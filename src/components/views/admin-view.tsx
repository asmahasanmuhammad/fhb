"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { toBn, timeAgo, bnCompact, formatMoney, bnNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  LayoutDashboard, Newspaper, Zap, Users, Megaphone, Wallet, Plus, Pencil, Trash2,
  TrendingUp, Eye, Video, MessageSquare, Crown, Ban, RotateCcw, CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminStats = {
  stats: {
    totalUsers: number; creators: number; premiumUsers: number; totalArticles: number;
    totalVideos: number; totalPosts: number; totalComments: number; totalMatches: number;
    liveMatches: number; newsViews: number; videoViews: number; adRevenue: number; membershipRevenue: number;
  };
  recentUsers: Array<{ id: string; name: string; username: string; role: string; isPremium: boolean; createdAt: string }>;
  recentArticles: Array<{ id: string; title: string; category: string; views: number; status: string; createdAt: string }>;
  ads: Array<{ id: string; name: string; placement: string; active: boolean; impressions: number; clicks: number; adCode: string | null }>;
};

export function AdminView() {
  const { user } = useAppStore();

  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    retry: false,
    refetchInterval: 30_000,
  });

  if (user && user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <Ban className="h-10 w-10 text-fhb-red" aria-hidden />
        <p className="text-sm font-bold">অনুমতি নেই</p>
        <p className="text-xs text-muted-foreground">
          এই পেজটি শুধু অ্যাডমিনদের জন্য। ডেমো দেখতে <b>admin@fhb.com.bd / Admin@2025</b> দিয়ে লগইন করুন।
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <LayoutDashboard className="h-6 w-6 text-primary" aria-hidden />
        অ্যাডমিন ড্যাশবোর্ড
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">Football Hub Bangladesh-এর সম্পূর্ণ নিয়ন্ত্রণ কেন্দ্র।</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "মোট ইউজার", value: bnNumber(s.totalUsers), icon: <Users className="h-4 w-4" aria-hidden /> },
          { label: "প্রিমিয়াম সদস্য", value: bnNumber(s.premiumUsers), icon: <Crown className="h-4 w-4" aria-hidden /> },
          { label: "নিউজ আর্টিকেল", value: bnNumber(s.totalArticles), icon: <Newspaper className="h-4 w-4" aria-hidden /> },
          { label: "শর্টস ভিডিও", value: bnNumber(s.totalVideos), icon: <Video className="h-4 w-4" aria-hidden /> },
          { label: "লাইভ ম্যাচ", value: bnNumber(s.liveMatches), icon: <CircleDot className="h-4 w-4" aria-hidden /> },
          { label: "মনিটাইজেশন আয়", value: formatMoney(s.adRevenue + s.membershipRevenue), icon: <TrendingUp className="h-4 w-4" aria-hidden /> },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {c.icon}
              <span className="text-[10px] font-semibold">{c.label}</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold sm:text-xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "নিউজ ভিউজ", value: bnCompact(s.newsViews) },
          { label: "ভিডিও ভিউজ", value: bnCompact(s.videoViews) },
          { label: "কমেন্ট", value: bnNumber(s.totalComments) },
          { label: "ম্যাচ", value: bnNumber(s.totalMatches) },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-card/60 p-3 text-center">
            <p className="font-display text-base font-bold text-primary">{c.value}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Management tabs */}
      <Tabs defaultValue="news" className="mt-8">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger value="news" className="gap-1.5 text-[11px] font-bold">
            <Newspaper className="h-3.5 w-3.5" aria-hidden /> নিউজ ম্যানেজমেন্ট
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-1.5 text-[11px] font-bold">
            <Zap className="h-3.5 w-3.5" aria-hidden /> ম্যাচ কন্ট্রোল
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-[11px] font-bold">
            <Users className="h-3.5 w-3.5" aria-hidden /> ইউজার
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-1.5 text-[11px] font-bold">
            <Megaphone className="h-3.5 w-3.5" aria-hidden /> বিজ্ঞাপন
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5 text-[11px] font-bold">
            <Wallet className="h-3.5 w-3.5" aria-hidden /> পেআউট
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-4"><NewsManager /></TabsContent>
        <TabsContent value="matches" className="mt-4"><MatchManager /></TabsContent>
        <TabsContent value="users" className="mt-4"><UserManager /></TabsContent>
        <TabsContent value="ads" className="mt-4"><AdManager ads={data.ads} /></TabsContent>
        <TabsContent value="payouts" className="mt-4"><PayoutManager /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ============ NEWS MANAGEMENT ============ */
