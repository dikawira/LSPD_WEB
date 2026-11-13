const API = "https://discord.com/api/v10";

export function discordConfig() {
  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, DISCORD_GUILD_ID } = process.env;
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI || !DISCORD_GUILD_ID) {
    throw new Error("Konfigurasi Discord OAuth belum lengkap");
  }
  // Normalize malformed callback paths such as https://domain//api/... to a single slash.
  // The normalized value is used for both OAuth authorization and token exchange.
  const redirect = new URL(DISCORD_REDIRECT_URI);
  redirect.pathname = "/" + redirect.pathname.replace(/^\/+/, "");
  const redirectUri = redirect.toString();
  return { clientId: DISCORD_CLIENT_ID, clientSecret: DISCORD_CLIENT_SECRET, redirectUri, guildId: DISCORD_GUILD_ID };
}

export async function exchangeCode(code: string) {
  const c = discordConfig();
  const body = new URLSearchParams({
    client_id: c.clientId, client_secret: c.clientSecret,
    grant_type: "authorization_code", code, redirect_uri: c.redirectUri
  });
  const response = await fetch(`${API}/oauth2/token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body,
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Gagal menukar kode OAuth Discord");
  return response.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

export async function getDiscordIdentity(token: string) {
  const response = await fetch(`${API}/users/@me`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
  });
  if (!response.ok) throw new Error("Gagal membaca identitas Discord");
  return response.json() as Promise<{ id: string; username: string; global_name?: string; avatar?: string }>;
}

export async function getGuildMember(token: string, guildId: string) {
  const response = await fetch(`${API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ roles: string[] }>;
}
