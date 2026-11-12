"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MembershipPlan } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  Check,
  X,
  Zap,
  Sparkles,
  ShieldCheck,
  Tv,
  BadgeCheck,
  CalendarClock,
  RefreshCw,
  Newspaper,
  Star,
  ArrowRight,
  Wallet,
  CreditCard,
  ShieldHalf,
  Trophy,
  Users,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

/* ════════════════════════════════════════════════════════════════
   PremiumView — world-class membership plans page for FHB v5.
   Gold is allowed here (premium context) — tints, hairlines and
   glow effects only. No ad slots — this sells the ad-free experience.
   ════════════════════════════════════════════════════════════════ */

/* ── Static data ─────────────────────────────────────────────── */

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

const COMPARISON_FEATURES = [
  { label: "Live scores & fixtures", free: true, pro: true, legend: true },
  { label: "News articles", free: true, pro: true, legend: true },
  { label: "Community posts", free: true, pro: true, legend: true },
  { label: "Ad-free experience", free: false, pro: true, legend: true },
  { label: "HD live streams", free: false, pro: true, legend: true },
  { label: "Exclusive analysis (48h early)", free: false, pro: true, legend: true },
  { label: "Creator gold badge", free: false, pro: true, legend: true },
  { label: "Priority support", free: false, pro: true, legend: true },
  { label: "Tactical pitch tools", free: false, pro: false, legend: true },
  { label: "Legend-only Discord", free: false, pro: false, legend: true },
  { label: "Signed merch drop access", free: false, pro: false, legend: true },
  { label: "Direct player Q&A sessions", free: false, pro: false, legend: true },
];

const TESTIMONIALS = [
  {
    name: "Rafiqul Islam",
    handle: "@rafi_bfl",
    avatar: "RI",
    rating: 5,
    text: "Switched to Pro last season and I genuinely can't go back. Watching BFL in HD without ads has completely changed my matchday experience. The tactical breakdowns alone are worth every taka.",
    plan: "PRO",
  },
  {
    name: "Sumaiya Chowdhury",
    handle: "@sumaiya_fc",
    avatar: "SC",
    rating: 5,
    text: "The Legend tier is unreal. I joined a live Q&A with Jamal Bhuyan last month — something I never thought was possible as a fan. FHB has redefined what a football platform can be.",
    plan: "LEGEND",
  },
  {
    name: "Tanvir Ahmed",
    handle: "@tanvir_goals",
    avatar: "TA",
    rating: 5,
    text: "The exclusive transfer news is what sold me. I found out about Obi's move to Dhaka Abahani 2 days before it broke on TV. That alone made the Pro subscription pay for itself.",
    plan: "PRO",
  },
];

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Does Premium remove all ads?",
    a: "Yes. Premium members never see header, in-feed, sidebar or mobile banner ads anywhere on FHB — the slots are removed entirely, not just hidden.",
  },
  {
    q: "How do creators earn money?",
    a: "Creators earn a share of ad revenue from shorts views plus fan tips. Every taka is tracked in the earnings dashboard and can be withdrawn to bKash.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Switch back to the free plan from this page whenever you like — you keep premium benefits until the end of the current billing period.",
  },
  {
    q: "Which payment methods are supported?",
    a: "bKash, Nagad, Rocket and Visa or Mastercard through the SSLCommerz gateway. In this demo, subscriptions activate instantly without a real charge.",
  },
  {
    q: "What's the difference between Pro and Legend?",
    a: "Pro gives you full ad-free access, HD streams, exclusive analysis and creator badges. Legend adds tactical pitch tools, a private Discord server, signed merch drop priority and exclusive player Q&A sessions.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Absolutely. If you're not satisfied within the first 7 days of your paid subscription, contact support and we'll issue a full refund — no questions asked.",
  },
];

const PLAN_META: Record<
  string,
  {
    icon: React.ReactNode;
    desc: string;
    gradient: string;
    accentColor: string;
  }
