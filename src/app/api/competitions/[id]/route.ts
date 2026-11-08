import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const competition = await db.competition.findUnique({ where: { id } });
    if (!competition) return fail("টুর্নামেন্ট পাওয়া যায়নি", 404);

    const [standings, matches, topScorers] = await Promise.all([
      competition.type === "LEAGUE"
        ? db.standing.findMany({
            where: { competitionId: id },
            include: { team: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, city: true } } },
            orderBy: { position: "asc" },
          })
        : Promise.resolve([]),
      db.match.findMany({
        where: { competitionId: id },
        include: {
          homeTeam: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true } },
          awayTeam: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true } },
        },
        orderBy: { kickoff: "desc" },
        take: 40,
      }),
      db.player.findMany({
        where: { goals: { gt: 0 } },
        orderBy: { goals: "desc" },
        take: 8,
        include: { team: { select: { id: true, name: true, initials: true, color: true } } },
      }),
    ]);

    return ok({ competition, standings, matches, topScorers });
  } catch (e) {
    return handleError(e);
  }
}
