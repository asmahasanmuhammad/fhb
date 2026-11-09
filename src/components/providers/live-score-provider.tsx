"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { LiveMatchUpdate } from "@/lib/types";

type LiveEvent = { id: string; text: string; ts: number };

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

export function LiveScoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LiveState>({ connected: false, matches: [], events: [] });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect through the gateway — NEVER use a port in the URL
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 2000,
      timeout: 12000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setState((s) => ({ ...s, connected: true }));
    });
    socket.on("disconnect", () => {
      setState((s) => ({ ...s, connected: false }));
    });
    socket.on("live:update", (payload: { matches: LiveMatchUpdate[]; events: LiveEvent[] }) => {
      setState({
        connected: true,
        matches: payload.matches ?? [],
        events: payload.events ?? [],
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <LiveScoreContext.Provider value={state}>{children}</LiveScoreContext.Provider>;
}

export function useLiveScores() {
  return useContext(LiveScoreContext);
}
