import { db } from "@/lib/db";
import { clearSessionCookie, getSessionUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (user) {
      // clear all sessions of this user for safety
      await db.session.deleteMany({ where: { userId: user.id } }).catch(() => {});
    }
    await clearSessionCookie();
    return ok({ loggedOut: true });
  } catch (e) {
    return handleError(e);
  }
}
