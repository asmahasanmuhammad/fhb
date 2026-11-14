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

    // Map match events (goals, yellow/red cards) to player nodes
    const mapEventsToPlayers = (players: typeof homeLineup.players, teamSide: "home" | "away") => {
      const teamEvents = match.events?.filter((e) => e.teamSide?.toLowerCase() === teamSide.toLowerCase()) || [];
      return players.map((p) => {
        const pLower = p.name.toLowerCase();
        const goalsScored = teamEvents.filter(
          (e) =>
            (e.type === "GOAL" || e.type === "PENALTY") &&
            e.playerName &&
            (pLower.includes(e.playerName.toLowerCase()) || e.playerName.toLowerCase().includes(pLower))
        ).length;
        const hasYellow = teamEvents.some(
          (e) =>
            e.type === "YELLOW" &&
            e.playerName &&
            (pLower.includes(e.playerName.toLowerCase()) || e.playerName.toLowerCase().includes(pLower))
        );
        const hasRed = teamEvents.some(
          (e) =>
            e.type === "RED" &&
            e.playerName &&
            (pLower.includes(e.playerName.toLowerCase()) || e.playerName.toLowerCase().includes(pLower))
        );

        return {
          ...p,
          goals: goalsScored > 0 ? goalsScored : p.goals,
          yellowCard: hasYellow || p.yellowCard,
          redCard: hasRed || p.redCard,
        };
      });
    };

    const homeMappedLineup = mapEventsToPlayers(homeLineup.players, "home");
    const homeMappedSubs = mapEventsToPlayers(homeLineup.subs, "home");
    const awayMappedLineup = mapEventsToPlayers(awayLineup.players, "away");
    const awayMappedSubs = mapEventsToPlayers(awayLineup.subs, "away");

    return ok({
      matchId: match.id,
      competition: match.competition,
      home: {
        team: match.homeTeam,
        formation: homeLineup.formation,
        manager: homeLineup.manager,
        lineup: homeMappedLineup,
        subs: homeMappedSubs,
      },
      away: {
        team: match.awayTeam,
        formation: awayLineup.formation,
        manager: awayLineup.manager,
        lineup: awayMappedLineup,
        subs: awayMappedSubs,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
