import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const competitionId = req.nextUrl.searchParams.get("competitionId");
    let compId: string | null = competitionId;
    if (!compId) {
      const bfl = await db.competition.findFirst({ where: { shortName: "BFL" } });
      compId = bfl?.id ?? null;
    }
    if (!compId) return ok({ standings: [], topScorers: [] });

    const [standings, competition] = await Promise.all([
      db.standing.findMany({
        where: { competitionId: compId },
        include: { team: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, city: true, logoUrl: true } } },
        orderBy: { position: "asc" },
      }),
      db.competition.findUnique({ where: { id: compId } }),
    ]);

    // Top scorers scoped to the clubs in this competition
    const teamIds = standings.map((s) => s.teamId);
    const topScorers = await db.player.findMany({
      where: { teamId: { in: teamIds }, goals: { gt: 0 } },
      orderBy: { goals: "desc" },
      take: 10,
      select: {
        id: true, name: true, goals: true, assists: true, position: true,
        team: { select: { id: true, name: true, initials: true, color: true, color2: true, logoUrl: true } },
      },
    });

    return ok({ standings, competition, topScorers });
  } catch (e) {
    return handleError(e);
  }
}
