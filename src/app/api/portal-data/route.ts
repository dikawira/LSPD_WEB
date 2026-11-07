import { NextRequest, NextResponse } from "next/server";
import { getSession, canManageAnnouncements, canManagePhotos, canViewPhotos } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureLegacyPortalRecordsImported } from "@/lib/legacy-portal-import";

export const dynamic = "force-dynamic";

const allowedKinds = new Set([
  "officers",
  "attendance",
  "announcements",
  "fleet",
  "weapons",
  "videos",
  "photos",
  "photo-hidden"
]);

const DELETED_KIND = "_deleted";
const deletionKey = (kind: string, id: string) => `${kind}:${id}`;
const response = (body: unknown, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "no-store, max-age=0" }
});

async function runSerializable<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    // P2034 is a serialization conflict; P2028 means Prisma closed/expired
    // the interactive transaction. Retry the entire operation with a NEW
    // transaction client, never with the expired transaction handle.
    const code = (error as { code?: string })?.code;
    if (code !== "P2034" && code !== "P2028") throw error;
    return work();
  }
}

const MAX_STORED_IMAGE_CHARS = 2_400_000;
const isHttpUrl = (value: unknown, optional = false) => {
  if (optional && (value === undefined || value === null || value === "")) return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
const isStoredImage = (value: unknown, optional = false) => {
  if (optional && (value === undefined || value === null || value === "")) return true;
  if (typeof value !== "string" || value.length > MAX_STORED_IMAGE_CHARS) return false;
  return /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value);
};
const isImageSource = (value: unknown, optional = false) => {
  if (optional && (value === undefined || value === null || value === "")) return true;
  if (typeof value !== "string") return false;
  if (/^\/api\/media\/media_[a-f0-9-]{30,40}$/i.test(value)) return true;
  return isHttpUrl(value, optional) || isStoredImage(value, optional);
};

function referencedMediaIds(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const albumPhotos = Array.isArray(record.albumPhotos) ? record.albumPhotos : [];
  const albumUrls = albumPhotos.map(photo => {
    if (typeof photo === "string") return photo;
    if (photo && typeof photo === "object") {
      const item = photo as Record<string, unknown>;
      return item.url ?? item.photoUrl ?? "";
    }
    return "";
  });
  const fields = [record.photoUrl, record.url, record.thumbnail, ...albumUrls];
  return [...new Set(fields.map(value => {
    if (typeof value !== "string") return "";
    return /^\/api\/media\/(media_[a-f0-9-]{30,40})$/i.exec(value)?.[1] || "";
  }).filter(Boolean))];
}

function mediaIdFromUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  return /^\/api\/media\/(media_[a-f0-9-]{30,40})$/i.exec(value)?.[1] || "";
}
const officerPhotoDeletionKey = (officerId: string, mediaId: string) => `officer-photo:${officerId}:${mediaId}`;
const officerAlbumDeletionKey = (officerId: string, mediaId: string) => `officer-album:${officerId}:${mediaId}`;

