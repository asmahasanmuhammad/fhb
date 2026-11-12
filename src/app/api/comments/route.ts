import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getSessionUser, requireUser } from "@/lib/auth";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const targetType = sp.get("targetType");
    const targetId = sp.get("targetId");
    if (!targetType || !targetId) return fail("targetType and targetId are required", 422);

    const comments = await db.comment.findMany({
      where: { targetType, targetId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isPremium: true,
            role: true,
          },
        },
      },
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
  content: z.string().trim().min(1, "Write a comment").max(500, "Keep comments within 500 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const { targetType, targetId, content } = parsed.data;

    const comment = await db.comment.create({
      data: { userId: user.id, targetType, targetId, content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isPremium: true,
            role: true,
          },
        },
      },
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const id = sp.get("id");

    if (!id) return fail("Comment ID is required", 400);

    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) return fail("Comment not found", 404);

    const isAdmin = user.role === "ADMIN";
    const isAuthor = comment.userId === user.id;

    if (!isAdmin && !isAuthor) {
      return fail("You do not have permission to delete this comment", 403);
    }

    await db.comment.delete({ where: { id } });

    // Decrement count on target
    if (comment.targetType === "NEWS") {
      await db.newsArticle.update({ where: { id: comment.targetId }, data: { commentCount: { decrement: 1 } } }).catch(() => {});
    } else if (comment.targetType === "VIDEO") {
      await db.video.update({ where: { id: comment.targetId }, data: { commentCount: { decrement: 1 } } }).catch(() => {});
    } else if (comment.targetType === "POST") {
      await db.post.update({ where: { id: comment.targetId }, data: { commentCount: { decrement: 1 } } }).catch(() => {});
    }

    return ok({ deleted: true, id, message: isAdmin && !isAuthor ? "Comment removed by admin" : "Comment deleted" });
  } catch (e) {
    return handleError(e);
  }
}
