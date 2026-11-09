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
  title: z.string().trim().min(5, "শিরোনাম কমপক্ষে ৫ অক্ষরের").max(160),
  excerpt: z.string().trim().min(10, "সারসংক্ষেপ কমপক্ষে ১০ অক্ষরের").max(400),
  content: z.string().trim().min(20, "বিস্তারিত লেখা কমপক্ষে ২০ অক্ষরের"),
  category: z.enum(["BPL", "NATIONAL", "TRANSFER", "INTERNATIONAL", "OPINION"]),
  coverUrl: z.string().trim().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  featured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = articleSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ভুল তথ্য", 422);

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
    if (!parsedId.success) return fail("আইডি প্রয়োজন", 422);

    const parsed = articleSchema.partial().safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ভুল তথ্য", 422);

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
    if (!id) return fail("আইডি প্রয়োজন", 422);
    await db.newsArticle.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
