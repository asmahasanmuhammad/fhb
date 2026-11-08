import { getSessionUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getSessionUser();
    return ok({ user });
  } catch (e) {
    return handleError(e);
  }
}
