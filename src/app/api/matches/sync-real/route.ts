import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { syncRealMatches } from "@/lib/match-sync";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const result = await syncRealMatches();
    return ok({
      synced: result.totalMatchesSynced,
      liveCount: result.liveMatchesCount,
      timestamp: Date.now(),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(_req: NextRequest) {
  try {
    const result = await syncRealMatches();
    return ok({
      synced: result.totalMatchesSynced,
      liveCount: result.liveMatchesCount,
      timestamp: Date.now(),
    });
  } catch (e) {
    return handleError(e);
  }
}