function databaseError(error: unknown, action: string) {
  const err = error as { code?: string; message?: string; meta?: { table?: string } };
  const code = String(err?.code || "");
  console.error(`[LSPD Portal API] ${action} failed`, error);

  if (code === "P2021" || code === "P2022") {
    return response({
      error: "Tabel database untuk data portal belum tersedia atau belum sesuai. Jalankan `npx prisma migrate deploy` pada deployment, lalu restart aplikasi.",
      code
    }, 503);
  }
  if (code === "P1001" || code === "P1002" || code === "P1008" || code === "P1017") {
    return response({
      error: "Aplikasi tidak dapat terhubung ke database. Periksa DATABASE_URL dan DIRECT_URL di environment deployment.",
      code
    }, 503);
  }
  if (code === "P2028") {
    return response({
      error: "Transaksi database ditutup sebelum penyimpanan selesai. Periksa koneksi database dan coba kembali; transaksi berikutnya akan menggunakan sesi baru.",
      code
    }, 503);
  }
  if (code === "P2002") {
    return response({ error: "Data dengan ID tersebut sudah ada. Silakan coba publish kembali.", code }, 409);
  }
  return response({
    error: `Gagal ${action} ke database${code ? ` (${code})` : ""}. Periksa log deployment untuk detail.`
  }, 500);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return response({ error: "Unauthorized" }, 401);

  const kind = req.nextUrl.searchParams.get("kind");
  if (!kind || !allowedKinds.has(kind)) return response({ error: "Invalid kind" }, 400);
  // Announcements are readable by every authenticated LSPD portal user.
  if ((kind === "photos" || kind === "photo-hidden") && !canViewPhotos(session)) {
    return response({ error: "You don't have permission" }, 403);
  }

  try {
    await ensureLegacyPortalRecordsImported();

    // Durable deletion markers stop stale localStorage copies from being
    // treated as new records during a later browser's first-load migration.
    const deletedRows = await prisma.portalRecord.findMany({
      where: { kind: DELETED_KIND, id: { startsWith: `${kind}:` } },
      select: { id: true }
    });
    const deletedIds = new Set(deletedRows.map(row => row.id.slice(kind.length + 1)));

    let records: unknown[];
    if (kind === "photos") {
      const [rows, hiddenRows] = await prisma.$transaction([
        prisma.portalRecord.findMany({
          where: { kind: "photos" },
          orderBy: { updatedAt: "desc" }
        }),
        prisma.portalRecord.findMany({ where: { kind: "photo-hidden" } })
      ]);
      const hiddenIds = new Set(
        hiddenRows.map(row => String((row.payload as { id?: unknown } | null)?.id ?? ""))
      );
      records = rows
        .filter(row => !hiddenIds.has(row.id) && !deletedIds.has(row.id))
        .map(row => row.payload);
    } else {
      const rows = await prisma.portalRecord.findMany({
        where: { kind },
        orderBy: { updatedAt: "desc" }
      });
      records = rows.filter(row => !deletedIds.has(row.id)).map(row => row.payload);
    }

    if (req.nextUrl.searchParams.get("withDeleted") === "1") {
      return response({ records, deletedIds: [...deletedIds] });
    }
    return response(records);
  } catch (error) {
    return databaseError(error, "membaca data");
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return response({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const records = body.records;

    if (!allowedKinds.has(kind) || !Array.isArray(records)) {
      return response({ error: "Invalid payload" }, 400);
    }
    if (kind === "announcements" && !canManageAnnouncements(session)) {
      return response({ error: "You don't have permission" }, 403);
    }
    if ((kind === "photos" || kind === "photo-hidden" || kind === "videos") && !canManagePhotos(session)) {
      return response({ error: "You don't have permission" }, 403);
    }
    if (records.length < 1 || records.length > 2000) {
      return response({ error: "Jumlah data tidak valid." }, 400);
    }

    const valid = records.filter((record: any) => {
      if (!record || typeof record.id !== "string" || !record.id.trim() || record.id.length > 160) {
        return false;
      }
      if (kind === "videos") {
        const videoCategories = new Set(["Trailer", "Recruitment", "Operations", "Training", "Events", "Community"]);
        return typeof record.title === "string" && record.title.trim().length > 0 && record.title.length <= 120 &&
          typeof record.category === "string" && videoCategories.has(record.category) &&
          isHttpUrl(record.url) && isHttpUrl(record.thumbnail, true) &&
          (record.duration === undefined || (typeof record.duration === "string" && record.duration.length <= 10));
      }
      if (kind !== "photos") return true;

      const categories = new Set([
        "Headquarters",
        "Patrol",
        "Operations",
        "Training",
        "Events",
        "Community",
        "Other"
      ]);

      return typeof record.title === "string" &&
        record.title.trim().length > 0 &&
        record.title.length <= 120 &&
        typeof record.category === "string" &&
        categories.has(record.category) &&
        isImageSource(record.url) &&
        isImageSource(record.thumbnail, true) &&
        (record.duration === undefined ||
          (typeof record.duration === "string" && record.duration.length <= 500)) &&
        (record.details === undefined ||
          (typeof record.details === "string" && record.details.length <= 500));
    });

    if (valid.length !== records.length) {
      return response({
        error: kind === "videos"
          ? "Data video tidak valid. Periksa judul, kategori, URL, thumbnail, dan durasi."
          : "Data foto tidak valid. Pastikan judul, kategori, dan URL gambar HTTP(S) sudah benar."
      }, 400);
    }

    const saveRecords = () => prisma.$transaction(async tx => {
      const markers = await tx.portalRecord.findMany({
        where: {
          kind: DELETED_KIND,
          id: { in: valid.map(item => deletionKey(kind, item.id)) }
        },
        select: { id: true }
      });
      const blockedIds = new Set(markers.map(marker => marker.id.slice(kind.length + 1)));
      const writable = valid.filter(item => !blockedIds.has(item.id));

      for (const incoming of writable) {
        const previous = (kind === "photos" || kind === "officers")
          ? await tx.portalRecord.findUnique({ where: { kind_id: { kind, id: incoming.id } }, select: { payload: true } })
          : null;
        let item: any = incoming;
        if (kind === "officers" && previous?.payload && typeof previous.payload === "object") {
          const prior: any = previous.payload;
          item = { ...incoming };

          // Keep the last server-confirmed main portrait if an older/stale client
          // sends an empty or missing value. Explicit removal is separately flagged.
          const priorPhotoUrl = typeof prior.photoUrl === "string" ? prior.photoUrl : "";
          const incomingPhotoUrl = typeof incoming.photoUrl === "string" ? incoming.photoUrl : "";
          const requestedPhotoRemoval = incoming.photoRemovalRequested === true;
          const priorPhotoId = mediaIdFromUrl(priorPhotoUrl);
          if (requestedPhotoRemoval) {
            item.photoUrl = "";
            if (priorPhotoId) {
              await tx.portalRecord.upsert({
                where: { kind_id: { kind: DELETED_KIND, id: officerPhotoDeletionKey(incoming.id, priorPhotoId) } },
                create: { id: officerPhotoDeletionKey(incoming.id, priorPhotoId), kind: DELETED_KIND, payload: { recordKind: "officer-photo", officerId: incoming.id, mediaId: priorPhotoId, deletedAt: new Date().toISOString() } },
                update: { payload: { recordKind: "officer-photo", officerId: incoming.id, mediaId: priorPhotoId, deletedAt: new Date().toISOString() } }
              });
            }
          } else if (!incomingPhotoUrl) {
            item.photoUrl = priorPhotoUrl;
          } else {
            const incomingPhotoId = mediaIdFromUrl(incomingPhotoUrl);
            if (incomingPhotoId) {
              const removedMarker = await tx.portalRecord.findUnique({
                where: { kind_id: { kind: DELETED_KIND, id: officerPhotoDeletionKey(incoming.id, incomingPhotoId) } },
                select: { id: true }
              });
              if (removedMarker) item.photoUrl = priorPhotoUrl;
            }
            if (priorPhotoId && incomingPhotoUrl !== priorPhotoUrl && mediaIdFromUrl(item.photoUrl) !== priorPhotoId) {
              await tx.portalRecord.upsert({
                where: { kind_id: { kind: DELETED_KIND, id: officerPhotoDeletionKey(incoming.id, priorPhotoId) } },
                create: { id: officerPhotoDeletionKey(incoming.id, priorPhotoId), kind: DELETED_KIND, payload: { recordKind: "officer-photo", officerId: incoming.id, mediaId: priorPhotoId, deletedAt: new Date().toISOString() } },
                update: { payload: { recordKind: "officer-photo", officerId: incoming.id, mediaId: priorPhotoId, deletedAt: new Date().toISOString() } }
              });
            }
          }
          delete item.photoRemovalRequested;

          // Album entries are append-preserved during normal profile edits. A photo
          // can only leave the shared album via the explicit DELETE endpoint below.
          const oldAlbum = Array.isArray(prior.albumPhotos) ? prior.albumPhotos : [];
          const incomingAlbum = Array.isArray(incoming.albumPhotos) ? incoming.albumPhotos : [];
          const albumById = new Map<string, any>();
          for (const photo of [...oldAlbum, ...incomingAlbum]) {
            if (!photo || typeof photo !== "object") continue;
            const mediaId = String((photo as any).id || mediaIdFromUrl((photo as any).url || (photo as any).photoUrl || ""));
            if (!mediaId) continue;
            const removedMarker = await tx.portalRecord.findUnique({
              where: { kind_id: { kind: DELETED_KIND, id: officerAlbumDeletionKey(incoming.id, mediaId) } },
              select: { id: true }
            });
            if (!removedMarker) albumById.set(mediaId, photo);
          }
          item.albumPhotos = [...albumById.values()];
        }

        await tx.portalRecord.upsert({
          where: { kind_id: { kind, id: item.id } },
          create: { id: item.id, kind, payload: item },
          update: { payload: item }
        });
        if (previous && (kind === "photos" || kind === "officers")) {
          const previousAssets = referencedMediaIds(previous.payload);
          const currentAssets = new Set(referencedMediaIds(item));
          const obsoleteAssets = previousAssets.filter(assetId => !currentAssets.has(assetId));
          if (obsoleteAssets.length) {
            await tx.portalRecord.deleteMany({ where: { kind: "media-assets", id: { in: obsoleteAssets } } });
          }
        }
        if (kind === "photos") {
          await tx.portalRecord.deleteMany({
            where: { kind: "photo-hidden", id: `photo-hidden:${item.id}` }
          });
        }
      }
      return { saved: writable.length, ignoredDeletedIds: [...blockedIds] };
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 45_000 });

    const result = await runSerializable(saveRecords);
    return response({ ok: true, ...result });
  } catch (error) {
    return databaseError(error, "menyimpan data");
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return response({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const id = String(body.id || "");

    if (!allowedKinds.has(kind) || !id || id.length > 160) {
      return response({ error: "Invalid payload" }, 400);
    }
    if (kind === "announcements" && !canManageAnnouncements(session)) {
      return response({ error: "You don't have permission" }, 403);
    }
    if ((kind === "photos" || kind === "photo-hidden" || kind === "videos") && !canManagePhotos(session)) {
      return response({ error: "You don't have permission" }, 403);
    }

    const deleteRecord = () => prisma.$transaction(async tx => {
      const existing = (kind === "photos" || kind === "officers")
        ? await tx.portalRecord.findUnique({ where: { kind_id: { kind, id } }, select: { payload: true } })
        : null;
      const linkedAssets = existing ? referencedMediaIds(existing.payload) : [];
      const removed = await tx.portalRecord.deleteMany({ where: { kind, id } });
      if (linkedAssets.length) {
        await tx.portalRecord.deleteMany({ where: { kind: "media-assets", id: { in: linkedAssets } } });
      }

      // A permanent tombstone survives across all clients and blocks old
      // browser caches from restoring the same record ID after deletion.
      await tx.portalRecord.upsert({
        where: { kind_id: { kind: DELETED_KIND, id: deletionKey(kind, id) } },
        create: {
          id: deletionKey(kind, id),
          kind: DELETED_KIND,
          payload: { recordKind: kind, recordId: id, deletedAt: new Date().toISOString() }
        },
        update: {
          payload: { recordKind: kind, recordId: id, deletedAt: new Date().toISOString() }
        }
      });

      if (kind === "photos") {
        await tx.portalRecord.upsert({
          where: { kind_id: { kind: "photo-hidden", id: `photo-hidden:${id}` } },
          create: { id: `photo-hidden:${id}`, kind: "photo-hidden", payload: { id } },
          update: { payload: { id } }
        });
      }
      return removed.count;
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 45_000 });

    const deletedRecords = await runSerializable(deleteRecord);
    return response({
      ok: true,
      deletedRecords,
      permanentlyDeleted: true,
      ...(kind === "photos" ? { hiddenGlobally: true } : {})
    });
  } catch (error) {
    return databaseError(error, "menghapus data");
  }
}
