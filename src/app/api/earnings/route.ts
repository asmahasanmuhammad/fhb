import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { requireCreatorOrAdmin } from "@/lib/auth";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireCreatorOrAdmin();

    const [earnings, videos, payoutRequests] = await Promise.all([
      db.earning.findMany({
        where: { creatorId: user.id, source: { not: "PAYOUT" } },
        include: { video: { select: { id: true, title: true, thumbnailUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      db.video.findMany({
        where: { creatorId: user.id },
        select: { id: true, title: true, views: true, likeCount: true, monetized: true, createdAt: true, thumbnailUrl: true },
        orderBy: { views: "desc" },
      }),
      db.payoutRequest.findMany({ where: { creatorId: user.id }, orderBy: { createdAt: "desc" } }),
    ]);

    const total = earnings.reduce((s, e) => s + e.amount, 0);
    const paidOut = payoutRequests.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
    const pending = payoutRequests.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
    const balance = total - paidOut - pending;
    const totalViews = videos.reduce((s, v) => s + v.views, 0);

    // monthly series for chart (last 6 months)
    const months: Array<{ month: string; amount: number }> = [];
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const amount = earnings
        .filter((e) => e.createdAt >= d && e.createdAt < next)
        .reduce((s, e) => s + e.amount, 0);
      months.push({ month: monthNames[d.getMonth()], amount });
    }

    return ok({
      earnings, videos, payoutRequests,
      stats: {
        total,
        balance,
        pending,
        paidOut,
        totalViews,
        monetizedCount: videos.filter((v) => v.monetized).length,
        rpm: totalViews > 0 ? (total / totalViews) * 1000 : 0, // BDT per 1000 views
      },
      monthly: months,
    });
  } catch (e) {
    return handleError(e);
  }
}
