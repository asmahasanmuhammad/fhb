import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const competitions = await db.competition.findMany({
      include: {
        _count: { select: { matches: true } },
      },
      orderBy: { type: "asc" },
    });
    return ok({ competitions });
  } catch (e) {
    return handleError(e);
  }
}
