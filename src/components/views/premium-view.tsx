"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MembershipPlan } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney } from "@/lib/format";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, Check, X, Zap, Sparkles, ChevronDown, ShieldCheck, Tv,
  BadgeCheck, CalendarClock, RefreshCw, Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   PremiumView — membership plans page.
   Gold is allowed here (premium context) but stays FLAT: tints and
   hairlines only — text-fhb-gold / bg-fhb-gold/10 / border-fhb-gold/40.
   No ad slots on this page — it sells the ad-free experience.
   ════════════════════════════════════════════════════════════════ */

const BENEFITS = [
  {
    Icon: ShieldCheck,
    title: "Ad-free everywhere",
    desc: "Header, in-feed, sidebar and mobile slots removed entirely.",
  },
  {
    Icon: Newspaper,
    title: "Exclusive analysis",
    desc: "Transfer desk scoops and tactical breakdowns, 48 hours early.",
  },
  {
    Icon: Tv,
    title: "HD Live TV",
    desc: "BFL and national team streams in full HD with no mid-roll ads.",
  },
  {
    Icon: BadgeCheck,
    title: "Creator badges",
    desc: "A gold crown beside your name across scores, posts and shorts.",
  },
];

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

const PLAN_META: Record<string, { icon: React.ReactNode; desc: string }> = {
  FREE: { icon: <Zap className="h-[18px] w-[18px]" aria-hidden />, desc: "The starter experience for every fan" },
  PRO: { icon: <Crown className="h-[18px] w-[18px]" aria-hidden />, desc: "For the true football devotees" },
  LEGEND: { icon: <Sparkles className="h-[18px] w-[18px]" aria-hidden />, desc: "The ultimate fan experience" },
};

