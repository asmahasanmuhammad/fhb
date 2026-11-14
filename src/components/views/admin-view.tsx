"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { fmtNum, timeAgo, fmtCompact, formatMoney, fmtLocale, formatKickoff } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/football/section-header";
import { TeamCrest } from "@/components/football/team-badge";
import { AdBrandLogo } from "@/components/football/ad-slot";
import {
  LayoutDashboard, Newspaper, Zap, Users, Megaphone, Wallet, Plus, Pencil, Trash2,
  Eye, Clapperboard, MessageSquare, PenLine, Crown, Ban, RotateCcw,
  ShieldCheck, Info, Star, CheckCircle2, XCircle, Inbox, Search, Shirt, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayerManager } from "@/components/admin/player-manager";

/* ── Types (API contracts kept identical) ─────────────────── */

type AdminAd = {
  id: string;
  name: string;
  placement: string;
  active: boolean;
  impressions: number;
  clicks: number;
  adCode: string | null;
  headline: string | null;
  bodyText: string | null;
  ctaLabel: string | null;
  linkUrl: string | null;
  brandColor: string | null;
  brandInitials: string | null;
  logoUrl: string | null;
  logoTheme: string | null;
  imageHint: string | null;
};

type AdminStats = {
  stats: {
    totalUsers: number; creators: number; premiumUsers: number; totalArticles: number;
    totalVideos: number; totalPosts: number; totalComments: number; totalMatches: number;
    liveMatches: number; newsViews: number; videoViews: number; adRevenue: number; membershipRevenue: number;
  };
  recentUsers: Array<{ id: string; name: string; username: string; role: string; isPremium: boolean; createdAt: string }>;
  recentArticles: Array<{ id: string; title: string; category: string; views: number; status: string; createdAt: string }>;
  ads: AdminAd[];
};

type AdminMatch = {
  id: string; status: string; homeScore: number | null; awayScore: number | null; minute: number | null;
  kickoff: string; round: string | null; venue: string | null;
  homeTeam: { id: string; name: string; initials: string; color: string };
  awayTeam: { id: string; name: string; initials: string; color: string };
  competition: { id: string; name: string; shortName: string };
};

type Article = {
  id: string; title: string; excerpt: string; content: string; category: string;
  coverUrl: string | null; status: string; featured: boolean; views: number; createdAt: string;
  author: { name: string };
};

type AdminUser = {
  id: string; name: string; username: string; email: string; role: string; isPremium: boolean;
  isBanned: boolean; followerCount: number; createdAt: string;
  _count: { posts: number; videos: number; comments: number };
};

type Payout = { id: string; amount: number; method: string; account: string; status: string; createdAt: string; creator: { name: string; username: string } };

/* ── Section navigation ───────────────────────────────────── */

const SECTIONS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "matches", label: "Matches", Icon: Zap },
  { id: "players", label: "Players", Icon: Shirt },
  { id: "news", label: "News", Icon: Newspaper },
  { id: "users", label: "Users", Icon: Users },
  { id: "ads", label: "Ads", Icon: Megaphone },
  { id: "payouts", label: "Payouts", Icon: Wallet },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ── Presentation constants & helpers (module-level, pure) ── */

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-fhb-gold/30 bg-fhb-gold/12 text-fhb-gold" },
  APPROVED: { label: "Approved", cls: "border-primary/25 bg-primary/12 text-primary" },
  PAID: { label: "Paid", cls: "border-primary/25 bg-primary/12 text-primary" },
  PAUSED: { label: "Paused", cls: "border-fhb-red/25 bg-fhb-red/12 text-fhb-red" },
  REJECTED: { label: "Rejected", cls: "border-fhb-red/25 bg-fhb-red/12 text-fhb-red" },
};

const METHOD_LABEL: Record<string, string> = { BKASH: "bKash", NAGAD: "Nagad", BANK: "Bank" };
const ROLE_LABEL: Record<string, string> = { USER: "Fan", CREATOR: "Creator", ADMIN: "Admin" };
const ROLE_CLS: Record<string, string> = {
  USER: "border-border bg-muted text-muted-foreground",
  CREATOR: "border-primary/25 bg-primary/12 text-primary",
  ADMIN: "border-fhb-gold/30 bg-fhb-gold/12 text-fhb-gold",
};

const MATCH_STATUS = [
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "LIVE", label: "Live" },
  { value: "FINISHED", label: "Finished" },
] as const;

const MATCH_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "FINISHED", label: "Finished" },
] as const;

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

const thCls = "h-9 px-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/80";
const tdCls = "px-3 py-2.5 align-middle";

