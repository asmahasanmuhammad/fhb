"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { LogoMark } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, AlertTriangle, AtSign, Mail, Lock, User, ShieldCheck, Clapperboard, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthView() {
  const { refreshUser, navigate } = useAppStore();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

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
      if (!json.success) throw new Error(json.error ?? "কিছু একটা ভুল হয়েছে");
      await refreshUser();
      toast({
        title: mode === "login" ? "স্বাগতম!" : "অ্যাকাউন্ট তৈরি সফল!",
        description: json.data.name ? `${json.data.name}, FHB-তে আপনাকে স্বাগতম!` : undefined,
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
    "w-full rounded-xl border border-border bg-background px-10 py-3 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="noise stadium-panel edge-lit relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-8">
        <span className="floodlight pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <div className="mb-7 text-center">
            <span className="inline-block transition-transform hover:-rotate-6">
              <LogoMark size={10} />
            </span>
            <h1 className="display-hero mt-4 text-2xl text-foreground sm:text-[1.7rem]">
              {mode === "login" ? "স্বাগতম, ফুটবলপ্রেমী!" : "FHB ফ্যামিলিতে যোগ দিন"}
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {mode === "login"
                ? "লাইভ স্কোর, নিউজ, শর্টস আর কমিউনিটি — সব এক অ্যাকাউন্টে"
                : "মাত্র ৩০ সেকেন্ডে অ্যাকাউন্ট খুলুন"}
            </p>
          </div>

          {/* Mode switch */}
          <div className="mb-7 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/40 p-1.5">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.97]",
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={mode === m}
              >
                {m === "login" ? <LogIn className="h-3.5 w-3.5" aria-hidden /> : <UserPlus className="h-3.5 w-3.5" aria-hidden />}
                {m === "login" ? "লগইন" : "রেজিস্ট্রেশন"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4.5 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-[11px] font-bold text-foreground">
                    পূর্ণ নাম <span className="text-fhb-red">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="আপনার নাম"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="mb-1.5 block text-[11px] font-bold text-foreground">
                    ইউজারনেম <span className="text-fhb-red">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      placeholder="যেমন: bpl_fan10"
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
                {mode === "login" ? "ইমেইল / ইউজারনেম" : "ইমেইল"} <span className="text-fhb-red">*</span>
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
                পাসওয়ার্ড <span className="text-fhb-red">*</span>
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-xs font-medium text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="sheen flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_14px_34px_-12px_var(--primary)] transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট খুলুন"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-7 rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-[11px] font-bold text-primary">ডেমো অ্যাকাউন্ট (এক ক্লিকে ফিল হবে)</p>
            <div className="mt-3 space-y-2">
              {[
                { icon: <ShieldCheck className="h-4 w-4 text-fhb-red" aria-hidden />, label: "অ্যাডমিন — সম্পূর্ণ কন্ট্রোল", email: "admin@fhb.com.bd", pass: "Admin@2025" },
                { icon: <Clapperboard className="h-4 w-4 text-primary" aria-hidden />, label: "ক্রিয়েটর — আয়ের ড্যাশবোর্ড", email: "creator@fhb.com.bd", pass: "Creator@2025" },
                { icon: <Heart className="h-4 w-3.5 text-fhb-gold" aria-hidden />, label: "ফ্যান — লাইক, কমেন্ট, পোস্ট", email: "tanvir@fhb.com.bd", pass: "Fan@2025" },
              ].map((d) => (
                <button
                  key={d.email}
                  onClick={() => quickLogin(d.email, d.pass)}
                  className="group flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background/70 px-3 py-2.5 text-left text-[11px] transition-all hover:border-primary/50 active:scale-[0.98]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">{d.icon}</span>
                    <span className="min-w-0">
                      <span className="block font-bold text-foreground">{d.label}</span>
                      <span className="block truncate text-muted-foreground">
                        {d.email} / {d.pass}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
