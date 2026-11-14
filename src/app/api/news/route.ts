import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { autoSyncOneNewsArticle } from "@/lib/news-sync";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Check if 30 minutes have passed since last published article
    try {
      const latest = await db.newsArticle.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      const now = Date.now();
      const THIRTY_MINS = 30 * 60 * 1000;
      if (!latest || (now - new Date(latest.createdAt).getTime() >= THIRTY_MINS)) {
        await autoSyncOneNewsArticle();
      }
    } catch (syncErr) {
      console.warn("[api/news] Auto-sync attempt error:", syncErr);
    }

    const sp = req.nextUrl.searchParams;
    const category = sp.get("category");
    const featured = sp.get("featured");
    const limit = Math.min(parseInt(sp.get("limit") ?? "20", 10), 50);
    const offset = parseInt(sp.get("offset") ?? "0", 10);

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (category && category !== "ALL") where.category = category;
    if (featured === "true") where.featured = true;

    const [articles, total] = await Promise.all([
      db.newsArticle.findMany({
        where,
        include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.newsArticle.count({ where }),
    ]);

    return ok({ articles, total });
  } catch (e) {
    return handleError(e);
  }
}
