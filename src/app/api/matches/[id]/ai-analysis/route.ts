import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getMatchAiAnalysis } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        events: true,
      },
    });

    if (!match) return fail("Match not found", 404);

    const analysis = await getMatchAiAnalysis(match);
    return ok({ matchId: match.id, analysis });
  } catch (e) {
    return handleError(e);
  }
}
