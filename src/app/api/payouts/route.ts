import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { requireCreatorOrAdmin } from "@/lib/auth";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.number().min(500, "Minimum withdrawal is Tk 500"),
  method: z.enum(["BKASH", "NAGAD", "BANK"]),
  account: z.string().trim().min(5, "Enter your account number").max(40),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireCreatorOrAdmin();
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    // check balance
    const [earnings, payouts] = await Promise.all([
      db.earning.findMany({ where: { creatorId: user.id, source: { not: "PAYOUT" } } }),
      db.payoutRequest.findMany({ where: { creatorId: user.id, status: { in: ["PENDING", "PAID", "APPROVED"] } } }),
    ]);
    const total = earnings.reduce((s, e) => s + e.amount, 0);
    const held = payouts.reduce((s, p) => s + p.amount, 0);
    if (parsed.data.amount > total - held) {
      return fail("Insufficient balance", 422);
    }

    const payout = await db.payoutRequest.create({
      data: { creatorId: user.id, ...parsed.data, status: "PENDING" },
    });
    return ok({ payout });
  } catch (e) {
    return handleError(e);
  }
}
