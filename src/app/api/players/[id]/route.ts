import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const player = await db.player.findUnique({
      where: { id },
      include: { team: true },
    });
    if (!player) return fail("Player not found", 404);

    const similar = player.teamId
      ? await db.player.findMany({
          where: { teamId: player.teamId, id: { not: player.id }, position: player.position },
          take: 4,
          include: { team: { select: { id: true, name: true, initials: true, color: true, logoUrl: true } } },
        })
      : [];

    return ok({ player, similar });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) return fail("Request body is required", 400);

    const player = await db.player.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.teamId !== undefined ? { teamId: body.teamId || null } : {}),
        ...(body.position !== undefined ? { position: body.position } : {}),
        ...(body.nationality !== undefined ? { nationality: body.nationality } : {}),
        ...(body.jerseyNumber !== undefined ? { jerseyNumber: body.jerseyNumber } : {}),
        ...(body.birthYear !== undefined ? { birthYear: body.birthYear } : {}),
        ...(body.heightCm !== undefined ? { heightCm: body.heightCm } : {}),
        ...(body.goals !== undefined ? { goals: body.goals } : {}),
        ...(body.assists !== undefined ? { assists: body.assists } : {}),
        ...(body.appearances !== undefined ? { appearances: body.appearances } : {}),
        ...(body.cleanSheets !== undefined ? { cleanSheets: body.cleanSheets } : {}),
        ...(body.rating !== undefined ? { rating: body.rating } : {}),
        ...(body.isNationalTeam !== undefined ? { isNationalTeam: Boolean(body.isNationalTeam) } : {}),
        ...(body.photoUrl !== undefined ? { photoUrl: body.photoUrl ? body.photoUrl.trim() : null } : {}),
        ...(body.bio !== undefined ? { bio: body.bio ? body.bio.trim() : null } : {}),
      },
      include: { team: true },
    });

    return ok({ player });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.player.delete({ where: { id } });
    return ok({ success: true, id });
  } catch (e) {
    return handleError(e);
  }
}
