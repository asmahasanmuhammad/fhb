"use client";

import { useEffect, useState } from "react";
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
import { PageHeader } from "@/components/football/section-header";
import { TeamCrest } from "@/components/football/team-badge";
import {
  LayoutDashboard, Newspaper, Zap, Users, Megaphone, Wallet, Plus, Pencil, Trash2,
  TrendingUp, Eye, Clapperboard, MessageSquare, PenLine, Crown, Ban, RotateCcw,
  CircleDot, ShieldCheck, Info, Star, CheckCircle2, XCircle, Inbox,
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

/* ── Section navigation ───────────────────────────────────── */

const SECTIONS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "matches", label: "Matches", Icon: Zap },
  { id: "news", label: "News", Icon: Newspaper },
  { id: "users", label: "Users", Icon: Users },
  { id: "ads", label: "Ads", Icon: Megaphone },
  { id: "payouts", label: "Payouts", Icon: Wallet },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ── Presentation helpers ─────────────────────────────────── */

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-border bg-muted text-muted-foreground" },
  APPROVED: { label: "Approved", cls: "border-primary/25 bg-primary/12 text-primary" },
  PAID: { label: "Paid", cls: "border-primary/25 bg-primary/12 text-primary" },
  REJECTED: { label: "Rejected", cls: "border-fhb-red/25 bg-fhb-red/12 text-fhb-red" },
};

const METHOD_LABEL: Record<string, string> = { BKASH: "bKash", NAGAD: "Nagad", BANK: "Bank" };
const ROLE_LABEL: Record<string, string> = { USER: "Fan", CREATOR: "Creator", ADMIN: "Admin" };

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

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

/** Consistent 11px uppercase card header with hairline rule. */
function CardHead({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
      <h3 className="eyebrow text-muted-foreground">{label}</h3>
      {right != null && <div className="min-w-0 text-right">{right}</div>}
    </div>
  );
}

function ColHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("eyebrow text-muted-foreground/70", className)}>{children}</span>;
}

function Chip({ children, cls }: { children: React.ReactNode; cls?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
        cls ?? "border-border bg-muted text-muted-foreground"
      )}
    >
      {children}
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
    <div className="edge-lit card-lift rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", iconCls)}>
          <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        </span>
        <p className="eyebrow truncate text-muted-foreground">{label}</p>
      </div>
      <p className="tabular mt-3 font-display text-[1.35rem] font-bold leading-none tracking-[-0.01em] text-foreground">
        {value}
      </p>
      {sub != null && <p className="mt-2 truncate text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Section heading inside the admin content column. */
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.01em] text-foreground">{title}</h2>
      {sub && <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>}
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
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const isActive = o.value === active;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            disabled={isActive || disabled}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-bold transition-colors disabled:cursor-default",
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

/* ═══════════════════════════════════════════════════════════════════
   AdminView — professional console: sidebar nav + dense tables
   ═══════════════════════════════════════════════════════════════════ */
