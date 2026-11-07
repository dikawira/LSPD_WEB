import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { canManagePhotos, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DATA_URL_CHARS = 2_400_000;
const MAX_IMAGE_BYTES = 1_800_000;
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const purpose = String(body.purpose || "");
    const dataUrl = String(body.dataUrl || "");
    if (!["officer-photo", "officer-album-photo", "gallery-photo"].includes(purpose)) {
      return json({ error: "Invalid image upload purpose." }, 400);
    }
    if (purpose === "gallery-photo" && !canManagePhotos(session)) {
      return json({ error: "You don't have permission to upload gallery photos." }, 403);
    }
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      return json({ error: "Compressed image is too large. Select a smaller image." }, 413);
    }

    const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/]+=*)$/i.exec(dataUrl);
    if (!match) return json({ error: "Image data must be a valid JPG, PNG, or WEBP file." }, 400);

    const contentType = match[1].toLowerCase();
    const imageBytes = Buffer.from(match[2], "base64");
    if (!imageBytes.length || imageBytes.length > MAX_IMAGE_BYTES) {
      return json({ error: "Compressed image must be smaller than 1.8 MB." }, 413);
    }

    // Verify the actual file signature instead of trusting the browser MIME label.
    const isJpeg = contentType === "image/jpeg" && imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff;
    const isPng = contentType === "image/png" && imageBytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const isWebp = contentType === "image/webp" &&
      imageBytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      imageBytes.subarray(8, 12).toString("ascii") === "WEBP";
    if (!(isJpeg || isPng || isWebp)) {
      return json({ error: "The uploaded image file signature is invalid." }, 400);
    }

    const id = `media_${randomUUID()}`;
    const payload = {
      id,
      contentType,
      base64: imageBytes.toString("base64"),
      size: imageBytes.length,
      purpose,
      uploadedBy: session.discordId,
      createdAt: new Date().toISOString()
    };
    await prisma.portalRecord.create({
      data: { id, kind: "media-assets", payload }
    });

    return json({ ok: true, id, url: `/api/media/${id}`, contentType, size: imageBytes.length }, 201);
  } catch (error) {
    console.error("[LSPD media] upload failed", error);
    return json({ error: "Unable to save the image in the shared database. Check the database connection and PortalRecord table." }, 503);
  }
}
