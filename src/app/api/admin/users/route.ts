import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({
      select: {
        id: true, name: true, username: true, email: true, role: true,
        isPremium: true, isBanned: true, followerCount: true, createdAt: true,
        _count: { select: { posts: true, videos: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return ok({ users });
  } catch (e) {
    return handleError(e);
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["USER", "CREATOR", "ADMIN"]).optional(),
  isBanned: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid input", 422);
    if (parsed.data.id === admin.id && parsed.data.isBanned) return fail("You cannot ban yourself", 422);

    const user = await db.user.update({
      where: { id: parsed.data.id },
      data: parsed.data.role ? { role: parsed.data.role } : { isBanned: parsed.data.isBanned },
    });
    return ok({ user: { id: user.id, role: user.role, isBanned: user.isBanned } });
  } catch (e) {
    return handleError(e);
  }
}
