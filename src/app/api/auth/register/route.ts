import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ok, fail, handleError, rateLimit } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and _"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`register:${ip}`, 10, 60_000)) return fail("Too many attempts — please try again in a moment", 429);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const { name, username, email, password } = parsed.data;

    const exists = await db.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (exists) {
      return fail("An account with this email or username already exists — please log in", 409);
    }

    const user = await db.user.create({
      data: {
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role: "USER",
      },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return ok({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });
  } catch (e) {
    return handleError(e);
  }
}
