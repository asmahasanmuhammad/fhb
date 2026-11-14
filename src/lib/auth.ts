import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Session, User } from "@prisma/client";
import { createHmac } from "crypto";

export const SESSION_COOKIE = "fhb_session";
const SESSION_DAYS = 30;
const SESSION_SECRET = process.env.SESSION_SECRET || "fhbd-auth-session-super-secure-key-2026-football";

export type SafeUser = Omit<User, "passwordHash">;

export type TokenUserData = {
  id: string;
  email: string;
  username: string;
  name?: string;
  role?: string;
  isPremium?: boolean;
  premiumUntil?: string | null;
  passwordHash?: string;
  avatarUrl?: string | null;
  exp?: number;
};

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

/**
 * Creates a tamper-proof self-contained HMAC signed session token.
 * Contains user metadata so stateless Vercel Serverless lambdas can verify
 * and auto-heal missing user rows in ephemeral /tmp/ SQLite on the fly.
 */
export function signSessionToken(userId: string, userObj?: Partial<User> | null): string {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payloadData: TokenUserData = {
    id: userId,
    email: userObj?.email || "",
    username: userObj?.username || "",
    name: userObj?.name || "",
    role: userObj?.role || "USER",
    isPremium: Boolean(userObj?.isPremium),
    premiumUntil: userObj?.premiumUntil ? userObj.premiumUntil.toISOString() : null,
    avatarUrl: userObj?.avatarUrl || null,
    passwordHash: userObj?.passwordHash || "",
    exp: expiresAt,
  };
  const b64 = Buffer.from(JSON.stringify(payloadData), "utf8").toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(b64).digest("hex");
  return `${b64}.${sig}`;
}

export function verifySessionToken(token: string): TokenUserData | null {
  try {
    const parts = token.split(".");
    // Legacy format support: userId.expiresAt.sig
    if (parts.length === 3) {
      const [userId, expiresAtStr, sig] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      if (!expiresAt || expiresAt < Date.now()) return null;
      const payload = `${userId}.${expiresAtStr}`;
      const expectedSig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
      if (sig !== expectedSig) return null;
      return { id: userId, email: "", username: "", exp: expiresAt };
    }

    // Modern self-contained JWT-style format: base64url(json).sig
    if (parts.length !== 2) return null;
    const [b64, sig] = parts;
    const expectedSig = createHmac("sha256", SESSION_SECRET).update(b64).digest("hex");
    if (sig !== expectedSig) return null;

    const data: TokenUserData = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (!data.id || !data.exp || data.exp < Date.now()) return null;
    return data;
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

export async function createSession(userId: string, userObj?: Partial<User> | null): Promise<string> {
  const token = signSessionToken(userId, userObj);
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

    // 1. Check stateless cryptographic token
    const verified = verifySessionToken(token);
    if (verified && verified.id) {
      // Look up in database
      let user = await db.user.findUnique({
        where: { id: verified.id },
      }).catch(() => null);

      if (user) {
        if (user.isBanned) return null;
        return toSafeUser(user);
      }

      // 2. AUTO-HEAL: If this serverless container's /tmp/ DB was cold-started or recycled,
      // restore the verified user into this container's SQLite DB on the fly!
      if (verified.email && verified.username) {
        try {
          user = await db.user.upsert({
            where: { id: verified.id },
            update: {
              isPremium: Boolean(verified.isPremium),
            },
            create: {
              id: verified.id,
              email: verified.email,
              username: verified.username,
              name: verified.name || "Fan",
              passwordHash: verified.passwordHash || "",
              role: verified.role || "USER",
              isPremium: Boolean(verified.isPremium),
              bio: "Official fan on Football Hub Bangladesh.",
            },
          });
          return toSafeUser(user);
        } catch (healErr) {
          console.warn("[auth] Auto-heal upsert notice:", healErr);
        }
      }

      // Return verified payload if upsert fails
      return {
        id: verified.id,
        email: verified.email,
        username: verified.username,
        name: verified.name || "Fan",
        role: verified.role || "USER",
        isPremium: Boolean(verified.isPremium),
        premiumUntil: verified.premiumUntil ? new Date(verified.premiumUntil) : null,
        avatarUrl: verified.avatarUrl ?? null,
        bio: null,
        followerCount: 0,
        followingCount: 0,
        earningsTotal: 0,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // 3. Fallback to DB session table (for legacy plain tokens)
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
