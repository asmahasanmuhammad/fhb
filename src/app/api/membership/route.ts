import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const plans = await db.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });
    return ok({ plans });
  } catch (e) {
    return handleError(e);
  }
}

const subscribeSchema = z.object({ planCode: z.enum(["FREE", "PRO", "LEGEND"]) });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) return fail("সঠিক প্ল্যান নির্বাচন করুন", 422);

    const plan = await db.membershipPlan.findUnique({ where: { code: parsed.data.planCode } });
    if (!plan) return fail("প্ল্যান পাওয়া যায়নি", 404);

    // simulate payment success (demo mode — real bKash/Nagad/SSLCommerz integration point)
    const expiresAt = plan.price === 0 ? new Date(0) : new Date(Date.now() + 30 * 864e5);

    // expire old subscriptions
    await db.subscription.updateMany({
      where: { userId: user.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    await db.subscription.create({
      data: {
        userId: user.id,
        planCode: plan.code,
        amount: plan.price,
        status: plan.price === 0 ? "CANCELLED" : "ACTIVE",
        expiresAt,
      },
    });

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        isPremium: plan.price > 0,
        premiumUntil: plan.price > 0 ? expiresAt : null,
      },
    });

    return ok({
      plan: plan.code,
      isPremium: updated.isPremium,
      premiumUntil: updated.premiumUntil,
      message: plan.price > 0 ? `${plan.name} প্ল্যান অ্যাক্টিভ হয়েছে! (ডেমো পেমেন্ট)` : "ফ্রি প্ল্যানে ফিরে এসেছেন",
    });
  } catch (e) {
    return handleError(e);
  }
}
