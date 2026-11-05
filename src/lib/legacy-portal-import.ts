import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const IMPORT_KIND = "_system";
const IMPORT_ID = "legacy-prisma-records-v1";

type ImportRow = { id: string; kind: string; payload: Record<string, unknown> };

/**
 * One-time bridge from the original typed Prisma tables into PortalRecord,
 * which is now the single source of truth used by every portal surface.
 * Existing PortalRecord rows always win when an ID already exists.
 */
export async function ensureLegacyPortalRecordsImported() {
  const marker = await prisma.portalRecord.findUnique({
    where: { kind_id: { kind: IMPORT_KIND, id: IMPORT_ID } },
    select: { id: true }
  });
  if (marker) return;

  const [users, announcements, attendance, fleet, weapons] = await Promise.all([
    prisma.user.findMany({
      where: { OR: [{ fullName: { not: null } }, { badgeNumber: { not: null } }, { rank: { not: null } }, { division: { not: null } }, { callsign: { not: null } }] },
      orderBy: { createdAt: "asc" }
    }),
    prisma.announcement.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
    prisma.attendance.findMany({ include: { user: true }, orderBy: { createdAt: "asc" } }),
    prisma.fleetVehicle.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.weapon.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  const existingOfficerRows = await prisma.portalRecord.findMany({
    where: { kind: "officers" },
    select: { payload: true }
  });
  const existingDiscordIds = new Set(existingOfficerRows.map(row => {
    const payload = row.payload as { discordId?: unknown } | null;
    return String(payload?.discordId || "");
  }).filter(Boolean));

  const rows: ImportRow[] = [];

  for (const item of users) {
    if (existingDiscordIds.has(item.discordId)) continue;
    const dutyStatus: Record<string, string> = { ON_DUTY: "On Duty", ON_BREAK: "On Break", LEAVE: "Leave", OFF_DUTY: "Off Duty" };
    rows.push({
      id: `officer-discord-${item.discordId}`,
      kind: "officers",
      payload: {
        id: `officer-discord-${item.discordId}`,
        discordId: item.discordId,
        username: item.username,
        fullName: item.fullName || item.globalName || item.username,
        batchNumber: item.badgeNumber || "",
        badgeNumber: item.badgeNumber || "",
        rank: item.rank || "Recruit",
        division: item.division || "",
        callsign: item.callsign || "",
        certifications: item.certifications || [],
        status: dutyStatus[item.dutyStatus] || "Off Duty",
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    });
  }

  for (const item of announcements) {
    rows.push({
      id: item.id,
      kind: "announcements",
      payload: {
        id: item.id,
        title: item.title,
        content: item.content,
        body: item.content,
        category: item.category || "Official Announcement",
        priority: "Normal",
        author: item.authorName,
        authorId: item.authorId,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    });
  }

  for (const item of attendance) {
    rows.push({
      id: item.id,
      kind: "attendance",
      payload: {
        id: item.id,
        discordId: item.user.discordId,
        username: item.user.username,
        fullName: item.user.fullName || item.user.globalName || item.user.username,
        batchNumber: item.user.badgeNumber || "",
        rank: item.user.rank || "",
        division: item.user.division || "",
        callsign: item.user.callsign || "",
        action: item.clockOut ? "Clock Out" : "Clock In",
        clockIn: item.clockIn.toISOString(),
        clockOut: item.clockOut?.toISOString() ?? null,
        submittedAt: item.clockIn.toISOString(),
        notes: item.notes || "",
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.createdAt.toISOString()
      }
    });
  }

  for (const item of fleet) {
    rows.push({
      id: item.id,
      kind: "fleet",
      payload: {
        id: item.id,
        name: item.name,
        model: item.name,
        unit: "",
        plate: item.plate || "",
        vehicleType: item.vehicleType || "",
        type: item.vehicleType || "",
        division: "",
        assignedTo: item.assignedTo || "",
        officer: item.assignedTo || "",
        callsign: "",
        status: item.status || "Available",
        notes: item.notes || "",
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    });
  }

  for (const item of weapons) {
    rows.push({
      id: item.id,
      kind: "weapons",
      payload: {
        id: item.id,
        name: item.name,
        weaponType: item.weaponType || "",
        type: item.weaponType || "",
        serialNumber: item.serialNumber || "",
        serial: item.serialNumber || "",
        assignedTo: item.assignedTo || "",
        assigned: item.assignedTo || "",
        division: "",
        status: item.status || "Available",
        notes: item.notes || "",
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    });
  }

  await prisma.$transaction(async tx => {
    if (rows.length) {
      await tx.portalRecord.createMany({
        data: rows.map(row => ({ ...row, payload: row.payload as Prisma.InputJsonValue })),
        skipDuplicates: true
      });
    }
    await tx.portalRecord.upsert({
      where: { kind_id: { kind: IMPORT_KIND, id: IMPORT_ID } },
      create: {
        id: IMPORT_ID,
        kind: IMPORT_KIND,
        payload: { imported: rows.length, completedAt: new Date().toISOString() }
      },
      update: { payload: { imported: rows.length, completedAt: new Date().toISOString() } }
    });
  });
}
