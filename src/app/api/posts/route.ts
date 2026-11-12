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
    const offset = parseInt(sp.get("offset") ?? "0", 10);
    const tag = sp.get("tag");
    const filter = sp.get("filter") ?? "Latest"; // Latest | Hot | Following

    const sessionUser = await getSessionUser();

    const where: Record<string, unknown> = {};

    if (tag && tag !== "ALL") {
      where.matchTag = tag;
    }

    if (filter === "Following" && sessionUser) {
      const followingList = await db.follow.findMany({
        where: { followerId: sessionUser.id },
        select: { followingId: true },
      });
      const ids = followingList.map((f) => f.followingId);
      where.authorId = { in: ids };
    }

    const orderBy: Array<Record<string, "asc" | "desc">> =
      filter === "Hot"
        ? [{ likeCount: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              isPremium: true,
              role: true,
              followerCount: true,
            },
          },
        },
        orderBy,
        take: 20,
        skip: offset,
      }),
      db.post.count({ where }),
    ]);

    // suggested creators to follow
    const suggested = await db.user.findMany({
      where: { role: { in: ["CREATOR", "ADMIN"] } },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        followerCount: true,
        isPremium: true,
        role: true,
      },
      take: 6,
      orderBy: { followerCount: "desc" },
    });

    return ok({ posts, total, suggested });
  } catch (e) {
    return handleError(e);
  }
}

const postSchema = z.object({
  content: z.string().trim().min(1, "Write something in your post").max(1000, "Keep it within 1000 characters"),
  matchTag: z.string().trim().max(50).optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const post = await db.post.create({
      data: {
        authorId: user.id,
        content: parsed.data.content,
        matchTag: parsed.data.matchTag ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isPremium: true,
            role: true,
            followerCount: true,
          },
        },
      },
    });
    return ok({ post });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const id = sp.get("id");

    if (!id) return fail("Post ID is required", 400);

    const post = await db.post.findUnique({ where: { id } });
    if (!post) return fail("Post not found", 404);

    const isAdmin = user.role === "ADMIN";
    const isAuthor = post.authorId === user.id;

    if (!isAdmin && !isAuthor) {
      return fail("You do not have permission to delete this post", 403);
    }

    // Cascade delete comments and likes associated with this post
    await db.comment.deleteMany({ where: { targetType: "POST", targetId: id } }).catch(() => {});
    await db.like.deleteMany({ where: { targetType: "POST", targetId: id } }).catch(() => {});
    await db.post.delete({ where: { id } });

    return ok({ deleted: true, id, message: isAdmin && !isAuthor ? "Post removed by admin" : "Post deleted" });
  } catch (e) {
    return handleError(e);
  }
}