> = {
  FREE: {
    icon: <Zap className="h-5 w-5" aria-hidden />,
    desc: "The starter experience for every fan",
    gradient: "from-white/5 to-white/[0.02]",
    accentColor: "rgba(255,255,255,0.15)",
  },
  PRO: {
    icon: <Crown className="h-5 w-5" aria-hidden />,
    desc: "For the true football devotees",
    gradient: "from-fhb-gold/15 to-fhb-gold/5",
    accentColor: "rgba(251,191,36,0.6)",
  },
  LEGEND: {
    icon: <Sparkles className="h-5 w-5" aria-hidden />,
    desc: "The ultimate fan experience",
    gradient: "from-primary/15 to-primary/5",
    accentColor: "rgba(255,30,70,0.6)",
  },
};

/* ── Helpers ──────────────────────────────────────────────────── */

function parsePlanFeatures(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

/* ── Sub-components ──────────────────────────────────────────── */

/** Animated gradient mesh background for the hero */
function HeroMeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06080f] via-[#06080f] to-[#06080f]" />
      {/* Stadium mesh radials */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,191,36,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 60%, rgba(255,30,70,0.06) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 80% 70%, rgba(0,229,255,0.04) 0%, transparent 60%)",
        }}
      />
      {/* Mesh grid lines — stadium stripes */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-grid"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      {/* Bottom fade-out */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#06080f] to-transparent" />
    </div>
  );
}

/** Glowing crown logo */
function GlowingCrown({ size = 72 }: { size?: number }) {
  return (
    <motion.div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{
        filter: [
          "drop-shadow(0 0 12px rgba(251,191,36,0.5)) drop-shadow(0 0 32px rgba(251,191,36,0.2))",
          "drop-shadow(0 0 20px rgba(251,191,36,0.8)) drop-shadow(0 0 48px rgba(251,191,36,0.35))",
          "drop-shadow(0 0 12px rgba(251,191,36,0.5)) drop-shadow(0 0 32px rgba(251,191,36,0.2))",
        ],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
        }}
      />
      <Crown
        style={{ width: size * 0.6, height: size * 0.6 }}
        className="relative text-fhb-gold"
        strokeWidth={1.5}
      />
    </motion.div>
  );
}

/** Animated gradient text */
function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block", className)}
      style={{
        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 35%, #fff7e0 55%, #fbbf24 100%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "gold-shimmer 4s linear infinite",
      }}
    >
      {children}
    </span>
  );
}

/** Pulsing ring for the popular badge */
function PulsingRing() {
  return (
    <span className="absolute -inset-1 rounded-full" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border border-fhb-gold/60"
        animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border border-fhb-gold/40"
        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.4,
        }}
      />
    </span>
  );
}

