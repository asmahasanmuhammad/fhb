import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

// GET: check if current user liked given targets
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const targetType = sp.get("targetType");
    const targetIds = (sp.get("targetIds") ?? "").split(",").filter(Boolean);
    if (!targetType || targetIds.length === 0) return ok({ liked: [] });

    const user = await requireUser();
    const likes = await db.like.findMany({
      where: { userId: user.id, targetType, targetId: { in: targetIds } },
      select: { targetId: true },
    });
    return ok({ liked: likes.map((l) => l.targetId) });
  } catch {
    return ok({ liked: [] });
  }
}

const likeSchema = z.object({
  targetType: z.enum(["NEWS", "VIDEO", "POST", "COMMENT"]),
  targetId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = likeSchema.safeParse(body);
    if (!parsed.success) return fail("ভুল অনুরোধ", 422);

    const { targetType, targetId } = parsed.data;

    const existing = await db.like.findUnique({
      where: { userId_targetType_targetId: { userId: user.id, targetType, targetId } },
    });

    if (existing) {
      // unlike
      await db.like.delete({ where: { id: existing.id } });
      const delta = { decrement: 1 };
      if (targetType === "NEWS") await db.newsArticle.update({ where: { id: targetId }, data: { likeCount: delta } }).catch(() => {});
      if (targetType === "VIDEO") await db.video.update({ where: { id: targetId }, data: { likeCount: delta } }).catch(() => {});
      if (targetType === "POST") await db.post.update({ where: { id: targetId }, data: { likeCount: delta } }).catch(() => {});
      return ok({ liked: false });
    } else {
      await db.like.create({ data: { userId: user.id, targetType, targetId } });
      const delta = { increment: 1 };
      if (targetType === "NEWS") await db.newsArticle.update({ where: { id: targetId }, data: { likeCount: delta } }).catch(() => {});
      if (targetType === "VIDEO") await db.video.update({ where: { id: targetId }, data: { likeCount: delta } }).catch(() => {});
      if (targetType === "POST") await db.post.update({ where: { id: targetId }, data: { likeCount: delta } }).catch(() => {});
      return ok({ liked: true });
    }
  } catch (e) {
    return handleError(e);
  }
}
