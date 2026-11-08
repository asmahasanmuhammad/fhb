"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, Info } from "lucide-react";
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
        title: mode === "login" ? "স্বাগতম! 🎉" : "অ্যাকাউন্ট তৈরি সফল! 🎉",
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

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="hero-glow rounded-2xl border bg-card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 font-display text-xl font-bold text-primary-foreground shadow-lg">
            F<span className="text-fhb-red">H</span>
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-wide">
            {mode === "login" ? "স্বাগতম, ফুটবলপ্রেমী!" : "FHB ফ্যামিলিতে যোগ দিন"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "login" ? "লাইভ স্কোর, নিউজ, শর্টস আর কমিউনিটি — সব এক অ্যাকাউন্টে" : "মাত্র ৩০ সেকেন্ডে অ্যাকাউন্ট খুলুন"}
          </p>
        </div>

        {/* Mode switch */}
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-muted p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all",
                mode === m ? "bg-background shadow text-primary" : "text-muted-foreground"
              )}
            >
              {m === "login" ? <LogIn className="h-3.5 w-3.5" aria-hidden /> : <UserPlus className="h-3.5 w-3.5" aria-hidden />}
              {m === "login" ? "লগইন" : "রেজিস্ট্রেশন"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {mode === "register" && (
            <>
              <div>
                <label htmlFor="name" className="mb-1 block text-[11px] font-bold">
                  পূর্ণ নাম *
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="আপনার নাম"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="username" className="mb-1 block text-[11px] font-bold">
                  ইউজারনেম *
                </label>
                <input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="যেমন: bpl_fan10"
                  pattern="[a-zA-Z0-9_]+"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] font-bold">
              {mode === "login" ? "ইমেইল / ইউজারনেম *" : "ইমেইল *"}
            </label>
            <input
              id="email"
              type={mode === "login" ? "text" : "email"}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-[11px] font-bold">
              পাসওয়ার্ড *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPass ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
              >
                {showPass ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-fhb-red/10 px-3 py-2 text-xs font-medium text-fhb-red">
              {error}
            </p>
          )}

          <Button type="submit" disabled={busy} className="w-full py-2.5 font-bold">
            {busy ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট খুলুন"}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
            <Info className="h-3.5 w-3.5" aria-hidden /> ডেমো অ্যাকাউন্ট (এক ক্লিকে ফিল হবে)
          </p>
          <div className="mt-2.5 grid gap-1.5">
            {[
              ["👑 অ্যাডমিন — সম্পূর্ণ কন্ট্রোল", "admin@fhb.com.bd", "Admin@2025"],
              ["🎬 ক্রিয়েটর — আয়ের ড্যাশবোর্ড", "creator@fhb.com.bd", "Creator@2025"],
              ["⚽ ফ্যান — লাইক, কমেন্ট, পোস্ট", "tanvir@fhb.com.bd", "Fan@2025"],
            ].map(([label, email, pass]) => (
              <button
                key={email}
                onClick={() => quickLogin(email, pass)}
                className="flex items-center justify-between gap-2 rounded-lg border bg-background/70 px-3 py-2 text-left text-[11px] transition-colors hover:border-primary/50"
              >
                <span>
                  <span className="font-bold">{label}</span>
                  <br />
                  <span className="text-muted-foreground">
                    {email} / {pass}
                  </span>
                </span>
                <LogIn className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
