"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MembershipPlan } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, Check, X, ShieldCheck, Zap, Sparkles, CreditCard, HelpCircle,
  BadgeCheck, ChevronDown, CalendarClock, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

/* ════════════════════════════════════════════════════════════════
   PremiumView — membership & monetization page
   Gold-accent hero, plan comparison, payment strip, FAQ accordion.
   No ad slots here — this page sells the ad-free experience.
   ════════════════════════════════════════════════════════════════ */

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Visa", "Mastercard"];

const FAQ_ITEMS: Array<[string, string]> = [
  [
    "Does Premium remove all ads?",
    "Yes. Premium members never see header, in-feed, sidebar or mobile banner ads anywhere on FHB — the slots are removed entirely, not just hidden.",
  ],
  [
    "How do creators earn money?",
    "Creators earn a share of ad revenue from shorts views plus fan tips. Every taka is tracked in the earnings dashboard and can be withdrawn to bKash.",
  ],
  [
    "Can I cancel anytime?",
    "Yes. Switch back to the free plan from this page whenever you like — you keep premium benefits until the end of the current period.",
  ],
  [
    "Which payment methods are supported?",
    "bKash, Nagad, Rocket and Visa or Mastercard through the SSLCommerz gateway. In this demo, subscriptions activate instantly without a real charge.",
  ],
];

