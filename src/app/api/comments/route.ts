import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getSessionUser, requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const targetType = sp.get("targetType");
    const targetId = sp.get("targetId");
    if (!targetType || !targetId) return fail("targetType ও targetId প্রয়োজন", 422);

    const comments = await db.comment.findMany({
      where: { targetType, targetId },
      include: { user: { select: { id: true, name: true, username: true, avatarUrl: true, isPremium: true, role: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return ok({ comments });
  } catch (e) {
    return handleError(e);
  }
}

const commentSchema = z.object({
  targetType: z.enum(["NEWS", "VIDEO", "POST"]),
  targetId: z.string().min(1),
  content: z.string().trim().min(1, "কমেন্ট লিখুন").max(500, "কমেন্ট ৫০০ অক্ষরের মধ্যে রাখুন"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ভুল তথ্য", 422);

    const { targetType, targetId, content } = parsed.data;

    const comment = await db.comment.create({
      data: { userId: user.id, targetType, targetId, content },
      include: { user: { select: { id: true, name: true, username: true, avatarUrl: true, isPremium: true, role: true } } },
    });

    // increment count on target
    if (targetType === "NEWS") {
      await db.newsArticle.update({ where: { id: targetId }, data: { commentCount: { increment: 1 } } }).catch(() => {});
    } else if (targetType === "VIDEO") {
      await db.video.update({ where: { id: targetId }, data: { commentCount: { increment: 1 } } }).catch(() => {});
    } else if (targetType === "POST") {
      await db.post.update({ where: { id: targetId }, data: { commentCount: { increment: 1 } } }).catch(() => {});
    }

    return ok({ comment });
  } catch (e) {
    return handleError(e);
  }
}
