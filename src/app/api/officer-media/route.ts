import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DELETED_KIND = "_deleted";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
const MAX_DATA_URL_CHARS = 2_400_000;
const MAX_IMAGE_BYTES = 1_800_000;
const albumDeletionKey = (officerId: string, mediaId: string) => `officer-album:${officerId}:${mediaId}`;

async function runSerializable<T>(work: () => Promise<T>): Promise<T> {
  try { return await work(); }
  catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "P2034" && code !== "P2028") throw error;
    return work(); // retry from a fresh Prisma transaction
  }
}

function parseImage(dataUrl: unknown) {
  if (typeof dataUrl !== "string" || dataUrl.length > MAX_DATA_URL_CHARS) throw new Error("Compressed image is too large.");
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/]+=*)$/i.exec(dataUrl);
  if (!match) throw new Error("Image data must be a valid JPG, PNG, or WEBP file.");
  const contentType = match[1].toLowerCase();
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("Compressed image must be smaller than 1.8 MB.");
  const isJpeg = contentType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = contentType === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const isWebp = contentType === "image/webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (!(isJpeg || isPng || isWebp)) throw new Error("Image file signature is invalid.");
  return { contentType, bytes };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  try {
    const body = await req.json();
    const officerId = String(body.officerId || "");
    if (!officerId || officerId.length > 160) return json({ error: "Invalid officer ID." }, 400);
    const { contentType, bytes } = parseImage(body.dataUrl);
    const mediaId = `media_${randomUUID()}`;
    const photo = {
      id: mediaId,
      url: `/api/media/${mediaId}`,
      caption: String(body.caption || "Officer photo").slice(0, 100),
      uploadedAt: new Date().toISOString()
    };
    const officer = await runSerializable(() => prisma.$transaction(async tx => {
      const row = await tx.portalRecord.findUnique({ where: { kind_id: { kind: "officers", id: officerId } } });
      if (!row) throw Object.assign(new Error("Officer record was not found in the shared database."), { status: 404 });
      const payload = row.payload as Record<string, any>;
      const album = Array.isArray(payload.albumPhotos) ? payload.albumPhotos : [];
      if (album.length >= 12) throw Object.assign(new Error("Officer album is limited to 12 photos."), { status: 409 });
      await tx.portalRecord.create({
        data: { id: mediaId, kind: "media-assets", payload: { id: mediaId, contentType, base64: bytes.toString("base64"), size: bytes.length, purpose: "officer-album-photo", uploadedBy: session.discordId, createdAt: new Date().toISOString() } }
      });
      const updated = { ...payload, albumPhotos: [...album, photo], albumUpdatedAt: new Date().toISOString() };
      await tx.portalRecord.update({ where: { kind_id: { kind: "officers", id: officerId } }, data: { payload: updated } });
      return updated;
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 }));
    return json({ ok: true, photo, officer }, 201);
  } catch (error) {
    const status = Number((error as any)?.status || 503);
    console.error("[LSPD officer album] upload failed", error);
    return json({ error: (error as Error)?.message || "Unable to save the officer photo album to the shared database." }, status);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  try {
    const body = await req.json();
    const officerId = String(body.officerId || "");
    const mediaId = String(body.mediaId || "");
    if (!officerId || officerId.length > 160 || !/^media_[a-f0-9-]{30,40}$/i.test(mediaId)) return json({ error: "Invalid officer or media ID." }, 400);
    const officer = await runSerializable(() => prisma.$transaction(async tx => {
      const row = await tx.portalRecord.findUnique({ where: { kind_id: { kind: "officers", id: officerId } } });
      if (!row) throw Object.assign(new Error("Officer record was not found."), { status: 404 });
      const payload = row.payload as Record<string, any>;
      const album = Array.isArray(payload.albumPhotos) ? payload.albumPhotos : [];
      const exists = album.some((item: any) => String(item?.id || "") === mediaId || String(item?.url || "").endsWith(`/${mediaId}`));
      if (!exists) throw Object.assign(new Error("This photo is no longer in the officer album."), { status: 404 });
      const updated = { ...payload, albumPhotos: album.filter((item: any) => String(item?.id || "") !== mediaId && !String(item?.url || "").endsWith(`/${mediaId}`)), albumUpdatedAt: new Date().toISOString() };
      await tx.portalRecord.update({ where: { kind_id: { kind: "officers", id: officerId } }, data: { payload: updated } });
      await tx.portalRecord.deleteMany({ where: { kind: "media-assets", id: mediaId } });
      await tx.portalRecord.upsert({
        where: { kind_id: { kind: DELETED_KIND, id: albumDeletionKey(officerId, mediaId) } },
        create: { id: albumDeletionKey(officerId, mediaId), kind: DELETED_KIND, payload: { recordKind: "officer-album-photo", officerId, mediaId, deletedAt: new Date().toISOString() } },
        update: { payload: { recordKind: "officer-album-photo", officerId, mediaId, deletedAt: new Date().toISOString() } }
      });
      return updated;
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 }));
    return json({ ok: true, officer, deletedMediaId: mediaId });
  } catch (error) {
    const status = Number((error as any)?.status || 503);
    console.error("[LSPD officer album] delete failed", error);
    return json({ error: (error as Error)?.message || "Unable to delete the officer album photo from the shared database." }, status);
  }
}
