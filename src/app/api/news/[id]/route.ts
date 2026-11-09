import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const article = await db.newsArticle.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true } } },
    });
    if (!article || article.status !== "PUBLISHED") return fail("Article not found", 404);

    // increment views (fire & forget)
    db.newsArticle.update({ where: { id: article.id }, data: { views: { increment: 1 } } }).catch(() => {});

    const related = await db.newsArticle.findMany({
      where: { category: article.category, id: { not: article.id }, status: "PUBLISHED" },
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return ok({ article, related });
  } catch (e) {
    return handleError(e);
  }
}
