import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const competition = await db.competition.findUnique({ where: { id } });
    if (!competition) return fail("Competition not found", 404);

    const [standings, matches, topScorers] = await Promise.all([
      competition.type === "LEAGUE"
        ? db.standing.findMany({
            where: { competitionId: id },
            include: { team: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, city: true, logoUrl: true } } },
            orderBy: { position: "asc" },
          })
        : Promise.resolve([]),
      db.match.findMany({
        where: { competitionId: id },
        include: {
          homeTeam: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, logoUrl: true } },
          awayTeam: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, logoUrl: true } },
        },
        orderBy: { kickoff: "desc" },
        take: 40,
      }),
      (async () => {
        // scorers from the clubs that compete in this competition
        const compTeamIds = await db.standing.findMany({
          where: { competitionId: id },
          select: { teamId: true },
        });
        const ids = compTeamIds.map((s) => s.teamId);
        if (ids.length === 0) {
          const compTeams = await db.match.findMany({
            where: { competitionId: id },
            select: { homeTeamId: true, awayTeamId: true },
            take: 60,
          });
          compTeams.forEach((m) => {
            ids.push(m.homeTeamId, m.awayTeamId);
          });
        }
        if (ids.length === 0) return [];
        return db.player.findMany({
          where: { teamId: { in: [...new Set(ids)] }, goals: { gt: 0 } },
          orderBy: { goals: "desc" },
          take: 8,
          include: { team: { select: { id: true, name: true, initials: true, color: true } } },
        });
      })(),
    ]);

    return ok({ competition, standings, matches, topScorers });
  } catch (e) {
    return handleError(e);
  }
}
