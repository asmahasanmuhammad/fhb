import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Handle /api/matches/live
    if (id === "live") {
      const [liveMatches, recentEvents] = await Promise.all([
        db.match.findMany({
          where: { status: "LIVE" },
          include: {
            homeTeam: {
              select: { id: true, name: true, shortName: true, initials: true, color: true, logoUrl: true },
            },
            awayTeam: {
              select: { id: true, name: true, shortName: true, initials: true, color: true, logoUrl: true },
            },
            competition: {
              select: { id: true, name: true, shortName: true, accentColor: true },
            },
          },
          orderBy: { minute: "desc" },
        }),
        db.matchEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
        }),
      ]);

      const formattedEvents = recentEvents.map((e) => ({
        id: e.id,
        text: `${e.type === "GOAL" ? "⚽ GOAL" : e.type === "YELLOW" ? "🟨 Yellow Card" : e.type} (${e.minute}') ${e.playerName ? `: ${e.playerName}` : ""}`,
        minute: e.minute,
        type: e.type,
        ts: new Date(e.createdAt).getTime(),
      }));

      return ok({
        matches: liveMatches.map((m) => ({
          id: m.id,
          minute: m.minute,
          period: m.period,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          competition: m.competition,
          status: "LIVE" as const,
        })),
        events: formattedEvents,
        serverTime: Date.now(),
      });
    }

    const match = await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } },
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