export function AdminView() {
  const { user } = useAppStore();
  useReveal();
  const [section, setSection] = useState<SectionId>("overview");

  // Track the site header height so the sidebar sticks exactly below it —
  // the header grows when the live score ticker row appears.
  const [headerH, setHeaderH] = useState<number | null>(null);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => setHeaderH(Math.round(header.getBoundingClientRect().height));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

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
        <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-fhb-red/25 bg-fhb-red/10">
          <Ban className="h-6 w-6 text-fhb-red" aria-hidden />
        </span>
        <p className="font-display text-base font-bold text-foreground">Access denied</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          This area is reserved for administrators. To preview the demo, log in with{" "}
          <b className="text-foreground">admin@fhb.com.bd / Admin@2025</b>.
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-16 rounded-xl" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[216px_minmax(0,1fr)]">
          <Skeleton className="hidden h-80 rounded-xl lg:block" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[100px] rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Admin console"
        kicker="control centre"
        subtitle="Content, users, advertising and creator payouts in one place"
        icon={<LayoutDashboard className="h-5 w-5" aria-hidden />}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Admin access
        </span>
      </PageHeader>

      <div className="reveal">
        {/* Section tabs — horizontal scroll on mobile */}
        <div
          className="fhb-scroll -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden"
          role="tablist"
          aria-label="Admin sections"
        >
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={section === id}
              onClick={() => setSection(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-[12px] font-bold transition-colors",
                section === id
                  ? "border-primary/40 bg-primary/12 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-6">
          {/* Sidebar nav — desktop */}
          <nav className="hidden lg:block" aria-label="Admin sections">
            <div
              className="edge-lit rounded-xl border border-border bg-card p-1.5 lg:sticky lg:top-[76px]"
              style={headerH != null ? { top: `${headerH + 12}px` } : undefined}
            >
              {SECTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  aria-current={section === id}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                    section === id
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content column */}
          <div className="min-w-0">
            {section === "overview" && <Overview data={data} />}
            {section === "matches" && <MatchManager />}
            {section === "news" && <NewsManager />}
            {section === "users" && <UserManager />}
            {section === "ads" && <AdManager ads={data.ads} />}
            {section === "payouts" && <PayoutManager />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ OVERVIEW ============ */
function Overview({ data }: { data: AdminStats }) {
  const s = data.stats;
  const tiles = [
    { label: "Total users", value: fmtLocale(s.totalUsers), sub: `${fmtLocale(s.creators)} creators`, Icon: Users, cls: "bg-primary/12 text-primary" },
    { label: "Premium members", value: fmtLocale(s.premiumUsers), sub: "Active subscriptions", Icon: Crown, cls: "bg-fhb-gold/12 text-fhb-gold" },
    {
      label: "Matches",
      value: fmtLocale(s.totalMatches),
      sub: <span className={s.liveMatches > 0 ? "font-semibold text-fhb-red" : undefined}>{fmtLocale(s.liveMatches)} live now</span>,
      Icon: CircleDot,
      cls: s.liveMatches > 0 ? "bg-fhb-red/12 text-fhb-red" : "bg-muted text-muted-foreground",
    },
    { label: "Articles", value: fmtLocale(s.totalArticles), sub: `${fmtCompact(s.newsViews)} reads`, Icon: Newspaper, cls: "bg-muted text-muted-foreground" },
    { label: "Videos", value: fmtLocale(s.totalVideos), sub: `${fmtCompact(s.videoViews)} views`, Icon: Clapperboard, cls: "bg-muted text-muted-foreground" },
    { label: "Revenue", value: formatMoney(s.adRevenue + s.membershipRevenue), sub: "Ads + memberships", Icon: TrendingUp, cls: "bg-primary/12 text-primary" },
  ];

  const engagement = [
    { label: "News reads", value: fmtCompact(s.newsViews), Icon: Eye },
    { label: "Video views", value: fmtCompact(s.videoViews), Icon: Clapperboard },
    { label: "Comments", value: fmtLocale(s.totalComments), Icon: MessageSquare },
    { label: "Community posts", value: fmtLocale(s.totalPosts), Icon: PenLine },
  ];

  return (
    <div>
      <SectionTitle title="Platform overview" sub="Live metrics — this panel refreshes automatically every 30 seconds." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <StatTile key={t.label} label={t.label} value={t.value} sub={t.sub} icon={<t.Icon aria-hidden />} iconCls={t.cls} />
        ))}
      </div>

      {/* Engagement strip — hairline grid */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border/60 sm:grid-cols-4">
        {engagement.map((c) => (
          <div key={c.label} className="bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <c.Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
              <p className="eyebrow truncate text-muted-foreground">{c.label}</p>
            </div>
            <p className="tabular mt-2 font-display text-lg font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
          <CardHead label="New sign-ups" right={<span className="text-[11px] font-semibold text-muted-foreground">Most recent 6</span>} />
          <div className="divide-y divide-border/60">
            {data.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03] sm:px-5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-[11px] font-bold text-muted-foreground"
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
                <Chip>{ROLE_LABEL[u.role] ?? u.role}</Chip>
                <span className="tabular shrink-0 text-[11px] text-muted-foreground">{timeAgo(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
          <CardHead label="Latest articles" right={<span className="text-[11px] font-semibold text-muted-foreground">Most recent 6</span>} />
          <div className="divide-y divide-border/60">
            {data.recentArticles.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03] sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{a.title}</p>
                  <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]">
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
      <SectionTitle title="Match control" sub="Set match status — the live engine picks up changes within seconds." />

      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          <span className="font-bold text-foreground">Live test tip:</span> set any upcoming match to{" "}
          <span className="font-bold text-fhb-red">Live</span> — the WebSocket simulation service will automatically start
          updating minutes and scores.
        </p>
      </div>

      <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
        <CardHead
          label="Fixtures and results"
          right={<span className="text-[11px] font-semibold text-muted-foreground">{fmtNum(sorted.length)} matches</span>}
        />
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {sorted.map((m) => {
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
                  <SegmentGroup
                    ariaLabel={`Status for ${m.homeTeam.name} vs ${m.awayTeam.name}`}
                    active={m.status}
                    disabled={update.isPending}
                    onSelect={(st) => update.mutate({ id: m.id, status: st })}
                    options={[
                      { value: "SCHEDULED", label: "Upcoming" },
                      { value: "LIVE", label: "Live", activeCls: "bg-fhb-red/15 text-fhb-red" },
                      { value: "FINISHED", label: "Finished" },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle title="Newsroom" sub="Write, edit and curate the editorial feed." />
        <Button size="sm" onClick={openNew} className="gap-1.5 rounded-lg bg-primary font-bold">
          <Plus className="h-4 w-4" aria-hidden /> New article
        </Button>
      </div>

      <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
        <CardHead
          label="Articles"
          right={<span className="text-[11px] font-semibold text-muted-foreground">{fmtNum(articles.length)} total</span>}
        />
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden gap-3 border-b border-border/70 bg-white/[0.02] px-5 py-2 md:grid md:grid-cols-[minmax(0,1fr)_92px_88px_64px_84px_76px]">
              <ColHead>Article</ColHead>
              <ColHead>Category</ColHead>
              <ColHead>Status</ColHead>
              <ColHead className="text-right">Views</ColHead>
              <ColHead>Updated</ColHead>
              <ColHead className="text-right">Actions</ColHead>
            </div>
            <div className="divide-y divide-border/60">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5 md:grid md:grid-cols-[minmax(0,1fr)_92px_88px_64px_84px_76px] md:gap-3"
                >
                  <div className="min-w-0 flex-1 md:min-w-0">
                    <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold leading-tight text-foreground">
                      <span className="truncate">{a.title}</span>
                      {a.featured && <Star className="h-3 w-3 shrink-0 fill-fhb-gold text-fhb-gold" aria-label="Featured" />}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground md:hidden">
                      {a.category} · {a.status === "PUBLISHED" ? "Published" : "Draft"} · {fmtCompact(a.views)} views ·{" "}
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  <span className="hidden md:block">
                    <Chip cls="border-border bg-muted uppercase text-muted-foreground">{a.category}</Chip>
                  </span>
                  <span className="hidden md:block">
                    <Chip
                      cls={
                        a.status === "PUBLISHED"
                          ? "border-primary/25 bg-primary/12 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {a.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Chip>
                  </span>
                  <span className="tabular hidden text-right text-[12px] font-semibold text-foreground md:block">
                    {fmtCompact(a.views)}
                  </span>
                  <span className="tabular hidden text-[11px] text-muted-foreground md:block">{timeAgo(a.createdAt)}</span>
                  <div className="flex items-center gap-1 md:justify-self-end">
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      aria-label={`Edit ${a.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => del.mutate(a.id)}
                      aria-label={`Delete ${a.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-fhb-red/10 hover:text-fhb-red"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit article" : "New article"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editing ? "Update the story and save — changes go live immediately." : "Publish a new story to the FHB news feed."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="article-title" className="eyebrow mb-1.5 block text-muted-foreground">
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
              <label htmlFor="article-excerpt" className="eyebrow mb-1.5 block text-muted-foreground">
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
              <label htmlFor="article-body" className="eyebrow mb-1.5 block text-muted-foreground">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="article-category" className="eyebrow mb-1.5 block text-muted-foreground">
                  Category
                </label>
                <select
                  id="article-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputCls}
                >
                  {["BFL", "NATIONAL", "TRANSFER", "INTERNATIONAL", "OPINION"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="article-status" className="eyebrow mb-1.5 block text-muted-foreground">
                  Status
                </label>
                <select
                  id="article-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className={inputCls}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="article-cover" className="eyebrow mb-1.5 block text-muted-foreground">
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
            <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !form.title.trim() || !form.content.trim()}
              className="rounded-lg bg-primary font-bold"
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
type AdminUser = {
  id: string; name: string; username: string; email: string; role: string; isPremium: boolean;
  isBanned: boolean; followerCount: number; createdAt: string;
  _count: { posts: number; videos: number; comments: number };
};

const USER_COLS = "lg:grid-cols-[minmax(0,1.5fr)_76px_60px_60px_84px_172px_44px]";

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

      <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
        <CardHead
          label="Members"
          right={<span className="text-[11px] font-semibold text-muted-foreground">{fmtNum(users.length)} registered</span>}
        />
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className={cn("hidden gap-3 border-b border-border/70 bg-white/[0.02] px-5 py-2 lg:grid", USER_COLS)}>
              <ColHead>Member</ColHead>
              <ColHead className="text-right">Followers</ColHead>
              <ColHead className="text-right">Shorts</ColHead>
              <ColHead className="text-right">Posts</ColHead>
              <ColHead className="text-right">Comments</ColHead>
              <ColHead>Role</ColHead>
              <span />
            </div>
            <div className="divide-y divide-border/60">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    "flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5 lg:grid lg:gap-3",
                    USER_COLS
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 lg:min-w-0">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-[11px] font-bold text-muted-foreground"
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
                      <p className="truncate text-[11px] text-muted-foreground">
                        @{u.username} · {u.email}
                      </p>
                    </div>
                  </div>
                  <span className="tabular hidden text-right text-[12px] font-semibold text-foreground lg:block">
                    {fmtLocale(u.followerCount)}
                  </span>
                  <span className="tabular hidden text-right text-[12px] text-muted-foreground lg:block">
                    {fmtLocale(u._count.videos)}
                  </span>
                  <span className="tabular hidden text-right text-[12px] text-muted-foreground lg:block">
                    {fmtLocale(u._count.posts)}
                  </span>
                  <span className="tabular hidden text-right text-[12px] text-muted-foreground lg:block">
                    {fmtLocale(u._count.comments)}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
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
                    <button
                      type="button"
                      onClick={() => update.mutate({ id: u.id, isBanned: !u.isBanned })}
                      aria-label={u.isBanned ? `Unban ${u.name}` : `Ban ${u.name}`}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        u.isBanned
                          ? "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                          : "border-border text-muted-foreground hover:border-fhb-red/40 hover:bg-fhb-red/10 hover:text-fhb-red"
                      )}
                    >
                      {u.isBanned ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Ban className="h-3.5 w-3.5" aria-hidden />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
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

  const activeCount = ads.filter((a) => a.active).length;

  return (
    <div>
      <SectionTitle title="Advertising" sub="AdSense code, delivery and performance for every placement." />

      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          Paste your Google AdSense code (ca-pub-…) here and real ads will serve across the site in matching placements.
          Premium members never see ads — the core premium benefit.
        </p>
      </div>

      <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
        <CardHead
          label="Ad inventory"
          right={
            <span className="text-[11px] font-semibold text-muted-foreground">
              <span className="tabular font-bold text-primary">{fmtNum(activeCount)}</span> of {fmtNum(ads.length)} active
            </span>
          }
        />
        <div className="divide-y divide-border/60">
          {ads.map((ad) => {
            const ctr = ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0";
            return (
              <div key={ad.id} className="px-4 py-3.5 transition-colors hover:bg-white/[0.02] sm:px-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-[12px] font-bold text-white"
                    style={{ backgroundColor: ad.brandColor || "#1E9E50" }}
                  >
                    {(ad.brandInitials || ad.name.slice(0, 2)).trim()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{ad.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {placementLabel(ad.placement)}
                      {ad.headline && <span className="text-muted-foreground/70"> · “{ad.headline}”</span>}
                    </p>
                  </div>

                  {/* Performance — desktop */}
                  <div className="hidden items-center gap-5 sm:flex">
                    <div className="text-right">
                      <p className="eyebrow text-muted-foreground/70">Impressions</p>
                      <p className="tabular mt-1 text-[12.5px] font-semibold text-foreground">{fmtCompact(ad.impressions)}</p>
                    </div>
                    <div className="text-right">
                      <p className="eyebrow text-muted-foreground/70">Clicks</p>
                      <p className="tabular mt-1 text-[12.5px] font-semibold text-foreground">{fmtCompact(ad.clicks)}</p>
                    </div>
                    <div className="text-right">
                      <p className="eyebrow text-muted-foreground/70">CTR</p>
                      <p className="tabular mt-1 text-[12.5px] font-semibold text-primary">{fmtNum(ctr)}%</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing({ id: ad.id, code: ad.adCode ?? "" })}
                      className="h-8 rounded-lg text-[11px] font-bold"
                    >
                      Ad code
                    </Button>
                    <button
                      onClick={() => update.mutate({ id: ad.id, active: !ad.active })}
                      disabled={update.isPending}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50",
                        ad.active ? "border-primary/50 bg-primary" : "border-border bg-muted"
                      )}
                      role="switch"
                      aria-checked={ad.active}
                      aria-label={`${ad.name} — ${ad.active ? "active" : "inactive"}`}
                    >
                      <span
                        className={cn(
                          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all",
                          ad.active ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Performance — mobile */}
                <p className="tabular mt-2.5 text-[11px] text-muted-foreground sm:hidden">
                  {fmtCompact(ad.impressions)} impressions · {fmtCompact(ad.clicks)} clicks · {fmtNum(ctr)}% CTR
                </p>

                {editing?.id === ad.id && (
                  <div className="mt-3.5 border-t border-border/70 pt-3.5">
                    <label htmlFor={`adcode-${ad.id}`} className="eyebrow mb-1.5 block text-muted-foreground">
                      AdSense code
                    </label>
                    <textarea
                      id={`adcode-${ad.id}`}
                      value={editing.code}
                      onChange={(e) => setEditing((ed) => (ed ? { ...ed, code: e.target.value } : ed))}
                      rows={4}
                      placeholder='<ins class="adsbygoogle" …></ins>'
                      className={cn(inputCls, "resize-y font-mono text-[11px] leading-relaxed")}
                    />
                    <div className="mt-2.5 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => update.mutate({ id: ad.id, adCode: editing.code })}
                        disabled={update.isPending}
                        className="rounded-lg bg-primary font-bold"
                      >
                        Save code
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="rounded-lg">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  const pending = payouts.filter((p) => p.status === "PENDING");
  const pendingValue = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <SectionTitle title="Creator payouts" sub="Review, approve and settle creator withdrawal requests." />

      <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
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
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Inbox className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">No withdrawal requests</p>
            <p className="text-xs text-muted-foreground">Creator payout requests will appear here for review.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {payouts.map((p) => {
              const meta = PAYOUT_STATUS[p.status];
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5"
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
                  <Chip cls={meta?.cls}>{meta?.label ?? p.status}</Chip>
                  {(p.status === "PENDING" || p.status === "APPROVED") && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {p.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => update.mutate({ id: p.id, status: "APPROVED" })}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 px-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => update.mutate({ id: p.id, status: "REJECTED" })}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-fhb-red/30 px-2.5 text-[11px] font-bold text-fhb-red transition-colors hover:bg-fhb-red/10"
                          >
                            <XCircle className="h-3.5 w-3.5" aria-hidden /> Reject
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => update.mutate({ id: p.id, status: "PAID" })}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[11px] font-bold text-primary-foreground transition-all hover:brightness-110"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark paid
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
