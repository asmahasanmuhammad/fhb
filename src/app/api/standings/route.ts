import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const competitionId = req.nextUrl.searchParams.get("competitionId");
    let compId = competitionId;
    if (!compId) {
      const bpl = await db.competition.findFirst({ where: { shortName: "BPL" } });
      compId = bpl?.id;
    }
    if (!compId) return ok({ standings: [], topScorers: [] });

    const standings = await db.standing.findMany({
      where: { competitionId: compId },
      include: { team: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, city: true } } },
      orderBy: { position: "asc" },
    });

    const competition = await db.competition.findUnique({ where: { id: compId } });

    const topScorers = await db.player.findMany({
      where: { goals: { gt: 0 } },
      orderBy: { goals: "desc" },
      take: 10,
      select: {
        id: true, name: true, goals: true, assists: true, position: true,
        team: { select: { id: true, name: true, initials: true, color: true } },
      },
    });

    return ok({ standings, competition, topScorers });
  } catch (e) {
    return handleError(e);
  }
}
