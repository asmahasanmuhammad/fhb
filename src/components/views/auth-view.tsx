"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { LogoMark } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, EyeOff, AlertTriangle, AtSign, Mail, Lock, User, ArrowRight,
  Activity, Newspaper, Clapperboard, ShieldCheck, Heart, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   AuthView — split login/register screen.
   Left: flat brand panel (LogoMark, headline, benefit rows, live
   score chips). Right: centered form card (max-w-[400px]) with
   underline tabs. Mobile stacks form-first. No gradients.
   ════════════════════════════════════════════════════════════════ */

const BENEFITS = [
  { icon: Activity, title: "Live scores", body: "Minute-by-minute updates from every competition that matters." },
  { icon: Newspaper, title: "News desk", body: "Transfers, match reports and opinion — covered like a beat." },
  { icon: Clapperboard, title: "Creator shorts", body: "Highlights and fan videos from the FHB creator community." },
];

const DEMO_ACCOUNTS = [
  { icon: <ShieldCheck className="h-4 w-4 text-fhb-red" aria-hidden />, label: "Admin — full control", email: "admin@fhb.com.bd", pass: "Admin@2025" },
  { icon: <Clapperboard className="h-4 w-4 text-primary" aria-hidden />, label: "Creator — earnings dashboard", email: "creator@fhb.com.bd", pass: "Creator@2025" },
  { icon: <Heart className="h-3.5 w-3.5 text-fhb-gold" aria-hidden />, label: "Fan — likes, comments, posts", email: "tanvir@fhb.com.bd", pass: "Fan@2025" },
];

function fmtScore(v: number | null): string {
  return v == null ? "–" : String(v);
}

export function AuthView() {
  const { refreshUser, navigate } = useAppStore();
  const { toast } = useToast();
  useReveal();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  /** Live-score chips for the brand panel — real fixtures only, hides when quiet. */
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
    setError(null);
    setForm((f) => ({ ...f, email, password }));
  };

  const inputCls =
    "h-11 w-full rounded-[7px] border border-border bg-background pl-10 pr-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-1 items-center px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      <div className="grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
        {/* ── Form panel (first on mobile) ─────────────────────── */}
        <div className="order-1 flex items-center lg:order-2">
          <div className="mx-auto w-full max-w-[400px]">
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
              <h1 className="text-[20px] font-bold leading-none tracking-[-0.01em] text-foreground sm:text-[22px]">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                {mode === "login"
                  ? "Log in to follow your clubs and join the matchday talk."
                  : "Free, and takes about 30 seconds — no card needed."}
              </p>

              {/* Mode switch — underline tabs */}
              <div
                className="no-scrollbar mt-5 grid grid-cols-2 border-b border-border"
                role="tablist"
                aria-label="Authentication mode"
              >
                {([
                  { id: "login", label: "Sign in" },
                  { id: "register", label: "Create account" },
                ] as const).map((t) => {
                  const active = mode === t.id;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setMode(t.id);
                        setError(null);
                      }}
                      className={cn(
                        "label-cond relative py-2.5 text-[12.5px] font-semibold transition-colors",
                        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t.label}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-primary transition-opacity",
                          active ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              <form onSubmit={submit} className="mt-5 space-y-3.5">
                {mode === "register" && (
                  <>
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-[11px] font-semibold text-foreground">
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
                      <label htmlFor="username" className="mb-1.5 block text-[11px] font-semibold text-foreground">
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
                  <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold text-foreground">
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
                  <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold text-foreground">
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
                      className="tap-target absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-[6px] border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-xs font-medium text-destructive"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex h-11 w-full items-center justify-center rounded-[7px] bg-primary text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
                >
                  {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              {mode === "register" && (
                <p className="mt-3.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                  Planning to upload shorts? Ask about the creator role after signing up to unlock uploads and the earnings
                  dashboard.
                </p>
              )}

              <button
                onClick={() => navigate({ name: "home" })}
                className="group mt-4 flex w-full items-center justify-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                Continue as guest
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>

              {/* Demo access — collapsed by default, one click to fill */}
              <details className="group mt-5 border-t border-border/70 pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground">
                  Demo access for reviewers
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <div className="mt-2.5 divide-y divide-border/50 overflow-hidden rounded-[7px] border border-border bg-background">
                  {DEMO_ACCOUNTS.map((d) => (
                    <button
                      key={d.email}
                      onClick={() => quickLogin(d.email, d.pass)}
                      className="row-hover group/acc flex w-full items-center justify-between gap-2.5 px-3.5 py-2.5 text-left"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-secondary" aria-hidden>
                          {d.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11.5px] font-bold text-foreground">{d.label}</span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {d.email} / {d.pass}
                          </span>
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover/acc:translate-x-0.5 group-hover/acc:text-primary"
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* ── Brand panel ──────────────────────────────────────── */}
        <section
          className="order-2 flex flex-col justify-center rounded-xl border border-border bg-card p-6 sm:p-8 lg:order-1"
          aria-label="About Football Hub Bangladesh"
        >
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div className="min-w-0">
              <p className="label-cond text-[15px] font-bold tracking-[0.06em] text-foreground">FOOTBALL HUB</p>
              <p className="kicker mt-0.5 text-muted-foreground">Bangladesh</p>
            </div>
          </div>

          <h2 className="mt-6 text-[24px] font-bold leading-[1.12] tracking-[-0.015em] text-foreground sm:text-[28px]">
            Every match. Every goal. One hub.
          </h2>
          <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-muted-foreground">
            Live scores, news, shorts and the fan community — built for football in Bangladesh. One free account unlocks
            it all.
          </p>

          {/* Three quiet benefit rows */}
          <ul className="mt-7 space-y-3.5">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-3.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-primary/12 text-primary"
                  aria-hidden
                >
                  <b.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="label-cond text-[12.5px] font-bold tracking-[0.06em] text-foreground">{b.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Live-score vibe chips — real fixtures only */}
          <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
            {liveMatches.length > 0 ? (
              <>
                {liveMatches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate({ name: "match-detail", id: m.id })}
                    className="flex h-8 items-center gap-2 rounded-full border border-fhb-red/30 bg-fhb-red/[0.05] px-3 text-[11px] font-bold text-foreground/90 transition-colors hover:border-fhb-red/50"
                    aria-label={`${m.homeTeam.name} vs ${m.awayTeam.name} — view match`}
                  >
                    <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
                    <span className="tabular">
                      {m.homeTeam.initials} {fmtScore(m.homeScore)}–{fmtScore(m.awayScore)} {m.awayTeam.initials}
                    </span>
                    <span className="tabular text-fhb-red">{m.minute != null ? `${m.minute}′` : "LIVE"}</span>
                  </button>
                ))}
              </>
            ) : (
              <>
                <span className="flex h-8 items-center gap-2 rounded-full border border-border bg-elevated px-3 text-[11px] font-semibold text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-[2px] bg-primary" aria-hidden />
                  Fixtures every matchday
                </span>
                <span className="flex h-8 items-center gap-2 rounded-full border border-border bg-elevated px-3 text-[11px] font-semibold text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-[2px] bg-primary" aria-hidden />
                  Free forever
                </span>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
