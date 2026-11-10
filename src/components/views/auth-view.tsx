"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { LogoMark } from "@/components/layout/header";
import { TeamCrest } from "@/components/football/team-badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, EyeOff, LogIn, UserPlus, AlertTriangle, AtSign, Mail, Lock, User, ShieldCheck,
  Clapperboard, Heart, ChevronRight, Activity, Newspaper, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   AuthView — split-screen login / signup
   Left: form card (login/signup toggle, demo quick-fill).
   Right: stadium brand panel with value props and a live-score
   teaser. Mobile: compact brand strip above a single column.
   ════════════════════════════════════════════════════════════════ */

const VALUE_PROPS = [
  { icon: Activity, title: "Live scores", body: "Minute-by-minute updates from every competition that matters." },
  { icon: Newspaper, title: "News desk", body: "Transfers, match reports and opinion — covered like a beat." },
  { icon: Clapperboard, title: "Creator shorts", body: "Highlights and fan videos from the FHB creator community." },
  { icon: Users, title: "Fan community", body: "Matchday threads, takes and banter with fans across Bangladesh." },
];

export function AuthView() {
  const { refreshUser, navigate } = useAppStore();
  const { toast } = useToast();
  useReveal();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  /** Live-score teaser for the brand panel — real fixtures only, hides when quiet. */
  const { data: liveData } = useQuery<{ matches: Match[] }>({
    queryKey: ["auth-live-teaser"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=LIVE&days=2&limit=3");
      return res.json().then((j) => j.data);
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const liveMatches = liveData?.matches ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, username: form.username, email: form.email, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Something went wrong");
      await refreshUser();
      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description: json.data.name ? `Welcome to FHB, ${json.data.name}!` : undefined,
      });
      navigate({ name: "home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setMode("login");
    setForm((f) => ({ ...f, email, password }));
  };

  const inputCls =
    "w-full rounded-lg border border-white/20 bg-[#06080f] pl-10 pr-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50";

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 pb-14 pt-5 sm:px-6 sm:pt-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Form column ───────────────────────────────────────── */}
        <div className="reveal min-w-0 lg:col-span-6 xl:col-span-5">
          {/* Mobile brand strip */}
          <div className="mb-5 flex items-center gap-3.5 lg:hidden">
            <LogoMark size={10} />
            <div className="min-w-0">
              <p className="font-display text-sm font-black text-white">Football Hub Bangladesh</p>
              <p className="truncate text-[11px] font-semibold text-slate-300">Live scores · News · Shorts · Community</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-[#0b101d] p-6 sm:p-8 shadow-xl">
            <h1 className="font-display text-[1.75rem] font-black leading-tight text-white drop-shadow-sm">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-300">
              {mode === "login"
                ? "Log in to follow your clubs and join the matchday talk."
                : "Free, and takes about 30 seconds — no card needed."}
            </p>

            {/* Mode switch */}
            <div
              className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-white/15 bg-[#06080f] p-1"
              role="tablist"
              aria-label="Authentication mode"
            >
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-black uppercase tracking-wider transition-colors",
                    mode === m ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-slate-300 hover:text-white"
                  )}
                >
                  {m === "login" ? <LogIn className="h-3.5 w-3.5" aria-hidden /> : <UserPlus className="h-3.5 w-3.5" aria-hidden />}
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      <input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      <input
                        id="username"
                        value={form.username}
                        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                        placeholder="e.g. bpl_fan10"
                        pattern="[a-zA-Z0-9_]+"
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-300">
                  {mode === "login" ? "Email / Username" : "Email"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    id="email"
                    type={mode === "login" ? "text" : "email"}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={cn(inputCls, "pr-11")}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-600/20 px-3.5 py-3 text-xs font-semibold text-red-300"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="sheen flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-black text-white shadow-lg shadow-red-600/30 transition-opacity disabled:opacity-50"
              >
                {busy ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>

            {mode === "register" && (
              <p className="mt-4 text-center text-[11.5px] font-medium leading-relaxed text-slate-300">
                Planning to upload shorts? Ask about the creator role after signing up to unlock uploads and the earnings
                dashboard.
              </p>
            )}

            {/* Demo accounts */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-300">
                Demo accounts — one click to fill
              </p>
              <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/15 bg-[#06080f]">
                {[
                  { icon: <ShieldCheck className="h-4 w-4 text-red-500" aria-hidden />, label: "Admin — full control", email: "admin@fhb.com.bd", pass: "Admin@2025" },
                  { icon: <Clapperboard className="h-4 w-4 text-red-400" aria-hidden />, label: "Creator — earnings dashboard", email: "creator@fhb.com.bd", pass: "Creator@2025" },
                  { icon: <Heart className="h-3.5 w-3.5 text-amber-400" aria-hidden />, label: "Fan — likes, comments, posts", email: "tanvir@fhb.com.bd", pass: "Fan@2025" },
                ].map((d) => (
                  <button
                    key={d.email}
                    onClick={() => quickLogin(d.email, d.pass)}
                    className="group flex w-full items-center justify-between gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">{d.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-xs font-black text-white">{d.label}</span>
                        <span className="block truncate text-[11px] font-semibold text-slate-400">
                          {d.email} / {d.pass}
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-red-400"
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Brand column (desktop) ────────────────────────────── */}
        <aside className="reveal hidden lg:col-span-6 lg:block xl:col-span-7" aria-label="About Football Hub Bangladesh">
          <div className="relative h-full overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] p-8 xl:p-10 shadow-xl">
            <span className="floodlight pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex h-full flex-col">
              {/* Brand */}
              <div className="flex items-center gap-4">
                <LogoMark />
                <div>
                  <p className="font-display text-lg font-black text-white">Football Hub Bangladesh</p>
                  <p className="text-xs font-bold text-slate-300">fhb.com.bd — the fan's platform</p>
                </div>
              </div>

              <h2 className="mt-8 max-w-[20ch] text-2xl font-black text-white drop-shadow-sm sm:text-[1.85rem]">
                The home of Bangladesh football
              </h2>
              <p className="mt-2.5 max-w-[48ch] text-sm font-medium leading-relaxed text-slate-300">
                One free account for live scores, breaking news, creator shorts and the loudest fan community in the
                country.
              </p>

              {/* Value props */}
              <ul className="mt-7 grid flex-1 content-center gap-3 sm:grid-cols-2">
                {VALUE_PROPS.map((v) => (
                  <li key={v.title} className="rounded-lg border border-white/15 bg-white/[0.04] p-4 shadow-sm">
                    <p className="flex items-center gap-2 text-xs font-black text-white">
                      <v.icon className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
                      {v.title}
                    </p>
                    <p className="mt-1.5 text-[11.5px] font-medium leading-relaxed text-slate-300">{v.body}</p>
                  </li>
                ))}
              </ul>

              {/* Live-score teaser */}
              {liveMatches.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-lg border border-red-500/30 bg-[#06080f]">
                  <p className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-[10.5px] font-black uppercase tracking-[0.1em] text-red-400">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
                    Live right now
                  </p>
                  <div className="divide-y divide-white/10">
                    {liveMatches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigate({ name: "match-detail", id: m.id })}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                        aria-label={`${m.homeTeam.name} vs ${m.awayTeam.name} — view match`}
                      >
                        <TeamCrest team={m.homeTeam} size="sm" />
                        <span className="tabular min-w-0 flex-1 truncate font-display text-sm font-black text-white">
                          {m.homeTeam.initials} {fmtScore(m.homeScore)} – {fmtScore(m.awayScore)} {m.awayTeam.initials}
                        </span>
                        <TeamCrest team={m.awayTeam} size="sm" />
                        <span className="tabular shrink-0 rounded bg-red-600/25 border border-red-500/40 px-2 py-0.5 text-[10px] font-black text-red-300">
                          {m.minute != null ? `${m.minute}'` : "LIVE"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-[11.5px] font-medium text-slate-300">
                  Free forever. Premium removes every ad — from Tk 149/month.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ name: "premium" })}
                  className="shrink-0 gap-1.5 text-xs font-black border-white/20 bg-white/5 text-white hover:bg-white/15"
                >
                  Explore Premium
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function fmtScore(v: number | null): string {
  return v == null ? "–" : String(v);
}
