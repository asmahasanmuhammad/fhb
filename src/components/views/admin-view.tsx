"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { fmtNum, timeAgo, fmtCompact, formatMoney, fmtLocale } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/football/section-header";
import {
  LayoutDashboard, Newspaper, Zap, Users, Megaphone, Wallet, Plus, Pencil, Trash2,
  TrendingUp, Eye, Video, MessageSquare, Crown, Ban, RotateCcw, CircleDot,
  ShieldCheck, Info, Star, Clapperboard, CheckCircle2, XCircle,
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
  ads: Array<{ id: string; name: string; placement: string; active: boolean; impressions: number; clicks: number; adCode: string | null; headline?: string | null; brandColor?: string | null; brandInitials?: string | null }>;
};

export function AdminView() {
  const { user } = useAppStore();
  useReveal();

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
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-fhb-red/15">
          <Ban className="h-7 w-7 text-fhb-red" aria-hidden />
        </span>
        <p className="text-sm font-bold text-foreground">Access Denied</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          This page is for admins only. To preview the demo, log in with <b>admin@fhb.com.bd / Admin@2025</b>.
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-6">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const s = data.stats;

  const kpis = [
    { label: "Total Users", value: fmtLocale(s.totalUsers), icon: <Users className="h-4 w-4" aria-hidden />, chip: "bg-primary/15 text-primary" },
    { label: "Premium Members", value: fmtLocale(s.premiumUsers), icon: <Crown className="h-4 w-4" aria-hidden />, chip: "bg-fhb-gold/15 text-fhb-gold" },
    { label: "News Articles", value: fmtLocale(s.totalArticles), icon: <Newspaper className="h-4 w-4" aria-hidden />, chip: "bg-muted text-muted-foreground" },
    { label: "Shorts Videos", value: fmtLocale(s.totalVideos), icon: <Video className="h-4 w-4" aria-hidden />, chip: "bg-muted text-muted-foreground" },
    { label: "Live Matches", value: fmtLocale(s.liveMatches), icon: <CircleDot className="h-4 w-4" aria-hidden />, chip: "bg-fhb-red/15 text-fhb-red" },
    { label: "Monetization Revenue", value: formatMoney(s.adRevenue + s.membershipRevenue), icon: <TrendingUp className="h-4 w-4" aria-hidden />, chip: "bg-primary/15 text-primary" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="The complete control center of Football Hub Bangladesh"
        icon={<LayoutDashboard className="h-5 w-5" aria-hidden />}
      >
        <span className="flex items-center gap-1.5 rounded-full border border-fhb-red/40 bg-fhb-red/10 px-3 py-1.5 text-[10px] font-bold text-fhb-red">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Admin
        </span>
      </PageHeader>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((c) => (
          <div key={c.label} className="edge-lit card-lift rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", c.chip)}>{c.icon}</span>
              <span className="text-[10px] font-bold leading-tight text-muted-foreground">{c.label}</span>
            </div>
            <p className="tabular mt-2 font-display text-lg font-bold text-foreground sm:text-xl">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "News Views", value: fmtCompact(s.newsViews), icon: <Eye className="h-3.5 w-3.5" aria-hidden /> },
          { label: "Video Views", value: fmtCompact(s.videoViews), icon: <Clapperboard className="h-3.5 w-3.5" aria-hidden /> },
          { label: "Comments", value: fmtLocale(s.totalComments), icon: <MessageSquare className="h-3.5 w-3.5" aria-hidden /> },
          { label: "Matches", value: fmtLocale(s.totalMatches), icon: <Zap className="h-3.5 w-3.5" aria-hidden /> },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 px-3.5 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              {c.icon}
            </span>
            <div className="min-w-0">
              <p className="tabular font-display text-base font-bold text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Management tabs */}
      <Tabs defaultValue="news" className="mt-9">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-2xl border border-border bg-muted/40 p-1.5 sm:grid-cols-5">
          <TabsTrigger value="news" className="gap-1.5 rounded-md text-[11px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Newspaper className="h-3.5 w-3.5" aria-hidden /> News
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-1.5 rounded-md text-[11px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Zap className="h-3.5 w-3.5" aria-hidden /> Matches
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 rounded-md text-[11px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" aria-hidden /> Users
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-1.5 rounded-md text-[11px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Megaphone className="h-3.5 w-3.5" aria-hidden /> Ads
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5 rounded-md text-[11px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Wallet className="h-3.5 w-3.5" aria-hidden /> Payouts
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
      toast({ title: editing ? "Article updated" : "Article published" });
      setDialogOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Article deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
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
  const inputCls = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Newspaper className="h-3.5 w-3.5 text-primary" aria-hidden />
          {fmtNum(articles.length)} articles total
        </p>
        <Button size="sm" onClick={openNew} className="gap-1.5 rounded-md bg-primary font-bold">
          <Plus className="h-4 w-4" aria-hidden /> New Article
        </Button>
      </div>

      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-lg" />)
      ) : (
        <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
          <div className="divide-y divide-border/50">
            {articles.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 p-3 transition-colors hover:bg-accent/30">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className="h-4 rounded-sm px-1.5 text-[9px]">{a.category}</Badge>
                    <span className={a.status === "PUBLISHED" ? "font-bold text-primary" : "font-bold text-fhb-gold"}>
                      {a.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" aria-hidden />
                      {fmtCompact(a.views)}
                    </span>
                    <span>{timeAgo(a.createdAt)}</span>
                    {a.featured && <Star className="h-3 w-3 fill-fhb-gold text-fhb-gold" aria-label="Featured" />}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(a)} aria-label="Edit" className="h-8 w-8 p-0">
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => del.mutate(a.id)}
                    className="h-8 w-8 p-0 text-fhb-red hover:text-fhb-red"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Article" : "Write New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-foreground">Headline *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
                aria-label="Headline"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-foreground">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className={cn(inputCls, "resize-none")}
                aria-label="Excerpt"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-foreground">Body (Markdown supported) *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={8}
                className={cn(inputCls, "resize-y")}
                aria-label="Article body"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputCls}
                  aria-label="Category"
                >
                  {["BPL", "NATIONAL", "TRANSFER", "INTERNATIONAL", "OPINION"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-foreground">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className={inputCls}
                  aria-label="Status"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-foreground">Cover Image URL</label>
              <input
                value={form.coverUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="https://..."
                className={inputCls}
                aria-label="Cover image URL"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Feature on homepage
              <Star className="h-3.5 w-3.5 text-fhb-gold" aria-hidden />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-md">
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !form.title.trim() || !form.content.trim()}
              className="rounded-md bg-primary font-bold"
            >
              {save.isPending ? "Saving..." : "Publish"}
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
          ? "Match is now live! The live simulation service will pick it up within 15 seconds."
          : "Match updated";
      toast({ title: msg });
      queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const matches = data?.matches ?? [];
  const sorted = [...matches].sort((a, b) => {
    const rank = (s: string) => (s === "LIVE" ? 0 : s === "SCHEDULED" ? 1 : 2);
    return rank(a.status) - rank(b.status) || +new Date(b.kickoff) - +new Date(a.kickoff);
  });

  return (
    <div>
      <p className="mb-3 flex items-start gap-2.5 rounded-xl border border-fhb-red/25 bg-fhb-red/5 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-fhb-red" aria-hidden />
        <span>
          <b className="text-foreground">Live test tip:</b> set any upcoming match's status to <b className="text-fhb-red">&ldquo;Live&rdquo;</b> — the WebSocket simulation service will automatically start updating minutes and scores.
        </span>
      </p>
      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-lg" />)
      ) : (
        <div className="fhb-scroll max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {sorted.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/25">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {m.homeTeam.name} <span className="text-muted-foreground">vs</span> {m.awayTeam.name}
                </p>
                <p className="tabular text-[10px] text-muted-foreground">
                  {m.competition.shortName} · {new Date(m.kickoff).toLocaleDateString("en-US")} ·{" "}
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
                      "rounded-md border px-2.5 py-1.5 text-[10px] font-bold transition-colors disabled:opacity-40",
                      m.status === st
                        ? st === "LIVE"
                          ? "border-fhb-red/50 bg-fhb-red/15 text-fhb-red"
                          : "border-primary/50 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st === "LIVE" ? "Live" : st === "SCHEDULED" ? "Upcoming" : "Finished"}
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
      toast({ title: "User updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const users = data?.users ?? [];

  return (
    <div>
      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-lg" />)
      ) : (
        <div className="fhb-scroll max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/25">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                  {u.name}
                  <span className="text-[10px] text-muted-foreground">@{u.username}</span>
                  {u.isPremium && <Crown className="h-3 w-3 text-fhb-gold" aria-label="Premium" />}
                  {u.isBanned && (
                    <Badge className="h-4 rounded-sm bg-fhb-red px-1.5 text-[9px] hover:bg-fhb-red">Ban</Badge>
                  )}
                </p>
                <p className="tabular text-[10px] text-muted-foreground">
                  {u.email} · {fmtLocale(u.followerCount)} followers · {fmtLocale(u._count.comments)} comments
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["USER", "CREATOR", "ADMIN"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => update.mutate({ id: u.id, role: r })}
                    disabled={u.role === r || update.isPending}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[10px] font-bold transition-colors disabled:opacity-40",
                      u.role === r
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r === "USER" ? "Fan" : r === "CREATOR" ? "Creator" : "Admin"}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => update.mutate({ id: u.id, isBanned: !u.isBanned })}
                  className={cn("h-8 w-8 p-0", u.isBanned ? "text-primary hover:text-primary" : "text-fhb-red hover:text-fhb-red")}
                  aria-label={u.isBanned ? "Unban" : "Ban"}
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
      toast({ title: "Ad settings updated" });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div>
      <p className="mb-3 flex items-start gap-2.5 rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>
          Paste your Google AdSense code (ca-pub-...) here and real ads will serve across the site in matching placements. Premium
          members never see ads — the core premium benefit.
        </span>
      </p>
      <div className="space-y-2">
        {ads.map((ad) => (
          <div key={ad.id} className="edge-lit rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                  style={{ backgroundColor: ad.brandColor || "#1E9E50" }}
                >
                  {(ad.brandInitials || ad.name.slice(0, 2)).trim()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{ad.name}</p>
                  <p className="tabular text-[10px] text-muted-foreground">
                    {ad.placement} · {fmtCompact(ad.impressions)} impressions · {fmtCompact(ad.clicks)} clicks · CTR{" "}
                    {fmtNum(ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0")}%
                  </p>
                  {ad.headline && (
                    <p className="mt-1 truncate text-[11px] italic text-muted-foreground/80">“{ad.headline}”</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing({ id: ad.id, code: ad.adCode ?? "" })} className="rounded-md">
                  Edit Code
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
                  aria-label={`${ad.name} ${ad.active ? "Disable" : "Enable"}`}
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
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <textarea
                  value={editing.code}
                  onChange={(e) => setEditing((ed) => (ed ? { ...ed, code: e.target.value } : ed))}
                  rows={4}
                  placeholder='<ins class="adsbygoogle" ...></ins>'
                  className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-[11px] outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  aria-label="AdSense code"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => update.mutate({ id: ad.id, adCode: editing.code })} className="rounded-md bg-primary font-bold">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="rounded-md">
                    Cancel
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
      toast({ title: "Payout status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const payouts = data?.payouts ?? [];
  const STATUS_UI: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Pending", cls: "bg-fhb-gold/15 text-fhb-gold" },
    APPROVED: { label: "Approved", cls: "bg-primary/15 text-primary" },
    PAID: { label: "Paid", cls: "bg-primary/15 text-primary" },
    REJECTED: { label: "Rejected", cls: "bg-fhb-red/15 text-fhb-red" },
  };

  return (
    <div>
      {isLoading ? (
        [1, 2].map((i) => <Skeleton key={i} className="mb-2 h-16 rounded-lg" />)
      ) : payouts.length === 0 ? (
        <p className="edge-lit rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No withdrawal requests.
        </p>
      ) : (
        <div className="space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {p.creator.name} <span className="text-[10px] text-muted-foreground">@{p.creator.username}</span>
                </p>
                <p className="tabular text-[10px] text-muted-foreground">
                  {formatMoney(p.amount)} · {p.method === "BKASH" ? "bKash" : p.method === "NAGAD" ? "Nagad" : "Bank"} · {p.account} · {timeAgo(p.createdAt)}
                </p>
              </div>
              <span className={cn("rounded-sm px-2.5 py-1 text-[10px] font-bold", STATUS_UI[p.status]?.cls)}>
                {STATUS_UI[p.status]?.label ?? p.status}
              </span>
              {p.status === "PENDING" && (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => update.mutate({ id: p.id, status: "APPROVED" })}
                    className="gap-1 rounded-md text-[11px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => update.mutate({ id: p.id, status: "REJECTED" })}
                    className="gap-1 rounded-md text-[11px]"
                  >
                    <XCircle className="h-3.5 w-3.5" aria-hidden /> Reject
                  </Button>
                </div>
              )}
              {p.status === "APPROVED" && (
                <Button
                  size="sm"
                  onClick={() => update.mutate({ id: p.id, status: "PAID" })}
                  className="gap-1 rounded-md bg-primary text-[11px] font-bold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark Paid
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
