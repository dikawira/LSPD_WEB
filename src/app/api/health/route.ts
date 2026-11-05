import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureLegacyPortalRecordsImported } from "@/lib/legacy-portal-import";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    await ensureLegacyPortalRecordsImported();
    const [portalRecordCount, userCount, groupedRecords, legacyImport] = await Promise.all([
      prisma.portalRecord.count(),
      prisma.user.count(),
      prisma.portalRecord.groupBy({ by: ["kind"], _count: { _all: true } }),
      prisma.portalRecord.findUnique({
        where: { kind_id: { kind: "_system", id: "legacy-prisma-records-v1" } },
        select: { id: true, payload: true }
      })
    ]);
    return NextResponse.json({
      ok: true,
      database: "connected",
      portalRecordsTable: "available",
      portalRecordCount,
      authenticatedUsers: userCount,
      recordsByKind: Object.fromEntries(groupedRecords.map(item => [item.kind, item._count._all])),
      legacyPrismaImport: legacyImport ? "complete" : "not-needed-or-pending",
      checkedAt: new Date().toISOString()
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[LSPD health] database check failed", error);
    return NextResponse.json({
      ok: false,
      database: "unavailable",
      error: "Database connection or PortalRecord migration is not ready."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
