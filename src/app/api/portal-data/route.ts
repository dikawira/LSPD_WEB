import { NextRequest, NextResponse } from "next/server";
import { getSession, canManageAnnouncements, canManagePhotos, canViewPhotos } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const allowedKinds = new Set([
  "officers",
  "attendance",
  "announcements",
  "fleet",
  "weapons",
  "photos",
  "photo-hidden"
]);

const response = (body: unknown, status = 200) => NextResponse.json(body, { status });

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

function databaseError(error: unknown, action: string) {
  const err = error as { code?: string; message?: string; meta?: { table?: string } };
  const code = String(err?.code || "");
  console.error(`[LSPD Photo Gallery] ${action} failed`, error);

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
    if (kind === "photos") {
      const [rows, hiddenRows] = await prisma.$transaction([
        prisma.portalRecord.findMany({
          where: { kind: "photos" },
          orderBy: { updatedAt: "desc" }
        }),
        prisma.portalRecord.findMany({
          where: { kind: "photo-hidden" }
        })
      ]);
      const hiddenIds = new Set(
        hiddenRows.map(row => String((row.payload as { id?: unknown } | null)?.id ?? ""))
      );
      return response(rows.filter(row => !hiddenIds.has(row.id)).map(row => row.payload));
    }

    if (kind === "photo-hidden") {
      const hiddenRows = await prisma.portalRecord.findMany({ where: { kind: "photo-hidden" } });
      return response(hiddenRows.map(row => row.payload));
    }

    const rows = await prisma.portalRecord.findMany({
      where: { kind },
      orderBy: { updatedAt: "desc" }
    });
    return response(rows.map(row => row.payload));
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
    if ((kind === "photos" || kind === "photo-hidden") && !canManagePhotos(session)) {
      return response({ error: "You don't have permission" }, 403);
    }
    if (records.length < 1 || records.length > 2000) {
      return response({ error: "Jumlah data tidak valid." }, 400);
    }

    const valid = records.filter((record: any) => {
      if (!record || typeof record.id !== "string" || !record.id.trim() || record.id.length > 160) {
        return false;
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
        isHttpUrl(record.url) &&
        isHttpUrl(record.thumbnail, true) &&
        (record.duration === undefined ||
          (typeof record.duration === "string" && record.duration.length <= 500)) &&
        (record.details === undefined ||
          (typeof record.details === "string" && record.details.length <= 500));
    });

    if (valid.length !== records.length) {
      return response({
        error: "Data foto tidak valid. Pastikan judul, kategori, dan URL gambar HTTP(S) sudah benar."
      }, 400);
    }

    await prisma.$transaction(async tx => {
      for (const item of valid) {
        await tx.portalRecord.upsert({
          where: { kind_id: { kind, id: item.id } },
          create: { id: item.id, kind, payload: item },
          update: { payload: item }
        });

        if (kind === "photos") {
          await tx.portalRecord.deleteMany({
            where: { kind: "photo-hidden", id: `photo-hidden:${item.id}` }
          });
        }
      }
    });

    return response({ ok: true, saved: valid.length });
  } catch (error) {
    return databaseError(error, "menyimpan foto");
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
    if ((kind === "photos" || kind === "photo-hidden") && !canManagePhotos(session)) {
      return response({ error: "You don't have permission" }, 403);
    }

    if (kind === "photos") {
      const deletedRecords = await prisma.$transaction(async tx => {
        const removed = await tx.portalRecord.deleteMany({ where: { kind: "photos", id } });
        await tx.portalRecord.upsert({
          where: { kind_id: { kind: "photo-hidden", id: `photo-hidden:${id}` } },
          create: {
            id: `photo-hidden:${id}`,
            kind: "photo-hidden",
            payload: { id }
          },
          update: { payload: { id } }
        });
        return removed.count;
      });

      return response({ ok: true, deletedRecords, hiddenGlobally: true });
    }

    const removed = await prisma.portalRecord.deleteMany({ where: { kind, id } });
    return response({ ok: true, deletedRecords: removed.count });
  } catch (error) {
    return databaseError(error, "menghapus data");
  }
}
