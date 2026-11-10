import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { NATIONAL_TEAM_INITIALS } from "@/lib/types";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q")?.trim();
    let teams = await db.team.findMany({
      where: search
        ? { OR: [{ name: { contains: search } }, { shortName: { contains: search } }, { city: { contains: search } }] }
        : undefined,
      include: {
        _count: { select: { players: true } },
        standings: {
          take: 1,
          orderBy: { position: "asc" },
          select: { position: true, competition: { select: { id: true, name: true, shortName: true, country: true, type: true, accentColor: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
    // national teams last
    const national = teams.filter((t) => NATIONAL_TEAM_INITIALS.includes(t.initials));
    const clubs = teams.filter((t) => !NATIONAL_TEAM_INITIALS.includes(t.initials));
    teams = [...clubs, ...national];
    return ok({ teams });
  } catch (e) {
    return handleError(e);
  }
}
