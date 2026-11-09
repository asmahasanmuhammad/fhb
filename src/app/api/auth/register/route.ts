import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ok, fail, handleError, rateLimit } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে").max(60),
  username: z
    .string()
    .trim()
    .min(3, "ইউজারনেম কমপক্ষে ৩ অক্ষরের")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "ইউজারনেমে শুধু ইংরেজি অক্ষর, সংখ্যা ও _ ব্যবহার করুন"),
  email: z.string().trim().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`register:${ip}`, 10, 60_000)) return fail("অনেকবার চেষ্টা হয়েছে, একটু পরে আবার করুন", 429);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "ভুল তথ্য", 422);
    }
    const { name, username, email, password } = parsed.data;

    const exists = await db.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (exists) {
      return fail("এই ইমেইল বা ইউজারনেম দিয়ে অ্যাকাউন্ট আছে — লগইন করুন", 409);
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
