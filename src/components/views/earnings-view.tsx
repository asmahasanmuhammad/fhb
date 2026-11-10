"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney, fmtNum, fmtCompact, fmtLocale, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { AdSlot } from "@/components/football/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet, TrendingUp, AlertCircle, Heart, Gift, PlayCircle, BadgeCheck,
  Megaphone, Crown, Info, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   EarningsView — creator monetization dashboard.
   Stat tiles, monthly revenue chart (recharts), shorts performance
   table, transaction ledger and the payout panel. Rail carries a
   monetization-tips widget plus the sidebar ad.
   ════════════════════════════════════════════════════════════════ */

type EarningsData = {
  earnings: Array<{ id: string; amount: number; source: string; note: string | null; createdAt: string; video: { id: string; title: string; thumbnailUrl: string | null } | null }>;
  videos: Array<{ id: string; title: string; views: number; likeCount: number; monetized: boolean; thumbnailUrl: string | null }>;
  payoutRequests: Array<{ id: string; amount: number; method: string; account: string; status: string; createdAt: string }>;
  stats: { total: number; balance: number; pending: number; paidOut: number; totalViews: number; monetizedCount: number; rpm: number };
  monthly: Array<{ month: string; amount: number }>;
};

/* ── Presentation helpers (module-level, pure) ────────────── */

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Compact ledger date: "12 Mar". */
function fmtDay(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Month-over-month delta copy for the "This month" tile. */
function monthTrend(current: number, previous: number): { text: string; cls: string } {
  if (previous <= 0) {
    return current > 0
      ? { text: "First earnings recorded", cls: "text-primary" }
      : { text: "No earnings recorded yet", cls: "text-muted-foreground" };
  }
  const diff = current - previous;
  return diff >= 0
    ? { text: `+${formatMoney(diff)} vs last month`, cls: "text-primary" }
    : { text: `-${formatMoney(Math.abs(diff))} vs last month`, cls: "text-muted-foreground" };
}

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-border bg-secondary text-muted-foreground" },
  APPROVED: { label: "Approved", cls: "border-primary/25 bg-primary/12 text-primary" },
  PAID: { label: "Paid", cls: "border-primary/25 bg-primary/12 text-primary" },
  PAUSED: { label: "Paused", cls: "border-fhb-red/25 bg-fhb-red/12 text-fhb-red" },
  REJECTED: { label: "Rejected", cls: "border-fhb-red/25 bg-fhb-red/12 text-fhb-red" },
};

const SOURCE_META: Record<string, { label: string; short: string; Icon: typeof TrendingUp; cls: string }> = {
  AD_REVENUE: { label: "Ad revenue", short: "Ad revenue", Icon: TrendingUp, cls: "border-primary/25 bg-primary/12 text-primary" },
  PREMIUM: { label: "Premium watch time", short: "Premium", Icon: Crown, cls: "border-fhb-gold/30 bg-fhb-gold/12 text-fhb-gold" },
  TIPS: { label: "Fan tips", short: "Tips", Icon: Heart, cls: "border-fhb-gold/30 bg-fhb-gold/12 text-fhb-gold" },
  BONUS: { label: "Bonus", short: "Bonus", Icon: Gift, cls: "border-primary/25 bg-primary/12 text-primary" },
};

const METHOD_LABEL: Record<string, string> = { BKASH: "bKash", NAGAD: "Nagad", BANK: "Bank" };

const inputCls =
  "h-10 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

/** Condensed uppercase card header with hairline rule. */
function CardHead({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
      <h3 className="label-cond shrink-0 text-[12px] tracking-[0.08em] text-muted-foreground">{label}</h3>
      {right != null && <div className="min-w-0 text-right">{right}</div>}
    </div>
  );
}

