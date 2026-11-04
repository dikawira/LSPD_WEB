import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Supabase Transaction Pooler (port 6543) runs in transaction mode.
 * Prisma must use PgBouncer-compatible mode so prepared statements are not
 * reused across pooled connections. Keep DIRECT_URL separate for migrations.
 */
function getRuntimeDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    const isSupabaseTransactionPooler =
      url.port === "6543" || url.searchParams.get("pgbouncer") === "true";

    if (isSupabaseTransactionPooler) {
      url.searchParams.set("pgbouncer", "true");
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }
    }

    return url.toString();
  } catch {
    // Let Prisma report malformed connection strings without hiding the error.
    return raw;
  }
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();
const prismaOptions = runtimeDatabaseUrl
  ? { datasources: { db: { url: runtimeDatabaseUrl } } }
  : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
