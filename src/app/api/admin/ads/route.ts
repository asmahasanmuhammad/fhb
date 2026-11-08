import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  adCode: z.string().optional(),
  name: z.string().optional(),
  provider: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return fail("ভুল তথ্য", 422);

    const { id, ...rest } = parsed.data;
    const ad = await db.adSlot.update({ where: { id }, data: rest });
    return ok({ ad });
  } catch (e) {
    return handleError(e);
  }
}
