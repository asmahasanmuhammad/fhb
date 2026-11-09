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
    "w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 pb-14 pt-5 sm:px-6 sm:pt-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Form column ───────────────────────────────────────── */}
        <div className="reveal min-w-0 lg:col-span-6 xl:col-span-5">
          {/* Mobile brand strip */}
          <div className="mb-5 flex items-center gap-3.5 lg:hidden">
            <LogoMark size={10} />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-foreground">Football Hub Bangladesh</p>
              <p className="truncate text-[11px] text-muted-foreground">Live scores · News · Shorts · Community</p>
            </div>
          </div>

          <div className="edge-lit rounded-xl border border-border bg-card p-6 sm:p-8">
            <h1 className="font-display text-[1.7rem] font-bold leading-tight tracking-[-0.015em] text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login"
                ? "Log in to follow your clubs and join the matchday talk."
                : "Free, and takes about 30 seconds — no card needed."}
            </p>

            {/* Mode switch */}
            <div
              className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1"
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
                    "flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-bold transition-colors",
                    mode === m ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
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
                    <label htmlFor="name" className="mb-1.5 block text-[11px] font-bold text-foreground">
                      Full name <span className="text-fhb-red">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
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
                    <label htmlFor="username" className="mb-1.5 block text-[11px] font-bold text-foreground">
                      Username <span className="text-fhb-red">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
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
                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold text-foreground">
                  {mode === "login" ? "Email / Username" : "Email"} <span className="text-fhb-red">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
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
                <label htmlFor="password" className="mb-1.5 block text-[11px] font-bold text-foreground">
                  Password <span className="text-fhb-red">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-xs font-medium text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="sheen flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-50"
              >
                {busy ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>

            {mode === "register" && (
              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                Planning to upload shorts? Ask about the creator role after signing up to unlock uploads and the earnings
                dashboard.
              </p>
            )}

            {/* Demo accounts */}
            <div className="mt-6 border-t border-border/60 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Demo accounts — one click to fill
              </p>
              <div className="mt-3 divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-background/50">
                {[
                  { icon: <ShieldCheck className="h-4 w-4 text-fhb-red" aria-hidden />, label: "Admin — full control", email: "admin@fhb.com.bd", pass: "Admin@2025" },
                  { icon: <Clapperboard className="h-4 w-4 text-primary" aria-hidden />, label: "Creator — earnings dashboard", email: "creator@fhb.com.bd", pass: "Creator@2025" },
                  { icon: <Heart className="h-3.5 w-3.5 text-fhb-gold" aria-hidden />, label: "Fan — likes, comments, posts", email: "tanvir@fhb.com.bd", pass: "Fan@2025" },
                ].map((d) => (
                  <button
                    key={d.email}
                    onClick={() => quickLogin(d.email, d.pass)}
                    className="group flex w-full items-center justify-between gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">{d.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-foreground">{d.label}</span>
                        <span className="block truncate text-[10.5px] text-muted-foreground">
                          {d.email} / {d.pass}
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
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
          <div className="noise stadium-panel relative h-full overflow-hidden rounded-xl border border-border/70 p-8 xl:p-10">
            <span className="floodlight pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex h-full flex-col">
              {/* Brand */}
              <div className="flex items-center gap-4">
                <LogoMark />
                <div>
                  <p className="font-display text-lg font-bold text-foreground">Football Hub Bangladesh</p>
                  <p className="text-xs text-muted-foreground">fhb.com.bd — the fan's platform</p>
                </div>
              </div>

              <h2 className="display-hero mt-8 max-w-[20ch] text-2xl text-foreground sm:text-[1.75rem]">
                The home of Bangladesh football
              </h2>
              <p className="mt-2.5 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
                One free account for live scores, breaking news, creator shorts and the loudest fan community in the
                country.
              </p>

              {/* Value props */}
              <ul className="mt-7 grid flex-1 content-center gap-3 sm:grid-cols-2">
                {VALUE_PROPS.map((v) => (
                  <li key={v.title} className="rounded-lg border border-border/70 bg-card/60 p-4">
                    <p className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <v.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {v.title}
                    </p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{v.body}</p>
                  </li>
                ))}
              </ul>

              {/* Live-score teaser */}
              {liveMatches.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-lg border border-fhb-red/25 bg-card/70">
                  <p className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-fhb-red">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
                    Live right now
                  </p>
                  <div className="divide-y divide-border/60">
                    {liveMatches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigate({ name: "match-detail", id: m.id })}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                        aria-label={`${m.homeTeam.name} vs ${m.awayTeam.name} — view match`}
                      >
                        <TeamCrest team={m.homeTeam} size="sm" />
                        <span className="tabular min-w-0 flex-1 truncate font-display text-sm font-bold text-foreground">
                          {m.homeTeam.initials} {fmtScore(m.homeScore)} – {fmtScore(m.awayScore)} {m.awayTeam.initials}
                        </span>
                        <TeamCrest team={m.awayTeam} size="sm" />
                        <span className="tabular shrink-0 rounded bg-fhb-red/12 px-1.5 py-0.5 text-[10px] font-bold text-fhb-red">
                          {m.minute != null ? `${m.minute}'` : "LIVE"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                <p className="text-[11px] text-muted-foreground">
                  Free forever. Premium removes every ad — from Tk 149/month.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ name: "premium" })}
                  className="shrink-0 gap-1.5 text-xs font-bold"
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
