import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { canManageAnnouncements, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureLegacyPortalRecordsImported } from "@/lib/legacy-portal-import";

export const dynamic = "force-dynamic";

const allowedKinds = new Set(["officers", "attendance", "announcements", "fleet", "weapons"]);
const DELETED_KIND = "_deleted";
const deletionKey = (kind: string, id: string) => `${kind}:${id}`;
const out = (body: unknown, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "no-store, max-age=0" }
});

type PortalPayload = Record<string, any> & { id: string };

function toModuleRecord(kind: string, payload: PortalPayload) {
  if (kind === "officers") {
    return {
      ...payload,
      badgeNumber: payload.badgeNumber ?? payload.batchNumber ?? "",
      dutyStatus: payload.dutyStatus ?? payload.status ?? "OFF_DUTY"
    };
  }
  if (kind === "fleet") {
    return {
      ...payload,
      name: payload.name ?? payload.model ?? "",
      vehicleType: payload.vehicleType ?? payload.type ?? "",
      assignedTo: payload.assignedTo ?? payload.officer ?? ""
    };
  }
  if (kind === "weapons") {
    return {
      ...payload,
      weaponType: payload.weaponType ?? payload.type ?? "",
      serialNumber: payload.serialNumber ?? payload.serial ?? "",
      assignedTo: payload.assignedTo ?? payload.assigned ?? payload.officer ?? ""
    };
  }
  if (kind === "announcements") {
    return { ...payload, content: payload.content ?? payload.body ?? "" };
  }
  if (kind === "attendance") {
    const submittedAt = payload.submittedAt ?? payload.clockIn ?? payload.createdAt ?? new Date().toISOString();
    return {
      ...payload,
      user: { fullName: payload.fullName ?? payload.username ?? "Officer", username: payload.username ?? "" },
      clockIn: payload.clockIn ?? submittedAt,
      clockOut: payload.clockOut ?? (payload.action === "Clock Out" ? submittedAt : null)
    };
  }
  return payload;
}

