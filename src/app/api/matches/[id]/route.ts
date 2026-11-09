import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        events: { orderBy: [{ minute: "asc" }, { createdAt: "asc" }] },
      },
    });
    if (!match) return fail("Match not found", 404);
    return ok({ match });
  } catch (e) {
    return handleError(e);
  }
}
