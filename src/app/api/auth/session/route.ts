import { NextResponse } from "next/server";
import { getSession, canManageAnnouncements, canManagePhotos, canViewPhotos } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    discordId: session.discordId,
    username: session.username,
    globalName: session.globalName,
    avatar: session.avatar,
    canManageAnnouncements: canManageAnnouncements(session),
    canViewPhotos: canViewPhotos(session),
    canManagePhotos: canManagePhotos(session)
  });
}
