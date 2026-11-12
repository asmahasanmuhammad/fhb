import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status"); // LIVE | SCHEDULED | FINISHED | ALL
    const competitionId = sp.get("competitionId");
    const dateStr = sp.get("date"); // optional YYYY-MM-DD (UTC matchday)
    const days = parseInt(sp.get("days") ?? "60", 10);
    const limit = Math.min(parseInt(sp.get("limit") ?? "1000", 10), 2000);

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") where.status = status;
    if (competitionId) where.competitionId = competitionId;

    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      where.kickoff = { gte: startOfDay, lte: endOfDay };
    } else {
      const now = new Date();
      // Include past results (-days) and future fixtures (+days)
      const from = new Date(now.getTime() - days * 864e5);
      const to = new Date(now.getTime() + days * 864e5);
      where.kickoff = { gte: from, lte: to };
    }

    const matches = await db.match.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, city: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, city: true, logoUrl: true } },
        competition: { select: { id: true, name: true, shortName: true, type: true, accentColor: true } },
        events: {
          where: { type: "GOAL" },
          select: { id: true, minute: true, type: true, teamSide: true, playerName: true, detail: true },
          orderBy: { minute: "asc" },
        },
      },
      orderBy: [{ kickoff: "asc" }],
      take: limit,
    });

    return ok({ matches });
  } catch (e) {
    return handleError(e);
  }
}
