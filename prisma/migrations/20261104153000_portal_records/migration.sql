CREATE TABLE "PortalRecord" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortalRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PortalRecord_kind_id_key" ON "PortalRecord"("kind", "id");
CREATE INDEX "PortalRecord_kind_updatedAt_idx" ON "PortalRecord"("kind", "updatedAt");
