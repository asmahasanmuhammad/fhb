import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const [
      totalUsers, creators, premiumUsers, totalArticles, totalVideos, totalPosts,
      totalComments, totalMatches, liveMatches, totalViews, videoViews,
      recentUsers, recentArticles, ads, membershipRevenue,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "CREATOR" } }),
      db.user.count({ where: { isPremium: true } }),
      db.newsArticle.count(),
      db.video.count(),
      db.post.count(),
      db.comment.count(),
      db.match.count(),
      db.match.count({ where: { status: "LIVE" } }),
      db.newsArticle.aggregate({ _sum: { views: true } }),
      db.video.aggregate({ _sum: { views: true } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, username: true, role: true, isPremium: true, createdAt: true },
      }),
      db.newsArticle.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, category: true, views: true, status: true, createdAt: true },
      }),
      db.adSlot.findMany({ orderBy: { placement: "asc" } }),
      db.subscription.aggregate({
        where: { status: "ACTIVE" },
        _sum: { amount: true },
      }),
    ]);

    const adRevenue = ads.reduce((s, a) => s + a.impressions * 0.35 + a.clicks * 3.2, 0); // est. BDT

    return ok({
      stats: {
        totalUsers, creators, premiumUsers, totalArticles, totalVideos, totalPosts,
        totalComments, totalMatches, liveMatches,
        newsViews: totalViews._sum.views ?? 0,
        videoViews: videoViews._sum.views ?? 0,
        adRevenue,
        membershipRevenue: membershipRevenue._sum.amount ?? 0,
      },
      recentUsers, recentArticles, ads,
    });
  } catch (e) {
    return handleError(e);
  }
}
