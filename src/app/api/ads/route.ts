import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

// GET: active ad slots for a placement (used by AdSlot component)
export async function GET(req: NextRequest) {
  try {
    const placement = req.nextUrl.searchParams.get("placement");
    const where: Record<string, unknown> = { active: true };
    if (placement) where.placement = placement;
    const ads = await db.adSlot.findMany({ where, orderBy: { name: "asc" } });
    return ok({ ads });
  } catch (e) {
    return handleError(e);
  }
}

// POST: track impression/click
const trackSchema = z.object({
  adId: z.string().min(1),
  event: z.enum(["impression", "click"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid request", 422);
    const { adId, event } = parsed.data;
    await db.adSlot.update({
      where: { id: adId },
      data: event === "impression" ? { impressions: { increment: 1 } } : { clicks: { increment: 1 } },
    }).catch(() => {});
    return ok({ tracked: true });
  } catch (e) {
    return handleError(e);
  }
}
