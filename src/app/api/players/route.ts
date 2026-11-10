import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const position = sp.get("position");
    const teamId = sp.get("teamId");
    const national = sp.get("national");
    const q = sp.get("q")?.trim();
    const sort = sp.get("sort") ?? "goals"; // goals | rating | name

    const where: Record<string, unknown> = {};
    if (position) where.position = position;
    if (teamId) where.teamId = teamId;
    if (national === "true") where.isNationalTeam = true;
    if (q) where.name = { contains: q };

    const orderBy: Record<string, string> =
      sort === "rating" ? { rating: "desc" } : sort === "name" ? { name: "asc" } : { goals: "desc" };

    const players = await db.player.findMany({
      where,
      include: { team: { select: { id: true, name: true, initials: true, color: true, color2: true, logoUrl: true } } },
      orderBy,
      take: 120,
    });
    return ok({ players });
  } catch (e) {
    return handleError(e);
  }
}
