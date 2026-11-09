import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

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
