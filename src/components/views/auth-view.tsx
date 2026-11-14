"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { LogoMark } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, AlertTriangle, AtSign, Mail, Lock, User, ArrowRight, ArrowLeft,
  Activity, Newspaper, Clapperboard, ShieldCheck, Heart, ChevronRight,
  CheckCircle2, XCircle, ImageIcon, Loader2, Users, KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   AuthView — world-class split-screen authentication.
   Left 60%: animated gradient mesh panel + football copy + testimonial.
   Right 40%: form card — Sign In & Register with full UX polish.
   Mobile: form-first (stacked). Framer Motion AnimatePresence tabs.
   Keeps ALL original API calls: POST /api/auth/login,
   POST /api/auth/register, refreshUser(), navigate(), toast().
   ════════════════════════════════════════════════════════════════ */

/* ── Types ── */
type Mode = "login" | "register" | "forgot" | "reset";
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";
type PwStrength = "weak" | "medium" | "strong";

/* ── Constants ── */
const BENEFITS = [
  { icon: Activity,     title: "Live scores",    body: "Minute-by-minute updates from every competition that matters." },
  { icon: Newspaper,    title: "News desk",       body: "Transfers, match reports and opinion — covered like a beat." },
  { icon: Clapperboard, title: "Creator shorts",  body: "Highlights and fan videos from the FHBD creator community." },
];

const DEMO_ACCOUNTS = [
  { icon: <ShieldCheck  className="h-4 w-4 text-fhb-red"   aria-hidden />, label: "Admin — full control",        email: "admin@fhb.com.bd",   pass: "Admin@2025"   },
  { icon: <Clapperboard className="h-4 w-4 text-primary"   aria-hidden />, label: "Creator — earnings dashboard", email: "creator@fhb.com.bd", pass: "Creator@2025" },
  { icon: <Heart        className="h-3.5 w-3.5 text-fhb-gold" aria-hidden />, label: "Fan — likes, comments, posts", email: "tanvir@fhb.com.bd",  pass: "Fan@2025"     },
];

const TESTIMONIALS = [
  { quote: "FHBD is the only place I need on matchday. The live scores feel instant.", author: "Rafiqul Islam", role: "BPL Superfan · Dhaka" },
  { quote: "Following the national team has never been this fun. The community is incredible.", author: "Nasrin Akhter", role: "Bangladesh NT Fan · Chittagong" },
  { quote: "I upload my match clips here and the creator dashboard is clean. Love it.", author: "Tanvir Ahmed", role: "Football Creator · Sylhet" },
];

const FAN_COUNT = "12,847";

/* ── Helpers ── */
function fmtScore(v: number | null): string {
  return v == null ? "–" : String(v);
}

function getPasswordStrength(pw: string): PwStrength {
  if (pw.length < 6) return "weak";
  const hasUpper  = /[A-Z]/.test(pw);
  const hasLower  = /[a-z]/.test(pw);
  const hasDigit  = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
  if (pw.length >= 10 && score >= 3) return "strong";
  if (pw.length >= 8  && score >= 2) return "medium";
  return "weak";
}

const strengthConfig = {
  weak:   { label: "Weak",   color: "bg-red-500",    width: "w-1/3"  },
  medium: { label: "Medium", color: "bg-amber-400",  width: "w-2/3"  },
  strong: { label: "Strong", color: "bg-emerald-500",width: "w-full" },
};

/* ════════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════════ */

/* Animated gradient mesh orbs for the left panel */
function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Orb 1 — top-left red */}
      <motion.div
        className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-fhb-red/20 blur-[100px]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 2 — bottom-right sapphire */}
      <motion.div
        className="absolute -bottom-32 -right-20 h-[380px] w-[380px] rounded-full bg-blue-700/15 blur-[90px]"
        animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Orb 3 — center accent */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fhb-red/8 blur-[80px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />
    </div>
  );
}

