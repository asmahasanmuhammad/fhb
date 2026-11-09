import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getSessionUser, requireCreatorOrAdmin } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const creatorId = sp.get("creatorId");
    const where = creatorId ? { creatorId } : {};
    const videos = await db.video.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, username: true, avatarUrl: true, followerCount: true, isPremium: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return ok({ videos });
  } catch (e) {
    return handleError(e);
  }
}

const uploadSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().max(500).optional().nullable(),
  videoUrl: z.string().trim().min(3, "Enter a video URL"),
  thumbnailUrl: z.string().trim().optional().nullable(),
  tags: z.string().trim().max(120).optional().nullable(),
  monetized: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireCreatorOrAdmin();
    const body = await req.json().catch(() => null);
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const video = await db.video.create({
      data: {
        creatorId: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        videoUrl: parsed.data.videoUrl,
        thumbnailUrl: parsed.data.thumbnailUrl ?? null,
        tags: parsed.data.tags ?? null,
        monetized: parsed.data.monetized ?? false,
      },
      include: { creator: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    });
    return ok({ video });
  } catch (e) {
    return handleError(e);
  }
}
