import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
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