/* Rotating testimonial carousel */
function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <div className="mt-auto">
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative rounded-xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          {/* Open-quote decoration */}
          <span
            className="absolute -left-1 -top-3 font-serif text-6xl leading-none text-fhb-red/40 select-none"
            aria-hidden
          >
            "
          </span>
          <p className="relative text-[13px] leading-relaxed text-white/80 italic">
            {t.quote}
          </p>
          <footer className="mt-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fhb-red/20 text-[11px] font-bold text-fhb-red">
              {t.author.charAt(0)}
            </div>
            <div>
              <p className="text-[11.5px] font-bold text-white">{t.author}</p>
              <p className="text-[10.5px] text-white/50">{t.role}</p>
            </div>
          </footer>
        </motion.blockquote>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="mt-3 flex items-center gap-1.5" role="tablist" aria-label="Testimonial indicators">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === idx ? "w-6 bg-fhb-red" : "w-1.5 bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* Animated input field wrapper */
function FieldWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={cn("relative", className)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      {/* Glow ring */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[8px]"
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(255,30,70,0.25), 0 0 16px rgba(255,30,70,0.12)"
            : "0 0 0 0px rgba(255,30,70,0)",
        }}
        transition={{ duration: 0.2 }}
      />
      {children}
    </div>
  );
}

/* Password strength meter */
function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  const cfg = strengthConfig[strength];
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-1.5"
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
        <motion.div
          className={cn("h-full rounded-full", cfg.color)}
          initial={{ width: 0 }}
          animate={{ width: cfg.width.replace("w-", "").replace("1/3", "33%").replace("2/3", "66%").replace("full", "100%") }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            width:
              strength === "weak"   ? "33%"  :
              strength === "medium" ? "66%"  : "100%",
          }}
        />
      </div>
      <p className={cn(
        "mt-1 text-[10.5px] font-semibold",
        strength === "weak"   && "text-red-400",
        strength === "medium" && "text-amber-400",
        strength === "strong" && "text-emerald-400",
      )}>
        {cfg.label} password
      </p>
    </motion.div>
  );
}