function Chip({ children, cls }: { children: React.ReactNode; cls?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[10px] font-bold",
        cls ?? "border-border bg-secondary text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const meta = PAYOUT_STATUS[status];
  return <Chip cls={meta?.cls}>{meta?.label ?? status}</Chip>;
}

/** Stat tile — tiny uppercase label, big tabular numeral, sub line. */
function StatTile({
  label, value, sub, subCls,
}: {
  label: string; value: string; sub?: React.ReactNode; subCls?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="kicker truncate text-muted-foreground">{label}</p>
      <p className="score-num mt-1.5 text-[26px] text-foreground sm:text-[28px]">{value}</p>
      {sub != null && <p className={cn("mt-1.5 truncate text-[11px]", subCls ?? "text-muted-foreground")}>{sub}</p>}
    </div>
  );
}

/** Small metric cell used in hairline strips under charts. */
function MetricCell({ label, value, valueCls }: { label: string; value: string; valueCls?: string }) {
  return (
    <div className="min-w-0">
      <p className="kicker truncate text-muted-foreground/80">{label}</p>
      <p className={cn("tabular mt-1.5 text-[15px] font-bold text-foreground", valueCls)}>{value}</p>
    </div>
  );
}

/** Dark, quiet recharts tooltip. */
function EarningsTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-[6px] border border-border bg-popover px-3 py-2 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)]">
      <p className="label-cond text-[11px] tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 text-[13px] font-bold text-foreground">{formatMoney(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EarningsView
   ═══════════════════════════════════════════════════════════════════ */
export function EarningsView() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  useReveal();
  const queryClient = useQueryClient();
  const [payoutForm, setPayoutForm] = useState({ amount: 1000, method: "BKASH", account: "" });

  const { data, isLoading } = useQuery<EarningsData>({
    queryKey: ["earnings"],
    queryFn: async () => {
      const res = await fetch("/api/earnings");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    retry: false,
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutForm),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Withdrawal request submitted", description: "It will be processed within 2–3 business days." });
      setPayoutForm({ amount: 1000, method: "BKASH", account: "" });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
    onError: (e: Error) => toast({ title: "Request failed", description: e.message, variant: "destructive" }),
  });

  /* ── Gate: must be signed in ── */
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-10 sm:px-6">
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-primary/12 text-primary">
            <LogIn className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="label-cond mt-4 text-[16px] font-bold tracking-[0.05em] text-foreground">
            Sign in to view your earnings
          </h2>
          <p className="mx-auto mt-1.5 max-w-[44ch] text-xs leading-relaxed text-muted-foreground">
            The creator studio tracks ad revenue, premium watch time, tips and payouts for your shorts — all in one dashboard.
          </p>
          <button
            onClick={() => navigate({ name: "auth" })}
            className="mt-5 inline-flex h-9 items-center rounded-[6px] bg-primary px-5 text-[11.5px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  /* ── Gate: creator or admin only ── */
  if (user.role !== "CREATOR" && user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-[8px] border border-fhb-gold/25 bg-fhb-gold/10 text-fhb-gold">
          <AlertCircle className="h-6 w-6" aria-hidden />
        </span>
        <p className="label-cond text-[18px] font-bold tracking-[0.05em] text-foreground">Creator dashboard</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          This area is reserved for content creators. To preview the demo, log in with{" "}
          <b className="text-foreground">creator@fhb.com.bd / Creator@2025</b>.
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <PageLayout width="wide">
        <Skeleton className="h-16 rounded-lg" />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[108px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="mt-8 h-80 rounded-lg" />
        <Skeleton className="mt-6 h-64 rounded-lg" />
        <Skeleton className="mt-6 h-72 rounded-lg" />
      </PageLayout>
    );
  }

  const { stats, monthly, earnings, videos, payoutRequests } = data;

  /* Derived figures — all from existing API data */
  const thisMonth = monthly[monthly.length - 1]?.amount ?? 0;
  const prevMonth = monthly.length >= 2 ? monthly[monthly.length - 2]?.amount ?? null : null;
  const monthlyTotal = monthly.reduce((s, m) => s + m.amount, 0);
  const trend = prevMonth != null ? monthTrend(thisMonth, prevMonth) : null;

  const revenueByVideo = new Map<string, number>();
  for (const e of earnings) {
    if (e.video) revenueByVideo.set(e.video.id, (revenueByVideo.get(e.video.id) ?? 0) + e.amount);
  }
  const rankedVideos = [...videos].sort(
    (a, b) => (revenueByVideo.get(b.id) ?? 0) - (revenueByVideo.get(a.id) ?? 0) || b.views - a.views
  );

  /* ── Right rail (xl+): monetization tips + sidebar ad ── */
  const rail = (
    <>
      <RailCard title="Monetization tips">
        <div className="divide-y divide-border/40">
          {[
            {
              Icon: Megaphone,
              title: "Ad revenue share",
              desc: "A share of the AdSense revenue from ads served on your monetized shorts.",
              cls: "bg-primary/12 text-primary",
            },
            {
              Icon: Crown,
              title: "Premium watch time",
              desc: "Watch time from Premium members is paid out of the membership pool.",
              cls: "bg-fhb-gold/12 text-fhb-gold",
            },
            {
              Icon: Heart,
              title: "Fan tips",
              desc: "Supporters can tip you directly while watching your shorts.",
              cls: "bg-fhb-gold/12 text-fhb-gold",
            },
          ].map((r) => (
            <div key={r.title} className="flex items-start gap-3 px-4 py-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]", r.cls)} aria-hidden>
                <r.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-foreground">{r.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 border-t border-border bg-elevated/40 px-4 py-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Withdrawals start at Tk 500 via bKash, Nagad or bank transfer and are settled within 2–3 business days.
          </p>
        </div>
      </RailCard>

      <AdSlot placement="SIDEBAR" />
    </>
  );

  return (
    <PageLayout rail={rail} width="wide">
      <PageHeader
        title="Creator Earnings"
        kicker="creator studio"
        icon={<Wallet className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Ad revenue, premium watch time, tips and payouts across your shorts."
      />

      {/* ── Stat tiles ── */}
      <div className="reveal grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Total balance"
          value={formatMoney(stats.balance)}
          sub="Available to withdraw"
        />
        <StatTile
          label="This month"
          value={formatMoney(thisMonth)}
          sub={trend ? trend.text : "Current calendar month"}
          subCls={trend?.cls}
        />
        <StatTile
          label="Total views"
          value={fmtCompact(stats.totalViews)}
          sub={`${fmtNum(stats.monetizedCount)} of ${fmtNum(videos.length)} shorts monetized`}
        />
        <StatTile
          label="Followers"
          value={fmtLocale(user.followerCount ?? 0)}
          sub="Across the community"
        />
      </div>

      {/* ── Earnings over time ── */}
      <section className="reveal mt-6 overflow-hidden rounded-lg border border-border bg-card" aria-label="Earnings by month">
        <CardHead
          label="Earnings by month"
          right={
            <span className="tabular text-[11px] font-semibold text-muted-foreground">
              6-month total <span className="font-bold text-foreground">{formatMoney(monthlyTotal)}</span>
            </span>
          }
        />
        <div className="p-4 sm:p-5">
          <div
            className="h-[216px] w-full sm:h-[236px]"
            role="img"
            aria-label="Monthly earnings for the last six months"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.055)" strokeDasharray="2 4" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 10.5 }}
                  tickMargin={8}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 10.5 }}
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : fmtNum(v))}
                />
                <Tooltip content={<EarningsTooltip />} cursor={{ stroke: "rgba(255,255,255,0.14)" }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2CD96B"
                  strokeWidth={2}
                  fill="#2CD96B"
                  fillOpacity={0.1}
                  dot={false}
                  activeDot={{ r: 4, fill: "#2CD96B", stroke: "#0C0D11", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary metrics — hairline strip */}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
            <MetricCell label="Lifetime earnings" value={formatMoney(stats.total)} />
            <MetricCell label="RPM" value={`Tk ${stats.rpm.toFixed(1)}`} />
            <MetricCell label="Paid out" value={formatMoney(stats.paidOut)} />
            <MetricCell
              label="Pending"
              value={formatMoney(stats.pending)}
              valueCls={stats.pending > 0 ? "text-fhb-gold" : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── In-feed ad between sections ── */}
      <div className="reveal mt-6">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ── Shorts performance ── */}
      <section className="reveal mt-6 overflow-hidden rounded-lg border border-border bg-card" aria-label="Shorts performance">
        <CardHead
          label="Shorts performance"
          right={
            <span className="text-[11px] font-semibold text-muted-foreground">
              <span className="tabular font-bold text-primary">{fmtNum(stats.monetizedCount)}</span> of {fmtNum(videos.length)} monetized
            </span>
          }
        />
        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground">
              <PlayCircle className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[14px] tracking-[0.05em] text-foreground">No shorts yet</p>
            <p className="max-w-[36ch] text-[11.5px] leading-relaxed text-muted-foreground">
              Upload and monetize shorts to start earning.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[72px_minmax(0,1fr)_64px_64px_72px_96px] gap-3 border-b border-border bg-elevated/50 px-5 py-2 md:grid">
              <span />
              <span className="kicker text-muted-foreground/70">Video</span>
              <span className="kicker text-right text-muted-foreground/70">Views</span>
              <span className="kicker text-right text-muted-foreground/70">Likes</span>
              <span className="kicker text-muted-foreground/70">Status</span>
              <span className="kicker text-right text-muted-foreground/70">Revenue</span>
            </div>
            <div className="divide-y divide-border/50">
              {rankedVideos.map((v) => {
                const revenue = revenueByVideo.get(v.id) ?? 0;
                return (
                  <div
                    key={v.id}
                    className="row-hover grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 md:grid-cols-[72px_minmax(0,1fr)_64px_64px_72px_96px] md:px-5"
                  >
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-[4px] border border-border bg-elevated">
                      {v.thumbnailUrl ? (
                        <Image src={v.thumbnailUrl} alt="" fill sizes="72px" className="object-cover" unoptimized />
                      ) : (
                        <PlayCircle className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/60" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{v.title}</p>
                      <p className="tabular mt-0.5 truncate text-[11px] text-muted-foreground">
                        <span className="md:hidden">{fmtCompact(v.views)} views · </span>
                        {fmtCompact(v.likeCount)} likes
                      </p>
                    </div>
                    <span className="tabular hidden self-center text-right text-[12px] font-semibold text-foreground md:block">
                      {fmtCompact(v.views)}
                    </span>
                    <span className="tabular hidden self-center text-right text-[12px] text-muted-foreground md:block">
                      {fmtCompact(v.likeCount)}
                    </span>
                    <span className="hidden md:block">
                      <Chip
                        cls={
                          v.monetized
                            ? "border-primary/25 bg-primary/12 text-primary"
                            : "border-border bg-secondary text-muted-foreground"
                        }
                      >
                        {v.monetized && <BadgeCheck className="h-3 w-3" aria-hidden />}
                        {v.monetized ? "On" : "Off"}
                      </Chip>
                    </span>
                    <p className="tabular justify-self-end text-right text-[13px] font-bold text-foreground">
                      {revenue > 0 ? formatMoney(revenue) : <span className="font-medium text-muted-foreground/60">—</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── Recent transactions ── */}
      {earnings.length > 0 && (
        <section className="reveal mt-6 overflow-hidden rounded-lg border border-border bg-card" aria-label="Recent transactions">
          <CardHead
            label="Recent transactions"
            right={<span className="text-[11px] font-semibold text-muted-foreground">Last {fmtNum(Math.min(earnings.length, 12))}</span>}
          />
          <div className="fhb-scroll max-h-[380px] divide-y divide-border/50 overflow-y-auto">
            {earnings.slice(0, 12).map((e) => {
              const meta = SOURCE_META[e.source] ?? SOURCE_META.AD_REVENUE;
              return (
                <div
                  key={e.id}
                  className="row-hover grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_96px_92px] md:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                      {e.video?.title ?? meta.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {meta.label} · {timeAgo(e.createdAt)}
                    </p>
                  </div>
                  <span className="hidden sm:block">
                    <Chip cls={meta.cls}>{meta.short}</Chip>
                  </span>
                  <p className="tabular justify-self-end text-right text-[13px] font-bold text-primary">
                    +{formatMoney(e.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Payout panel ── */}
      <section className="reveal mt-6 overflow-hidden rounded-lg border border-border bg-card" aria-label="Payouts">
        <CardHead
          label="Payouts"
          right={
            <span className="tabular text-[11px] font-bold text-primary">
              {formatMoney(stats.balance)} available
            </span>
          }
        />
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
          {/* Request form */}
          <div className="space-y-4">
            <div>
              <p className="label-cond mb-1.5 text-[11px] tracking-[0.08em] text-muted-foreground">Payout method</p>
              <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Payout method">
                {(["BKASH", "NAGAD", "BANK"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={payoutForm.method === m}
                    onClick={() => setPayoutForm((f) => ({ ...f, method: m }))}
                    className={cn(
                      "label-cond h-10 rounded-[6px] border text-[12px] font-semibold transition-colors",
                      payoutForm.method === m
                        ? "border-primary/50 bg-primary/12 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {METHOD_LABEL[m]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Currently paying out via <span className="font-semibold text-foreground">{METHOD_LABEL[payoutForm.method] ?? payoutForm.method}</span>
                {payoutForm.account.trim() ? <> to <span className="tabular font-semibold text-foreground">{payoutForm.account.trim()}</span></> : null}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="payout-amount" className="label-cond mb-1.5 block text-[11px] tracking-[0.08em] text-muted-foreground">
                  Amount (Tk)
                </label>
                <input
                  id="payout-amount"
                  type="number"
                  min={500}
                  max={Math.floor(stats.balance)}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, amount: parseInt(e.target.value || "500", 10) }))}
                  className={cn(inputCls, "tabular")}
                />
              </div>
              <div>
                <label htmlFor="payout-account" className="label-cond mb-1.5 block text-[11px] tracking-[0.08em] text-muted-foreground">
                  Account number
                </label>
                <input
                  id="payout-account"
                  value={payoutForm.account}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, account: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className={inputCls}
                />
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Minimum withdrawal Tk 500 · processed within 2–3 business days.
            </p>
            <button
              onClick={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending || stats.balance < 500 || !payoutForm.account.trim()}
              className="flex h-10 w-full items-center justify-center rounded-[7px] bg-primary text-[11.5px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
            >
              {payoutMutation.isPending ? "Submitting…" : "Request payout"}
            </button>
          </div>

          {/* History */}
          <div className="lg:border-l lg:border-border lg:pl-5">
            <p className="label-cond mb-2 text-[11px] tracking-[0.08em] text-muted-foreground">Payout history</p>
            {payoutRequests.length === 0 ? (
              <div className="rounded-lg border border-border bg-background px-4 py-8 text-center">
                <p className="text-[12.5px] font-semibold text-foreground">No withdrawals yet</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Your requests will appear here with their review status.
                </p>
              </div>
            ) : (
              <div className="fhb-scroll max-h-[320px] divide-y divide-border/50 overflow-y-auto rounded-lg border border-border">
                {payoutRequests.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="tabular text-[12px] font-semibold text-foreground">
                        {formatMoney(p.amount)}
                        <span className="font-medium text-muted-foreground"> · {METHOD_LABEL[p.method] ?? p.method}</span>
                      </p>
                      <p className="tabular mt-0.5 truncate text-[11px] text-muted-foreground">
                        {p.account} · {timeAgo(p.createdAt)}
                      </p>
                    </div>
                    <StatusChip status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
