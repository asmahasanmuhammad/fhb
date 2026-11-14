import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { verifyPasswordResetToken, createSession, setSessionCookie, toSafeUser } from "@/lib/auth";
import { ok, fail, handleError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`reset-pw:${ip}`, 5, 60_000)) {
      return fail("Too many requests — please wait a moment before trying again", 429);
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid reset request", 422);
    }

    const { token, password } = parsed.data;
    const verified = verifyPasswordResetToken(token);
    if (!verified) {
      return fail("This password reset link is invalid or has expired. Please request a new one.", 400);
    }

    const user = await db.user.findUnique({
      where: { id: verified.userId },
    });

    if (!user) {
      return fail("Account not found", 404);
    }

    const newPasswordHash = hashPassword(password);
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Automatically create session and log user in with new credentials
    const sessionToken = await createSession(updatedUser.id);
    await setSessionCookie(sessionToken);

    return ok({
      message: "Password reset successful! You are now signed in.",
      user: toSafeUser(updatedUser),
    });
  } catch (e) {
    return handleError(e);
  }
}
