import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser, createSession, setSessionCookie } from "@/lib/auth";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

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
    if (!parsed.success) return fail("Select a valid plan", 422);

    const plan = await db.membershipPlan.findUnique({ where: { code: parsed.data.planCode } });
    if (!plan) return fail("Plan not found", 404);

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

    // Re-issue updated session token with new premium status
    const newToken = await createSession(user.id, {
      ...user,
      isPremium: updated.isPremium,
      premiumUntil: updated.premiumUntil,
    });
    await setSessionCookie(newToken);

    return ok({
      plan: plan.code,
      isPremium: updated.isPremium,
      premiumUntil: updated.premiumUntil,
      message: plan.price > 0 ? `${plan.name} plan activated! (demo payment)` : "You are back on the free plan",
    });
  } catch (e) {
    return handleError(e);
  }
}
