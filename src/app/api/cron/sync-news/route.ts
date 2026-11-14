import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { autoSyncOneNewsArticle } from "@/lib/news-sync";

export const dynamic = "force-dynamic";

async function cleanupLegacyArticles() {
  try {
    await db.newsArticle.deleteMany({
      where: {
        OR: [
          { id: "cmwg37yvf0001ljncyzuj90cw" },
          { id: "cmwg498nn0001jv08t7z3jol0" },
          { id: "cmwg51c1q0001l5076n7bdpnw" },
          { title: { contains: "সূর্যবংশী" } },
          { title: { contains: "ফুটবল" } },
          { title: { contains: "টস" } },
          { content: { contains: "প্রতিবেদনটি" } },
        ],
      },
    });
  } catch {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  try {
    await cleanupLegacyArticles();
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
    await cleanupLegacyArticles();
    const sp = req.nextUrl.searchParams;
    const force = sp.get("force") === "true";
    const result = await autoSyncOneNewsArticle(force);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
