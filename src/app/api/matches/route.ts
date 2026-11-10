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
    const days = parseInt(sp.get("days") ?? "30", 10);
    const limit = Math.min(parseInt(sp.get("limit") ?? "80", 10), 200);

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") where.status = status;
    if (competitionId) where.competitionId = competitionId;

    const now = new Date();
    const from = new Date(now.getTime() - days / 2 * 864e5);
    const to = new Date(now.getTime() + days * 864e5);
    where.kickoff = { gte: from, lte: to };

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
      orderBy: [{ kickoff: status === "SCHEDULED" ? "asc" : "desc" }],
      take: limit,
    });

    return ok({ matches });
  } catch (e) {
    return handleError(e);
  }
}
