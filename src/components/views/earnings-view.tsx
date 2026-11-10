"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney, fmtNum, fmtCompact, timeAgo } from "@/lib/format";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/football/section-header";
import {
  Wallet, TrendingUp, Banknote, AlertCircle, Coins, Heart, Gift, PlayCircle,
  BadgeCheck, Megaphone, Crown, Info, CalendarDays, Clapperboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EarningsData = {
  earnings: Array<{ id: string; amount: number; source: string; note: string | null; createdAt: string; video: { id: string; title: string; thumbnailUrl: string | null } | null }>;
  videos: Array<{ id: string; title: string; views: number; likeCount: number; monetized: boolean; thumbnailUrl: string | null }>;
  payoutRequests: Array<{ id: string; amount: number; method: string; account: string; status: string; createdAt: string }>;
  stats: { total: number; balance: number; pending: number; paidOut: number; totalViews: number; monetizedCount: number; rpm: number };
  monthly: Array<{ month: string; amount: number }>;
};

/* ── Presentation helpers ─────────────────────────────────── */

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-border bg-muted text-muted-foreground" },
  APPROVED: { label: "Approved", cls: "border-primary/25 bg-primary/12 text-primary" },
  PAID: { label: "Paid", cls: "border-primary/25 bg-primary/12 text-primary" },
  REJECTED: { label: "Rejected", cls: "border-fhb-red/25 bg-fhb-red/12 text-fhb-red" },
};

const SOURCE_META: Record<string, { label: string; Icon: LucideIcon; cls: string }> = {
  AD_REVENUE: { label: "Ad revenue", Icon: TrendingUp, cls: "bg-primary/12 text-primary" },
  PREMIUM: { label: "Premium watch time", Icon: Crown, cls: "bg-fhb-gold/12 text-fhb-gold" },
  TIPS: { label: "Fan tips", Icon: Heart, cls: "bg-fhb-red/12 text-fhb-red" },
  BONUS: { label: "Bonus", Icon: Gift, cls: "bg-fhb-gold/12 text-fhb-gold" },
};

const METHOD_LABEL: Record<string, string> = { BKASH: "bKash", NAGAD: "Nagad", BANK: "Bank" };

const inputCls =
  "h-10 w-full rounded-lg border border-white/20 bg-[#06080f] px-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50";

/** Consistent 11px uppercase card header with hairline rule. */
function CardHead({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/15 bg-[#06080f] px-4 py-3 sm:px-5">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-white">{label}</h3>
      {right != null && <div className="min-w-0 text-right">{right}</div>}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const meta = PAYOUT_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
        meta?.cls ?? "border-white/15 bg-white/5 text-slate-300"
      )}
    >
      {meta?.label ?? status}
    </span>
  );
}

