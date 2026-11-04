import { NextResponse } from "next/server";
import { discordConfig } from "@/lib/discord";
import { randomBytes } from "crypto";

export async function GET() {
  const c = discordConfig();
  const state = randomBytes(24).toString("hex");
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", c.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", c.redirectUri);
  url.searchParams.set("scope", "identify guilds.members.read");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("lspd_oauth_state", state, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:600 });
  return response;
}
