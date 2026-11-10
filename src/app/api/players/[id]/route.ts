import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

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
