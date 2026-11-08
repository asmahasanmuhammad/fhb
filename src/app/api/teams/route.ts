import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q")?.trim();
    let teams = await db.team.findMany({
      where: search
        ? { OR: [{ name: { contains: search } }, { shortName: { contains: search, mode: "insensitive" } }, { city: { contains: search } }] }
        : undefined,
      include: { _count: { select: { players: true } } },
      orderBy: { name: "asc" },
    });
    // national teams last
    const national = teams.filter((t) => ["BAN", "IND", "MDV"].includes(t.initials));
    const clubs = teams.filter((t) => !["BAN", "IND", "MDV"].includes(t.initials));
    teams = [...clubs, ...national];
    return ok({ teams });
  } catch (e) {
    return handleError(e);
  }
}
