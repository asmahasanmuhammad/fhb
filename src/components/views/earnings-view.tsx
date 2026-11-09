"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { formatMoney, toBn, timeAgo, bnCompact } from "@/lib/format";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/football/section-header";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Wallet, TrendingUp, Eye, Download, Banknote, Clock, CheckCircle2,
  AlertCircle, Coins, Heart, Gift, Radio, PlayCircle, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EarningsData = {
  earnings: Array<{ id: string; amount: number; source: string; note: string | null; createdAt: string; video: { id: string; title: string; thumbnailUrl: string | null } | null }>;
  videos: Array<{ id: string; title: string; views: number; likeCount: number; monetized: boolean; thumbnailUrl: string | null }>;
  payoutRequests: Array<{ id: string; amount: number; method: string; account: string; status: string; createdAt: string }>;
  stats: { total: number; balance: number; pending: number; paidOut: number; totalViews: number; monetizedCount: number; rpm: number };
  monthly: Array<{ month: string; amount: number }>;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "অপেক্ষমাণ", cls: "bg-fhb-gold/15 text-fhb-gold" },
  APPROVED: { label: "অনুমোদিত", cls: "bg-primary/15 text-primary" },
  PAID: { label: "পরিশোধিত", cls: "bg-primary/15 text-primary" },
  REJECTED: { label: "বাতিল", cls: "bg-fhb-red/15 text-fhb-red" },
};

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
      toast({ title: "উত্তোলনের অনুরোধ জমা হয়েছে", description: "২-৩ কর্মদিবসে প্রসেস হবে।" });
      setPayoutForm({ amount: 1000, method: "BKASH", account: "" });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
    onError: (e: Error) => toast({ title: "অনুরোধ ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  if (user && user.role !== "CREATOR" && user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fhb-gold/15">
          <AlertCircle className="h-7 w-7 text-fhb-gold" aria-hidden />
        </span>
        <p className="text-sm font-bold text-foreground">ক্রিয়েটর ড্যাশবোর্ড</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          এই পেজটি কনটেন্ট ক্রিয়েটরদের জন্য। ডেমো দেখতে <b>creator@fhb.com.bd / Creator@2025</b> দিয়ে লগইন করুন।
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { stats, monthly, earnings, videos, payoutRequests } = data;

  const sourceMeta = (source: string) => {
    switch (source) {
      case "TIPS":
        return { icon: <Heart className="h-4 w-4" aria-hidden />, cls: "bg-fhb-red/15 text-fhb-red" };
      case "BONUS":
        return { icon: <Gift className="h-4 w-4" aria-hidden />, cls: "bg-fhb-gold/15 text-fhb-gold" };
      default:
        return { icon: <TrendingUp className="h-4 w-4" aria-hidden />, cls: "bg-primary/15 text-primary" };
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="আয়ের ড্যাশবোর্ড"
        kicker="creator monetization"
        subtitle="ভিউ রেভিনিউ, টিপস ও বোনাসের সম্পূর্ণ হিসাব"
        icon={<Wallet className="h-5 w-5" aria-hidden />}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { label: "মোট আয়", value: formatMoney(stats.total), icon: <Coins className="h-4 w-4" aria-hidden />, chipCls: "bg-fhb-gold/15 text-fhb-gold", valueCls: "text-fhb-gold" },
          { label: "উত্তোলনযোগ্য ব্যালেন্স", value: formatMoney(stats.balance), icon: <Banknote className="h-4 w-4" aria-hidden />, chipCls: "bg-primary/15 text-primary", valueCls: "text-primary" },
          { label: "মোট ভিউ", value: bnCompact(stats.totalViews), icon: <Eye className="h-4 w-4" aria-hidden />, chipCls: "bg-muted text-muted-foreground", valueCls: "text-foreground" },
          { label: "RPM (প্রতি ১০০০ ভিউ)", value: `৳${toBn(stats.rpm.toFixed(1))}`, icon: <TrendingUp className="h-4 w-4" aria-hidden />, chipCls: "bg-fhb-red/15 text-fhb-red", valueCls: "text-fhb-red" },
        ].map((s) => (
          <div key={s.label} className="edge-lit card-lift rounded-2xl border border-border bg-card p-4.5 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.chipCls)}>{s.icon}</span>
              <span className="text-[10px] font-bold text-muted-foreground">{s.label}</span>
            </div>
            <p className={cn("tabular mt-3 font-display text-xl font-bold sm:text-2xl", s.valueCls)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Monthly chart + transactions */}
        <div className="edge-lit rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-5 flex items-center gap-2.5 font-display-bn text-base font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </span>
            মাসিক আয় (৳)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ background: "#0f1512", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString("bn-BD")} ৳`, "আয়"]}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent earnings */}
          <h3 className="mb-4 mt-8 flex items-center gap-2.5 border-t border-border pt-6 font-display-bn text-base font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Radio className="h-4 w-4" aria-hidden />
            </span>
            সাম্প্রতিক লেনদেন
          </h3>
          <div className="fhb-scroll max-h-64 space-y-2.5 overflow-y-auto pr-1">
            {earnings.map((e) => {
              const meta = sourceMeta(e.source);
              return (
                <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/25">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.cls)} aria-hidden>
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{e.note ?? "আয়"}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(e.createdAt)}</p>
                  </div>
                  <p className="tabular shrink-0 font-display text-sm font-bold text-primary">+{formatMoney(e.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Payout form */}
          <div className="edge-lit rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-5 flex items-center gap-2.5 font-display-bn text-base font-bold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Download className="h-4 w-4" aria-hidden />
              </span>
              উত্তোলনের অনুরোধ
            </h2>
            <div className="space-y-3.5">
              <div>
                <label htmlFor="amount" className="mb-1 block text-[11px] font-bold text-foreground">
                  পরিমাণ (৳) — সর্বনিম্ন ৫০০
                </label>
                <input
                  id="amount"
                  type="number"
                  min={500}
                  max={Math.floor(stats.balance)}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, amount: parseInt(e.target.value || "500", 10) }))}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">ব্যালেন্স: {formatMoney(stats.balance)}</p>
              </div>
              <div>
                <label htmlFor="method" className="mb-1 block text-[11px] font-bold text-foreground">
                  পদ্ধতি
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["BKASH", "NAGAD", "BANK"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayoutForm((f) => ({ ...f, method: m }))}
                      className={cn(
                        "rounded-xl border py-2.5 text-[11px] font-bold transition-all active:scale-95",
                        payoutForm.method === m
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m === "BKASH" ? "bKash" : m === "NAGAD" ? "Nagad" : "ব্যাংক"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="account" className="mb-1 block text-[11px] font-bold text-foreground">
                  অ্যাকাউন্ট নম্বর
                </label>
                <input
                  id="account"
                  value={payoutForm.account}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, account: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={() => payoutMutation.mutate()}
                disabled={payoutMutation.isPending || stats.balance < 500 || !payoutForm.account.trim()}
                className="sheen w-full rounded-xl bg-primary font-bold"
              >
                {payoutMutation.isPending ? "জমা হচ্ছে..." : "অনুরোধ জমা দিন"}
              </Button>
            </div>

            {/* Payout history */}
            {payoutRequests.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {payoutRequests.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      {p.status === "PENDING" ? (
                        <Clock className="h-3 w-3 text-fhb-gold" aria-hidden />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-primary" aria-hidden />
                      )}
                      {formatMoney(p.amount)} · {p.method === "BKASH" ? "bKash" : p.method}
                    </span>
                    <span className={cn("rounded-md px-2 py-0.5 font-bold", STATUS_META[p.status]?.cls ?? "")}>
                      {STATUS_META[p.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monetized videos */}
          <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
            <h2 className="flex items-center gap-2.5 border-b border-border bg-muted/40 px-4 py-3.5 font-display-bn text-[13px] font-bold text-foreground">
              <PlayCircle className="h-4 w-4 text-primary" aria-hidden /> আপনার শর্টস ({toBn(videos.length)})
            </h2>
            <div className="divide-y divide-border/60">
              {videos.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40">
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                    {v.thumbnailUrl && (
                      <Image src={v.thumbnailUrl} alt={v.title} fill sizes="64px" className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-foreground">{v.title}</p>
                    <p className="tabular text-[10px] text-muted-foreground">
                      {bnCompact(v.views)} ভিউ
                      {v.monetized && <span className="text-primary"> · মনিটাইজড</span>}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold",
                      v.monetized ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {v.monetized && <BadgeCheck className="h-2.5 w-2.5" aria-hidden />}
                    {v.monetized ? "চালু" : "বন্ধ"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
