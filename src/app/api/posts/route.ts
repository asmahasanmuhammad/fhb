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
    const [posts, total] = await Promise.all([
      db.post.findMany({
        include: { author: { select: { id: true, name: true, username: true, avatarUrl: true, isPremium: true, role: true, followerCount: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
        skip: offset,
      }),
      db.post.count(),
    ]);

    // suggested creators to follow
    const suggested = await db.user.findMany({
      where: { role: { in: ["CREATOR", "ADMIN"] } },
      select: { id: true, name: true, username: true, avatarUrl: true, bio: true, followerCount: true, isPremium: true, role: true },
      take: 6,
      orderBy: { followerCount: "desc" },
    });

    return ok({ posts, total, suggested });
  } catch (e) {
    return handleError(e);
  }
}

const postSchema = z.object({
  content: z.string().trim().min(2, "Write something in your post").max(600, "Keep it within 600 characters"),
  matchTag: z.string().trim().max(30).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const post = await db.post.create({
      data: { authorId: user.id, content: parsed.data.content, matchTag: parsed.data.matchTag ?? null },
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true, isPremium: true, role: true, followerCount: true } } },
    });
    return ok({ post });
  } catch (e) {
    return handleError(e);
  }
}
