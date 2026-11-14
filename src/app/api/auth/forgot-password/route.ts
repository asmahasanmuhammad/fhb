import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { signPasswordResetToken } from "@/lib/auth";
import { ok, fail, handleError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`forgot-pw:${ip}`, 5, 60_000)) {
      return fail("Too many requests — please wait a moment before trying again", 429);
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid email", 422);
    }

    const { email } = parsed.data;
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return fail("No account found registered with this email address", 404);
    }

    const resetToken = signPasswordResetToken(user.id, user.email);

    // If Resend or SMTP API key is configured, send actual transactional email
    if (process.env.RESEND_API_KEY) {
      try {
        const origin = req.headers.get("origin") || "https://fhbd.vercel.app";
        const resetLink = `${origin}/?view=auth&resetToken=${resetToken}&email=${encodeURIComponent(user.email)}`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "FHBD Security <security@fhbd.vercel.app>",
            to: [user.email],
            subject: "Reset your FHBD password",
            html: `
              <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #06080F; color: #ffffff; border-radius: 12px;">
                <h2 style="color: #e30206; margin-bottom: 8px;">FHBD Security</h2>
                <p>Hello ${user.name || "Fan"},</p>
                <p>We received a request to reset your FHBD password. Click the link below to set a new password:</p>
                <p style="margin: 24px 0;">
                  <a href="${resetLink}" style="background: #e30206; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </p>
                <p style="font-size: 12px; color: #94a3b8;">This link expires in 1 hour. If you did not request this reset, you can safely ignore this email.</p>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.warn("[forgot-password] Email sending failed:", err);
      }
    }

    return ok({
      message: "Reset authorization verified. You can now enter your new password.",
      token: resetToken,
      email: user.email,
    });
  } catch (e) {
    return handleError(e);
  }
}
