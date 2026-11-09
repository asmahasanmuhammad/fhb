import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

// GET: is current user following X?
export async function GET(req: NextRequest) {
  try {
    const followingId = req.nextUrl.searchParams.get("followingId");
    if (!followingId) return fail("followingId প্রয়োজন", 422);
    const user = await requireUser();
    const rel = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });
    return ok({ following: !!rel });
  } catch {
    return ok({ following: false });
  }
}

const followSchema = z.object({ followingId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = followSchema.safeParse(body);
    if (!parsed.success) return fail("ভুল অনুরোধ", 422);
    const { followingId } = parsed.data;
    if (followingId === user.id) return fail("নিজেকে ফলো করা যায় না", 422);

    const target = await db.user.findUnique({ where: { id: followingId } });
    if (!target) return fail("ইউজার পাওয়া যায়নি", 404);

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });
    if (existing) {
      await db.follow.delete({ where: { id: existing.id } });
      await db.user.update({ where: { id: followingId }, data: { followerCount: { decrement: 1 } } });
      await db.user.update({ where: { id: user.id }, data: { followingCount: { decrement: 1 } } });
      return ok({ following: false });
    } else {
      await db.follow.create({ data: { followerId: user.id, followingId } });
      await db.user.update({ where: { id: followingId }, data: { followerCount: { increment: 1 } } });
      await db.user.update({ where: { id: user.id }, data: { followingCount: { increment: 1 } } });
      return ok({ following: true });
    }
  } catch (e) {
    return handleError(e);
  }
}
