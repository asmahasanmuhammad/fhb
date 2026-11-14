import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { autoSyncOneNewsArticle } from "@/lib/news-sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const force = sp.get("force") === "true";
    const result = await autoSyncOneNewsArticle(force);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const force = sp.get("force") === "true";
    const result = await autoSyncOneNewsArticle(force);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
