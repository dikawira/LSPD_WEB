import { NextRequest, NextResponse } from "next/server";
import { getSession, canManageAnnouncements } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const allowedKinds = new Set(["officers", "attendance", "announcements", "fleet", "weapons"]);
const response = (body: unknown, status = 200) => NextResponse.json(body, { status });

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return response({ error: "Unauthorized" }, 401);
  const kind = req.nextUrl.searchParams.get("kind");
  if (!kind || !allowedKinds.has(kind)) return response({ error: "Invalid kind" }, 400);
  if (kind === "announcements" && !canManageAnnouncements(session)) return response({ error: "Forbidden" }, 403);
  try {
    const rows = await prisma.portalRecord.findMany({ where: { kind }, orderBy: { updatedAt: "desc" } });
    return response(rows.map(row => row.payload));
  } catch {
    return response({ error: "Database unavailable. Jalankan prisma migrate deploy." }, 503);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return response({ error: "Unauthorized" }, 401);
  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const records = body.records;
    if (!allowedKinds.has(kind) || !Array.isArray(records)) return response({ error: "Invalid payload" }, 400);
    if (kind === "announcements" && !canManageAnnouncements(session)) return response({ error: "Forbidden" }, 403);
    if (records.length > 2000) return response({ error: "Too many records" }, 413);
    const valid = records.filter((r: any) => r && typeof r.id === "string" && r.id.length <= 160);
    await prisma.$transaction(async tx => {
      for (const item of valid) {
        await tx.portalRecord.upsert({
          where: { kind_id: { kind, id: item.id } },
          create: { id: item.id, kind, payload: item },
          update: { payload: item }
        });
      }
    });
    return response({ ok: true, saved: valid.length });
  } catch {
    return response({ error: "Gagal menyimpan data ke database" }, 400);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return response({ error: "Unauthorized" }, 401);
  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const id = String(body.id || "");
    if (!allowedKinds.has(kind) || !id) return response({ error: "Invalid payload" }, 400);
    if (kind === "announcements" && !canManageAnnouncements(session)) return response({ error: "Forbidden" }, 403);
    await prisma.portalRecord.deleteMany({ where: { kind, id } });
    return response({ ok: true });
  } catch {
    return response({ error: "Gagal menghapus data" }, 400);
  }
}