type Article = {
  id: string; title: string; excerpt: string; content: string; category: string;
  coverUrl: string | null; status: string; featured: boolean; views: number; createdAt: string;
  author: { name: string };
};

function NewsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "BPL", coverUrl: "", featured: false, status: "PUBLISHED" });

  const { data, isLoading } = useQuery<{ articles: Article[] }>({
    queryKey: ["admin", "news"],
    queryFn: async () => {
      const res = await fetch("/api/admin/news");
      return res.json().then((j) => j.data);
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const isEdit = !!editing;
      const res = await fetch("/api/admin/news", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editing!.id, ...form } : form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: editing ? "নিউজ আপডেট হয়েছে ✅" : "নিউজ প্রকাশিত হয়েছে 🎉" });
      setDialogOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: Error) => toast({ title: "সেভ ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "নিউজ মুছে ফেলা হয়েছে 🗑️" });
      queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: Error) => toast({ title: "মুছে ফেলা ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", category: "BPL", coverUrl: "", featured: false, status: "PUBLISHED" });
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ title: a.title, excerpt: a.excerpt, content: a.content, category: a.category, coverUrl: a.coverUrl ?? "", featured: a.featured, status: a.status });
    setDialogOpen(true);
  };

  const articles = data?.articles ?? [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">মোট {toBn(articles.length)} টি আর্টিকেল</p>
        <Button size="sm" onClick={openNew} className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" aria-hidden /> নতুন নিউজ
        </Button>
      </div>

      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-xl" />)
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">{a.category}</Badge>
                  <span className={a.status === "PUBLISHED" ? "text-primary" : "text-fhb-gold"}>{a.status === "PUBLISHED" ? "প্রকাশিত" : "ড্রাফট"}</span>
                  <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" aria-hidden />{bnCompact(a.views)}</span>
                  <span>{timeAgo(a.createdAt)}</span>
                  {a.featured && <span className="text-fhb-gold">★ ফিচার্ড</span>}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => openEdit(a)} aria-label="এডিট করুন">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => del.mutate(a.id)} className="text-fhb-red" aria-label="মুছে ফেলুন">
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "নিউজ এডিট করুন" : "নতুন নিউজ লিখুন"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold">শিরোনাম *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="শিরোনাম"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold">সারসংক্ষেপ *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="সারসংক্ষেপ"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold">বিস্তারিত (Markdown সমর্থিত) *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={8}
                className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="বিস্তারিত লেখা"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold">ক্যাটাগরি</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  aria-label="ক্যাটাগরি"
                >
                  {["BPL", "NATIONAL", "TRANSFER", "INTERNATIONAL", "OPINION"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">স্ট্যাটাস</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  aria-label="স্ট্যাটাস"
                >
                  <option value="PUBLISHED">প্রকাশিত</option>
                  <option value="DRAFT">ড্রাফট</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold">কভার ইমেজ URL</label>
              <input
                value={form.coverUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="কভার ইমেজ URL"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              হোমপেজে ফিচার করুন ★
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title.trim() || !form.content.trim()} className="font-bold">
              {save.isPending ? "সেভ হচ্ছে..." : "প্রকাশ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============ MATCH MANAGER ============ */
type AdminMatch = {
  id: string; status: string; homeScore: number | null; awayScore: number | null; kickoff: string; round: string | null; venue: string | null;
  homeTeam: { id: string; name: string; initials: string; color: string };
  awayTeam: { id: string; name: string; initials: string; color: string };
  competition: { id: string; name: string; shortName: string };
};

function MatchManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ matches: AdminMatch[] }>({
    queryKey: ["admin", "matches"],
    queryFn: async () => {
      const res = await fetch("/api/admin/matches");
      return res.json().then((j) => j.data);
    },
  });

  const update = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/admin/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (_d, payload) => {
      const msg =
        payload.status === "LIVE"
          ? "🔴 ম্যাচ এখন লাইভ! লাইভ-সিমুলেশন সার্ভিস এটি ১৫ সেকেন্ডের মধ্যে নিয়ে নেবে।"
          : "ম্যাচ আপডেট হয়েছে ✅";
      toast({ title: msg });
      queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (e: Error) => toast({ title: "আপডেট ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const matches = data?.matches ?? [];
  const sorted = [...matches].sort((a, b) => {
    const rank = (s: string) => (s === "LIVE" ? 0 : s === "SCHEDULED" ? 1 : 2);
    return rank(a.status) - rank(b.status) || +new Date(b.kickoff) - +new Date(a.kickoff);
  });

  return (
    <div>
      <p className="mb-3 rounded-xl border border-fhb-red/25 bg-fhb-red/5 p-3 text-[11px] text-muted-foreground">
        💡 <b>লাইভ টেস্ট টিপ:</b> কোনো আসন্ন ম্যাচের স্ট্যাটাস <b>&ldquo;লাইভ&rdquo;</b> করুন — WebSocket সিমুলেশন সার্ভিস স্বয়ংক্রিয়ভাবে মিনিট ও স্কোর আপডেট শুরু করবে।
      </p>
      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-xl" />)
      ) : (
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1 fhb-scroll">
          {sorted.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {m.homeTeam.name} <span className="text-muted-foreground">বনাম</span> {m.awayTeam.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {m.competition.shortName} • {new Date(m.kickoff).toLocaleDateString("bn-BD")} •{" "}
                  {m.homeScore ?? "-"}:{m.awayScore ?? "-"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {(["SCHEDULED", "LIVE", "FINISHED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => update.mutate({ id: m.id, status: st })}
                    disabled={m.status === st || update.isPending}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-colors disabled:opacity-40",
                      m.status === st
                        ? st === "LIVE"
                          ? "border-fhb-red/60 bg-fhb-red/15 text-fhb-red"
                          : "border-primary/60 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st === "LIVE" ? "🔴 লাইভ" : st === "SCHEDULED" ? "আসছে" : "শেষ"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ USER MANAGER ============ */
type AdminUser = {
  id: string; name: string; username: string; email: string; role: string; isPremium: boolean;
  isBanned: boolean; followerCount: number; createdAt: string;
  _count: { posts: number; videos: number; comments: number };
};

function UserManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ users: AdminUser[] }>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      return res.json().then((j) => j.data);
    },
  });

  const update = useMutation({
    mutationFn: async (payload: { id: string; role?: string; isBanned?: boolean }) => {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "ইউজার আপডেট হয়েছে ✅" });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast({ title: "আপডেট ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const users = data?.users ?? [];

  return (
    <div>
      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-xl" />)
      ) : (
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1 fhb-scroll">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 truncate text-sm font-semibold">
                  {u.name}
                  <span className="text-[10px] text-muted-foreground">@{u.username}</span>
                  {u.isPremium && <Crown className="h-3 w-3 text-fhb-gold" aria-label="প্রিমিয়াম" />}
                  {u.isBanned && <Badge className="h-4 bg-fhb-red px-1.5 text-[9px]">ব্যান</Badge>}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {u.email} • {bnNumber(u.followerCount)} ফলোয়ার • {bnNumber(u._count.comments)} কমেন্ট
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {(["USER", "CREATOR", "ADMIN"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => update.mutate({ id: u.id, role: r })}
                    disabled={u.role === r || update.isPending}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors disabled:opacity-40",
                      u.role === r ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r === "USER" ? "ফ্যান" : r === "CREATOR" ? "ক্রিয়েটর" : "অ্যাডমিন"}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => update.mutate({ id: u.id, isBanned: !u.isBanned })}
                  className={cn("h-8 w-8 p-0", u.isBanned ? "text-primary" : "text-fhb-red")}
                  aria-label={u.isBanned ? "আনব্যান করুন" : "ব্যান করুন"}
                >
                  {u.isBanned ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Ban className="h-3.5 w-3.5" aria-hidden />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ AD MANAGER ============ */
function AdManager({ ads }: { ads: AdminStats["ads"] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ id: string; code: string } | null>(null);

  const update = useMutation({
    mutationFn: async (payload: { id: string; active?: boolean; adCode?: string }) => {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "বিজ্ঞাপন সেটিংস আপডেট হয়েছে ✅" });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (e: Error) => toast({ title: "আপডেট ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  return (
    <div>
      <p className="mb-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-[11px] text-muted-foreground">
        💡 Google AdSense কোড (ca-pub-...) এখানে বসিয়ে দিলেই সাইটজুড়ে সংশ্লিষ্ট প্লেসমেন্টে আসল বিজ্ঞাপন চলবে। প্রিমিয়াম সদস্যরা
        বিজ্ঞাপন দেখতে পাবেন না — এটাই প্রিমিয়ামের মূল সুবিধা।
      </p>
      <div className="space-y-2">
        {ads.map((ad) => (
          <div key={ad.id} className="rounded-xl border bg-card p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{ad.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {ad.placement} • {bnCompact(ad.impressions)} ইমপ্রেশন • {bnCompact(ad.clicks)} ক্লিক • CTR{" "}
                  {toBn(ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0")}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing({ id: ad.id, code: ad.adCode ?? "" })}>
                  কোড এডিট
                </Button>
                <button
                  onClick={() => update.mutate({ id: ad.id, active: !ad.active })}
                  disabled={update.isPending}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    ad.active ? "bg-primary" : "bg-muted"
                  )}
                  role="switch"
                  aria-checked={ad.active}
                  aria-label={`${ad.name} ${ad.active ? "বন্ধ" : "চালু"} করুন`}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                      ad.active ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
            {editing?.id === ad.id && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <textarea
                  value={editing.code}
                  onChange={(e) => setEditing((ed) => (ed ? { ...ed, code: e.target.value } : ed))}
                  rows={4}
                  placeholder='<ins class="adsbygoogle" ...></ins>'
                  className="w-full resize-y rounded-lg border bg-background px-3 py-2 font-mono text-[11px] outline-none focus:border-primary"
                  aria-label="AdSense কোড"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => update.mutate({ id: ad.id, adCode: editing.code })} className="font-bold">
                    সেভ করুন
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                    বাতিল
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ PAYOUT MANAGER ============ */
type Payout = { id: string; amount: number; method: string; account: string; status: string; createdAt: string; creator: { name: string; username: string } };

function PayoutManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ payouts: Payout[] }>({
    queryKey: ["admin", "payouts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payouts");
      return res.json().then((j) => j.data);
    },
  });

  const update = useMutation({
    mutationFn: async (payload: { id: string; status: string }) => {
      const res = await fetch("/api/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "পেআউট স্ট্যাটাস আপডেট হয়েছে ✅" });
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
    onError: (e: Error) => toast({ title: "আপডেট ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const payouts = data?.payouts ?? [];
  const STATUS_UI: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "অপেক্ষমাণ", cls: "bg-fhb-gold/15 text-fhb-gold" },
    APPROVED: { label: "অনুমোদিত", cls: "bg-primary/15 text-primary" },
    PAID: { label: "পরিশোধিত", cls: "bg-primary/15 text-primary" },
    REJECTED: { label: "বাতিল", cls: "bg-fhb-red/15 text-fhb-red" },
  };

  return (
    <div>
      {isLoading ? (
        [1, 2].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-xl" />)
      ) : payouts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">কোনো উত্তোলনের অনুরোধ নেই।</p>
      ) : (
        <div className="space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {p.creator.name} <span className="text-[10px] text-muted-foreground">@{p.creator.username}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatMoney(p.amount)} • {p.method === "BKASH" ? "bKash" : p.method === "NAGAD" ? "Nagad" : "ব্যাংক"} • {p.account} • {timeAgo(p.createdAt)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_UI[p.status]?.cls}`}>
                {STATUS_UI[p.status]?.label ?? p.status}
              </span>
              {p.status === "PENDING" && (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => update.mutate({ id: p.id, status: "APPROVED" })} className="text-[11px]">
                    অনুমোদন
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => update.mutate({ id: p.id, status: "REJECTED" })} className="text-[11px]">
                    বাতিল
                  </Button>
                </div>
              )}
              {p.status === "APPROVED" && (
                <Button size="sm" onClick={() => update.mutate({ id: p.id, status: "PAID" })} className="text-[11px] font-bold">
                  পরিশোধ সম্পন্ন
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
