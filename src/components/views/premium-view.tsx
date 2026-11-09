"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MembershipPlan } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/football/section-header";
import { Crown, Check, ShieldCheck, Zap, Sparkles, CreditCard, HelpCircle, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumView() {
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const refreshUser = useAppStore((s) => s.refreshUser);
  const { toast } = useToast();
  useReveal();
  const [busy, setBusy] = useState<string | null>(null);

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
      toast({ title: "Subscription successful", description: data.message });
    },
    onError: (e: Error) => toast({ title: "Subscription failed", description: e.message, variant: "destructive" }),
  });

  const plans = data?.plans ?? [];

  const planMeta: Record<string, { icon: React.ReactNode; desc: string; accent: string }> = {
    FREE: { icon: <Zap className="h-5 w-5" aria-hidden />, desc: "The starter experience for everyone", accent: "text-muted-foreground" },
    PRO: { icon: <Crown className="h-5 w-5" aria-hidden />, desc: "For the true football devotees", accent: "text-fhb-gold" },
    LEGEND: { icon: <Sparkles className="h-5 w-5" aria-hidden />, desc: "The ultimate fan experience", accent: "text-fhb-red" },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6">
      {/* ═══ Cinematic premium hero ═══ */}
      <div className="noise gold-panel relative overflow-hidden rounded-3xl border border-fhb-gold/25 p-7 text-center sm:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-14 select-none font-display text-[10rem] font-bold leading-none text-fhb-gold/[0.06] sm:text-[15rem]"
        >
          PRO
        </span>
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-fhb-gold/40 bg-fhb-gold/10 px-4 py-1.5 text-[11px] font-bold text-fhb-gold">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            FHB Premium Membership
          </span>
          <h1 className="display-hero mt-4 text-3xl text-foreground sm:text-[2.75rem]">
            For the love of football — <span className="gold-text">deeper than ever</span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            An ad-free experience, exclusive transfer news, HD highlights and bigger earning opportunities for creators.
          </p>
          {user?.isPremium && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden /> You are an active premium member
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const features: string[] = JSON.parse(plan.features || "[]");
            const meta = planMeta[plan.code] ?? planMeta.FREE;
            const isCurrent = user?.isPremium && plan.code !== "FREE";
            return (
              <div
                key={plan.id}
                className={cn(
                  "card-lift relative overflow-hidden rounded-3xl border p-6 sm:p-7",
                  plan.popular
                    ? "gold-panel border-fhb-gold/45 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)] md:-translate-y-3 md:scale-[1.02]"
                    : "edge-lit border-border bg-card"
                )}
              >
                {plan.popular && (
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fhb-gold/60 via-fhb-gold to-fhb-gold/60" aria-hidden />
                )}
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      plan.popular ? "border border-fhb-gold/30 bg-fhb-gold/15" : "bg-muted"
                    )}
                  >
                    <span className={meta.accent}>{meta.icon}</span>
                  </span>
                  {plan.popular && (
                    <span className="flex items-center gap-1 rounded-full bg-fhb-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-fhb-gold">
                      <Sparkles className="h-3 w-3" aria-hidden /> Most Popular
                    </span>
                  )}
                </div>
                <h3 className="font-display-bn mt-5 text-xl font-bold text-foreground sm:text-2xl">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{meta.desc}</p>
                <div className="mt-6 flex items-baseline gap-1.5 border-b border-border/70 pb-6">
                  <span className="tabular font-display text-4xl font-bold text-foreground sm:text-[2.75rem]">
                    {plan.price === 0 ? "Free" : formatMoney(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground">/{plan.period}</span>}
                </div>

                <ul className="mt-6 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          plan.popular ? "bg-fhb-gold/20 text-fhb-gold" : "bg-primary/15 text-primary"
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="leading-relaxed text-foreground/85">{f}</span>
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
                    "mt-7 w-full rounded-xl py-3 text-sm font-bold",
                    plan.popular && "sheen bg-fhb-gold text-black shadow-[0_14px_34px_-12px_var(--fhb-gold)] hover:bg-fhb-gold/90",
                    plan.code === "LEGEND" && !plan.popular && "border-fhb-red/40 text-fhb-red hover:bg-fhb-red/10 hover:text-fhb-red"
                  )}
                >
                  {subscribe.isPending && busy === plan.code
                    ? "Processing..."
                    : plan.price === 0
                      ? "Start Free"
                      : isCurrent
                        ? "Active"
                        : `Get ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment + FAQ */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="edge-lit rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2.5 font-display-bn text-base font-bold text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <CreditCard className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />
            </span>
            Payment Methods
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            In demo mode subscriptions activate instantly. In production, bKash, Nagad, Rocket and card payments are
            ready for (SSLCommerz) integration —{" "}
            just wire up gateway callbacks on the <code className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px]">/api/membership</code>
            endpoint.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["bKash", "Nagad", "Rocket", "Visa", "Mastercard"].map((p) => (
              <span key={p} className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            SSLCommerz secure payment gateway supported
          </p>
        </div>
        <div className="edge-lit rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2.5 font-display-bn text-base font-bold text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <HelpCircle className="h-[18px] w-[18px]" aria-hidden />
            </span>
            Frequently Asked Questions
          </h3>
          <div className="mt-4 space-y-3">
            {[
              ["Do ads go away with Premium?", "Yes! Premium members get a completely ad-free experience."],
              ["How do creators earn?", "Ad revenue share from shorts views + fan tips — everything is tracked in the earnings dashboard."],
              ["Can I cancel anytime?", "Yes, you can return to the free plan anytime from your profile."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border border-border bg-background/50 p-4">
                <p className="text-xs font-bold text-foreground">{q}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
