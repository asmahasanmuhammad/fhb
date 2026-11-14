import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Session, User } from "@prisma/client";
import { createHmac } from "crypto";

export const SESSION_COOKIE = "fhb_session";
const SESSION_DAYS = 30;
const SESSION_SECRET = process.env.SESSION_SECRET || "fhbd-auth-session-super-secure-key-2026-football";

export type SafeUser = Omit<User, "passwordHash">;

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

/**
 * Creates a tamper-proof HMAC signed session token.
 * Enables sessions to work seamlessly across stateless Vercel Serverless lambdas
 * without being dropped when SQLite /tmp/ instances scale out.
 */
export function signSessionToken(userId: string): string {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!expiresAt || expiresAt < Date.now()) return null;
    const payload = `${userId}.${expiresAtStr}`;
    const expectedSig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    return userId;
  } catch {
    return null;
  }
}

/**
 * Creates a signed password reset token valid for 1 hour.
 */
export function signPasswordResetToken(userId: string, email: string): string {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  const payload = `reset.${userId}.${email}.${expiresAt}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 5 || parts[0] !== "reset") return null;
    const [_, userId, email, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!expiresAt || expiresAt < Date.now()) return null;
    const payload = `reset.${userId}.${email}.${expiresAtStr}`;
    const expectedSig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    return { userId, email };
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = signSessionToken(userId);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  try {
    await db.session.create({ data: { token, userId, expiresAt } });
  } catch (err) {
    // Best-effort database insertion in ephemeral /tmp/
    console.warn("[auth] Best-effort session insert notice:", err);
  }
  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const isHttps = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    // 1. Check stateless cryptographic token (resilient across all serverless lambda containers)
    const verifiedUserId = verifySessionToken(token);
    if (verifiedUserId) {
      const user = await db.user.findUnique({
        where: { id: verifiedUserId },
      });
      if (user && !user.isBanned) {
        return toSafeUser(user);
      }
    }

    // 2. Fallback to DB session table (for legacy / plain tokens)
    const session: (Session & { user: User }) | null = await db.session.findUnique({
      where: { token },
      include: { user: true },
    }).catch(() => null);

    if (session) {
      if (session.expiresAt < new Date()) {
        await db.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }
      if (session.user.isBanned) return null;
      return toSafeUser(session.user);
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Login required", 401);
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AuthError("Admin permission required", 403);
  return user;
}

export async function requireCreatorOrAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "CREATOR" && user.role !== "ADMIN") {
    throw new AuthError("Creator account required", 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}
