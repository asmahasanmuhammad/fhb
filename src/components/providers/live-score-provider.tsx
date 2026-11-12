"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { LiveMatchUpdate } from "@/lib/types";

type LiveEvent = { id: string; text: string; ts: number; minute?: number; type?: string };

type LiveState = {
  connected: boolean;
  matches: LiveMatchUpdate[];
  events: LiveEvent[];
};

const LiveScoreContext = createContext<LiveState>({
  connected: false,
  matches: [],
  events: [],
});

/**
 * LiveScoreProvider — polls /api/matches/live every 5s.
 * NO socket.io, NO port 3003, NO external bun process.
 * 100% real data from the database via REST API only.
 */
export function LiveScoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LiveState>({ connected: false, matches: [], events: [] });

  useEffect(() => {
    let mounted = true;

    const fetchLiveUpdates = async () => {
      try {
        const res = await fetch("/api/matches/live", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && mounted) {
            setState({
              connected: true,
              matches: json.data.matches || [],
              events: json.data.events || [],
            });
          }
        }
      } catch {
        // offline — stay silent
      }
    };

    fetchLiveUpdates();
    const pollInterval = setInterval(fetchLiveUpdates, 5000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  return <LiveScoreContext.Provider value={state}>{children}</LiveScoreContext.Provider>;
}

export function useLiveScores() {
  return useContext(LiveScoreContext);
}
