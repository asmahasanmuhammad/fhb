import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ok, fail, handleError, rateLimit } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().min(3),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`login:${ip}`, 15, 60_000)) return fail("Too many attempts — please try again in a moment", 429);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail("Enter your email and password", 422);

    const { email, password } = parsed.data;
    const user = await db.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }] },
    });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return fail("Incorrect email/username or password", 401);
    }
    if (user.isBanned) return fail("This account has been temporarily suspended", 403);

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return ok({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      avatarUrl: user.avatarUrl,
    });
  } catch (e) {
    return handleError(e);
  }
}
