import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const payouts = await db.payoutRequest.findMany({
      include: { creator: { select: { id: true, name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ payouts });
  } catch (e) {
    return handleError(e);
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "PAID", "REJECTED"]),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return fail("ভুল তথ্য", 422);

    const payout = await db.payoutRequest.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
      include: { creator: { select: { id: true, name: true, username: true } } },
    });
    return ok({ payout });
  } catch (e) {
    return handleError(e);
  }
}
