import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const team = await db.team.findUnique({
      where: { id },
      include: { players: { orderBy: [{ position: "asc" }, { jerseyNumber: "asc" }] } },
    });
    if (!team) return fail("Team not found", 404);

    const matches = await db.match.findMany({
      where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
      include: {
        homeTeam: { select: { id: true, name: true, initials: true, color: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, initials: true, color: true, logoUrl: true } },
        competition: { select: { id: true, name: true, shortName: true, accentColor: true } },
      },
      orderBy: { kickoff: "desc" },
      take: 10,
    });

    const standings = await db.standing.findMany({
      where: { teamId: id },
      include: { competition: { select: { id: true, name: true, shortName: true } } },
    });

    return ok({ team, matches, standings });
  } catch (e) {
    return handleError(e);
  }
}
