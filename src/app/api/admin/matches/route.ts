import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const matches = await db.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, initials: true, color: true } },
        awayTeam: { select: { id: true, name: true, initials: true, color: true } },
        competition: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: { kickoff: "desc" },
      take: 60,
    });
    const competitions = await db.competition.findMany({ select: { id: true, name: true } });
    const teams = await db.team.findMany({ select: { id: true, name: true, initials: true } });
    return ok({ matches, competitions, teams });
  } catch (e) {
    return handleError(e);
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).optional(),
  homeScore: z.number().int().min(0).max(30).optional(),
  awayScore: z.number().int().min(0).max(30).optional(),
  minute: z.number().int().min(0).max(130).optional().nullable(),
  kickoff: z.string().optional(),
  competitionId: z.string().optional(),
  homeTeamId: z.string().optional(),
  awayTeamId: z.string().optional(),
  venue: z.string().optional(),
  round: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const { id, kickoff, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (kickoff) data.kickoff = new Date(kickoff);

    const match = await db.match.update({ where: { id }, data });
    return ok({ match });
  } catch (e) {
    return handleError(e);
  }
}

const createSchema = z.object({
  competitionId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoff: z.string().min(1),
  venue: z.string().optional().nullable(),
  round: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    if (parsed.data.homeTeamId === parsed.data.awayTeamId) return fail("The same team cannot be both home and away", 422);

    const match = await db.match.create({
      data: {
        ...parsed.data,
        venue: parsed.data.venue ?? null,
        round: parsed.data.round ?? null,
        kickoff: new Date(parsed.data.kickoff),
        status: "SCHEDULED",
      },
    });
    return ok({ match });
  } catch (e) {
    return handleError(e);
  }
}