/** Plan features are stored as a JSON string — parse safely. */
function parsePlanFeatures(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

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
      toast({ title: "Subscription updated", description: data.message });
    },
    onError: (e: Error) => toast({ title: "Subscription failed", description: e.message, variant: "destructive" }),
  });

  const plans = data?.plans ?? [];

  /** Features the free tier lacks — pulled from the Pro plan, shown with X marks. */
  const proPlan = plans.find((p) => p.code === "PRO");
  const freeMissing = proPlan ? parsePlanFeatures(proPlan.features).slice(0, 2) : [];

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const expiryLine = user?.premiumUntil
    ? new Date(user.premiumUntil).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      <PageHeader
        title="Premium Membership"
        kicker="support FHB, unlock everything"
        icon={<Crown className="text-fhb-gold" aria-hidden />}
        subtitle="One membership for the whole platform — ad-free football, HD streams and early access to the stories that matter."
      >
        {user?.isPremium && (
          <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-fhb-gold/40 bg-fhb-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-fhb-gold">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Premium active{expiryLine ? ` until ${expiryLine}` : ""}
          </span>
        )}
      </PageHeader>

      {/* ═══ Benefits band — 4 flat tiles, gold-tinted icons ═══ */}
      <section className="reveal grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Premium benefits">
        {BENEFITS.map((b) => (
          <div key={b.title} className="card-lift flex items-start gap-3.5 rounded-lg border border-border bg-card p-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-fhb-gold/10 text-fhb-gold"
              aria-hidden
            >
              <b.Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="label-cond text-[13px] font-bold tracking-[0.06em] text-foreground">{b.title}</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ═══ Current membership status ═══ */}
      {user?.isPremium && (
        <section
          className="reveal mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-fhb-gold/40 bg-fhb-gold/[0.05] p-4 sm:p-5"
          aria-label="Membership status"
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-fhb-gold/10 text-fhb-gold"
              aria-hidden
            >
              <Crown className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="label-cond text-[15px] font-bold tracking-[0.05em] text-foreground">
                You&rsquo;re premium {expiryLine ? `until ${expiryLine}` : "for the current period"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Every ad slot is removed and creator earnings are boosted while your plan is active.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={scrollToPlans}
              className="flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3 text-[11px] font-bold uppercase tracking-wider text-foreground/85 transition-colors hover:border-white/25"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Change plan
            </button>
            <button
              onClick={() => {
                setBusy("FREE");
                subscribe.mutate("FREE");
              }}
              disabled={subscribe.isPending && busy === "FREE"}
              className="flex h-8 items-center rounded-[6px] border border-border bg-card px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground disabled:opacity-50"
            >
              {subscribe.isPending && busy === "FREE" ? "Processing…" : "Cancel membership"}
            </button>
          </div>
        </section>
      )}

      {/* ═══ Plan cards ═══ */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div id="plans" className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const features = parsePlanFeatures(plan.features);
            const meta = PLAN_META[plan.code] ?? PLAN_META.FREE;
            const isFree = plan.price === 0;
            const isCurrentPaid = !!user?.isPremium && !isFree;
            return (
              <div
                key={plan.id}
                className={cn(
                  "reveal card-lift flex h-full flex-col rounded-lg border bg-card p-5",
                  plan.popular ? "border-fhb-gold/50" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label-cond text-[17px] font-bold tracking-[0.05em] text-foreground">{plan.name}</p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">{meta.desc}</p>
                  </div>
                  {plan.popular ? (
                    <span className="label-cond flex shrink-0 items-center gap-1 rounded-[4px] bg-fhb-gold/15 px-2 py-1 text-[9.5px] font-bold tracking-[0.1em] text-fhb-gold">
                      <Sparkles className="h-3 w-3" aria-hidden /> Most Popular
                    </span>
                  ) : (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground"
                      aria-hidden
                    >
                      {meta.icon}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-baseline gap-1.5 border-b border-border pb-5">
                  <span className="score-num text-[34px] leading-none text-foreground">
                    {isFree ? "Free" : formatMoney(plan.price)}
                  </span>
                  {!isFree && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      /{plan.period}
                    </span>
                  )}
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs">
                      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-primary/12 text-primary">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="leading-relaxed text-foreground/85">{f}</span>
                    </li>
                  ))}
                  {isFree &&
                    freeMissing.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs">
                        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-secondary text-muted-foreground/70">
                          <X className="h-3 w-3" aria-hidden />
                        </span>
                        <span className="leading-relaxed text-muted-foreground/70 line-through decoration-border">{f}</span>
                      </li>
                    ))}
                </ul>

                <div className="mt-auto pt-6">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate({ name: "auth" });
                      return;
                    }
                    setBusy(plan.code);
                    subscribe.mutate(plan.code);
                  }}
                  disabled={subscribe.isPending && busy === plan.code}
                  className={cn(
                    "mt-6 flex h-10 w-full items-center justify-center rounded-[7px] text-[11.5px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] disabled:opacity-60",
                    plan.popular && !isCurrentPaid
                      ? "bg-primary text-primary-foreground hover:brightness-110"
                      : "border border-border bg-card text-foreground/85 hover:border-white/25"
                  )}
                >
                  {subscribe.isPending && busy === plan.code
                    ? "Processing…"
                    : isFree
                      ? user?.isPremium
                        ? "Switch to Free"
                        : user
                          ? "Start Free"
                          : "Start Free — Sign In"
                      : isCurrentPaid
                        ? "Current plan"
                        : user
                          ? `Get ${plan.name}`
                          : `Get ${plan.name} — Sign In`}
                </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment methods — quiet strip under the grid */}
      <div className="reveal mt-5 flex flex-wrap items-center justify-center gap-2" aria-label="Payment methods">
        {PAYMENT_METHODS.map((p) => (
          <span
            key={p}
            className="rounded-[4px] border border-border bg-card px-2.5 py-1 text-[10.5px] font-bold text-foreground/75"
          >
            {p}
          </span>
        ))}
        <span className="text-[11px] text-muted-foreground">Secured by SSLCommerz · demo mode activates instantly</span>
      </div>

      {/* ═══ FAQ ═══ */}
      <section className="reveal mt-10" aria-label="Frequently asked questions">
        <SectionHeader title="Frequently Asked Questions" kicker="good to know" />
        <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-card">
          {FAQ_ITEMS.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q}>
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="row-hover flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={cn("text-sm font-bold", open ? "text-primary" : "text-foreground")}>{q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180 text-primary"
                    )}
                    aria-hidden
                  />
                </button>
                {open && <p className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground">{a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
