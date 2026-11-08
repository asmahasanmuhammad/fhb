import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true, name: true, username: true, avatarUrl: true, bio: true, role: true,
        isPremium: true, followerCount: true, followingCount: true, createdAt: true,
      },
    });
    if (!user) return fail("ইউজার পাওয়া যায়নি", 404);

    const [posts, videos] = await Promise.all([
      db.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.video.findMany({
        where: { creatorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // is current user following this profile?
    const me = await getSessionUser();
    let following = false;
    if (me && me.id !== user.id) {
      const rel = await db.follow.findUnique({
        where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
      });
      following = !!rel;
    }

    const totalLikes =
      posts.reduce((s, p) => s + p.likeCount, 0) + videos.reduce((s, v) => s + v.likeCount, 0);

    return ok({ user, posts, videos, following, totalLikes });
  } catch (e) {
    return handleError(e);
  }
}
