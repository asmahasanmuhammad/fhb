import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError, rateLimit } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!rateLimit(`view:${id}`, 500, 60_000)) return ok({ counted: false });
    const video = await db.video.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return ok({ views: video.views });
  } catch (e) {
    return handleError(e);
  }
}
