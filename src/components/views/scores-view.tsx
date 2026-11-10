"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { useReveal } from "@/hooks/use-reveal";
import type { Match, MatchDetail } from "@/lib/types";
import { MatchRow } from "@/components/football/match-card";
import { TeamCrest } from "@/components/football/team-badge";
import { LiveBadge } from "@/components/football/live-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatKickoff, fmtNum } from "@/lib/format";
import {
  Activity, ArrowLeft, ArrowLeftRight, CalendarDays, CalendarX, ChevronRight, Clock,
  FileText, Flag, Goal, ListOrdered, MapPin, PlayCircle, Table2, Timer, Trophy, Tv, Zap,
  Radio, Signal, Headphones, Maximize2, Settings, Volume2, VolumeX, Play, Pause, Flame, BarChart2,
} from "lucide-react";
import { TacticalPitch } from "@/components/football/tactical-pitch";

/* ════════════════════════════════════════════════════════════════
   ScoresView — FotMob-style match centre
   Date rail + status tabs, competition-grouped dense rows, side rail.
   ════════════════════════════════════════════════════════════════ */

type Tab = "all" | "live" | "upcoming" | "finished";

const DAY_MS = 86_400_000;
const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** How far back/forward the date rail scans for fixture days (matches the API window). */
const RAIL_SPAN_DAYS = 30;
/** Right-rail quick links, resolved against competitions present in the data. */
const TOP_COMPETITIONS = ["EPL", "UCL", "LaLiga", "Serie A", "Bundesliga", "BFL"];
const STATUS_TABS: Tab[] = ["all", "live", "upcoming", "finished"];
const TAB_LABELS: Record<Tab, string> = {
  all: "All",
  live: "Live",
  upcoming: "Upcoming",
  finished: "Finished",
};

