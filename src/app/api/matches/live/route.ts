import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const liveMatches = await db.match.findMany({
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
        events: {
          orderBy: { minute: "desc" },
          take: 10,
        },
      },
      orderBy: { minute: "desc" },
    });

    const liveMatchIds = liveMatches.map((m) => m.id);

    // Only return live events for matches that are CURRENTLY LIVE
    const recentEvents = liveMatchIds.length > 0
      ? await db.matchEvent.findMany({
          where: { matchId: { in: liveMatchIds } },
          orderBy: { createdAt: "desc" },
          take: 15,
        })
      : [];

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
  } catch (e) {
    return handleError(e);
  }
}