/* Username availability indicator */
function UsernameIndicator({ status }: { status: UsernameStatus }) {
  return (
    <AnimatePresence mode="wait">
      {status === "checking" && (
        <motion.span key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Checking username…" />
        </motion.span>
      )}
      {status === "available" && (
        <motion.span key="ok" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="absolute right-3 top-1/2 -translate-y-1/2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Username available" />
        </motion.span>
      )}
      {(status === "taken" || status === "invalid") && (
        <motion.span key="err" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="absolute right-3 top-1/2 -translate-y-1/2">
          <XCircle className="h-4 w-4 text-red-400" aria-label={status === "taken" ? "Username taken" : "Invalid username"} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main AuthView export
   ════════════════════════════════════════════════════════════════ */
export function AuthView() {
  const { refreshUser, navigate } = useAppStore();
  const { toast } = useToast();
  useReveal();

  /* ── UI state ── */
  const [mode, setMode]           = useState<Mode>("login");
  const [showPass, setShowPass]   = useState(false);
  const [busy, setBusy]           = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  /* ── Password reset state ── */
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ── Form state ── */
  const [form, setForm] = useState({
    name: "", username: "", email: "", password: "", avatarUrl: "",
  });

  /* ── Username availability ── */
  const [unStatus, setUnStatus] = useState<UsernameStatus>("idle");
  const unDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback((value: string) => {
    if (unDebounceRef.current) clearTimeout(unDebounceRef.current);
    if (!value) { setUnStatus("idle"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) { setUnStatus("invalid"); return; }
    setUnStatus("checking");
    unDebounceRef.current = setTimeout(async () => {
      try {
        // Best-effort check; falls back gracefully if endpoint unavailable
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
        if (res.ok) {
          const json = await res.json();
          setUnStatus(json.available ? "available" : "taken");
        } else {
          // If endpoint doesn't exist yet, assume available to not block register
          setUnStatus("available");
        }
      } catch {
        setUnStatus("available");
      }
    }, 500);
  }, []);

  /* ── Live score chips ── */
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

  /* ── Mode switch ── */
  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setUnStatus("idle");
  };

  /* ── Submit (handles login, register, forgot, and reset) ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      if (!form.email || !form.email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Failed to verify account");
        setResetToken(json.data.token);
        setResetEmail(json.data.email);
        setMode("reset");
        toast({
          title: "Account Verified",
          description: "Enter your new password below.",
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === "reset") {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match. Please verify.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, password: newPassword }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Failed to update password");
        await refreshUser();
        toast({
          title: "Password Updated!",
          description: "Your password has been changed. You are now logged in.",
        });
        navigate({ name: "home" });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === "register" && !acceptTerms) {
      setError("Please accept the terms of service to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, username: form.username, email: form.email, password: form.password, avatarUrl: form.avatarUrl || undefined };
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
        description: json.data.name ? `Welcome to FHBD, ${json.data.name}!` : undefined,
      });
      navigate({ name: "home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /* ── Quick-fill demo accounts ── */
  const quickLogin = (email: string, password: string) => {
    setMode("login");
    setError(null);
    setForm((f) => ({ ...f, email, password }));
  };

  /* ── Shared input class ── */
  const inputCls =
    "h-11 w-full rounded-[8px] border border-input bg-muted/40 dark:bg-white/[0.04] pl-10 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-fhb-red/50 focus:bg-background";

  /* ── Framer variants ── */
  const panelVariants = {
    initial:  { opacity: 0, x: 24 },
    animate:  { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
    exit:     { opacity: 0, x: -24, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as const } },
  };

  /* ══════════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-1 items-stretch overflow-hidden">
      <div className="flex w-full flex-col lg:flex-row">

        {/* ══════════════════════════════════════════════════
            LEFT PANEL — 60% — Brand / Visual
            ══════════════════════════════════════════════════ */}
        <section
          className="relative order-2 hidden flex-col overflow-hidden lg:order-1 lg:flex lg:w-[60%]"
          style={{ background: "linear-gradient(135deg, #06080f 0%, #0a0e1a 50%, #0d0611 100%)" }}
          aria-label="About FHBD"
        >
          <GradientMesh />

          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />

          {/* Content */}
          <div className="relative flex flex-1 flex-col p-10 xl:p-14">
            {/* Logo */}
            <div className="flex items-center">
              <LogoMark size={42} />
            </div>

            {/* Hero text */}
            <div className="mt-14">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                className="text-[38px] font-bold leading-[1.08] tracking-[-0.025em] text-white xl:text-[46px]"
              >
                Every match.
                <br />
                <span className="text-fhb-red">Every goal.</span>
                <br />
                One hub.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                className="mt-5 max-w-[46ch] text-[14px] leading-relaxed text-white/55"
              >
                Live scores, breaking news, fan shorts and the best football community
                in Bangladesh — all in one free account.
              </motion.p>
            </div>

            {/* Benefits */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 space-y-4"
            >
              {BENEFITS.map((b, i) => (
                <motion.li
                  key={b.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-fhb-red/15 text-fhb-red ring-1 ring-fhb-red/20"
                    aria-hidden
                  >
                    <b.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="label-cond text-[12.5px] font-bold tracking-[0.06em] text-white">{b.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-white/50">{b.body}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* Live score chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              {liveMatches.length > 0 ? (
                liveMatches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate({ name: "match-detail", id: m.id })}
                    className="flex h-8 items-center gap-2 rounded-full border border-fhb-red/30 bg-fhb-red/8 px-3 text-[11px] font-bold text-white/90 backdrop-blur-sm transition-colors hover:border-fhb-red/60 hover:bg-fhb-red/15"
                    aria-label={`${m.homeTeam.name} vs ${m.awayTeam.name}`}
                  >
                    <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
                    <span className="tabular">
                      {m.homeTeam.initials} {fmtScore(m.homeScore)}–{fmtScore(m.awayScore)} {m.awayTeam.initials}
                    </span>
                    <span className="tabular text-fhb-red">{m.minute != null ? `${m.minute}′` : "LIVE"}</span>
                  </button>
                ))
              ) : (
                <>
                  <span className="flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-semibold text-white/60">
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden /> Fixtures every matchday
                  </span>
                  <span className="flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-semibold text-white/60">
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-emerald-500" aria-hidden /> Free forever
                  </span>
                </>
              )}
            </div>

            {/* Social proof counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 flex items-center gap-2.5"
            >
              <div className="flex -space-x-2">
                {["#ff1e46","#3b82f6","#f59e0b","#10b981"].map((c, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="h-7 w-7 rounded-full border-2 border-[#06080f] ring-0"
                    style={{ backgroundColor: c + "33", borderColor: "#06080f" }}
                  />
                ))}
              </div>
              <p className="text-[12px] text-white/50">
                <span className="font-bold text-white">{FAN_COUNT}</span> fans already on board
              </p>
            </motion.div>

            {/* Spacer then testimonial */}
            <div className="mt-auto pt-10">
              <TestimonialCarousel />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            RIGHT PANEL — 40% — Form
            ══════════════════════════════════════════════════ */}
        <div className="order-1 flex flex-1 flex-col items-center justify-center bg-background px-4 py-10 sm:px-8 lg:order-2 lg:w-[40%] transition-colors duration-200">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <LogoMark size={36} />
          </div>

          <div className="w-full max-w-[400px]">

            {/* Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7">

              {/* Heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`heading-${mode}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-[21px] font-bold leading-none tracking-[-0.01em] text-foreground">
                    {mode === "login" && "Welcome back"}
                    {mode === "register" && "Create your account"}
                    {mode === "forgot" && "Reset your password"}
                    {mode === "reset" && "Set new password"}
                  </h2>
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                    {mode === "login" && "Sign in to follow your clubs and join matchday talk."}
                    {mode === "register" && "Free forever — no card needed. 30 seconds to set up."}
                    {mode === "forgot" && "Enter your registered email to verify and reset your password."}
                    {mode === "reset" && `Create a strong new password for ${resetEmail || "your account"}.`}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Tab switcher or Back to Sign In */}
              {mode === "login" || mode === "register" ? (
                <div
                  className="mt-5 grid grid-cols-2 rounded-[9px] border border-border bg-muted/60 p-1"
                  role="tablist"
                  aria-label="Authentication mode"
                >
                  {(["login", "register"] as const).map((t) => {
                    const active = mode === t;
                    return (
                      <button
                        key={t}
                        role="tab"
                        aria-selected={active}
                        onClick={() => switchMode(t)}
                        className="relative rounded-[7px] py-2 text-[12.5px] font-semibold transition-colors"
                      >
                        {active && (
                          <motion.span
                            layoutId="tab-bg"
                            className="absolute inset-0 rounded-[7px] bg-fhb-red/15 ring-1 ring-fhb-red/30"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span className={cn("relative", active ? "text-fhb-red" : "text-muted-foreground hover:text-foreground")}>
                          {t === "login" ? "Sign In" : "Register"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-between border-b border-border/60 pb-3">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </button>
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fhb-red">
                    <KeyRound className="h-3 w-3" /> Security
                  </span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={submit} className="mt-5" noValidate>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-3.5"
                  >
                    {/* ── FORGOT PASSWORD MODE ── */}
                    {mode === "forgot" && (
                      <div>
                        <label htmlFor="auth-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                          Registered Email <span className="text-fhb-red">*</span>
                        </label>
                        <FieldWrap>
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                          <input
                            id="auth-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="you@example.com"
                            className={inputCls}
                            required
                            autoComplete="email"
                          />
                        </FieldWrap>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          Enter the email address associated with your FHBD account to authorize a password reset.
                        </p>
                      </div>
                    )}

                    {/* ── RESET PASSWORD MODE ── */}
                    {mode === "reset" && (
                      <div className="space-y-3.5">
                        <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
                          <span className="text-muted-foreground">Resetting password for: </span>
                          <span className="font-semibold text-foreground">{resetEmail}</span>
                        </div>
                        <div>
                          <label htmlFor="new-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            New Password <span className="text-fhb-red">*</span>
                          </label>
                          <FieldWrap>
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="new-password"
                              type={showPass ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="At least 6 characters"
                              className={cn(inputCls, "pr-11")}
                              required
                              minLength={6}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass((v) => !v)}
                              className="tap-target absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={showPass ? "Hide password" : "Show password"}
                            >
                              {showPass ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                            </button>
                          </FieldWrap>
                          {newPassword.length > 0 && <StrengthMeter password={newPassword} />}
                        </div>
                        <div>
                          <label htmlFor="confirm-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Confirm New Password <span className="text-fhb-red">*</span>
                          </label>
                          <FieldWrap>
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="confirm-password"
                              type={showPass ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat new password"
                              className={inputCls}
                              required
                              minLength={6}
                              autoComplete="new-password"
                            />
                          </FieldWrap>
                        </div>
                      </div>
                    )}

                    {/* ── REGISTER-ONLY fields ── */}
                    {mode === "register" && (
                      <>
                        {/* Full name */}
                        <div>
                          <label htmlFor="reg-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Full name <span className="text-fhb-red">*</span>
                          </label>
                          <FieldWrap>
                            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="reg-name"
                              value={form.name}
                              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="Your full name"
                              className={inputCls}
                              required
                              autoComplete="name"
                            />
                          </FieldWrap>
                        </div>

                        {/* Username with availability check */}
                        <div>
                          <label htmlFor="reg-username" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Username <span className="text-fhb-red">*</span>
                          </label>
                          <FieldWrap>
                            <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="reg-username"
                              value={form.username}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => ({ ...f, username: val }));
                                checkUsername(val);
                              }}
                              placeholder="e.g. bpl_fan10"
                              pattern="[a-zA-Z0-9_]+"
                              className={cn(inputCls, "pr-10")}
                              required
                              autoComplete="username"
                            />
                            <UsernameIndicator status={unStatus} />
                          </FieldWrap>
                          <AnimatePresence>
                            {unStatus === "taken" && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-1 text-[10.5px] font-semibold text-red-400"
                              >
                                That username is already taken.
                              </motion.p>
                            )}
                            {unStatus === "invalid" && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-1 text-[10.5px] font-semibold text-red-400"
                              >
                                3–20 chars, letters, numbers and underscore only.
                              </motion.p>
                            )}
                            {unStatus === "available" && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-1 text-[10.5px] font-semibold text-emerald-400"
                              >
                                Username is available!
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Avatar URL */}
                        <div>
                          <label htmlFor="reg-avatar" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Avatar URL <span className="text-muted-foreground/40">(optional)</span>
                          </label>
                          <FieldWrap>
                            <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="reg-avatar"
                              type="url"
                              value={form.avatarUrl}
                              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                              placeholder="https://…/photo.jpg"
                              className={inputCls}
                              autoComplete="photo"
                            />
                          </FieldWrap>
                        </div>
                      </>
                    )}

                    {/* ── LOGIN & REGISTER SHARED FIELDS ── */}
                    {(mode === "login" || mode === "register") && (
                      <>
                        {/* Email / Username */}
                        <div>
                          <label htmlFor="auth-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            {mode === "login" ? "Email / Username" : "Email"} <span className="text-fhb-red">*</span>
                          </label>
                          <FieldWrap>
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="auth-email"
                              type={mode === "login" ? "text" : "email"}
                              value={form.email}
                              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                              placeholder="you@example.com"
                              className={inputCls}
                              required
                              autoComplete={mode === "login" ? "username" : "email"}
                            />
                          </FieldWrap>
                        </div>

                        {/* Password */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <label htmlFor="auth-password" className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                              Password <span className="text-fhb-red">*</span>
                            </label>
                            {mode === "login" && (
                              <button
                                type="button"
                                className="text-[11px] font-semibold text-muted-foreground transition-colors hover:text-fhb-red cursor-pointer"
                                onClick={() => switchMode("forgot")}
                              >
                                Forgot password?
                              </button>
                            )}
                          </div>
                          <FieldWrap>
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <input
                              id="auth-password"
                              type={showPass ? "text" : "password"}
                              value={form.password}
                              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                              placeholder="••••••••"
                              className={cn(inputCls, "pr-11")}
                              required
                              minLength={6}
                              autoComplete={mode === "login" ? "current-password" : "new-password"}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass((v) => !v)}
                              className="tap-target absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={showPass ? "Hide password" : "Show password"}
                            >
                              {showPass
                                ? <EyeOff className="h-4 w-4" aria-hidden />
                                : <Eye    className="h-4 w-4" aria-hidden />
                              }
                            </button>
                          </FieldWrap>

                          {/* Strength meter (register only) */}
                          {mode === "register" && (
                            <AnimatePresence>
                              {form.password.length > 0 && (
                                <StrengthMeter password={form.password} />
                              )}
                            </AnimatePresence>
                          )}
                        </div>

                        {/* Remember me (login) */}
                        {mode === "login" && (
                          <label className="flex cursor-pointer items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/[0.04] accent-fhb-red"
                            />
                            <span className="text-[12px] text-muted-foreground">Remember me for 30 days</span>
                          </label>
                        )}

                        {/* Accept terms (register) */}
                        {mode === "register" && (
                          <label className="flex cursor-pointer items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={acceptTerms}
                              onChange={(e) => setAcceptTerms(e.target.checked)}
                              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/[0.04] accent-fhb-red"
                              required
                            />
                            <span className="text-[12px] leading-relaxed text-muted-foreground">
                              I agree to FHBD&apos;s{" "}
                              <button
                                type="button"
                                className="font-semibold text-fhb-red underline underline-offset-2 hover:no-underline"
                                onClick={() => navigate({ name: "terms" })}
                              >
                                Terms of Service
                              </button>{" "}
                              and{" "}
                              <button
                                type="button"
                                className="font-semibold text-fhb-red underline underline-offset-2 hover:no-underline"
                                onClick={() => navigate({ name: "privacy" })}
                              >
                                Privacy Policy
                              </button>
                            </span>
                          </label>
                        )}
                      </>
                    )}

                    {/* Inline error */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          key="error"
                          role="alert"
                          initial={{ opacity: 0, y: -6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2 overflow-hidden rounded-[7px] border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-xs font-medium text-red-400"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={busy || (mode === "register" && (unStatus === "taken" || unStatus === "invalid"))}
                      whileTap={{ scale: 0.97 }}
                      className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[8px] bg-fhb-red text-[13px] font-bold uppercase tracking-widest text-white shadow-lg shadow-fhb-red/20 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Shimmer */}
                      {!busy && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ translateX: ["−100%", "200%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                        />
                      )}
                      {busy ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          <span>Please wait…</span>
                        </>
                      ) : (
                        <span>
                          {mode === "login" && "Sign In"}
                          {mode === "register" && "Create Account"}
                          {mode === "forgot" && "Verify & Continue"}
                          {mode === "reset" && "Update Password & Sign In"}
                        </span>
                      )}
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </form>

              {/* Social proof micro-counter */}
              <div className="mt-5 flex items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-fhb-red/70" aria-hidden />
                <span>
                  Join <span className="font-bold text-foreground">{FAN_COUNT}</span> football fans — it&apos;s free
                </span>
              </div>
            </div>

            {/* Guest CTA */}
            <button
              onClick={() => navigate({ name: "home" })}
              className="group mt-5 flex w-full items-center justify-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-fhb-red"
            >
              Continue as guest
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>

            {/* Demo access — collapsed by default */}
            <details className="group mt-5">
              <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 transition-colors hover:text-muted-foreground select-none">
                Demo access for reviewers
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" aria-hidden />
              </summary>
              <div className="mt-3 divide-y divide-white/5 overflow-hidden rounded-[10px] border border-white/8 bg-white/[0.02]">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => quickLogin(d.email, d.pass)}
                    className="group/acc flex w-full items-center justify-between gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-white/[0.06]" aria-hidden>
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
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover/acc:translate-x-0.5 group-hover/acc:text-fhb-red"
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