/** Individual plan card */
function PlanCard({
  plan,
  features,
  meta,
  isFree,
  isCurrentPlan,
  isPending,
  busy,
  user,
  onSubscribe,
  onNavigateAuth,
  index,
}: {
  plan: MembershipPlan;
  features: string[];
  meta: (typeof PLAN_META)[string];
  isFree: boolean;
  isCurrentPlan: boolean;
  isPending: boolean;
  busy: string | null;
  user: { isPremium: boolean } | null;
  onSubscribe: (code: string) => void;
  onNavigateAuth: () => void;
  index: number;
}) {
  const isPopular = plan.popular;
  const isPro = plan.code === "PRO";
  const isLegend = plan.code === "LEGEND";

  const ctaLabel = (() => {
    if (isPending && busy === plan.code) return "Processing…";
    if (isFree) {
      if (user?.isPremium) return "Switch to Free";
      return user ? "Start Free" : "Start Free — Sign In";
    }
    if (isCurrentPlan) return "Current Plan ✓";
    return user ? `Get ${plan.name}` : `Get ${plan.name} — Sign In`;
  })();

  const ctaStyle = (() => {
    if (isCurrentPlan) {
      return "border border-fhb-gold/50 bg-fhb-gold/10 text-fhb-gold cursor-default";
    }
    if (isLegend) {
      return "bg-gradient-to-r from-primary to-[#c0001e] text-white hover:brightness-110 shadow-lg shadow-primary/30";
    }
    if (isPro) {
      return "bg-gradient-to-r from-fhb-gold to-[#f59e0b] text-[#06080f] font-extrabold hover:brightness-110 shadow-lg shadow-fhb-gold/30";
    }
    return "border border-white/15 bg-white/5 text-foreground/85 hover:border-white/30 hover:bg-white/10";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{
        y: -6,
        boxShadow: isPopular
          ? "0 24px 60px rgba(251,191,36,0.18), 0 8px 24px rgba(0,0,0,0.5)"
          : isLegend
          ? "0 24px 60px rgba(255,30,70,0.15), 0 8px 24px rgba(0,0,0,0.5)"
          : "0 16px 40px rgba(0,0,0,0.5)",
      }}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-6 overflow-hidden",
        isPopular
          ? "border-fhb-gold/50"
          : isLegend
          ? "border-primary/40"
          : "border-white/10"
      )}
    >
      {/* Card inner gradient wash */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-b opacity-60",
          meta.gradient
        )}
        aria-hidden
      />

      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-px left-0 right-0 flex justify-center" aria-hidden>
          <div className="relative">
            <PulsingRing />
            <span className="relative flex items-center gap-1.5 rounded-b-lg bg-fhb-gold px-3 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[#06080f]">
              <Sparkles className="h-3 w-3" />
              Most Popular
            </span>
          </div>
        </div>
      )}

      {/* Plan header */}
      <div className={cn("relative flex items-start justify-between gap-3", isPopular && "mt-5")}>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[8px]",
                isPopular
                  ? "bg-fhb-gold/15 text-fhb-gold"
                  : isLegend
                  ? "bg-primary/15 text-primary"
                  : "bg-white/8 text-muted-foreground"
              )}
              aria-hidden
            >
              {meta.icon}
            </span>
            <p className="label-cond text-[18px] font-extrabold tracking-[0.04em] text-foreground">
              {plan.name}
            </p>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="relative mt-6 flex items-baseline gap-1.5 border-b border-white/8 pb-5">
        {isFree ? (
          <span className="score-num text-[38px] leading-none text-foreground">Free</span>
        ) : (
          <>
            <span
              className={cn(
                "score-num text-[38px] leading-none",
                isPopular ? "text-fhb-gold" : isLegend ? "text-foreground" : "text-foreground"
              )}
            >
              {formatMoney(plan.price)}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                /{plan.period}
              </span>
              <span className="text-[9px] text-muted-foreground/60">BDT</span>
            </div>
          </>
        )}
      </div>

      {/* Feature list */}
      <ul className="relative mt-5 flex-1 space-y-2.5">
        {features.map((f, fi) => (
          <motion.li
            key={f}
            className="flex items-start gap-2.5 text-xs"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + fi * 0.04 + 0.2 }}
          >
            <span
              className={cn(
                "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px]",
                isPopular
                  ? "bg-fhb-gold/15 text-fhb-gold"
                  : isLegend
                  ? "bg-primary/15 text-primary"
                  : "bg-white/8 text-white/60"
              )}
            >
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="leading-relaxed text-foreground/85">{f}</span>
          </motion.li>
        ))}
      </ul>

      {/* CTA button */}
      <div className="relative mt-auto pt-6">
        <motion.button
          onClick={() => {
            if (!user) {
              onNavigateAuth();
              return;
            }
            if (!isCurrentPlan) {
              onSubscribe(plan.code);
            }
          }}
          disabled={(isPending && busy === plan.code) || isCurrentPlan}
          whileHover={!isCurrentPlan ? { scale: 1.02 } : undefined}
          whileTap={!isCurrentPlan ? { scale: 0.97 } : undefined}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-70",
            ctaStyle
          )}
        >
          {isPending && busy === plan.code ? (
            <>
              <motion.span
                className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              />
              Processing…
            </>
          ) : (
            <>
              {ctaLabel}
              {!isCurrentPlan && !isFree && (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              )}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

/** Star rating */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-fhb-gold text-fhb-gold" : "fill-transparent text-white/20"
          )}
        />
      ))}
    </div>
  );
}

