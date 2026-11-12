import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { getSessionUser, requireUser, requireCreatorOrAdmin } from "@/lib/auth";
import { z } from "zod";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const creatorId = sp.get("creatorId");
    const where = creatorId ? { creatorId } : {};
    const videos = await db.video.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            followerCount: true,
            isPremium: true,
          },
        },
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const id = sp.get("id");

    if (!id) return fail("Video ID is required", 400);

    const video = await db.video.findUnique({ where: { id } });
    if (!video) return fail("Video not found", 404);

    const isAdmin = user.role === "ADMIN";
    const isCreator = video.creatorId === user.id;

    if (!isAdmin && !isCreator) {
      return fail("You do not have permission to delete this video", 403);
    }

    // Cascade delete likes and comments
    await db.comment.deleteMany({ where: { targetType: "VIDEO", targetId: id } }).catch(() => {});
    await db.like.deleteMany({ where: { targetType: "VIDEO", targetId: id } }).catch(() => {});
    await db.video.delete({ where: { id } });

    return ok({ deleted: true, id, message: isAdmin && !isCreator ? "Video removed by admin" : "Video deleted" });
  } catch (e) {
    return handleError(e);
  }
}
