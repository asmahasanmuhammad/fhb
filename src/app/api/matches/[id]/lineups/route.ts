import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getTeamStartingXI } from "@/lib/team-lineups";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } },
        competition: true,
        events: true,
      },
    });

    if (!match) return fail("Match not found", 404);

    const homeLineup = getTeamStartingXI(match.homeTeam, match.homeTeam.players);
    const awayLineup = getTeamStartingXI(match.awayTeam, match.awayTeam.players);

    // Map any match events to player nodes
    const goals = match.events?.filter((e) => e.type === "GOAL" || e.type === "PENALTY") || [];
    const yellows = match.events?.filter((e) => e.type === "YELLOW") || [];

    return ok({
      matchId: match.id,
      competition: match.competition,
      home: {
        team: match.homeTeam,
        formation: homeLineup.formation,
        manager: homeLineup.manager,
        lineup: homeLineup.players,
        subs: homeLineup.subs,
      },
      away: {
        team: match.awayTeam,
        formation: awayLineup.formation,
        manager: awayLineup.manager,
        lineup: awayLineup.players,
        subs: awayLineup.subs,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