/** Edge-lit stat tile — small icon, 11px label, big tabular value. */
function StatTile({
  label, value, sub, icon, iconCls,
}: {
  label: string; value: string; sub?: React.ReactNode; icon: React.ReactNode; iconCls: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-[#0b101d] p-4 shadow-lg">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", iconCls)}>
          <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        </span>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300 truncate">{label}</p>
      </div>
      <p className="tabular mt-3 font-display text-[1.4rem] font-black leading-none tracking-[-0.01em] text-white drop-shadow-sm">
        {value}
      </p>
      {sub != null && <p className="mt-2 truncate text-[11.5px] font-medium text-slate-300">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EarningsView — Stripe-class creator monetization dashboard
   ═══════════════════════════════════════════════════════════════════ */
export function EarningsView() {
  const { user } = useAppStore();
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

  if (user && user.role !== "CREATOR" && user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-fhb-gold/25 bg-fhb-gold/10">
          <AlertCircle className="h-6 w-6 text-fhb-gold" aria-hidden />
        </span>
        <p className="font-display text-base font-bold text-foreground">Creator dashboard</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          This area is reserved for content creators. To preview the demo, log in with{" "}
          <b className="text-foreground">creator@fhb.com.bd / Creator@2025</b>.
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-16 rounded-xl" />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const { stats, monthly, earnings, videos, payoutRequests } = data;

  /* Derived figures — all from existing API data */
  const thisMonth = monthly[monthly.length - 1]?.amount ?? 0;
  const monthlyTotal = monthly.reduce((s, m) => s + m.amount, 0);
  const maxMonthly = Math.max(...monthly.map((m) => m.amount), 1);

  const revenueByVideo = new Map<string, number>();
  for (const e of earnings) {
    if (e.video) revenueByVideo.set(e.video.id, (revenueByVideo.get(e.video.id) ?? 0) + e.amount);
  }
  const rankedVideos = [...videos].sort(
    (a, b) => (revenueByVideo.get(b.id) ?? 0) - (revenueByVideo.get(a.id) ?? 0) || b.views - a.views
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Creator earnings"
        kicker="monetization"
        subtitle="Ad revenue, premium watch time, tips and payouts across your shorts"
        icon={<Wallet className="h-5 w-5" aria-hidden />}
      />

      {/* ── Stat tiles ── */}
      <div className="reveal grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Total earnings"
          value={formatMoney(stats.total)}
          sub="Lifetime, all sources"
          icon={<Coins aria-hidden />}
          iconCls="bg-fhb-gold/12 text-fhb-gold"
        />
        <StatTile
          label="This month"
          value={formatMoney(thisMonth)}
          sub="Current calendar month"
          icon={<CalendarDays aria-hidden />}
          iconCls="bg-primary/12 text-primary"
        />
        <StatTile
          label="Available balance"
          value={formatMoney(stats.balance)}
          sub="Ready to withdraw"
          icon={<Banknote aria-hidden />}
          iconCls="bg-primary/12 text-primary"
        />
        <StatTile
          label="Monetized videos"
          value={`${fmtNum(stats.monetizedCount)} of ${fmtNum(videos.length)}`}
          sub="Shorts in the program"
          icon={<Clapperboard aria-hidden />}
          iconCls="bg-muted text-muted-foreground"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* ═══ Main column ═══ */}
        <div className="space-y-6 lg:col-span-8">
          {/* ── Earnings performance ── */}
          <section className="reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg">
            <CardHead
              label="Earnings by month"
              right={
                <span className="tabular text-[11px] font-semibold text-slate-300">
                  6-month total <span className="font-black text-white">{formatMoney(monthlyTotal)}</span>
                </span>
              }
            />
            <div className="p-4 sm:p-5">
              <div className="flex h-44 gap-2 sm:gap-3" role="img" aria-label="Monthly earnings for the last six months">
                {monthly.map((m) => {
                  const h = (m.amount / maxMonthly) * 100;
                  return (
                    <div key={m.month} className="group relative flex h-full min-w-0 flex-1 flex-col">
                      <div className="relative flex flex-1 items-end border-b border-white/10">
                        <span className="tabular pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-[#06080f] px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 shadow">
                          {formatMoney(m.amount)}
                        </span>
                        <div
                          className="w-full rounded-t-[3px] bg-red-500/80 transition-colors group-hover:bg-red-400"
                          style={{ height: `${Math.max(h, m.amount > 0 ? 3 : 1)}%` }}
                        />
                      </div>
                      <span className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.08em] text-slate-300">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Secondary metrics — hairline strip */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Total views</p>
                  <p className="tabular mt-1.5 font-display text-[15px] font-black text-white">
                    {fmtCompact(stats.totalViews)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Avg. RPM</p>
                  <p className="tabular mt-1.5 font-display text-[15px] font-black text-white">
                    Tk {stats.rpm.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Paid out</p>
                  <p className="tabular mt-1.5 font-display text-[15px] font-black text-white">
                    {formatMoney(stats.paidOut)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Pending</p>
                  <p className="tabular mt-1.5 font-display text-[15px] font-black text-emerald-400">
                    {formatMoney(stats.pending)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Revenue by video ── */}
          <section className="reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg">
            <CardHead
              label="Revenue by video"
              right={<span className="text-[11px] font-bold text-slate-300">{fmtNum(videos.length)} shorts</span>}
            />
            {videos.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <PlayCircle className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-foreground">No shorts yet</p>
                <p className="text-xs text-muted-foreground">Upload and monetize shorts to start earning.</p>
              </div>
            ) : (
              <>
                <div className="hidden gap-3 border-b border-border/70 bg-white/[0.02] px-5 py-2 sm:grid sm:grid-cols-[72px_minmax(0,1fr)_72px_96px_88px]">
                  <span />
                  <span className="eyebrow text-muted-foreground/70">Video</span>
                  <span className="eyebrow text-right text-muted-foreground/70">Views</span>
                  <span className="eyebrow text-muted-foreground/70">Status</span>
                  <span className="eyebrow text-right text-muted-foreground/70">Revenue</span>
                </div>
                <div className="divide-y divide-border/60">
                  {rankedVideos.map((v) => {
                    const revenue = revenueByVideo.get(v.id) ?? 0;
                    return (
                      <div
                        key={v.id}
                        className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03] sm:grid-cols-[72px_minmax(0,1fr)_72px_96px_88px] sm:px-5"
                      >
                        <div className="relative h-10 w-[72px] shrink-0 overflow-hidden rounded-md border border-border bg-elevated">
                          {v.thumbnailUrl ? (
                            <Image src={v.thumbnailUrl} alt={v.title} fill sizes="72px" className="object-cover" unoptimized />
                          ) : (
                            <PlayCircle className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/60" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{v.title}</p>
                          <p className="tabular mt-1 text-[11px] text-muted-foreground">
                            <span className="sm:hidden">{fmtCompact(v.views)} views · </span>
                            {fmtCompact(v.likeCount)} likes
                          </p>
                        </div>
                        <span className="tabular hidden self-center text-right text-[12px] font-semibold text-foreground sm:block">
                          {fmtCompact(v.views)}
                        </span>
                        <span
                          className={cn(
                            "hidden shrink-0 items-center gap-1 self-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold sm:inline-flex",
                            v.monetized
                              ? "border-primary/25 bg-primary/12 text-primary"
                              : "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {v.monetized && <BadgeCheck className="h-3 w-3" aria-hidden />}
                          {v.monetized ? "On" : "Off"}
                        </span>
                        <p className="tabular justify-self-end text-right font-display text-[13px] font-bold text-foreground">
                          {revenue > 0 ? (
                            formatMoney(revenue)
                          ) : (
                            <span className="font-medium text-muted-foreground/60">—</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ═══ Side rail ═══ */}
        <div className="space-y-6 lg:col-span-4">
          {/* ── Payouts ── */}
          <section className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card">
            <CardHead
              label="Withdraw funds"
              right={<span className="tabular text-[11px] font-bold text-primary">{formatMoney(stats.balance)} available</span>}
            />
            <div className="space-y-4 p-4 sm:p-5">
              <div>
                <p className="eyebrow mb-1.5 text-muted-foreground">Payout method</p>
                <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Payout method">
                  {(["BKASH", "NAGAD", "BANK"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={payoutForm.method === m}
                      onClick={() => setPayoutForm((f) => ({ ...f, method: m }))}
                      className={cn(
                        "h-10 rounded-lg border text-xs font-bold transition-colors",
                        payoutForm.method === m
                          ? "border-primary/50 bg-primary/12 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {METHOD_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="payout-amount" className="eyebrow mb-1.5 block text-muted-foreground">
                  Amount (Tk)
                </label>
                <input
                  id="payout-amount"
                  type="number"
                  min={500}
                  max={Math.floor(stats.balance)}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, amount: parseInt(e.target.value || "500", 10) }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="payout-account" className="eyebrow mb-1.5 block text-muted-foreground">
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
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Minimum withdrawal Tk 500 · processed within 2–3 business days.
              </p>
              <Button
                onClick={() => payoutMutation.mutate()}
                disabled={payoutMutation.isPending || stats.balance < 500 || !payoutForm.account.trim()}
                className="sheen w-full rounded-lg bg-primary font-bold"
              >
                {payoutMutation.isPending ? "Submitting…" : "Request withdrawal"}
              </Button>
            </div>

            {payoutRequests.length > 0 && (
              <div className="border-t border-border/70">
                <p className="eyebrow px-4 pb-1 pt-3.5 text-muted-foreground sm:px-5">Payout history</p>
                <div className="mt-1 divide-y divide-border/60">
                  {payoutRequests.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
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
              </div>
            )}
          </section>

          {/* ── Recent activity ── */}
          <section className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card">
            <CardHead
              label="Recent activity"
              right={<span className="text-[11px] font-semibold text-muted-foreground">Last {fmtNum(earnings.length)}</span>}
            />
            {earnings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <TrendingUp className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground">Earnings will appear here as your shorts rack up views.</p>
              </div>
            ) : (
              <div className="fhb-scroll max-h-[400px] divide-y divide-border/60 overflow-y-auto">
                {earnings.map((e) => {
                  const meta = SOURCE_META[e.source] ?? SOURCE_META.AD_REVENUE;
                  const Icon = meta.Icon;
                  return (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03] sm:px-5">
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.cls)} aria-hidden>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-semibold leading-tight text-foreground">
                          {e.note ?? meta.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {meta.label} · {timeAgo(e.createdAt)}
                        </p>
                      </div>
                      <p className="tabular shrink-0 text-[13px] font-bold text-primary">+{formatMoney(e.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── How you earn ── */}
          <section className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card">
            <CardHead label="How you earn" />
            <div className="divide-y divide-border/60">
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
                  desc: "Watch time from Premium members is paid out of the membership revenue pool.",
                  cls: "bg-fhb-gold/12 text-fhb-gold",
                },
                {
                  Icon: Heart,
                  title: "Fan tips",
                  desc: "Supporters can tip you directly while watching your shorts.",
                  cls: "bg-fhb-red/12 text-fhb-red",
                },
              ].map((r) => (
                <div key={r.title} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", r.cls)} aria-hidden>
                    <r.Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{r.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 border-t border-border/70 bg-white/[0.02] px-4 py-3 sm:px-5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Withdrawals start at Tk 500 via bKash, Nagad or bank transfer and are settled within 2–3 business days.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