export function PremiumView() {
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const refreshUser = useAppStore((s) => s.refreshUser);
  const { toast } = useToast();
  useReveal();
  const [busy, setBusy] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data, isLoading } = useQuery<{ plans: MembershipPlan[] }>({
    queryKey: ["membership"],
    queryFn: async () => {
      const res = await fetch("/api/membership");
      return res.json().then((j) => j.data);
    },
  });

  const subscribe = useMutation({
    mutationFn: async (planCode: string) => {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      refreshUser();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}
      toast({ title: "Subscription successful! 🏆", description: data.message });
    },
    onError: (e: Error) => toast({ title: "Subscription failed", description: e.message, variant: "destructive" }),
  });

  const plans = data?.plans ?? [];

  /** Cheapest paid plan — the honest "from" price, straight from the API. */
  const minPaidPrice = useMemo(() => {
    const paid = plans.filter((p) => p.price > 0);
    return paid.length ? Math.min(...paid.map((p) => p.price)) : null;
  }, [plans]);

  /** Features the free tier lacks — pulled from the Pro plan, shown with X marks. */
  const freeMissing = useMemo(() => {
    const pro = plans.find((p) => p.code === "PRO");
    if (!pro) return [];
    try {
      const features: string[] = JSON.parse(pro.features || "[]");
      return features.slice(0, 2);
    } catch {
      return [];
    }
  }, [plans]);

  const planMeta: Record<string, { icon: React.ReactNode; desc: string }> = {
    FREE: { icon: <Zap className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />, desc: "The starter experience for every fan" },
    PRO: { icon: <Crown className="h-[18px] w-[18px]" aria-hidden />, desc: "For the true football devotees" },
    LEGEND: { icon: <Sparkles className="h-[18px] w-[18px]" aria-hidden />, desc: "The ultimate fan experience" },
  };

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const expiryLine = user?.premiumUntil
    ? new Date(user.premiumUntil).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ═══ Gold hero band ═══ */}
      <section className="noise gold-panel reveal relative overflow-hidden rounded-xl border border-fhb-gold/25 px-6 py-9 sm:px-10 sm:py-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[8rem] font-bold leading-none tracking-tight text-fhb-gold/[0.05] sm:text-[12rem]"
        >
          PRO
        </span>
        <div className="relative max-w-[62ch]">
          <p className="eyebrow flex items-center gap-2 text-fhb-gold">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Premium membership
          </p>
          <h1 className="display-hero mt-3 text-[1.9rem] text-foreground sm:text-[2.6rem]">
            FHB <span className="gold-text">Premium</span>
          </h1>
          <p className="mt-3.5 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            An ad-free experience, HD highlights, transfer news 48 hours early and bigger earning opportunities for
            creators — one membership for the whole platform.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {minPaidPrice != null && (
              <span className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">From</span>
                <span className="tabular font-display text-2xl font-bold text-fhb-gold">{formatMoney(minPaidPrice)}</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </span>
            )}
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="text-xs font-medium text-muted-foreground">Cancel anytime · bKash, Nagad and cards</span>
          </div>
          <div className="mt-6">
            {user?.isPremium ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                You are an active premium member
              </span>
            ) : (
              <Button
                onClick={scrollToPlans}
                className="sheen h-11 gap-2 bg-fhb-gold px-6 text-sm font-bold text-black hover:bg-fhb-gold/90"
              >
                <Crown className="h-4 w-4" aria-hidden />
                See membership plans
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Current membership status ═══ */}
      {user?.isPremium && (
        <section className="reveal edge-lit mt-6 rounded-xl border border-fhb-gold/30 bg-card p-5 sm:p-6" aria-label="Membership status">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-fhb-gold/30 bg-fhb-gold/12 text-fhb-gold">
                <Crown className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-display text-base font-bold text-foreground">
                  Premium is active
                  <span className="rounded bg-fhb-gold/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-fhb-gold">
                    Ad-free
                  </span>
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {expiryLine ? `Valid until ${expiryLine}` : "Valid for the current period"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={scrollToPlans} className="gap-1.5 font-semibold">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Change plan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBusy("FREE");
                  subscribe.mutate("FREE");
                }}
                disabled={subscribe.isPending && busy === "FREE"}
                className="font-semibold text-muted-foreground hover:text-foreground"
              >
                {subscribe.isPending && busy === "FREE" ? "Processing..." : "Cancel membership"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Plan cards ═══ */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[430px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div id="plans" className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            let features: string[] = [];
            try {
              features = JSON.parse(plan.features || "[]");
            } catch {
              features = [];
            }
            const meta = planMeta[plan.code] ?? planMeta.FREE;
            const isCurrent = user?.isPremium && plan.code !== "FREE";
            const isFree = plan.price === 0;
            return (
              <div
                key={plan.id}
                className={cn(
                  "reveal flex h-full flex-col rounded-xl border p-5 sm:p-6 shadow-xl",
                  plan.popular ? "border-amber-400/60 bg-[#10172c] shadow-amber-500/10" : "border-white/15 bg-[#0b101d]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-black text-white">{plan.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-300">{meta.desc}</p>
                  </div>
                  {plan.popular ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.1em] text-amber-300">
                      <Sparkles className="h-3 w-3" aria-hidden /> Most Popular
                    </span>
                  ) : (
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", plan.popular ? "bg-amber-400/20" : "bg-white/10 text-slate-300")}>
                      {meta.icon}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-baseline gap-1.5 border-b border-white/10 pb-5">
                  <span className="tabular font-display text-[2.1rem] font-black leading-none text-white sm:text-4xl">
                    {isFree ? "Free" : formatMoney(plan.price)}
                  </span>
                  {!isFree && <span className="text-xs font-bold text-slate-300">/{plan.period}</span>}
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs">
                      <span
                        className={cn(
                          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded",
                          plan.popular ? "bg-amber-400/25 text-amber-300" : "bg-red-600/25 text-red-400"
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="leading-relaxed text-slate-200 font-medium">{f}</span>
                    </li>
                  ))}
                  {isFree && freeMissing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs">
                      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-white/10 text-slate-400">
                        <X className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="leading-relaxed text-slate-400 line-through decoration-white/20">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    if (!user) {
                      navigate({ name: "auth" });
                      return;
                    }
                    setBusy(plan.code);
                    subscribe.mutate(plan.code);
                  }}
                  disabled={subscribe.isPending && busy === plan.code}
                  variant={plan.popular ? "default" : "outline"}
                  className={cn(
                    "mt-6 w-full py-3 text-sm font-black rounded-lg",
                    plan.popular ? "sheen bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/30" : "border-white/20 bg-white/5 text-white hover:bg-white/15"
                  )}
                >
                  {subscribe.isPending && busy === plan.code
                    ? "Processing..."
                    : isFree
                      ? user?.isPremium
                        ? "Switch to Free"
                        : "Start Free"
                      : isCurrent
                        ? "Active"
                        : `Get ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Payment methods strip ═══ */}
      <section className="reveal edge-lit mt-8 rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Payment methods">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <CreditCard className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-foreground">Pay your way</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Local mobile finance and international cards, secured by SSLCommerz.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((p) => (
              <span
                key={p}
                className="rounded-md border border-border bg-elevated px-3 py-1.5 text-[11px] font-bold text-foreground/80"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground sm:ml-auto">
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            Demo mode — subscriptions activate instantly
          </p>
        </div>
      </section>

      {/* ═══ FAQ accordion ═══ */}
      <section className="reveal mt-8" aria-label="Frequently asked questions">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1.5 text-primary">Good to know</p>
            <h2 className="font-display text-[1.35rem] font-bold tracking-[-0.01em] text-foreground sm:text-[1.55rem]">
              Frequently asked questions
            </h2>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HelpCircle className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <div className="h-px w-full bg-border/70" aria-hidden />
        <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
          {FAQ_ITEMS.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q}>
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className={cn("text-sm font-bold", open ? "text-primary" : "text-foreground")}>{q}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180 text-primary")}
                    aria-hidden
                  />
                </button>
                {open && (
                  <p className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground">{a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
