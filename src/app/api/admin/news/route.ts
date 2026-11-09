import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

// GET: all articles for management table
export async function GET() {
  try {
    await requireAdmin();
    const articles = await db.newsArticle.findMany({
      include: { author: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ articles });
  } catch (e) {
    return handleError(e);
  }
}

const articleSchema = z.object({
  title: z.string().trim().min(5, "Headline must be at least 5 characters").max(160),
  excerpt: z.string().trim().min(10, "Excerpt must be at least 10 characters").max(400),
  content: z.string().trim().min(20, "Article body must be at least 20 characters"),
  category: z.enum(["BFL", "NATIONAL", "TRANSFER", "INTERNATIONAL", "OPINION"]),
  coverUrl: z.string().trim().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  featured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = articleSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const slug = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const article = await db.newsArticle.create({
      data: {
        ...parsed.data,
        slug,
        authorId: admin.id,
        coverUrl: parsed.data.coverUrl || null,
      },
    });
    return ok({ article });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const idSchema = z.object({ id: z.string().min(1) });
    const parsedId = idSchema.safeParse(body);
    if (!parsedId.success) return fail("ID is required", 422);

    const parsed = articleSchema.partial().safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const article = await db.newsArticle.update({
      where: { id: parsedId.data.id },
      data: parsed.data,
    });
    return ok({ article });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("ID is required", 422);
    await db.newsArticle.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
