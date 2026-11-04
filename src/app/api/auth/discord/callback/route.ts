import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getDiscordIdentity, getGuildMember, discordConfig } from "@/lib/discord";
import { createSession, hasAnyRole, roleIds, ANNOUNCEMENT_ACCESS_ROLE_ID } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("lspd_oauth_state")?.value;
  if (!code || !state || !savedState || state !== savedState) return NextResponse.redirect(new URL("/?error=oauth_state", request.url));

  try {
    const cfg = discordConfig();
    const token = await exchangeCode(code);
    const identity = await getDiscordIdentity(token.access_token);
    const member = await getGuildMember(token.access_token, cfg.guildId);
    const allowedRoles = roleIds("DISCORD_ALLOWED_ROLE_IDS");
    // Announcement access is tied to this exact Discord role ID.
    const announcementRoles = [ANNOUNCEMENT_ACCESS_ROLE_ID];

    // Fail closed: an empty allow-list or absent guild membership never grants access.
    if (!member || !hasAnyRole(member.roles, allowedRoles)) return NextResponse.redirect(new URL("/?error=access_denied", request.url));

    const canManageAnnouncements = hasAnyRole(member.roles, announcementRoles);
    await prisma.user.upsert({
      where: { discordId: identity.id },
      update: { username: identity.username, globalName: identity.global_name, avatar: identity.avatar, lastLoginAt: new Date() },
      create: { discordId: identity.id, username: identity.username, globalName: identity.global_name, avatar: identity.avatar }
    });
    await createSession({ discordId: identity.id, username: identity.username, globalName: identity.global_name, avatar: identity.avatar, roles: member.roles, canManageAnnouncements });
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("lspd_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
