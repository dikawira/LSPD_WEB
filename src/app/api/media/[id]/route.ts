import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await context.params;
  if (!/^media_[a-f0-9-]{30,40}$/i.test(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const row = await prisma.portalRecord.findUnique({
      where: { kind_id: { kind: "media-assets", id } },
      select: { payload: true }
    });
    if (!row) return new NextResponse("Not found", { status: 404 });

    const asset = row.payload as { contentType?: string; base64?: string } | null;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!asset?.base64 || !asset.contentType || !allowedTypes.has(asset.contentType)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const bytes = Buffer.from(asset.base64, "base64");
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": asset.contentType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox"
      }
    });
  } catch (error) {
    console.error("[LSPD media] read failed", error);
    return new NextResponse("Unable to load image", { status: 503 });
  }
}
