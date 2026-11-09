"use client";

import { create } from "zustand";
import type { SafeUser } from "@/lib/types";

export type View =
  | { name: "home" }
  | { name: "scores" }
  | { name: "live-tv" }
  | { name: "standings" }
  | { name: "news" }
  | { name: "news-detail"; id: string }
  | { name: "teams" }
  | { name: "team-detail"; id: string }
  | { name: "players" }
  | { name: "player-detail"; id: string }
  | { name: "competitions" }
  | { name: "competition-detail"; id: string }
  | { name: "shorts" }
  | { name: "upload" }
  | { name: "community" }
  | { name: "premium" }
  | { name: "profile"; username?: string }
  | { name: "auth" }
  | { name: "admin" }
  | { name: "earnings" }
  | { name: "match-detail"; id: string };

interface AppState {
  view: View;
  history: View[];
  user: SafeUser | null;
  authLoading: boolean;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  navigate: (view: View) => void;
  back: () => void;
  setUser: (user: SafeUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: { name: "home" },
  history: [],
  user: null,
  authLoading: true,
  language: "bn",
  setLanguage: (lang) => set({ language: lang }),

  navigate: (view) => {
    const { view: current, history } = get();
    if (JSON.stringify(current) === JSON.stringify(view)) return;
    set({ view, history: [...history, current].slice(-15) });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  },

  back: () => {
    const { history } = get();
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set({ view: prev, history: history.slice(0, -1) });
    } else {
      set({ view: { name: "home" }, history: [] });
    }
  },

  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  refreshUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      set({ user: json?.data?.user ?? null, authLoading: false });
    } catch {
      set({ user: null, authLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({ user: null });
  },
}));