export function ScoresView() {
  const [userTab, setUserTab] = useState<Tab | null>(null);
  const [dayOffset, setDayOffset] = useState(0); // 0 = today
  const live = useLiveScores();
  const liveConnected = live.connected;
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  // Track the site header height so the sub-nav sticks exactly below it —
  // the header grows with the live ticker row and the desktop league rail.
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

  const { data, isLoading } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "scores"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=60&limit=150");
      return res.json().then((j) => j.data);
    },
    refetchInterval: 60_000, // fallback refresh for socket-less situations
  });

  /** Fetched matches with any socket live-state merged in. */
  const matches = useMemo(() => {
    const all = data?.matches ?? [];
    const liveIds = new Set(live.matches.map((m) => m.id));
    return all.map((m) => (liveIds.has(m.id) ? { ...m, status: "LIVE" as const } : m));
  }, [data, live.matches]);

  const liveMatches = useMemo(() => matches.filter((m) => m.status === "LIVE"), [matches]);
  const liveCount = liveMatches.length;

  // Smart default tab: land on "live" only when matches are actually live
  const tab: Tab = userTab ?? (liveCount > 0 ? "live" : "all");

  /** Date rail chips — Yesterday/Today/Tomorrow anchors plus every day with
   *  fixtures inside the fetched window, so no match is unreachable. */
  const dayChips = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const counts = new Map<number, number>();
    for (const m of matches) {
      const d = new Date(m.kickoff);
      d.setHours(0, 0, 0, 0);
      const key = Math.round((d.getTime() - base.getTime()) / DAY_MS);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const chips: Array<{ offset: number; count: number; label: string; fullLabel: string }> = [];
    const push = (offset: number) => {
      const d = new Date(base.getTime() + offset * DAY_MS);
      chips.push({
        offset,
        count: counts.get(offset) ?? 0,
        label:
          offset === -1
            ? "Yesterday"
            : offset === 0
              ? "Today"
              : offset === 1
                ? "Tomorrow"
                : `${DOW_SHORT[d.getDay()]} ${d.getDate()}`,
        fullLabel: formatKickoff(d.toISOString()).date,
      });
    };
    // Past fixture days, then the three anchors, then upcoming fixture days
    for (let o = -RAIL_SPAN_DAYS; o <= -2; o++) if ((counts.get(o) ?? 0) > 0) push(o);
    for (const o of [-1, 0, 1]) push(o);
    for (let o = 2; o <= RAIL_SPAN_DAYS; o++) if ((counts.get(o) ?? 0) > 0) push(o);
    return chips;
  }, [matches]);

  const selectedDay = dayChips.find((c) => c.offset === dayOffset) ?? dayChips.find((c) => c.offset === 0) ?? dayChips[0];

  /** Matches on the selected day (live state already merged). */
  const dayMatches = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const target = base.getTime() + dayOffset * DAY_MS;
    return matches.filter((m) => {
      const d = new Date(m.kickoff);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target;
    });
  }, [matches, dayOffset]);

  /** Rows for the active tab. Live is global — live play is always "now". */
  const pool = useMemo(() => {
    if (tab === "live") return liveMatches;
    if (tab === "upcoming") return dayMatches.filter((m) => m.status === "SCHEDULED");
    if (tab === "finished") return dayMatches.filter((m) => m.status === "FINISHED");
    return dayMatches;
  }, [tab, liveMatches, dayMatches]);

  /** Group by competition; live competitions float to the top. */
  const grouped = useMemo(() => {
    const byComp = new Map<string, { comp: Match["competition"]; list: Match[] }>();
    for (const m of pool) {
      const g = byComp.get(m.competition.id) ?? { comp: m.competition, list: [] };
      g.list.push(m);
      byComp.set(m.competition.id, g);
    }
    const rank = (m: Match) => (m.status === "LIVE" ? 0 : m.status === "SCHEDULED" ? 1 : 2);
    const groups = [...byComp.values()];
    for (const g of groups) {
      g.list.sort((a, b) => {
        const r = rank(a) - rank(b);
        if (r !== 0) return r;
        const ka = +new Date(a.kickoff);
        const kb = +new Date(b.kickoff);
        return rank(a) === 2 ? kb - ka : ka - kb; // finished: newest first, others: earliest first
      });
    }
    groups.sort((a, b) => {
      const aLive = a.list.some((m) => m.status === "LIVE") ? 0 : 1;
      const bLive = b.list.some((m) => m.status === "LIVE") ? 0 : 1;
      if (aLive !== bLive) return aLive - bLive;
      return +new Date(a.list[0].kickoff) - +new Date(b.list[0].kickoff);
    });
    return groups;
  }, [pool]);

  /** Right-rail quick list, resolved from competitions present in the data. */
  const topCompetitions = useMemo(() => {
    const byShort = new Map<string, Match["competition"]>();
    for (const m of matches) byShort.set(m.competition.shortName, m.competition);
    return TOP_COMPETITIONS.map((s) => byShort.get(s)).filter((c): c is Match["competition"] => Boolean(c));
  }, [matches]);

  const counts: Record<Tab, number> = {
    all: dayMatches.length,
    live: liveCount,
    upcoming: dayMatches.filter((m) => m.status === "SCHEDULED").length,
    finished: dayMatches.filter((m) => m.status === "FINISHED").length,
  };

  const todayLine = formatKickoff(new Date().toISOString()).date;

  const emptyCopy =
    tab === "live"
      ? { title: "No live matches right now", hint: "Scores move to Live the moment a match kicks off." }
      : tab === "upcoming"
        ? { title: "No upcoming fixtures", hint: `Nothing is scheduled on ${selectedDay.label}. Try another date.` }
        : tab === "finished"
          ? { title: "No results yet", hint: `No matches have finished on ${selectedDay.label}.` }
          : { title: `No matches on ${selectedDay.label}`, hint: "Pick another date from the rail above." };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Live Scores & Fixtures"
        kicker="match centre · real-time bst"
        subtitle={`${todayLine} ${new Date().getFullYear()} — every fixture, live minute and final score`}
        icon={<Zap className="h-5 w-5" aria-hidden />}
      >
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 px-3 py-1 text-[10.5px] font-black uppercase tracking-wider",
            liveConnected
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-white/[0.05] text-white/40 border border-white/[0.08]"
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", liveConnected ? "live-dot bg-emerald-400" : "bg-white/30")}
            aria-hidden
          />
          {liveConnected ? "Live Feed Connected" : "Local Database Mode"}
        </span>
      </PageHeader>

      {/* Leaderboard ad */}
      <div className="reveal mb-6">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      {/* ── Sticky sub-nav: date rail + status tabs ─────────────── */}
      <div
        className="sticky top-14 z-30 -mx-4 border-b border-white/15 bg-[#06080f]/95 backdrop-blur-2xl sm:-mx-6 sm:top-[60px] lg:top-[90px] shadow-lg"
        style={headerH != null ? { top: `${headerH}px` } : undefined}
      >
        <div className="flex flex-col gap-2 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          {/* Date rail */}
          <div
            className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1"
            role="group"
            aria-label="Match date"
          >
            {dayChips.map((chip) => (
              <button
                key={chip.offset}
                onClick={() => setDayOffset(chip.offset)}
                aria-pressed={dayOffset === chip.offset}
                title={chip.fullLabel}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded px-3 py-2 text-[11.5px] font-black uppercase tracking-wider transition-all",
                  dayOffset === chip.offset
                    ? "bg-[#ff1e46] text-white shadow-[0_0_12px_rgba(255,30,70,0.5)]"
                    : "text-white font-extrabold hover:bg-white/10 hover:text-white"
                )}
              >
                {chip.label}
                {chip.count > 0 && (
                  <span
                    className={cn(
                      "tabular px-1.5 py-0.2 rounded text-[10px] font-mono font-bold",
                      dayOffset === chip.offset ? "bg-black/30 text-white" : "bg-white/10 text-white"
                    )}
                  >
                    {fmtNum(chip.count)}
                  </span>
                )}
                {chip.offset === 0 && liveCount > 0 && (
                  <span className="live-dot h-2 w-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" aria-hidden />
                )}
              </button>
            ))}
          </div>

          {/* Status filter tabs */}
          <div
            className="no-scrollbar flex shrink-0 items-center gap-1 self-start overflow-x-auto rounded border border-white/15 bg-[#050812] p-1 lg:self-auto"
            role="tablist"
            aria-label="Match status filter"
          >
            {STATUS_TABS.map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setUserTab(key)}
                className={cn(
                  "flex shrink-0 items-center justify-center gap-1.5 rounded px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-wider transition-all",
                  tab === key
                    ? "bg-[#ff1e46] text-white shadow-[0_0_10px_rgba(255,30,70,0.5)]"
                    : "text-white font-extrabold hover:text-[#00e5ff] hover:bg-white/10"
                )}
              >
                {key === "live" && liveCount > 0 && (
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full bg-white shadow-[0_0_6px_#ffffff]", tab !== "live" && "live-dot")}
                    aria-hidden
                  />
                )}
                {TAB_LABELS[key]}
                <span
                  className={cn(
                    "tabular text-[10px] font-mono font-bold ml-1",
                    tab === key ? "text-white" : "text-[#cbd5e1]"
                  )}
                >
                  ({fmtNum(counts[key])})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Match list + side rail ──────────────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {isLoading ? (
            <div className="space-y-4" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="overflow-hidden rounded-md border border-white/10 bg-[#090d19]">
                  <div className="border-b border-white/10 bg-[#050812] px-3.5 py-3">
                    <Skeleton className="h-4 w-44 rounded-md bg-white/10" />
                  </div>
                  <div className="divide-y divide-white/10">
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="flex items-center gap-3 px-4 py-3">
                        <Skeleton className="h-9 w-10 rounded-md bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-2/3 rounded-md bg-white/10" />
                          <Skeleton className="h-3.5 w-1/2 rounded-md bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="reveal flex flex-col items-center justify-center gap-2.5 rounded-md border border-white/12 bg-[#090d19] px-6 py-14 text-center shadow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded bg-white/10 text-white">
                {tab === "live" ? (
                  <Activity className="h-6 w-6 text-[#ff1e46]" aria-hidden />
                ) : (
                  <CalendarX className="h-6 w-6 text-white" aria-hidden />
                )}
              </span>
              <p className="text-base font-extrabold text-white">{emptyCopy.title}</p>
              <p className="max-w-[36ch] text-xs leading-relaxed text-[#cbd5e1] font-medium">{emptyCopy.hint}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((g) => {
                const first = g.list[0];
                const round = first.round ?? (first.matchday ? `Matchday ${fmtNum(first.matchday)}` : null);
                const hasLive = g.list.some((m) => m.status === "LIVE");
                return (
                  <section
                    key={g.comp.id}
                    className="reveal overflow-hidden rounded-md border border-white/12 bg-[#090d19] shadow-xl"
                    aria-label={g.comp.name}
                  >
                    {/* Competition group header */}
                    <button
                      onClick={() => navigate({ name: "competition-detail", id: g.comp.id })}
                      className="group flex w-full items-center gap-2.5 border-b border-white/12 bg-[#050812] px-4 py-3 text-left transition-all hover:bg-white/10"
                      aria-label={`View competition: ${g.comp.name}`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                        style={{ backgroundColor: g.comp.accentColor ?? "#ff1e46" }}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate text-[13px] font-black uppercase tracking-wider text-white" title={g.comp.name}>
                        {g.comp.name}
                      </span>
                      {round && (
                        <span className="hidden min-w-0 truncate text-[11.5px] font-bold text-[#cbd5e1] md:inline">
                          · {round}
                        </span>
                      )}
                      {hasLive && (
                        <span className="flex shrink-0 items-center gap-1.5 rounded bg-red-600/30 border border-red-500/50 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-widest text-white shadow-sm">
                          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#ff1e46]" aria-hidden />
                          Live
                        </span>
                      )}
                      <span className="tabular ml-auto shrink-0 text-[11px] font-bold text-white uppercase tracking-widest">
                        {fmtNum(g.list.length)} {g.list.length === 1 ? "match" : "matches"}
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-white transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </button>
                    {/* Dense match rows */}
                    <div className="divide-y divide-white/10">
                      {g.list.map((m) => (
                        <MatchRow key={m.id} match={m} showCompetition={false} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* In-feed ad after the match list */}
          <div className="reveal mt-6">
            <AdSlot placement="IN_FEED" />
          </div>
        </div>

        {/* ── Side rail ─────────────────────────────────────────── */}
        <aside className="min-w-0 space-y-5 lg:col-span-4" aria-label="Scores side rail">
          {liveCount > 0 && (
            <div className="reveal overflow-hidden rounded-md border border-[#ff1e46]/40 bg-[#0c1224] shadow-xl">
              <p className="flex items-center gap-2 border-b border-[#ff1e46]/30 bg-[#ff1e46]/20 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white">
                <span className="live-dot h-2 w-2 rounded-full bg-[#ff1e46]" aria-hidden />
                Live Now — {fmtNum(liveCount)}
              </p>
              <div className="divide-y divide-white/10">
                {liveMatches.slice(0, 4).map((m) => (
                  <MatchRow key={m.id} match={m} showCompetition />
                ))}
              </div>
              <button
                onClick={() => setUserTab("live")}
                className="flex w-full items-center justify-center gap-1 border-t border-white/10 py-2.5 text-[10.5px] font-black uppercase tracking-widest text-red-400 transition-colors hover:bg-red-600/10"
              >
                All live matches <ChevronRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          )}

          <div className="reveal">
            <AdSlot placement="SIDEBAR" className="min-h-[250px]" />
          </div>

          {isLoading ? (
            <Skeleton className="h-[236px] bg-white/[0.04]" />
          ) : (
            topCompetitions.length > 0 && (
              <div className="reveal overflow-hidden border border-white/[0.07] bg-[#0d0d10]">
                <p className="flex items-center gap-2 border-b border-white/[0.07] bg-[#060608] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                  Top Competitions
                </p>
                <div className="grid grid-cols-2 gap-2 p-3">
                  {topCompetitions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate({ name: "competition-detail", id: c.id })}
                      title={c.name}
                      className="group flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-left transition-colors hover:border-red-500/40 hover:bg-white/[0.06]"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: c.accentColor ?? "#dc2626" }}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate text-[11px] font-black uppercase tracking-wider text-white/80 transition-colors group-hover:text-white">
                        {c.shortName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </aside>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MatchDetailView — broadcast match centre
   Scoreboard hero, event timeline, match info, countdown for fixtures.
   ════════════════════════════════════════════════════════════════ */

export function MatchDetailView({ matchId }: { matchId: string }) {
  const back = useAppStore((s) => s.back);
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  const liveData = live.matches.find((m) => m.id === matchId);
  useReveal();

  const { data, isLoading } = useQuery<{ match: MatchDetail }>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`);
      return res.json().then((j) => j.data);
    },
    refetchInterval: liveData ? 15_000 : false,
  });

  const isScheduled = !liveData && data?.match?.status === "SCHEDULED";

  // Subtab navigation in Match Centre
  const [matchSubTab, setMatchSubTab] = useState<"stream" | "pitch" | "timeline" | "stats" | "info">("pitch");
  const [streamPlaying, setStreamPlaying] = useState(true);
  const [streamMuted, setStreamMuted] = useState(false);
  const [cameraAngle, setCameraAngle] = useState<"main" | "tactical" | "goal">("main");
  const [audioChannel, setAudioChannel] = useState<"stadium" | "tactical">("stadium");
  const [streamServer, setStreamServer] = useState("Server 1 (BDIX Dhaka 60FPS)");
  const streamVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto switch to stream if live
  useEffect(() => {
    if (status === "LIVE") {
      setMatchSubTab("stream");
    }
  }, [status]);

  // Ticking clock for the kick-off countdown (client only)
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    if (!isScheduled) return;
    const tick = () => setNowMs(Date.now());
    const raf = requestAnimationFrame(tick); // first paint, without a 1s "--" flash
    const t = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [isScheduled]);

  if (isLoading || !data?.match) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="mt-5 h-[268px] rounded-xl" />
        <Skeleton className="mt-6 h-56 rounded-xl" />
      </div>
    );
  }

  const m = data.match;
  const homeScore = liveData ? liveData.homeScore : m.homeScore;
  const awayScore = liveData ? liveData.awayScore : m.awayScore;
  const minute = liveData ? liveData.minute : m.minute;
  const period = liveData ? liveData.period : m.period;
  const status = liveData ? "LIVE" : m.status;
  const events = m.events ?? [];
  const ko = formatKickoff(m.kickoff);
  const homeWon = status === "FINISHED" && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWon = status === "FINISHED" && (awayScore ?? 0) > (homeScore ?? 0);
  const roundLabel = m.round ?? (m.matchday ? `Matchday ${fmtNum(m.matchday)}` : null);

  const msLeft = nowMs !== null ? +new Date(m.kickoff) - nowMs : null;
  const countdown =
    msLeft !== null && msLeft > 0
      ? {
          d: Math.floor(msLeft / DAY_MS),
          h: Math.floor((msLeft % DAY_MS) / 3_600_000),
          m: Math.floor((msLeft % 3_600_000) / 60_000),
          s: Math.floor((msLeft % 60_000) / 1000),
        }
      : null;

  const infoRows = [
    { label: "Competition", value: m.competition.name },
    { label: "Round", value: roundLabel ?? "—" },
    { label: "Venue", value: m.venue ?? "To be confirmed" },
    { label: "Date", value: ko.date },
    { label: "Kick-off", value: `${ko.time} (local time)` },
    {
      label: "Status",
      value:
        status === "LIVE"
          ? period === "HT"
            ? "Half-Time"
            : `In play — ${fmtNum(minute ?? 0)}′`
          : status === "FINISHED"
            ? "Full-Time"
            : "Scheduled",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Top bar: back + page title ─────────────────────────── */}
      <div className="mb-5 flex items-center gap-3.5">
        <button
          onClick={back}
          className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-0">
          <p className="eyebrow text-primary">Match Centre</p>
          <h1 className="truncate font-display text-sm font-bold tracking-[-0.01em] text-foreground sm:text-base">
            {m.homeTeam.name} vs {m.awayTeam.name}
          </h1>
        </div>
      </div>

      {/* ── Scoreboard hero — broadcast panel ──────────────────── */}
      <section
        className="reveal noise stadium-panel pitch-pattern edge-lit overflow-hidden rounded-xl border border-border/70"
        aria-label="Scoreboard"
      >
        {/* Competition strip */}
        <div className="relative flex items-center justify-between gap-2 border-b border-border/60 bg-black/20 px-4 py-2.5 sm:px-6">
          <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-foreground/90">
            <span
              className="h-2 w-2 shrink-0 rounded-[3px]"
              style={{ backgroundColor: m.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">{m.competition.name}</span>
            {roundLabel && (
              <span className="hidden shrink-0 text-muted-foreground sm:inline">· {roundLabel}</span>
            )}
          </span>
          {status === "FINISHED" && (
            <span className="shrink-0 rounded bg-muted px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Full-Time
            </span>
          )}
          {status === "SCHEDULED" && (
            <span className="shrink-0 rounded border border-primary/35 bg-primary/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
              {ko.relative === ko.date ? ko.date.split(",")[1]?.trim() : ko.relative}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-8 sm:gap-6 sm:px-8 sm:py-10">
          <TeamHeroBlock team={m.homeTeam} dimmed={awayWon} onClick={() => navigate({ name: "team-detail", id: m.homeTeam.id })} />
          <div className="shrink-0 px-1 text-center">
            {status === "SCHEDULED" ? (
              <>
                <p className="tabular font-display text-[2.5rem] font-bold leading-none text-foreground sm:text-5xl">
                  {ko.time}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{ko.date}</p>
              </>
            ) : (
              <>
                <p className="tabular font-display text-5xl font-bold leading-none text-foreground sm:text-[4.25rem]">
                  {fmtNum(homeScore ?? 0)}
                  <span className="mx-2 text-muted-foreground/35 sm:mx-3">–</span>
                  {fmtNum(awayScore ?? 0)}
                </p>
                {status === "LIVE" && (
                  <p className="mt-3.5">
                    <LiveBadge minute={minute} period={period} />
                  </p>
                )}
              </>
            )}
          </div>
          <TeamHeroBlock team={m.awayTeam} dimmed={homeWon} onClick={() => navigate({ name: "team-detail", id: m.awayTeam.id })} />
        </div>

        {/* Meta strip */}
        <div className="relative grid grid-cols-3 divide-x divide-border/60 border-t border-border/60 bg-black/20">
          {[
            { icon: <MapPin className="h-3.5 w-3.5" aria-hidden />, label: "Venue", value: m.venue ?? "To be confirmed" },
            { icon: <CalendarDays className="h-3.5 w-3.5" aria-hidden />, label: "Date", value: ko.date },
            { icon: <Clock className="h-3.5 w-3.5" aria-hidden />, label: "Kick-off", value: ko.time },
          ].map((meta) => (
            <div key={meta.label} className="px-2 py-3.5 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {meta.icon}
                {meta.label}
              </p>
              <p className="mt-1 truncate text-[11.5px] font-medium text-foreground" title={meta.value}>
                {meta.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Match Centre Sub-tabs: Stream, 2D Pitch, Timeline, Stats, Info ── */}
      <div className="reveal mt-6 flex items-center justify-between overflow-x-auto no-scrollbar border-b border-border/80 pb-2 gap-1.5 bg-card/40 p-1.5 rounded-xl border">
        {[
          { id: "stream", label: "HD Live Stream", icon: <Tv className="h-3.5 w-3.5" />, live: status === "LIVE" },
          { id: "pitch", label: "2D Tactical Pitch", icon: <Activity className="h-3.5 w-3.5 text-emerald-400" /> },
          { id: "timeline", label: "Timeline", icon: <ListOrdered className="h-3.5 w-3.5" /> },
          { id: "stats", label: "Match Stats", icon: <BarChart2 className="h-3.5 w-3.5" /> },
          { id: "info", label: "Match Info", icon: <MapPin className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMatchSubTab(tab.id as typeof matchSubTab)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              matchSubTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.live && (
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* ── Subtab 1: HD Live Stream & Broadcast Director ── */}
      {matchSubTab === "stream" && (
        <section className="reveal mt-4 space-y-4" aria-label="HD Live Broadcast Simulator">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl group">
            <video
              ref={streamVideoRef}
              src={
                cameraAngle === "main"
                  ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  : cameraAngle === "tactical"
                  ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
                  : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
              }
              autoPlay
              loop
              muted={streamMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Live TV broadcast overlay badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>LIVE 1080P HD</span>
              </span>
              <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 font-bold border border-white/10">
                60 FPS • BDIX
              </span>
            </div>

            {/* Stream playback overlay controls */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (streamVideoRef.current) {
                      if (streamPlaying) {
                        streamVideoRef.current.pause();
                        setStreamPlaying(false);
                      } else {
                        streamVideoRef.current.play();
                        setStreamPlaying(true);
                      }
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {streamPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setStreamMuted(!streamMuted)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {streamMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  {m.homeTeam.initials} {fmtNum(homeScore ?? 0)} - {fmtNum(awayScore ?? 0)} {m.awayTeam.initials} ({period ?? "FT"})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (streamVideoRef.current?.requestFullscreen) {
                      streamVideoRef.current.requestFullscreen();
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Director Controls: Camera Angle & Audio Commentary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Camera Switcher */}
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-2 flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-primary" />
                <span>Camera Angle Switcher:</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "main", label: "Main TV" },
                  { id: "tactical", label: "Drone Tactical" },
                  { id: "goal", label: "Goal-Line" },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraAngle(cam.id as typeof cameraAngle)}
                    className={cn(
                      "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                      cameraAngle === cam.id
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Commentary Feed Switcher */}
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-2 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-rose-500" />
                <span>Live Audio Commentary:</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setAudioChannel("stadium")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                    audioChannel === "stadium"
                      ? "bg-rose-600 text-white shadow"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Stadium Broadcast (EN)
                </button>
                <button
                  onClick={() => setAudioChannel("tactical")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                    audioChannel === "tactical"
                      ? "bg-rose-600 text-white shadow"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Tactical Analysis (EN)
                </button>
              </div>
            </div>
          </div>

          {/* Live Commentary Feed Ticker */}
          <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse text-sm">
              🎙️
            </div>
            <div className="flex-1 text-xs leading-relaxed">
              <span className="font-bold text-primary mr-2">
                Live Commentary (74&apos;):
              </span>
              <span className="text-foreground/90">
                {audioChannel === "stadium"
                  ? "Brilliant progressive play through the lines, testing the backline with venomous speed! The stadium is electric."
                  : "Kings pushing high with a 3-2-5 attacking shape. Morsalin drifting inside to overload the half-space with precision."}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Subtab 2: 2D Interactive Tactical Pitch ── */}
      {matchSubTab === "pitch" && (
        <section className="reveal mt-4" aria-label="2D Tactical Pitch">
          <TacticalPitch
            homeTeam={m.homeTeam}
            awayTeam={m.awayTeam}
            homeFormation="4-3-3"
            awayFormation="4-2-3-1"
          />
        </section>
      )}

      {/* ── Subtab 3: Match Timeline ── */}
      {matchSubTab === "timeline" && (
        <section className="reveal mt-4" aria-label="Match events">
          <SectionHeader
            title="Match Timeline"
            kicker="key events"
            accent={status === "LIVE" ? "red" : "primary"}
            icon={<ListOrdered className="h-3.5 w-3.5" aria-hidden />}
          />
          {status === "LIVE" && (
            <p className="-mt-1 mb-3 flex items-center gap-2 text-[11px] font-semibold text-fhb-red">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
              Updating live — goals and cards appear here in real time
            </p>
          )}
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Timer className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-foreground">
                {status === "LIVE" ? "No events yet" : "No events recorded"}
              </p>
              <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
                {status === "LIVE"
                  ? "Goals, cards and substitutions will appear here as they happen."
                  : "This match has no recorded events."}
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-border bg-card">
              <span
                className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-border/70 sm:block"
                aria-hidden
              />
              {status === "LIVE" && (
                <div className="relative border-b border-border/50 bg-fhb-red/[0.06] px-4 py-2 sm:px-6">
                  <span className="relative z-[1] mx-auto flex w-fit items-center gap-2 rounded-full border border-fhb-red/35 bg-fhb-red/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-fhb-red">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
                    {liveData?.period === "HT" ? "Half-Time" : `Live · ${fmtNum(liveData?.minute ?? m.minute ?? 0)}′`}
                  </span>
                </div>
              )}
              {events
                .slice()
                .sort((a, b) => b.minute - a.minute)
                .map((e) => {
                  const isHome = e.teamSide === "home";
                  const isAway = e.teamSide === "away";

                  if (!isHome && !isAway) {
                    return (
                      <div
                        key={e.id}
                        className="relative border-b border-border/50 bg-muted/30 px-4 py-2.5 last:border-0 sm:px-6"
                      >
                        <span className="relative z-[1] mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {eventIcon(e.type, "h-3.5 w-3.5")}
                          {eventLabel(e.type)} · {fmtNum(e.minute)}′
                        </span>
                      </div>
                    );
                  }

                  const side = isHome ? m.homeTeam : m.awayTeam;
                  const name = e.playerName && e.playerName !== "—" ? e.playerName : null;
                  const main = name ?? e.detail ?? eventLabel(e.type);
                  const sub = name ? `${eventLabel(e.type)} · ${side.name}` : side.name;
                  const content = (
                    <>
                      <p className="truncate text-[13px] font-semibold text-foreground">{main}</p>
                      <p className="truncate text-[10.5px] text-muted-foreground">{sub}</p>
                    </>
                  );
                  const icon = (
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        eventTint(e.type)
                      )}
                    >
                      {eventIcon(e.type)}
                    </span>
                  );

                  return (
                    <div
                      key={e.id}
                      className="relative flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:px-6"
                    >
                      <div
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-3 sm:justify-end",
                          !isHome && "sm:invisible"
                        )}
                      >
                        <div className="min-w-0 sm:text-right">{content}</div>
                        <span className="hidden sm:flex">{icon}</span>
                      </div>

                      <span className="tabular relative z-[1] order-first flex h-8 min-w-[3.5rem] shrink-0 items-center justify-center rounded-full border border-border bg-elevated px-2 font-display text-[11.5px] font-bold text-foreground/85 sm:order-none sm:mx-auto">
                        {fmtNum(e.minute)}′
                      </span>

                      <div className={cn("hidden min-w-0 sm:flex sm:items-center sm:gap-3", !isAway && "sm:invisible")}>
                        {icon}
                        <div className="min-w-0">{content}</div>
                      </div>
                    </div>
                  );
                })}
              <div className="relative border-t border-border/50 bg-muted/25 px-4 py-2.5 sm:px-6">
                <span className="relative z-[1] mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                  Kick-off · 0′
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Subtab 4: Match Stats (xG, Possession, Shots) ── */}
      {matchSubTab === "stats" && (
        <section className="reveal mt-4 space-y-3" aria-label="Advanced Match Statistics">
          <SectionHeader
            title="Match Analytics & xG"
            kicker="performance data"
            icon={<BarChart2 className="h-3.5 w-3.5 text-primary" />}
          />
          <div className="space-y-3 max-w-xl mx-auto">
            {[
              { label: "Possession (%)", home: 58, away: 42 },
              { label: "Expected Goals (xG)", home: 2.14, away: 0.85 },
              { label: "Total Shots", home: 14, away: 8 },
              { label: "Shots on Target", home: 6, away: 3 },
              { label: "Corner Kicks", home: 7, away: 3 },
              { label: "Fouls Committed", home: 11, away: 14 },
              { label: "Passing Accuracy (%)", home: 87, away: 79 },
            ].map((stat, idx) => {
              const homeNum = Number(stat.home);
              const awayNum = Number(stat.away);
              const total = homeNum + awayNum || 1;
              const homePct = Math.round((homeNum / total) * 100);

              return (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                    <span className="text-primary font-mono text-sm">{stat.home}</span>
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-foreground font-mono text-sm">{stat.away}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    <div className="bg-primary h-full transition-all" style={{ width: `${homePct}%` }} />
                    <div className="bg-muted-foreground/30 h-full flex-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Subtab 5: Match Info ── */}
      {matchSubTab === "info" && (
        <section className="reveal mt-4" aria-label="Match information">
          <SectionHeader
            title="Match Info"
            kicker="match details"
            icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}
          />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <dl className="divide-y divide-border/60">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[96px_1fr] items-baseline gap-3 px-4 py-3 sm:grid-cols-[140px_1fr]"
                >
                  <dt className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="min-w-0 truncate text-[13px] font-medium text-foreground" title={row.value}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ── In-feed ad ─────────────────────────────────────────── */}
      <div className="reveal mt-8">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ── Back navigation + compact CTA row ──────────────────── */}
      <div className="reveal mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={back}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Go back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ name: "standings" })}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary sm:flex-none"
          >
            <Table2 className="h-3.5 w-3.5" aria-hidden />
            Standings
          </button>
          <button
            onClick={() => navigate({ name: "live-tv" })}
            className="sheen flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 sm:flex-none"
          >
            <Tv className="h-3.5 w-3.5" aria-hidden />
            Watch on Live TV
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

/** Team block inside the scoreboard hero — crest + name, links to team page. */
function TeamHeroBlock({
  team,
  dimmed,
  onClick,
}: {
  team: Match["homeTeam"];
  dimmed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex min-w-0 flex-col items-center gap-3 text-center sm:gap-4"
      aria-label={`View team: ${team.name}`}
    >
      <TeamCrest team={team} size="match" className="transition-transform duration-300 group-hover:scale-[1.04]" />
      <span
        className={cn(
          "line-clamp-2 max-w-[8.5rem] text-[13px] font-bold leading-tight transition-colors group-hover:text-primary sm:max-w-[11rem] sm:text-base",
          dimmed && "text-muted-foreground"
        )}
      >
        {team.name}
      </span>
    </button>
  );
}

function eventIcon(type: string, className?: string) {
  switch (type) {
    case "GOAL":
      return <Goal className={cn("h-4 w-4", className)} aria-hidden />;
    case "YELLOW":
      return <span className="h-3.5 w-2.5 rounded-[2px] bg-yellow-400/90" aria-label="Yellow card" />;
    case "RED":
      return <span className="h-3.5 w-2.5 rounded-[2px] bg-fhb-red" aria-label="Red card" />;
    case "SUB":
      return <ArrowLeftRight className={cn("h-4 w-4", className)} aria-hidden />;
    case "HT":
      return <Timer className={cn("h-4 w-4", className)} aria-hidden />;
    case "FT":
      return <Flag className={cn("h-4 w-4", className)} aria-hidden />;
    default:
      return <FileText className={cn("h-4 w-4", className)} aria-hidden />;
  }
}

function eventLabel(type: string) {
  switch (type) {
    case "GOAL":
      return "Goal";
    case "YELLOW":
      return "Yellow Card";
    case "RED":
      return "Red Card";
    case "SUB":
      return "Substitution";
    case "HT":
      return "Half-Time";
    case "FT":
      return "Full-Time";
    default:
      return "Event";
  }
}

function eventTint(type: string) {
  switch (type) {
    case "GOAL":
      return "bg-primary/15 text-primary";
    case "RED":
      return "bg-fhb-red/15 text-fhb-red";
    case "YELLOW":
      return "bg-yellow-400/15 text-yellow-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}