function buildPayload(kind: string, data: Record<string, any>, session: NonNullable<Awaited<ReturnType<typeof getSession>>>, id?: string): PortalPayload {
  const now = new Date().toISOString();
  if (kind === "officers") {
    return {
      id: id || `officer-discord-${session.discordId}`,
      discordId: session.discordId,
      username: session.username,
      fullName: String(data.fullName || session.globalName || session.username).trim(),
      batchNumber: String(data.badgeNumber || data.batchNumber || "").trim(),
      badgeNumber: String(data.badgeNumber || data.batchNumber || "").trim(),
      rank: String(data.rank || "Recruit"),
      division: String(data.division || ""),
      callsign: String(data.callsign || ""),
      certifications: Array.isArray(data.certifications)
        ? data.certifications
        : String(data.certifications || "").split(",").map(value => value.trim()).filter(Boolean),
      status: String(data.status || "Off Duty"),
      notes: String(data.notes || ""),
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  }
  if (kind === "fleet") {
    const name = String(data.name ?? data.model ?? "").trim();
    return {
      id: id || `fleet-${randomUUID()}`,
      name,
      model: name,
      unit: String(data.unit || "").trim(),
      plate: String(data.plate || "").trim(),
      vehicleType: String(data.vehicleType ?? data.type ?? ""),
      type: String(data.vehicleType ?? data.type ?? ""),
      division: String(data.division || ""),
      assignedTo: String(data.assignedTo ?? data.officer ?? ""),
      officer: String(data.assignedTo ?? data.officer ?? ""),
      callsign: String(data.callsign || ""),
      status: String(data.status || "Available"),
      notes: String(data.notes || ""),
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  }
  if (kind === "weapons") {
    const name = String(data.name || "").trim();
    const weaponType = String(data.weaponType ?? data.type ?? "");
    const serialNumber = String(data.serialNumber ?? data.serial ?? "");
    const assignedTo = String(data.assignedTo ?? data.assigned ?? "");
    return {
      id: id || `weapon-${randomUUID()}`,
      name,
      weaponType,
      type: weaponType,
      serialNumber,
      serial: serialNumber,
      assignedTo,
      assigned: assignedTo,
      division: String(data.division || ""),
      status: String(data.status || "Available"),
      notes: String(data.notes || ""),
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  }
  if (kind === "announcements") {
    const title = String(data.title || "").trim();
    const content = String(data.content ?? data.body ?? "").trim();
    return {
      id: id || `announcement-${randomUUID()}`,
      title,
      content,
      body: content,
      category: String(data.category || "Official Announcement"),
      priority: String(data.priority || "Normal"),
      author: session.globalName || session.username,
      authorId: session.discordId,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  }
  const action = String(data.action || "in").toLowerCase();
  return {
    id: id || `attendance-${randomUUID()}`,
    discordId: session.discordId,
    username: session.username,
    fullName: String(data.fullName || session.globalName || session.username),
    batchNumber: String(data.batchNumber || data.badgeNumber || ""),
    rank: String(data.rank || ""),
    division: String(data.division || ""),
    callsign: String(data.callsign || ""),
    action: action === "out" || action === "clock out" ? "Clock Out" : "Clock In",
    notes: String(data.notes || ""),
    submittedAt: now,
    createdAt: now,
    updatedAt: now
  };
}

async function upsertPortalRecord(kind: string, payload: PortalPayload) {
  const save = () => prisma.$transaction(async tx => {
    const tombstone = await tx.portalRecord.findUnique({
      where: { kind_id: { kind: DELETED_KIND, id: deletionKey(kind, payload.id) } },
      select: { id: true }
    });
    if (tombstone) {
      const error = new Error("Record ini sudah dihapus dan tidak dapat dipulihkan dari cache lama.");
      Object.assign(error, { code: "LSPD_RECORD_DELETED" });
      throw error;
    }
    return tx.portalRecord.upsert({
      where: { kind_id: { kind, id: payload.id } },
      create: { id: payload.id, kind, payload },
      update: { payload }
    });
  }, { isolationLevel: "Serializable" });

  try {
    return await save();
  } catch (error) {
    if ((error as { code?: string })?.code !== "P2034") throw error;
    return save();
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return out({ error: "Unauthorized" }, 401);
  const kind = req.nextUrl.searchParams.get("kind") || "";
  if (!allowedKinds.has(kind)) return out({ error: "Invalid kind" }, 400);

  try {
    await ensureLegacyPortalRecordsImported();
    const [rows, tombstones] = await prisma.$transaction([
      prisma.portalRecord.findMany({ where: { kind }, orderBy: { updatedAt: "desc" } }),
      prisma.portalRecord.findMany({
        where: { kind: DELETED_KIND, id: { startsWith: `${kind}:` } },
        select: { id: true }
      })
    ]);
    const deletedIds = new Set(tombstones.map(row => row.id.slice(kind.length + 1)));
    return out(rows.filter(row => !deletedIds.has(row.id)).map(row => toModuleRecord(kind, row.payload as unknown as PortalPayload)));
  } catch (error) {
    console.error("[LSPD records] read failed", error);
    return out({ error: "Database query failed. Check DATABASE_URL and the PortalRecord migration." }, 503);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return out({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const data = body.data && typeof body.data === "object" ? body.data as Record<string, any> : {};
    if (!allowedKinds.has(kind)) return out({ error: "Invalid kind" }, 400);
    if (kind === "announcements" && !canManageAnnouncements(session)) return out({ error: "You don't have permission" }, 403);
    if (kind !== "attendance" && kind !== "officers" && !String(data.name || data.title || "").trim()) {
      return out({ error: "Nama atau judul wajib diisi." }, 400);
    }

    if (kind === "officers") {
      const profile = await prisma.user.upsert({
        where: { discordId: session.discordId },
        update: {
          username: session.username,
          globalName: session.globalName,
          fullName: String(data.fullName || session.globalName || session.username),
          badgeNumber: String(data.badgeNumber || data.batchNumber || "") || null,
          rank: String(data.rank || "Recruit"),
          division: String(data.division || "") || null,
          callsign: String(data.callsign || "") || null,
          certifications: Array.isArray(data.certifications) ? data.certifications.map(String) : String(data.certifications || "").split(",").map((value: string) => value.trim()).filter(Boolean)
        },
        create: {
          discordId: session.discordId,
          username: session.username,
          globalName: session.globalName,
          fullName: String(data.fullName || session.globalName || session.username),
          badgeNumber: String(data.badgeNumber || data.batchNumber || "") || null,
          rank: String(data.rank || "Recruit"),
          division: String(data.division || "") || null,
          callsign: String(data.callsign || "") || null,
          certifications: Array.isArray(data.certifications) ? data.certifications.map(String) : String(data.certifications || "").split(",").map((value: string) => value.trim()).filter(Boolean)
        }
      });
      const payload = buildPayload(kind, { ...data, fullName: profile.fullName, badgeNumber: profile.badgeNumber, rank: profile.rank, division: profile.division, callsign: profile.callsign, certifications: profile.certifications }, session);
      const saved = await upsertPortalRecord(kind, payload);
      return out(toModuleRecord(kind, saved.payload as unknown as PortalPayload));
    }

    const payload = buildPayload(kind, data, session);
    const saved = await upsertPortalRecord(kind, payload);
    return out(toModuleRecord(kind, saved.payload as unknown as PortalPayload), 201);
  } catch (error) {
    if ((error as { code?: string })?.code === "LSPD_RECORD_DELETED") {
      return out({ error: "Data ini sudah dihapus. Gunakan ID baru untuk membuat record baru." }, 410);
    }
    console.error("[LSPD records] create failed", error);
    return out({ error: "Gagal menyimpan data ke database bersama." }, 503);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return out({ error: "Unauthorized" }, 401);
  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const id = String(body.id || "");
    const data = body.data && typeof body.data === "object" ? body.data as Record<string, any> : {};
    if (!allowedKinds.has(kind) || !id) return out({ error: "Invalid payload" }, 400);
    if (kind === "announcements" && !canManageAnnouncements(session)) return out({ error: "You don't have permission" }, 403);

    const current = await prisma.portalRecord.findUnique({ where: { kind_id: { kind, id } } });
    if (!current) return out({ error: "Record not found" }, 404);
    const merged = buildPayload(kind, { ...(current.payload as unknown as PortalPayload), ...data }, session, id);
    const saved = await upsertPortalRecord(kind, merged);
    return out(toModuleRecord(kind, saved.payload as unknown as PortalPayload));
  } catch (error) {
    if ((error as { code?: string })?.code === "LSPD_RECORD_DELETED") {
      return out({ error: "Data ini sudah dihapus dan tidak dapat diperbarui dari salinan lama." }, 410);
    }
    console.error("[LSPD records] update failed", error);
    return out({ error: "Gagal memperbarui data di database bersama." }, 503);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return out({ error: "Unauthorized" }, 401);
  try {
    const body = await req.json();
    const kind = String(body.kind || "");
    const id = String(body.id || "");
    if (!allowedKinds.has(kind) || !id) return out({ error: "Invalid payload" }, 400);
    if (kind === "announcements" && !canManageAnnouncements(session)) return out({ error: "You don't have permission" }, 403);
    const deleteRecord = () => prisma.$transaction(async tx => {
      const removed = await tx.portalRecord.deleteMany({ where: { kind, id } });
      await tx.portalRecord.upsert({
        where: { kind_id: { kind: DELETED_KIND, id: deletionKey(kind, id) } },
        create: {
          id: deletionKey(kind, id), kind: DELETED_KIND,
          payload: { recordKind: kind, recordId: id, deletedAt: new Date().toISOString() }
        },
        update: { payload: { recordKind: kind, recordId: id, deletedAt: new Date().toISOString() } }
      });
      return removed.count;
    }, { isolationLevel: "Serializable" });
    let deletedRecords: number;
    try { deletedRecords = await deleteRecord(); }
    catch (error) {
      if ((error as { code?: string })?.code !== "P2034") throw error;
      deletedRecords = await deleteRecord();
    }
    return out({ ok: true, deletedRecords, permanentlyDeleted: true });
  } catch (error) {
    console.error("[LSPD records] delete failed", error);
    return out({ error: "Gagal menghapus data dari database bersama." }, 503);
  }
}