/** Testimonial card */
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-card p-5"
    >
      {/* Avatar + meta */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
            testimonial.plan === "LEGEND"
              ? "bg-primary/20 text-primary"
              : "bg-fhb-gold/20 text-fhb-gold"
          )}
          aria-hidden
        >
          {testimonial.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-foreground">{testimonial.name}</p>
          <p className="text-[11px] text-muted-foreground">{testimonial.handle}</p>
        </div>
        <div className="ml-auto shrink-0">
          <span
            className={cn(
              "rounded-[4px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              testimonial.plan === "LEGEND"
                ? "bg-primary/15 text-primary"
                : "bg-fhb-gold/15 text-fhb-gold"
            )}
          >
            {testimonial.plan}
          </span>
        </div>
      </div>
      <StarRating rating={testimonial.rating} />
      <p className="text-[12.5px] leading-relaxed text-foreground/80 italic">
        &ldquo;{testimonial.text}&rdquo;
      </p>
    </motion.div>
  );
}

/** Payment method pill */
function PaymentPill({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <motion.span
      whileHover={{ scale: 1.06, y: -2 }}
      className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-card px-3 py-2 text-[11px] font-bold text-foreground/80 shadow-sm"
    >
      {icon}
      {label}
    </motion.span>
  );
}

/* ═════════════════════════════════════════════════════════════
   Main Component
   ═════════════════════════════════════════════════════════════ */

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
      toast({ title: "Subscription updated", description: data.message });
    },
    onError: (e: Error) =>
      toast({
        title: "Subscription failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const plans = data?.plans ?? [];

  const proPlan = plans.find((p) => p.code === "PRO");
  const freeMissing = proPlan ? parsePlanFeatures(proPlan.features).slice(0, 2) : [];

  const expiryLine = user?.premiumUntil
    ? new Date(user.premiumUntil).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-20 sm:px-6">
      {/* ═══ CSS for gold shimmer animation ═══ */}
      <style>{`
        @keyframes gold-shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════ */}
      <section
        className="relative -mx-4 mb-14 overflow-hidden px-4 pb-20 pt-16 sm:-mx-6 sm:px-6 sm:pt-20"
        aria-label="Premium hero"
      >
        <HeroMeshBackground />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Crown logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <GlowingCrown size={80} />
          </motion.div>

          {/* Kicker */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="kicker mb-3 text-fhb-gold/80"
          >
            Football Hub Bangladesh · Premium
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="display-hero mb-4 text-[clamp(2rem,5vw,3.5rem)] text-foreground"
          >
            Unlock the{" "}
            <GradientText>Full Experience</GradientText>
          </motion.h1>

          {/* Value proposition */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mx-auto mb-8 max-w-lg text-[14px] leading-relaxed text-muted-foreground"
          >
            One membership for the whole platform — ad-free football, HD live streams and
            early access to the stories that matter. Join{" "}
            <strong className="text-foreground/90">50,000+</strong> Bangladesh football fans who
            already watch the game differently.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToPlans}
              className="flex h-11 items-center gap-2 rounded-[10px] bg-gradient-to-r from-fhb-gold to-[#f59e0b] px-6 text-[12px] font-extrabold uppercase tracking-wider text-[#06080f] shadow-lg shadow-fhb-gold/30 transition-all"
            >
              <Crown className="h-4 w-4" aria-hidden />
              View Plans
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToPlans}
              className="flex h-11 items-center gap-2 rounded-[10px] border border-white/15 bg-white/5 px-6 text-[12px] font-bold uppercase tracking-wider text-foreground/85 backdrop-blur-sm transition-all hover:border-white/30"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-6"
          >
            {[
              { icon: <Users className="h-4 w-4" />, value: "50K+", label: "Premium fans" },
              { icon: <Tv className="h-4 w-4" />, value: "HD", label: "Live streams" },
              { icon: <Trophy className="h-4 w-4" />, value: "48h", label: "Early access" },
              { icon: <ShieldCheck className="h-4 w-4" />, value: "0", label: "Ads shown" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-fhb-gold/70">{stat.icon}</span>
                <span className="text-[13px] font-bold text-foreground">{stat.value}</span>
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CURRENT MEMBERSHIP STATUS BANNER
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {user?.isPremium && (
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="reveal mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-fhb-gold/40 bg-gradient-to-r from-fhb-gold/[0.07] to-fhb-gold/[0.03] p-5"
            aria-label="Membership status"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-fhb-gold/15 text-fhb-gold"
                aria-hidden
              >
                <Crown className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="label-cond text-[15px] font-bold tracking-[0.04em] text-foreground">
                  You&rsquo;re premium{" "}
                  {expiryLine ? `until ${expiryLine}` : "for the current period"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Every ad slot removed · creator earnings boosted · HD streams active
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={scrollToPlans}
                className="flex h-8 items-center gap-1.5 rounded-[7px] border border-white/15 bg-white/5 px-3 text-[11px] font-bold uppercase tracking-wider text-foreground/85 transition-colors hover:border-white/30"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Change plan
              </button>
              <button
                onClick={() => {
                  setBusy("FREE");
                  subscribe.mutate("FREE");
                }}
                disabled={subscribe.isPending && busy === "FREE"}
                className="flex h-8 items-center rounded-[7px] border border-white/10 bg-transparent px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground disabled:opacity-50"
              >
                {subscribe.isPending && busy === "FREE" ? "Processing…" : "Cancel membership"}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          BENEFITS BAND
          ═══════════════════════════════════════════════ */}
      <section className="reveal mb-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Premium benefits">
        {BENEFITS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, borderColor: "rgba(251,191,36,0.3)" }}
            className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-card p-4 transition-colors"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-fhb-gold/10 text-fhb-gold"
              aria-hidden
            >
              <b.Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="label-cond text-[13px] font-bold tracking-[0.05em] text-foreground">
                {b.title}
              </h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                {b.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════
          PLAN CARDS
          ═══════════════════════════════════════════════ */}
      <section aria-label="Membership plans" className="reveal">
        <div className="mb-8 text-center">
          <p className="kicker mb-2 text-fhb-gold/70">Choose your tier</p>
          <h2 className="display-hero text-[clamp(1.5rem,3.5vw,2.5rem)] text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-[13px] text-muted-foreground">
            All plans include the core FHB experience. Upgrade for the full package.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[480px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div
            id="plans"
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {plans.map((plan, index) => {
              const features = parsePlanFeatures(plan.features);
              const meta = PLAN_META[plan.code] ?? PLAN_META.FREE;
              const isFree = plan.price === 0;
              const isCurrentPlan =
                (isFree && !user?.isPremium) ||
                (!isFree && !!user?.isPremium);

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  features={features}
                  meta={meta}
                  isFree={isFree}
                  isCurrentPlan={isCurrentPlan}
                  isPending={subscribe.isPending}
                  busy={busy}
                  user={user}
                  onSubscribe={(code) => {
                    setBusy(code);
                    subscribe.mutate(code);
                  }}
                  onNavigateAuth={() => navigate({ name: "auth" })}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          MONEY-BACK GUARANTEE BANNER
          ═══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="reveal mt-8 flex flex-col items-center justify-center gap-3 rounded-xl border border-fhb-green/20 bg-gradient-to-r from-fhb-green/[0.05] to-transparent px-6 py-5 text-center sm:flex-row sm:text-left"
        aria-label="Money-back guarantee"
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-fhb-green/30 bg-fhb-green/10 text-fhb-green"
          aria-hidden
        >
          <ShieldHalf className="h-6 w-6" />
        </span>
        <div>
          <p className="label-cond text-[14px] font-bold text-foreground">
            7-Day Money-Back Guarantee
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Not satisfied within the first 7 days? Contact support for a full refund — no questions asked, no hoops to jump through.
          </p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          PAYMENT METHODS STRIP
          ═══════════════════════════════════════════════ */}
      <div
        className="reveal mt-6 flex flex-wrap items-center justify-center gap-2.5"
        aria-label="Accepted payment methods"
      >
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Pay with:
        </span>
        <PaymentPill
          label="bKash"
          icon={<Wallet className="h-3.5 w-3.5 text-pink-400" />}
        />
        <PaymentPill
          label="Nagad"
          icon={<Wallet className="h-3.5 w-3.5 text-orange-400" />}
        />
        <PaymentPill
          label="Rocket"
          icon={<Rocket className="h-3.5 w-3.5 text-purple-400" />}
        />
        <PaymentPill
          label="Visa"
          icon={<CreditCard className="h-3.5 w-3.5 text-blue-400" />}
        />
        <PaymentPill
          label="Mastercard"
          icon={<CreditCard className="h-3.5 w-3.5 text-red-400" />}
        />
        <span className="ml-1 text-[11px] text-muted-foreground/60">
          · Secured by SSLCommerz · demo activates instantly
        </span>
      </div>

      {/* ═══════════════════════════════════════════════
          FEATURE COMPARISON TABLE
          ═══════════════════════════════════════════════ */}
      <section className="reveal mt-16" aria-label="Plan comparison">
        <div className="mb-8 text-center">
          <p className="kicker mb-2 text-fhb-gold/70">Side by side</p>
          <h2 className="display-hero text-[clamp(1.4rem,3vw,2.2rem)] text-foreground">
            Full feature comparison
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                {["Free", "Pro", "Legend"].map((name) => (
                  <th
                    key={name}
                    className={cn(
                      "px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider",
                      name === "Pro"
                        ? "text-fhb-gold"
                        : name === "Legend"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {COMPARISON_FEATURES.map((feat, i) => (
                <motion.tr
                  key={feat.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3 text-[12.5px] text-foreground/85">
                    {feat.label}
                  </td>
                  {(["free", "pro", "legend"] as const).map((tier) => (
                    <td key={tier} className="px-5 py-3 text-center">
                      {feat[tier] ? (
                        <span className="inline-flex items-center justify-center">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              tier === "pro"
                                ? "text-fhb-gold"
                                : tier === "legend"
                                ? "text-primary"
                                : "text-fhb-green"
                            )}
                            strokeWidth={2.5}
                            aria-label="Included"
                          />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center">
                          <X
                            className="h-3.5 w-3.5 text-white/20"
                            aria-label="Not included"
                          />
                        </span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════ */}
      <section className="reveal mt-16" aria-label="Fan testimonials">
        <div className="mb-8 text-center">
          <p className="kicker mb-2 text-fhb-gold/70">From the terraces</p>
          <h2 className="display-hero text-[clamp(1.4rem,3vw,2.2rem)] text-foreground">
            What fans are saying
          </h2>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Real subscribers. Real experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.handle} testimonial={t} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ SECTION
          ═══════════════════════════════════════════════ */}
      <section className="reveal mt-16" aria-label="Frequently asked questions">
        <div className="mb-8 text-center">
          <p className="kicker mb-2 text-fhb-gold/70">Good to know</p>
          <h2 className="display-hero text-[clamp(1.4rem,3vw,2.2rem)] text-foreground">
            Frequently asked questions
          </h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible defaultValue="item-0">
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <AccordionItem
                key={q}
                value={`item-${i}`}
                className="border-b border-white/10 last:border-b-0"
              >
                <AccordionTrigger
                  className={cn(
                    "px-1 py-4 text-left text-[13.5px] font-bold tracking-[0.01em] text-foreground",
                    "hover:no-underline hover:text-fhb-gold transition-colors",
                    "[&[data-state=open]]:text-fhb-gold"
                  )}
                >
                  {q}
                </AccordionTrigger>
                <AccordionContent className="px-1 pb-4 text-[12.5px] leading-relaxed text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BOTTOM CTA STRIP
          ═══════════════════════════════════════════════ */}
      <section className="reveal mt-16">
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="relative overflow-hidden rounded-2xl border border-fhb-gold/20 bg-gradient-to-br from-fhb-gold/[0.07] via-transparent to-primary/[0.05] p-10 text-center"
        >
          {/* Background mesh */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(251,191,36,0.06) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <GlowingCrown size={56} />
            <h2 className="mt-5 display-hero text-[clamp(1.4rem,3vw,2rem)] text-foreground">
              Ready to elevate your game?
            </h2>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Join 50,000+ fans watching Bangladesh football the way it deserves to be watched.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToPlans}
                className="flex h-11 items-center gap-2 rounded-[10px] bg-gradient-to-r from-fhb-gold to-[#f59e0b] px-7 text-[12px] font-extrabold uppercase tracking-wider text-[#06080f] shadow-lg shadow-fhb-gold/25"
              >
                <Crown className="h-4 w-4" />
                Get Premium
              </motion.button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground/60">
              7-day money-back guarantee · Cancel anytime
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
