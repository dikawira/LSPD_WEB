import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "lspd_session";
export const ANNOUNCEMENT_ACCESS_ROLE_ID = "1559517530312278036";

export function canManageAnnouncements(session: Pick<Session, "roles"> | null | undefined): boolean {
  return !!session?.roles?.includes(ANNOUNCEMENT_ACCESS_ROLE_ID);
}
const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET belum dikonfigurasi");
  return new TextEncoder().encode(value);
};

export type Session = {
  discordId: string; username: string; globalName?: string;
  avatar?: string; roles: string[]; canManageAnnouncements: boolean;
};

export async function createSession(session: Session) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("7d").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7
  });
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as Session;
  } catch { return null; }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function roleIds(envName: string): string[] {
  return (process.env[envName] ?? "").split(",").map(x => x.trim()).filter(Boolean);
}

export function hasAnyRole(userRoles: string[], allowed: string[]) {
  return allowed.length > 0 && allowed.some(role => userRoles.includes(role));
}
