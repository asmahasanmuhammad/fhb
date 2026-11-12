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
  | { name: "match-detail"; id: string }
  | { name: "terms" }
  | { name: "privacy" }
  | { name: "cookies" }
  | { name: "contact" }
  | { name: "advertise" }
  | { name: "press" }
  | { name: "careers" };

interface AppState {
  view: View;
  history: View[];
  user: SafeUser | null;
  authLoading: boolean;
  navigate: (view: View, syncHistory?: boolean) => void;
  back: () => void;
  setUser: (user: SafeUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

function syncBrowserUrl(view: View) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (view.name === "home") {
      url.searchParams.delete("view");
      url.searchParams.delete("id");
      url.searchParams.delete("username");
      window.history.pushState({ view }, "", url.pathname + (url.search ? url.search : ""));
    } else {
      url.searchParams.set("view", view.name);
      if ("id" in view && view.id) {
        url.searchParams.set("id", view.id);
      } else {
        url.searchParams.delete("id");
      }
      if ("username" in view && view.username) {
        url.searchParams.set("username", view.username);
      } else {
        url.searchParams.delete("username");
      }
      window.history.pushState({ view }, "", url.pathname + url.search);
    }
  } catch {
    /* noop */
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  view: { name: "home" },
  history: [],
  user: null,
  authLoading: true,

  navigate: (view, syncHistory = true) => {
    const { view: current, history } = get();
    if (JSON.stringify(current) === JSON.stringify(view)) return;
    set({ view, history: [...history, current].slice(-15) });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      if (syncHistory) syncBrowserUrl(view);
    }
  },

  back: () => {
    const { history } = get();
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set({ view: prev, history: history.slice(0, -1) });
      syncBrowserUrl(prev);
    } else {
      set({ view: { name: "home" }, history: [] });
      syncBrowserUrl({ name: "home" });
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