function placementLabel(p: string): string {
  const map: Record<string, string> = {
    HEADER_BANNER: "Header banner",
    SIDEBAR: "Sidebar",
    IN_FEED: "In-feed",
    MOBILE_BANNER: "Mobile banner",
  };
  return map[p] ?? p.replaceAll("_", " ").toLowerCase();
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** ISO date → datetime-local input value ("YYYY-MM-DDTHH:mm", local time). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Condensed uppercase card header with hairline rule. */
function CardHead({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
      <h3 className="label-cond shrink-0 text-[12px] text-muted-foreground">{label}</h3>
      {right != null && <div className="min-w-0 text-right">{right}</div>}
    </div>
  );
}

function Chip({ children, cls }: { children: React.ReactNode; cls?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[10px] font-bold",
        cls ?? "border-border bg-muted text-muted-foreground"
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

/** Stat tile — the dashboard standard: kicker, big tabular numeral, delta line. */
function StatTile({
  label, value, sub, subCls,
}: {
  label: string; value: string; sub?: React.ReactNode; subCls?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="kicker truncate text-muted-foreground">{label}</p>
      <p className="score-num mt-1.5 text-[26px] text-foreground sm:text-[28px]">{value}</p>
      {sub != null && <p className={cn("mt-1.5 truncate text-[11px]", subCls ?? "text-muted-foreground")}>{sub}</p>}
    </div>
  );
}

/** Section heading inside the admin content column. */
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="label-cond text-[1.35rem] font-bold leading-none text-foreground">{title}</h2>
      {sub && <p className="mt-1.5 text-[12.5px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Compact segmented control (status / role pickers). */
function SegmentGroup({
  options, active, onSelect, disabled, ariaLabel,
}: {
  options: Array<{ value: string; label: string; activeCls?: string }>;
  active: string;
  onSelect: (v: string) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const isActive = o.value === active;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            disabled={isActive || disabled}
            className={cn(
              "rounded-[4px] px-2 py-1 text-[11px] font-bold transition-colors disabled:cursor-default",
              isActive
                ? o.activeCls ?? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground disabled:opacity-40"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Quiet info banner used above manager tables. */
function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-md border border-border bg-card px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p className="text-[11.5px] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AdminView — professional console: sidebar nav + dense tables
   ═══════════════════════════════════════════════════════════════════ */
export function AdminView() {
  const user = useAppStore((s) => s.user);
  useReveal();
  const [section, setSection] = useState<SectionId>("overview");
  const [loggingIn, setLoggingIn] = useState(false);

  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: Boolean(user && user.role === "ADMIN"),
    retry: false,
    refetchInterval: 30_000,
  });

  const handleAdminSignIn = async () => {
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@fhb.com.bd", password: "Admin@2025" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        useAppStore.getState().setUser(json.data);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingIn(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <p className="label-cond text-[20px] font-bold text-foreground">Admin Console Access</p>
          <p className="text-xs leading-relaxed text-muted-foreground mt-1.5">
            This management control center requires administrator privileges. You can quickly sign in using the official demo admin account.
          </p>
        </div>
        <div className="w-full rounded-lg border border-border bg-card p-3.5 text-left text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground">Demo Email:</span>
            <span className="font-mono font-semibold text-foreground">admin@fhb.com.bd</span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-border/50">
            <span className="text-muted-foreground">Demo Password:</span>
            <span className="font-mono font-semibold text-foreground">Admin@2025</span>
          </div>
        </div>
        <Button
          onClick={handleAdminSignIn}
          disabled={loggingIn}
          className="w-full gap-2 bg-primary font-bold shadow-md h-9 text-xs cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          {loggingIn ? "Signing In…" : "One-Click Admin Sign In"}
        </Button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="mt-6 h-11 w-full rounded-md" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-md" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64 rounded-md" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Admin Console"
        kicker="control centre"
        subtitle="Content, users, advertising and creator payouts in one place"
        icon={<LayoutDashboard className="h-5 w-5" aria-hidden />}
      >
        <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Admin access
        </span>
      </PageHeader>

      <div className="reveal">
        {/* Section tabs — MatchDetailView underline pattern */}
        <div
          className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-border"
          role="tablist"
          aria-label="Admin sections"
        >
          {SECTIONS.map(({ id, label, Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(id)}
                className={cn(
                  "relative flex h-10 shrink-0 items-center gap-2 px-4 text-[12.5px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-primary" aria-hidden />}
              </button>
            );
          })}
        </div>

        {/* Content column */}
        <div className="min-w-0">
          {section === "overview" && <Overview data={data} />}
          {section === "matches" && <MatchManager />}
          {section === "players" && <PlayerManager />}
          {section === "news" && <NewsManager />}
          {section === "users" && <UserManager />}
          {section === "ads" && <AdManager ads={data.ads} />}
          {section === "payouts" && <PayoutManager />}
        </div>
      </div>
    </div>
  );
}

/* ============ OVERVIEW ============ */
function Overview({ data }: { data: AdminStats }) {
  const s = data.stats;
  const adImpressions = data.ads.reduce((sum, a) => sum + a.impressions, 0);
  const adClicks = data.ads.reduce((sum, a) => sum + a.clicks, 0);
  const adCtr = adImpressions ? ((adClicks / adImpressions) * 100).toFixed(1) : "0";

  const tiles = [
    {
      label: "Total users",
      value: fmtLocale(s.totalUsers),
      sub: `${fmtLocale(s.creators)} creators · ${fmtLocale(s.premiumUsers)} premium`,
    },
    {
      label: "Matches",
      value: fmtLocale(s.totalMatches),
      sub: s.liveMatches > 0 ? `${fmtLocale(s.liveMatches)} live now` : "None live right now",
      subCls: s.liveMatches > 0 ? "font-semibold text-fhb-red" : undefined,
    },
    { label: "Articles", value: fmtLocale(s.totalArticles), sub: `${fmtCompact(s.newsViews)} reads` },
    { label: "Shorts videos", value: fmtLocale(s.totalVideos), sub: `${fmtCompact(s.videoViews)} views` },
    {
      label: "Ad delivery",
      value: fmtCompact(adImpressions),
      sub: `${fmtCompact(adClicks)} clicks · ${adCtr}% CTR`,
      subCls: "text-primary",
    },
    { label: "Revenue", value: formatMoney(s.adRevenue + s.membershipRevenue), sub: "Ads + memberships" },
  ];

  const engagement = [
    { label: "Premium members", value: fmtLocale(s.premiumUsers), Icon: Crown, cls: "text-fhb-gold" },
    { label: "News reads", value: fmtCompact(s.newsViews), Icon: Eye, cls: "text-primary/80" },
    { label: "Video views", value: fmtCompact(s.videoViews), Icon: Clapperboard, cls: "text-primary/80" },
    { label: "Comments", value: fmtLocale(s.totalComments), Icon: MessageSquare, cls: "text-primary/80" },
    { label: "Community posts", value: fmtLocale(s.totalPosts), Icon: PenLine, cls: "text-primary/80" },
  ];

  return (
    <div>
      <SectionTitle title="Platform overview" sub="Live metrics — this panel refreshes automatically every 30 seconds." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <StatTile key={t.label} label={t.label} value={t.value} sub={t.sub} subCls={t.subCls} />
        ))}
      </div>

      {/* Engagement strip — hairline grid */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border/60 sm:grid-cols-3 xl:grid-cols-5">
        {engagement.map((c) => (
          <div key={c.label} className="bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <c.Icon className={cn("h-3.5 w-3.5 shrink-0", c.cls)} aria-hidden />
              <p className="kicker truncate text-muted-foreground">{c.label}</p>
            </div>
            <p className="score-num mt-2 text-[19px] text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="New sign-ups">
          <CardHead label="New sign-ups" right={<span className="text-[11px] font-semibold text-muted-foreground">Most recent 6</span>} />
          <div className="divide-y divide-border/50">
            {data.recentUsers.map((u) => (
              <div key={u.id} className="row-hover flex items-center gap-3 px-4 py-2.5 sm:px-5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted font-display text-[11px] font-bold text-muted-foreground"
                  aria-hidden
                >
                  {initials(u.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold leading-tight text-foreground">
                    <span className="truncate">{u.name}</span>
                    {u.isPremium && <Crown className="h-3 w-3 shrink-0 text-fhb-gold" aria-label="Premium member" />}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">@{u.username}</p>
                </div>
                <Chip cls={ROLE_CLS[u.role]}>{ROLE_LABEL[u.role] ?? u.role}</Chip>
                <span className="tabular shrink-0 text-[11px] text-muted-foreground">{timeAgo(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="Latest articles">
          <CardHead label="Latest articles" right={<span className="text-[11px] font-semibold text-muted-foreground">Most recent 6</span>} />
          <div className="divide-y divide-border/50">
            {data.recentArticles.map((a) => (
              <div key={a.id} className="row-hover flex items-center gap-3 px-4 py-2.5 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{a.title}</p>
                  <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="shrink-0 rounded-[3px] bg-muted px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]">
                      {a.category}
                    </span>
                    <span className={a.status === "PUBLISHED" ? "font-semibold text-primary" : undefined}>
                      {a.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="truncate">{timeAgo(a.createdAt)}</span>
                  </p>
                </div>
                <span className="tabular flex shrink-0 items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Eye className="h-3 w-3" aria-hidden />
                  {fmtCompact(a.views)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============ MATCH MANAGER ============ */
function MatchManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LIVE" | "SCHEDULED" | "FINISHED">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMatch | null>(null);
  const [mForm, setMForm] = useState({
    kickoff: "", status: "SCHEDULED", homeScore: "", awayScore: "", minute: "", venue: "", round: "",
  });

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
      setDialogOpen(false);
      setEditing(null);
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
  const visible = statusFilter === "ALL" ? sorted : sorted.filter((m) => m.status === statusFilter);

  const openEdit = (m: AdminMatch) => {
    setEditing(m);
    setMForm({
      kickoff: toLocalInput(m.kickoff),
      status: m.status,
      homeScore: m.homeScore != null ? String(m.homeScore) : "",
      awayScore: m.awayScore != null ? String(m.awayScore) : "",
      minute: m.minute != null ? String(m.minute) : "",
      venue: m.venue ?? "",
      round: m.round ?? "",
    });
    setDialogOpen(true);
  };

  const submitEdit = () => {
    if (!editing || !mForm.kickoff) return;
    const payload: Record<string, unknown> = {
      id: editing.id,
      kickoff: new Date(mForm.kickoff).toISOString(),
      status: mForm.status,
      venue: mForm.venue,
      round: mForm.round,
      minute: mForm.minute === "" ? null : Number(mForm.minute),
    };
    if (mForm.homeScore !== "") payload.homeScore = Number(mForm.homeScore);
    if (mForm.awayScore !== "") payload.awayScore = Number(mForm.awayScore);
    update.mutate(payload);
  };

  return (
    <div>
      <SectionTitle title="Match control" sub="Set match status — the live engine picks up changes within seconds." />

      <InfoBanner>
        <span className="font-bold text-foreground">Live test tip:</span> set any upcoming match to{" "}
        <span className="font-bold text-fhb-red">Live</span> — the WebSocket simulation service will automatically start
        updating minutes and scores.
      </InfoBanner>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <CardHead
          label="Fixtures and results"
          right={<span className="text-[11px] font-semibold text-muted-foreground">{fmtNum(sorted.length)} matches</span>}
        />
        {/* Status filter rail */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-border/70 px-4 py-2.5 sm:px-5" role="group" aria-label="Filter matches by status">
          {MATCH_FILTERS.map((f) => {
            const count = f.value === "ALL" ? sorted.length : sorted.filter((m) => m.status === f.value).length;
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                aria-pressed={isActive}
                className={cn(
                  "label-cond flex shrink-0 items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "tabular rounded-full px-1.5 py-px text-[10px] font-bold",
                    isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Zap className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[14px] text-foreground">No matches in this view</p>
            <p className="text-[11.5px] text-muted-foreground">Switch the filter to see other fixtures.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {visible.map((m) => {
              const ko = formatKickoff(m.kickoff);
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <TeamCrest team={m.homeTeam} size="xs" />
                      <span className="min-w-0 flex-1 truncate text-right text-[13px] font-semibold text-foreground">
                        {m.homeTeam.name}
                      </span>
                      <span
                        className={cn(
                          "tabular shrink-0 px-1.5 font-display text-[13px] font-bold",
                          m.status === "LIVE" ? "text-fhb-red" : "text-foreground"
                        )}
                      >
                        {m.status === "SCHEDULED" ? (
                          <span className="text-[11px] font-semibold text-muted-foreground">{ko.time}</span>
                        ) : (
                          `${m.homeScore ?? 0}–${m.awayScore ?? 0}`
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                        {m.awayTeam.name}
                      </span>
                      <TeamCrest team={m.awayTeam} size="xs" />
                    </div>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                      <span className="truncate">{m.competition.shortName ?? m.competition.name}</span>
                      {m.round && <span className="shrink-0">· {m.round}</span>}
                      <span className="shrink-0">· {ko.date}</span>
                      {m.venue && <span className="hidden shrink-0 sm:inline">· {m.venue}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      aria-label={`Edit ${m.homeTeam.name} vs ${m.awayTeam.name}`}
                      className="tap-target flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <SegmentGroup
                      ariaLabel={`Status for ${m.homeTeam.name} vs ${m.awayTeam.name}`}
                      active={m.status}
                      disabled={update.isPending}
                      onSelect={(st) => update.mutate({ id: m.id, status: st })}
                      options={MATCH_STATUS.map((s) => ({
                        value: s.value,
                        label: s.label,
                        ...(s.value === "LIVE" ? { activeCls: "bg-fhb-red/15 text-fhb-red" } : {}),
                      }))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit match dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-md">
          <DialogHeader>
            <DialogTitle className="label-cond text-lg font-bold">Edit match</DialogTitle>
            <DialogDescription className="text-[12px]">
              {editing
                ? `${editing.homeTeam.name} vs ${editing.awayTeam.name} — ${editing.competition.name}`
                : "Update kickoff, status and score details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="match-kickoff" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Kickoff
                </label>
                <input
                  id="match-kickoff"
                  type="datetime-local"
                  value={mForm.kickoff}
                  onChange={(e) => setMForm((f) => ({ ...f, kickoff: e.target.value }))}
                  className={cn(inputCls, "[color-scheme:dark] tabular")}
                />
              </div>
              <div>
                <label htmlFor="match-status" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Status
                </label>
                <Select value={mForm.status} onValueChange={(v) => setMForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger id="match-status" className="h-10 w-full rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATCH_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="match-homescore" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Home score
                </label>
                <input
                  id="match-homescore"
                  type="number"
                  min={0}
                  max={30}
                  value={mForm.homeScore}
                  onChange={(e) => setMForm((f) => ({ ...f, homeScore: e.target.value }))}
                  className={cn(inputCls, "tabular")}
                />
              </div>
              <div>
                <label htmlFor="match-awayscore" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Away score
                </label>
                <input
                  id="match-awayscore"
                  type="number"
                  min={0}
                  max={30}
                  value={mForm.awayScore}
                  onChange={(e) => setMForm((f) => ({ ...f, awayScore: e.target.value }))}
                  className={cn(inputCls, "tabular")}
                />
              </div>
              <div>
                <label htmlFor="match-minute" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Minute
                </label>
                <input
                  id="match-minute"
                  type="number"
                  min={0}
                  max={130}
                  value={mForm.minute}
                  onChange={(e) => setMForm((f) => ({ ...f, minute: e.target.value }))}
                  className={cn(inputCls, "tabular")}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="match-venue" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Venue
                </label>
                <input
                  id="match-venue"
                  value={mForm.venue}
                  onChange={(e) => setMForm((f) => ({ ...f, venue: e.target.value }))}
                  placeholder="e.g. Bangabandhu National Stadium"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="match-round" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Round
                </label>
                <input
                  id="match-round"
                  value={mForm.round}
                  onChange={(e) => setMForm((f) => ({ ...f, round: e.target.value }))}
                  placeholder="e.g. Matchday 7"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-md">
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={update.isPending || !mForm.kickoff} className="rounded-md bg-primary font-bold">
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============ NEWS MANAGEMENT ============ */
function NewsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [confirmDel, setConfirmDel] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "BFL", coverUrl: "", featured: false, status: "PUBLISHED" });

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
    setForm({ title: "", excerpt: "", content: "", category: "BFL", coverUrl: "", featured: false, status: "PUBLISHED" });
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ title: a.title, excerpt: a.excerpt, content: a.content, category: a.category, coverUrl: a.coverUrl ?? "", featured: a.featured, status: a.status });
    setDialogOpen(true);
  };

  const articles = data?.articles ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? articles.filter((a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
    : articles;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle title="Newsroom" sub="Write, edit and curate the editorial feed." />
        <Button size="sm" onClick={openNew} className="gap-1.5 rounded-md bg-primary font-bold">
          <Plus className="h-4 w-4" aria-hidden /> New article
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <CardHead
          label="Articles"
          right={<span className="text-[11px] font-semibold text-muted-foreground">{fmtNum(articles.length)} total</span>}
        />
        {/* Search rail */}
        <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-2.5 sm:px-5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by headline or category"
            aria-label="Search articles"
            className="h-8 w-full min-w-0 rounded-[4px] border border-transparent bg-transparent text-[12.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-background focus:px-2.5"
          />
          {q && (
            <span className="tabular shrink-0 text-[11px] font-semibold text-muted-foreground">
              {fmtNum(filtered.length)} / {fmtNum(articles.length)}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Search className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[14px] text-foreground">No articles found</p>
            <p className="text-[11.5px] text-muted-foreground">Try a different headline or category.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className={cn(thCls, "px-4 sm:px-5")}>Article</TableHead>
                <TableHead className={cn(thCls, "hidden md:table-cell")}>Category</TableHead>
                <TableHead className={thCls}>Status</TableHead>
                <TableHead className={cn(thCls, "hidden text-right sm:table-cell")}>Views</TableHead>
                <TableHead className={cn(thCls, "hidden lg:table-cell")}>Updated</TableHead>
                <TableHead className={cn(thCls, "px-4 text-right sm:px-5")}>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="border-border/50 hover:bg-white/[0.03]">
                  <TableCell className={cn(tdCls, "max-w-[200px] px-4 sm:max-w-[340px] sm:px-5")}>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold leading-tight text-foreground">{a.title}</span>
                        {a.featured && <Star className="h-3 w-3 shrink-0 fill-fhb-gold text-fhb-gold" aria-label="Featured" />}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground md:hidden">
                        {a.category} · {a.status === "PUBLISHED" ? "Published" : "Draft"} · {fmtCompact(a.views)} views · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className={cn(tdCls, "hidden md:table-cell")}>
                    <Chip cls="border-border bg-muted uppercase text-muted-foreground">{a.category}</Chip>
                  </TableCell>
                  <TableCell className={tdCls}>
                    <Chip
                      cls={
                        a.status === "PUBLISHED"
                          ? "border-primary/25 bg-primary/12 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {a.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Chip>
                  </TableCell>
                  <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] font-semibold text-foreground sm:table-cell")}>
                    {fmtCompact(a.views)}
                  </TableCell>
                  <TableCell className={cn(tdCls, "tabular hidden text-[11px] text-muted-foreground lg:table-cell")}>
                    {timeAgo(a.createdAt)}
                  </TableCell>
                  <TableCell className={cn(tdCls, "px-4 sm:px-5")}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        aria-label={`Edit ${a.title}`}
                        className="tap-target flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDel(a)}
                        aria-label={`Delete ${a.title}`}
                        className="tap-target flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-fhb-red/10 hover:text-fhb-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDel != null} onOpenChange={(o) => { if (!o) setConfirmDel(null); }}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="label-cond text-lg font-bold">Delete article</AlertDialogTitle>
            <AlertDialogDescription className="text-[12.5px] leading-relaxed">
              This permanently removes “{confirmDel?.title}” from the newsroom. The action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDel) del.mutate(confirmDel.id);
                setConfirmDel(null);
              }}
              className="rounded-md border-none bg-fhb-red font-bold text-white hover:bg-fhb-red/90"
            >
              Delete article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-md">
          <DialogHeader>
            <DialogTitle className="label-cond text-lg font-bold">{editing ? "Edit article" : "New article"}</DialogTitle>
            <DialogDescription className="text-xs">
              {editing ? "Update the story and save — changes go live immediately." : "Publish a new story to the FHBD news feed."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="article-title" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Headline *
              </label>
              <input
                id="article-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="article-excerpt" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Excerpt *
              </label>
              <textarea
                id="article-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className={cn(inputCls, "resize-none")}
              />
            </div>
            <div>
              <label htmlFor="article-body" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Body — Markdown supported *
              </label>
              <textarea
                id="article-body"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={8}
                className={cn(inputCls, "resize-y")}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="article-category" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Category
                </label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger id="article-category" className="h-10 w-full rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["BFL", "NATIONAL", "TRANSFER", "INTERNATIONAL", "OPINION"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="article-status" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Status
                </label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger id="article-status" className="h-10 w-full rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label htmlFor="article-cover" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Cover image URL
              </label>
              <input
                id="article-cover"
                value={form.coverUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3.5 py-3">
              <label htmlFor="article-featured" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
                Feature on homepage
                <Star className="h-3.5 w-3.5 text-fhb-gold" aria-hidden />
              </label>
              <Switch
                id="article-featured"
                checked={form.featured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
              />
            </div>
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
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============ USER MANAGER ============ */
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
      <SectionTitle title="Users and roles" sub="Promote creators, moderate members and review audience activity." />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <CardHead
          label="Members"
          right={<span className="text-[11px] font-semibold text-muted-foreground">{fmtNum(users.length)} registered</span>}
        />
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className={cn(thCls, "px-4 sm:px-5")}>Member</TableHead>
                <TableHead className={cn(thCls, "hidden text-right xl:table-cell")}>Followers</TableHead>
                <TableHead className={cn(thCls, "hidden text-right xl:table-cell")}>Shorts</TableHead>
                <TableHead className={cn(thCls, "hidden text-right xl:table-cell")}>Posts</TableHead>
                <TableHead className={cn(thCls, "hidden text-right xl:table-cell")}>Comments</TableHead>
                <TableHead className={thCls}>Role</TableHead>
                <TableHead className={cn(thCls, "px-4 text-right sm:px-5")}>
                  <span className="sr-only">Moderation</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-border/50 hover:bg-white/[0.03]">
                  <TableCell className={cn(tdCls, "max-w-[220px] px-4 sm:max-w-[320px] sm:px-5")}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted font-display text-[11px] font-bold text-muted-foreground"
                        aria-hidden
                      >
                        {initials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold leading-tight text-foreground">
                          <span className="truncate">{u.name}</span>
                          {u.isPremium && <Crown className="h-3 w-3 shrink-0 text-fhb-gold" aria-label="Premium member" />}
                          {u.isBanned && <Chip cls="border-fhb-red/25 bg-fhb-red/12 text-fhb-red">Banned</Chip>}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">@{u.username} · {u.email}</p>
                        <p className="tabular mt-0.5 text-[11px] text-muted-foreground xl:hidden">
                          {fmtLocale(u.followerCount)} followers · {fmtLocale(u._count.videos)} shorts · {fmtLocale(u._count.comments)} comments
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] font-semibold text-foreground xl:table-cell")}>
                    {fmtLocale(u.followerCount)}
                  </TableCell>
                  <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] text-muted-foreground xl:table-cell")}>
                    {fmtLocale(u._count.videos)}
                  </TableCell>
                  <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] text-muted-foreground xl:table-cell")}>
                    {fmtLocale(u._count.posts)}
                  </TableCell>
                  <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] text-muted-foreground xl:table-cell")}>
                    {fmtLocale(u._count.comments)}
                  </TableCell>
                  <TableCell className={tdCls}>
                    <SegmentGroup
                      ariaLabel={`Role for ${u.name}`}
                      active={u.role}
                      disabled={update.isPending}
                      onSelect={(r) => update.mutate({ id: u.id, role: r })}
                      options={[
                        { value: "USER", label: "Fan" },
                        { value: "CREATOR", label: "Creator" },
                        { value: "ADMIN", label: "Admin" },
                      ]}
                    />
                  </TableCell>
                  <TableCell className={cn(tdCls, "px-4 sm:px-5")}>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => update.mutate({ id: u.id, isBanned: !u.isBanned })}
                        aria-label={u.isBanned ? `Unban ${u.name}` : `Ban ${u.name}`}
                        className={cn(
                          "tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors",
                          u.isBanned
                            ? "border-primary/30 text-primary hover:bg-primary/10"
                            : "border-border text-muted-foreground hover:border-fhb-red/40 hover:bg-fhb-red/10 hover:text-fhb-red"
                        )}
                      >
                        {u.isBanned ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Ban className="h-3.5 w-3.5" aria-hidden />}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

/* ============ AD MANAGER ============ */
function AdManager({ ads }: { ads: AdminAd[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdminAd | null>(null);
  const [adForm, setAdForm] = useState({
    name: "", headline: "", bodyText: "", ctaLabel: "", linkUrl: "", brandColor: "", brandInitials: "", logoUrl: "", logoTheme: "LIGHT", imageHint: "", adCode: "",
  });

  const update = useMutation({
    mutationFn: async (payload: {
      id: string; active?: boolean; adCode?: string; name?: string; headline?: string; bodyText?: string;
      ctaLabel?: string; brandColor?: string; brandInitials?: string; logoUrl?: string; logoTheme?: string; imageHint?: string; linkUrl?: string;
    }) => {
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
      setDialogOpen(false);
      setEditingAd(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const activeCount = ads.filter((a) => a.active).length;

  const openEditor = (ad: AdminAd) => {
    setEditingAd(ad);
    setAdForm({
      name: ad.name,
      headline: ad.headline ?? "",
      bodyText: ad.bodyText ?? "",
      ctaLabel: ad.ctaLabel ?? "",
      linkUrl: ad.linkUrl ?? "",
      brandColor: ad.brandColor ?? "",
      brandInitials: ad.brandInitials ?? "",
      logoUrl: ad.logoUrl ?? "",
      logoTheme: ad.logoTheme ?? "LIGHT",
      imageHint: ad.imageHint ?? "",
      adCode: ad.adCode ?? "",
    });
    setDialogOpen(true);
  };

  const submitCreative = () => {
    if (!editingAd) return;
    update.mutate({
      id: editingAd.id,
      name: adForm.name,
      headline: adForm.headline,
      bodyText: adForm.bodyText,
      ctaLabel: adForm.ctaLabel,
      linkUrl: adForm.linkUrl,
      brandColor: adForm.brandColor,
      brandInitials: adForm.brandInitials,
      logoUrl: adForm.logoUrl,
      logoTheme: adForm.logoTheme,
      imageHint: adForm.imageHint,
      adCode: adForm.adCode,
    });
  };

  const previewColor = /^#[0-9a-fA-F]{6}$/.test(adForm.brandColor) ? adForm.brandColor : "#2BE573";

  return (
    <div>
      <SectionTitle title="Advertising" sub="AdSense code, delivery and performance for every placement." />

      <InfoBanner>
        Paste your Google AdSense code (ca-pub-…) here and real ads will serve across the site in matching placements.
        Premium members never see ads — the core premium benefit.
      </InfoBanner>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <CardHead
          label="Ad inventory"
          right={
            <span className="text-[11px] font-semibold text-muted-foreground">
              <span className="tabular font-bold text-primary">{fmtNum(activeCount)}</span> of {fmtNum(ads.length)} active
            </span>
          }
        />
        {ads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Megaphone className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[14px] text-foreground">No ad slots</p>
            <p className="text-[11.5px] text-muted-foreground">Ad placements will appear here once configured.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className={cn(thCls, "px-4 sm:px-5")}>Ad</TableHead>
                <TableHead className={cn(thCls, "hidden text-right sm:table-cell")}>Impressions</TableHead>
                <TableHead className={cn(thCls, "hidden text-right sm:table-cell")}>Clicks</TableHead>
                <TableHead className={cn(thCls, "hidden text-right md:table-cell")}>CTR</TableHead>
                <TableHead className={thCls}>Active</TableHead>
                <TableHead className={cn(thCls, "px-4 text-right sm:px-5")}>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => {
                const ctr = ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0";
                return (
                  <TableRow key={ad.id} className="border-border/50 hover:bg-white/[0.03]">
                    <TableCell className={cn(tdCls, "max-w-[200px] px-4 sm:max-w-[320px] sm:px-5")}>
                      <div className="flex min-w-0 items-center gap-3">
                        <AdBrandLogo
                          brand={{ name: ad.name, brandColor: ad.brandColor, brandInitials: ad.brandInitials, logoUrl: ad.logoUrl, logoTheme: ad.logoTheme }}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{ad.name}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{placementLabel(ad.placement)}</p>
                          <p className="tabular mt-0.5 text-[11px] text-muted-foreground sm:hidden">
                            {fmtCompact(ad.impressions)} impressions · {fmtCompact(ad.clicks)} clicks · {fmtNum(ctr)}% CTR
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] font-semibold text-foreground sm:table-cell")}>
                      {fmtCompact(ad.impressions)}
                    </TableCell>
                    <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] font-semibold text-foreground sm:table-cell")}>
                      {fmtCompact(ad.clicks)}
                    </TableCell>
                    <TableCell className={cn(tdCls, "tabular hidden text-right text-[12px] font-semibold text-primary md:table-cell")}>
                      {fmtNum(ctr)}%
                    </TableCell>
                    <TableCell className={tdCls}>
                      <Switch
                        checked={ad.active}
                        disabled={update.isPending}
                        onCheckedChange={() => update.mutate({ id: ad.id, active: !ad.active })}
                        aria-label={`${ad.name} — ${ad.active ? "active" : "inactive"}`}
                      />
                    </TableCell>
                    <TableCell className={cn(tdCls, "px-4 sm:px-5")}>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditor(ad)}
                          className="h-8 gap-1.5 rounded-md text-[11px] font-bold"
                        >
                          <Pencil className="h-3 w-3" aria-hidden /> Creative
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Creative editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingAd(null); }}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-md">
          <DialogHeader>
            <DialogTitle className="label-cond text-lg font-bold">Edit ad creative</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 text-[12px]">
              {editingAd && <Chip cls="uppercase">{placementLabel(editingAd.placement)}</Chip>}
              Demo creative copy and AdSense code for this placement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Live creative preview */}
            <div className="flex items-center gap-3.5 overflow-hidden rounded-md border border-border bg-elevated/50 p-3.5">
              <AdBrandLogo
                brand={{ name: adForm.name || "Ad", brandColor: previewColor, brandInitials: adForm.brandInitials, logoUrl: adForm.logoUrl, logoTheme: adForm.logoTheme }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold leading-tight text-foreground/95">
                  {adForm.headline || adForm.name || "Headline"}
                </p>
                {adForm.bodyText && <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{adForm.bodyText}</p>}
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Sponsored</p>
              </div>
              <span
                className="flex h-8 shrink-0 items-center gap-1 rounded-[5px] px-3.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: `${previewColor}e6` }}
              >
                {adForm.ctaLabel || "Learn More"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ad-name" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Campaign name
                </label>
                <input
                  id="ad-name"
                  value={adForm.name}
                  onChange={(e) => setAdForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="ad-link" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Link URL
                </label>
                <input
                  id="ad-link"
                  value={adForm.linkUrl}
                  onChange={(e) => setAdForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="https://… or #premium"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ad-headline" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Headline
              </label>
              <input
                id="ad-headline"
                value={adForm.headline}
                onChange={(e) => setAdForm((f) => ({ ...f, headline: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ad-body" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Body text
              </label>
              <textarea
                id="ad-body"
                value={adForm.bodyText}
                onChange={(e) => setAdForm((f) => ({ ...f, bodyText: e.target.value }))}
                rows={2}
                className={cn(inputCls, "resize-none")}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="ad-cta" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  CTA label
                </label>
                <input
                  id="ad-cta"
                  value={adForm.ctaLabel}
                  onChange={(e) => setAdForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  placeholder="Learn More"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="ad-color" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Brand color
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className="h-10 w-10 shrink-0 rounded-md border border-border"
                    style={{ backgroundColor: previewColor }}
                    aria-hidden
                  />
                  <input
                    id="ad-color"
                    value={adForm.brandColor}
                    onChange={(e) => setAdForm((f) => ({ ...f, brandColor: e.target.value }))}
                    placeholder="#2BE573"
                    className={cn(inputCls, "tabular")}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="ad-initials" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Brand initials
                </label>
                <input
                  id="ad-initials"
                  value={adForm.brandInitials}
                  onChange={(e) => setAdForm((f) => ({ ...f, brandInitials: e.target.value }))}
                  placeholder="AB"
                  maxLength={2}
                  className={cn(inputCls, "uppercase")}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ad-logo" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Brand logo URL
                </label>
                <input
                  id="ad-logo"
                  value={adForm.logoUrl}
                  onChange={(e) => setAdForm((f) => ({ ...f, logoUrl: e.target.value }))}
                  placeholder="/brands/bkash.png"
                  className={cn(inputCls, "font-mono text-[11px]")}
                />
              </div>
              <div>
                <label htmlFor="ad-logotheme" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                  Logo chip
                </label>
                <select
                  id="ad-logotheme"
                  value={adForm.logoTheme}
                  onChange={(e) => setAdForm((f) => ({ ...f, logoTheme: e.target.value }))}
                  className={inputCls}
                >
                  <option value="LIGHT">White chip (colour logos)</option>
                  <option value="DARK">Brand-colour chip (white logos)</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="ad-imagehint" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                Campaign Banner / Poster Image URL
              </label>
              <input
                id="ad-imagehint"
                value={adForm.imageHint}
                onChange={(e) => setAdForm((f) => ({ ...f, imageHint: e.target.value }))}
                placeholder="/ads/walton_tv_banner.jpg"
                className={cn(inputCls, "font-mono text-[11px]")}
              />
            </div>
            <div>
              <label htmlFor="ad-code" className="label-cond mb-1.5 block text-[11px] text-muted-foreground">
                AdSense code
              </label>
              <textarea
                id="ad-code"
                value={adForm.adCode}
                onChange={(e) => setAdForm((f) => ({ ...f, adCode: e.target.value }))}
                rows={4}
                placeholder='<ins class="adsbygoogle" …></ins>'
                className={cn(inputCls, "resize-y font-mono text-[11px] leading-relaxed")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-md">
              Cancel
            </Button>
            <Button onClick={submitCreative} disabled={update.isPending || !adForm.name.trim()} className="rounded-md bg-primary font-bold">
              {update.isPending ? "Saving…" : "Save creative"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============ PAYOUT MANAGER ============ */
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
  const pending = payouts.filter((p) => p.status === "PENDING");
  const pendingValue = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <SectionTitle title="Creator payouts" sub="Review, approve and settle creator withdrawal requests." />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <CardHead
          label="Withdrawal queue"
          right={
            pending.length > 0 ? (
              <span className="text-[11px] font-semibold text-muted-foreground">
                <span className="tabular font-bold text-foreground">{fmtNum(pending.length)} pending</span> ·{" "}
                {formatMoney(pendingValue)}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-muted-foreground">Queue is clear</span>
            )
          }
        />
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Inbox className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[14px] text-foreground">No withdrawal requests</p>
            <p className="text-[11.5px] text-muted-foreground">Creator payout requests will appear here for review.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="row-hover flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {p.creator.name} <span className="font-medium text-muted-foreground">@{p.creator.username}</span>
                  </p>
                  <p className="tabular mt-0.5 truncate text-[11px] text-muted-foreground">
                    {METHOD_LABEL[p.method] ?? p.method} · {p.account} · {timeAgo(p.createdAt)}
                  </p>
                </div>
                <p className="tabular shrink-0 font-display text-[14px] font-bold text-foreground">{formatMoney(p.amount)}</p>
                <StatusChip status={p.status} />
                {(p.status === "PENDING" || p.status === "APPROVED") && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {p.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => update.mutate({ id: p.id, status: "APPROVED" })}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/30 px-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => update.mutate({ id: p.id, status: "REJECTED" })}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-fhb-red/30 px-2.5 text-[11px] font-bold text-fhb-red transition-colors hover:bg-fhb-red/10"
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden /> Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => update.mutate({ id: p.id, status: "PAID" })}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[11px] font-bold text-primary-foreground transition-all hover:brightness-110"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark paid
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
