import { NextRequest } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const playerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Player name must be at least 2 characters").trim(),
  teamId: z.string().nullable().optional(),
  position: z.enum(["GK", "DF", "MF", "FW"], {
    errorMap: () => ({ message: "Position must be GK, DF, MF, or FW" }),
  }),
  nationality: z.string().default("Bangladesh").optional(),
  jerseyNumber: z.number().int().min(1).max(99).nullable().optional(),
  birthYear: z.number().int().min(1960).max(2020).nullable().optional(),
  heightCm: z.number().int().min(120).max(230).nullable().optional(),
  goals: z.number().int().min(0).default(0).optional(),
  assists: z.number().int().min(0).default(0).optional(),
  appearances: z.number().int().min(0).default(0).optional(),
  cleanSheets: z.number().int().min(0).default(0).optional(),
  rating: z.number().min(1.0).max(10.0).default(7.0).optional(),
  isNationalTeam: z.boolean().default(false).optional(),
  photoUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

/**
 * GET /api/admin/players
 * Fetch players with search, filters, team list, and available local player photos.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim();
    const teamId = sp.get("teamId")?.trim();
    const position = sp.get("position")?.trim();
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(sp.get("limit") || "50", 10)));
    const sort = sp.get("sort") || "rating"; // rating | goals | name | createdAt

    const where: Record<string, unknown> = {};
    if (position && position !== "ALL") where.position = position;
    if (teamId && teamId !== "ALL") where.teamId = teamId;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { nationality: { contains: q } },
        { team: { name: { contains: q } } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === "name"
        ? { name: "asc" }
        : sort === "goals"
        ? { goals: "desc" }
        : sort === "appearances"
        ? { appearances: "desc" }
        : { rating: "desc" };

    const [total, players, teams] = await Promise.all([
      db.player.count({ where }),
      db.player.findMany({
        where,
        include: {
          team: {
            select: { id: true, name: true, shortName: true, initials: true, color: true, color2: true, logoUrl: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.team.findMany({
        select: { id: true, name: true, shortName: true, initials: true, color: true, logoUrl: true },
        orderBy: { name: "asc" },
      }),
    ]);

    // Read available local player photos from public/players
    let availablePhotos: string[] = [];
    try {
      const playersDir = path.join(process.cwd(), "public", "players");
      if (fs.existsSync(playersDir)) {
        availablePhotos = fs
          .readdirSync(playersDir)
          .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .map((f) => `/players/${f}`);
      }
    } catch {
      availablePhotos = [];
    }

    return ok({
      players,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      teams,
      availablePhotos,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/admin/players
 * Create a new player.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = playerSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid player data", 422);
    }

    const data = parsed.data;
    const player = await db.player.create({
      data: {
        name: data.name,
        teamId: data.teamId || null,
        position: data.position,
        nationality: data.nationality || "Bangladesh",
        jerseyNumber: data.jerseyNumber ?? null,
        birthYear: data.birthYear ?? null,
        heightCm: data.heightCm ?? null,
        goals: data.goals ?? 0,
        assists: data.assists ?? 0,
        appearances: data.appearances ?? 0,
        cleanSheets: data.cleanSheets ?? 0,
        rating: data.rating ?? 7.0,
        isNationalTeam: Boolean(data.isNationalTeam),
        photoUrl: data.photoUrl ? data.photoUrl.trim() : null,
        bio: data.bio ? data.bio.trim() : null,
      },
      include: {
        team: {
          select: { id: true, name: true, shortName: true, initials: true, color: true, logoUrl: true },
        },
      },
    });

    return ok({ player }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PUT /api/admin/players
 * Update an existing player.
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    if (!body?.id) return fail("Player ID is required for update", 400);

    const parsed = playerSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid player data", 422);
    }

    const { id, ...data } = parsed.data;
    const player = await db.player.update({
      where: { id: body.id },
      data: {
        name: data.name,
        teamId: data.teamId || null,
        position: data.position,
        nationality: data.nationality || "Bangladesh",
        jerseyNumber: data.jerseyNumber ?? null,
        birthYear: data.birthYear ?? null,
        heightCm: data.heightCm ?? null,
        goals: data.goals ?? 0,
        assists: data.assists ?? 0,
        appearances: data.appearances ?? 0,
        cleanSheets: data.cleanSheets ?? 0,
        rating: data.rating ?? 7.0,
        isNationalTeam: Boolean(data.isNationalTeam),
        photoUrl: data.photoUrl ? data.photoUrl.trim() : null,
        bio: data.bio ? data.bio.trim() : null,
      },
      include: {
        team: {
          select: { id: true, name: true, shortName: true, initials: true, color: true, logoUrl: true },
        },
      },
    });

    return ok({ player });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/admin/players
 * Delete player by ID passed in query param or body.
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const sp = req.nextUrl.searchParams;
    let id = sp.get("id");
    if (!id) {
      const body = await req.json().catch(() => null);
      id = body?.id;
    }
    if (!id) return fail("Player ID is required", 400);

    await db.player.delete({ where: { id } });
    return ok({ success: true, id });
  } catch (e) {
    return handleError(e);
  }
}
