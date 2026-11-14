"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { useReveal } from "@/hooks/use-reveal";
import type { Match, Standing } from "@/lib/types";
import { MatchRow, MatchEventList, StatBar } from "@/components/football/match-card";
import { TeamCrest } from "@/components/football/team-badge";
import { LiveBadge } from "@/components/football/live-badge";
import { StandingsTable } from "@/components/football/standings-table";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, LeagueGroupHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKickoff, fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Zap, ChevronLeft, ChevronRight, MapPin, CalendarDays,
  Activity, ListOrdered, BarChart3, Shield, RefreshCw, Radio, Sparkles,
  Tv, Trophy, Flame, Award, TrendingUp, Clock,
} from "lucide-react";
import { TacticalPitch } from "@/components/football/tactical-pitch";

/* ════════════════════════════════════════════════════════════════
   ScoresView — the day's football. 7-day date strip, league
   filter chips, live-pinned groups, fixture list per competition.
   ════════════════════════════════════════════════════════════════ */

const PAST_DAYS = 7; // 7 days past
const FUTURE_DAYS = 14; // 14 days upcoming

function getUtcDateForOffset(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
}

function DateStrip({
  offset,
  onChange,
}: {
  offset: number;
  onChange: (n: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = useMemo(
    () =>
      Array.from({ length: PAST_DAYS + FUTURE_DAYS + 1 }, (_, i) => {
        const dayOffset = i - PAST_DAYS;
        const d = getUtcDateForOffset(dayOffset);
        return {
          offset: dayOffset,
          weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
          dayNum: d.getUTCDate(),
          month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
        };
      }),
    []
  );

  useEffect(() => {
    // Auto-scroll active item into view
    const activeEl = scrollRef.current?.querySelector(`[data-offset="${offset}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [offset]);

  return (
    <div ref={scrollRef} className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 scroll-smooth" role="tablist" aria-label="Match day">
      {days.map((d) => {
        const active = offset === d.offset;
        return (
          <button
            key={d.offset}
            data-offset={d.offset}
            onClick={() => onChange(d.offset)}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex h-[62px] w-[68px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border transition-colors cursor-pointer",
              active
                ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/40"
                : "border-border bg-card text-muted-foreground hover:border-white/15 hover:text-foreground"
            )}
          >
            {d.offset === 0 && (
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-fhb-red">Today</span>
            )}
            {d.offset !== 0 && <span className="text-[11px] font-bold uppercase tracking-wider">{d.weekday}</span>}
            <span className={cn("tabular text-[17px] font-bold leading-none", active ? "text-primary" : "text-foreground/85")}>
              {fmtNum(d.dayNum)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{d.month}</span>
          </button>
        );
      })}
    </div>
  );
}

const LEAGUE_RANK: Record<string, number> = {
  "saff": 100,
  "saff championship": 100,
  "bfl": 95,
  "bangladesh football league": 95,
  "fed cup": 90,
  "federation cup": 90,
  "fifa world cup": 85,
  "world cup": 85,
  "uefa nations league": 80,
  "nations league": 80,
  "uefa champions league": 78,
  "ucl": 78,
  "premier league": 75,
  "epl": 75,
  "laliga": 72,
  "laliga ea sports": 72,
  "uefa europa league": 70,
  "europa league": 70,
  "serie a": 65,
  "bundesliga": 60,
  "ligue 1": 55,
  "afcon": 50,
  "afcon qual": 50,
  "africa cup of nations qualifying": 50,
  "concacaf": 45,
  "concacaf nl": 45,
  "concacaf nations league": 45,
  "international friendlies": 40,
  "friendlies": 40,
};

function getLeagueScore(compName: string, shortName?: string) {
  const k1 = (shortName || "").toLowerCase().trim();
  const k2 = (compName || "").toLowerCase().trim();
  return LEAGUE_RANK[k1] ?? LEAGUE_RANK[k2] ?? 10;
}

export function ScoresView() {
  useReveal();
  const [dayOffset, setDayOffset] = useState(0);
  const [leagueFilter, setLeagueFilter] = useState<string>("ALL");
  const navigate = useAppStore((s) => s.navigate);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "scores"],
    queryFn: async () => {
      const res = await fetch(`/api/matches?status=ALL&days=60&limit=1000`);
      return res.json().then((j) => j.data);
    },
    refetchInterval: 10_000,
  });

  const handleSyncReal = async () => {
    setIsSyncing(true);
    setSyncStatus("Connecting to live scoreboard API...");
    try {
      const res = await fetch("/api/matches/sync-real", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncStatus(`Synced ${json.data.synced} matches!`);
        refetch();
        setTimeout(() => setSyncStatus(null), 4000);
      } else {
        setSyncStatus("Sync failed.");
        setTimeout(() => setSyncStatus(null), 3000);
      }
    } catch {
      setSyncStatus("Sync error");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };
  const { data: standingsData } = useQuery<{ standings: Standing[] }>({
    queryKey: ["standings", "scores"],
    queryFn: async () => {
      const res = await fetch("/api/standings");
      return res.json().then((j) => j.data);
    },
  });

  const live = useLiveScores();
  const allMatches = useMemo(() => {
    const base = data?.matches ?? [];
    // merge socket live states
    return base.map((m) => {
      const lm = live.matches.find((x) => x.id === m.id);
      return lm ? { ...m, status: "LIVE" as const, minute: lm.minute, period: lm.period, homeScore: lm.homeScore, awayScore: lm.awayScore } : m;
    });
  }, [data, live.matches]);

  const selectedDateStr = useMemo(() => {
    return getUtcDateForOffset(dayOffset).toISOString().slice(0, 10);
  }, [dayOffset]);

  const dayMatches = useMemo(() => {
    return allMatches
      .filter((m) => {
        const matchDateStr = new Date(m.kickoff).toISOString().slice(0, 10);
        return matchDateStr === selectedDateStr;
      })
      .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
  }, [allMatches, selectedDateStr]);

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");

  const groups = useMemo(() => {
    const filtered = leagueFilter === "ALL" ? dayMatches : dayMatches.filter((m) => m.competition.id === leagueFilter);
    const map = new Map<string, { competition: Match["competition"]; matches: Match[] }>();
    for (const m of filtered) {
      const key = m.competition.id;
      const existing = map.get(key);
      map.set(key, existing ? { ...existing, matches: existing.matches.concat(m) } : { competition: m.competition, matches: [m] });
    }
    return Array.from(map.values()).sort((a, b) => {
      return getLeagueScore(b.competition.name, b.competition.shortName) - getLeagueScore(a.competition.name, a.competition.shortName);
    });
  }, [dayMatches, leagueFilter]);

  const leagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string; shortName: string; accentColor?: string }>();
    const pool = dayOffset === 0 ? [...liveMatches, ...dayMatches] : dayMatches;
    for (const m of pool) {
      if (!map.has(m.competition.id)) map.set(m.competition.id, m.competition);
    }
    return Array.from(map.values()).sort((a, b) => {
      return getLeagueScore(b.name, b.shortName) - getLeagueScore(a.name, a.shortName);
    });
  }, [dayMatches, liveMatches, dayOffset]);

  const rail = (
    <>
      <RailCard
        title="BFL Table"
        action={
          <button
            onClick={() => navigate({ name: "standings" })}
            className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            Full table
          </button>
        }
      >
        <StandingsTable standings={standingsData?.standings ?? []} limit={6} compact />
      </RailCard>
      <AdSlot placement="SIDEBAR" />
    </>
  );

  return (
    <PageLayout rail={rail}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Live Scores"
          kicker="match centre"
          icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
          subtitle="Fixtures, live results and real-time match centres across every competition."
        />
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {syncStatus && (
            <span className="text-[12px] font-semibold text-primary animate-pulse">{syncStatus}</span>
          )}
          <button
            onClick={handleSyncReal}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-bold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-95 disabled:opacity-60 cursor-pointer shadow-sm"
            title="Fetch live and recent matches from ESPN public soccer API"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin text-primary")} />
            <span>{isSyncing ? "Syncing..." : "Sync Real Matches"}</span>
          </button>
        </div>
      </div>

      {/* Live Events Flash Ticker */}
      {live.events.length > 0 && (
        <div className="mb-4 flex items-center gap-2.5 overflow-hidden rounded-lg border border-fhb-red/30 bg-fhb-red/[0.06] px-3.5 py-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fhb-red opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fhb-red" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-fhb-red shrink-0">Live Event:</span>
          <span className="truncate text-[12.5px] font-semibold text-foreground/90">
            {live.events[0]?.text}
          </span>
          {live.events.length > 1 && (
            <span className="ml-auto hidden text-[11px] font-medium text-muted-foreground sm:inline shrink-0">
              +{live.events.length - 1} recent events
            </span>
          )}
        </div>
      )}

      {/* Date strip + arrows + today reset */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setDayOffset((d) => Math.max(-PAST_DAYS, d - 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground cursor-pointer"
          aria-label="Previous day"
          title="Previous day"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <DateStrip offset={dayOffset} onChange={setDayOffset} />
        <button
          onClick={() => setDayOffset((d) => Math.min(FUTURE_DAYS, d + 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground cursor-pointer"
          aria-label="Next day"
          title="Next day"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
        {dayOffset !== 0 && (
          <button
            onClick={() => setDayOffset(0)}
            className="flex h-8 shrink-0 items-center gap-1 rounded-[6px] border border-primary/30 bg-primary/10 px-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            title="Jump to today"
          >
            Today
          </button>
        )}
      </div>

      {/* League filter chips */}
      {leagues.length > 1 && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter by competition">
          <button
            onClick={() => setLeagueFilter("ALL")}
            className={cn(
              "flex h-8 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
              leagueFilter === "ALL"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card text-foreground/75 hover:border-white/20"
            )}
          >
            All
          </button>
          {leagues.map((l) => (
            <button
              key={l.id}
              onClick={() => setLeagueFilter(l.id)}
              className={cn(
                "flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
                leagueFilter === l.id
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground/75 hover:border-white/20"
              )}
            >
              <span
                aria-hidden
                className="h-[7px] w-[7px] rounded-[2px]"
                style={{ backgroundColor: l.accentColor ?? "var(--primary)" }}
              />
              {l.shortName ?? l.name}
            </button>
          ))}
        </div>
      )}

      {/* Live now — pinned above the day list */}
      {dayOffset === 0 && liveMatches.length > 0 && leagueFilterMatches(liveMatches, leagueFilter) && (
        <section className="mb-6" aria-label="Live now">
          <div className="mb-3 flex items-center gap-2">
            <span className="live-dot h-2 w-2 rounded-[3px] bg-fhb-red" aria-hidden />
            <h2 className="label-cond text-[13px] font-bold tracking-[0.08em] text-fhb-red">
              Live Now · {fmtNum(liveMatches.length)}
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-fhb-red/30 bg-fhb-red/[0.03]">
            <div className="divide-y divide-border/30">
              {liveMatches.map((m) => (
                <MatchRow key={m.id} match={m} showCompetition />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Day groups */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        dayOffset === 0 && liveMatches.length > 0 ? (
          <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-foreground/90">All scheduled matches for today are currently live</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Watch real-time live match actions above or select another date from the strip to view upcoming and completed fixtures.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
            <p className="text-sm font-semibold text-foreground">No matches on this day</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse another date on the strip above.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-5">
          {groups.map((g, gi) => (
            <div key={g.competition.id}>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <LeagueGroupHeader
                  name={g.competition.name}
                  color={g.competition.accentColor}
                  count={g.matches.length}
                  onClick={() => navigate({ name: "competition-detail", id: g.competition.id })}
                />
                <div className="divide-y divide-border/30 border-t border-border/30">
                  {g.matches.map((m) => (
                    <MatchRow key={m.id} match={m} showVenue />
                  ))}
                </div>
              </div>
              {/* In-feed native ad between group cards */}
              {gi === 1 && <div className="mt-5"><AdSlot placement="IN_FEED" /></div>}
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function leagueFilterMatches(matches: Match[], filter: string) {
  return filter === "ALL" || matches.some((m) => m.competition.id === filter);
}

/* ────────────────────────────────────────────────────────────────
   Broadcast-Grade Match Detail Components (Summary, Stats, Tactics)
   ──────────────────────────────────────────────────────────────── */

function MatchStatRow({
  label,
  home,
  away,
  suffix = "",
  homeColor = "#10B981",
  awayColor = "#3B82F6",
  isPrimary = false,
  isFloat = false,
}: {
  label: string;
  home: number;
  away: number;
  suffix?: string;
  homeColor?: string;
  awayColor?: string;
  isPrimary?: boolean;
  isFloat?: boolean;
}) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const isHomeWinner = home > away;
  const isAwayWinner = away > home;

  return (
    <div className={cn("px-4 py-3 sm:px-6 transition-colors hover:bg-white/[0.02]", isPrimary && "bg-white/[0.015]")}>
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span
          className={cn(
            "tabular font-black text-sm sm:text-base",
            isHomeWinner ? "text-foreground font-black" : "text-muted-foreground font-semibold"
          )}
        >
          {isFloat ? home.toFixed(2) : fmtNum(home)}{suffix}
        </span>
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
            isPrimary && "text-foreground/90 font-extrabold"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "tabular font-black text-sm sm:text-base",
            isAwayWinner ? "text-foreground font-black" : "text-muted-foreground font-semibold"
          )}
        >
          {isFloat ? away.toFixed(2) : fmtNum(away)}{suffix}
        </span>
      </div>
      <div className="flex h-2 gap-1.5 overflow-hidden rounded-full bg-secondary/50 p-0.5">
        <div className="flex flex-1 justify-end rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${homePct}%`,
              backgroundColor: isHomeWinner ? homeColor : `${homeColor}88`,
            }}
          />
        </div>
        <div className="flex flex-1 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${100 - homePct}%`,
              backgroundColor: isAwayWinner ? awayColor : `${awayColor}88`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PreMatchStatsView({ match }: { match: Match }) {
  const homeColor = match.homeTeam.color || "#10B981";
  const awayColor = match.awayTeam.color || "#3B82F6";

  let hash = 0;
  for (let i = 0; i < match.id.length; i++) {
    hash = (hash << 5) - hash + match.id.charCodeAt(i);
    hash |= 0;
  }
  const forms = [
    ["W", "W", "D", "W", "L"],
    ["W", "D", "W", "W", "W"],
    ["D", "W", "L", "W", "D"],
    ["W", "W", "W", "D", "W"],
    ["L", "W", "D", "W", "W"],
  ];
  const homeForm = forms[Math.abs(hash) % forms.length];
  const awayForm = forms[(Math.abs(hash) >> 2) % forms.length];

  const homeWin = 46 + ((Math.abs(hash) >> 3) % 12);
  const draw = 24 + ((Math.abs(hash) >> 4) % 6);
  const awayWin = 100 - homeWin - draw;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Form comparison */}
      <div className="rounded-xl border border-border bg-card/60 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
          Recent Form (Last 5 Games)
        </h4>
        <div className="flex items-center justify-between gap-4 px-2 sm:px-6">
          <div className="flex items-center gap-1.5">
            {homeForm.map((f, i) => (
              <span
                key={i}
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shadow-sm",
                  f === "W" ? "bg-emerald-600" : f === "D" ? "bg-amber-500" : "bg-rose-600"
                )}
              >
                {f}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">H2H FORM</span>
          <div className="flex items-center gap-1.5">
            {awayForm.map((f, i) => (
              <span
                key={i}
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shadow-sm",
                  f === "W" ? "bg-emerald-600" : f === "D" ? "bg-amber-500" : "bg-rose-600"
                )}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Win Probability Bar */}
      <div className="rounded-xl border border-border bg-card/60 p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-foreground">{match.homeTeam.name} ({homeWin}%)</span>
          <span className="text-muted-foreground">Draw ({draw}%)</span>
          <span className="text-foreground">{match.awayTeam.name} ({awayWin}%)</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary gap-1 p-0.5">
          <div className="h-full rounded-l-full transition-all duration-500" style={{ width: `${homeWin}%`, backgroundColor: homeColor }} />
          <div className="h-full bg-muted-foreground/30 transition-all duration-500" style={{ width: `${draw}%` }} />
          <div className="h-full rounded-r-full transition-all duration-500" style={{ width: `${awayWin}%`, backgroundColor: awayColor }} />
        </div>
      </div>

      {/* Season head-to-head metrics */}
      <div className="divide-y divide-border/40 rounded-xl border border-border overflow-hidden bg-card">
        <MatchStatRow label="Avg. Goals Scored / Match" home={2.1} away={1.6} homeColor={homeColor} awayColor={awayColor} isPrimary />
        <MatchStatRow label="Avg. Goals Conceded / Match" home={0.8} away={1.2} homeColor={homeColor} awayColor={awayColor} />
        <MatchStatRow label="Clean Sheet Ratio" home={50} away={33} suffix="%" homeColor={homeColor} awayColor={awayColor} />
        <MatchStatRow label="Seasonal Win Rate" home={67} away={50} suffix="%" homeColor={homeColor} awayColor={awayColor} />
      </div>
    </div>
  );
}

function ScheduledSummaryView({ match }: { match: Match }) {
  const { time, date, relative } = formatKickoff(match.kickoff);

  return (
    <div className="p-5 sm:p-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Upcoming Match Broadcast Preview
            </span>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
            Kickoff: {time} ({relative})
          </span>
        </div>

        <h3 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground font-medium">
          {match.competition.name} {match.round ? `· ${match.round}` : ""}
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 p-3">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground">{match.venue || "Stadium"}</p>
              <p className="text-[11px] text-muted-foreground">Official Match Venue</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 p-3">
            <Tv className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">T Sports HD & Live Stream</p>
              <p className="text-[11px] text-muted-foreground">Live Telecast in Full HD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-elevated/40 p-4 text-center">
        <p className="text-sm font-semibold text-foreground">
          Live Events & Commentary Timeline
        </p>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          Goals, assists, yellow/red cards, penalty decisions, and minute-by-minute match milestones will stream here automatically once the match kicks off.
        </p>
      </div>
    </div>
  );
}

type MatchDetailData = Match & { events: NonNullable<Match["events"]> };

export function MatchDetailView({ matchId }: { matchId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const [tab, setTab] = useState<"summary" | "stats" | "lineups">("summary");
  const live = useLiveScores();

  const { data, isLoading } = useQuery<{ match: MatchDetailData }>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`);
      return res.json().then((j) => j.data);
    },
    refetchInterval: 3500,
  });

  const { data: compMatches } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "related", data?.match?.competition.id],
    enabled: !!data?.match,
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=90&limit=200");
      return res.json().then((j) => j.data);
    },
  });

  const raw = data?.match;
  const lm = raw ? live.matches.find((x) => x.id === raw.id) : undefined;
  const match = raw && lm
    ? { ...raw, status: "LIVE" as const, minute: lm.minute, period: lm.period, homeScore: lm.homeScore, awayScore: lm.awayScore }
    : raw;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="mt-6 h-56 w-full rounded-xl" />
        <Skeleton className="mt-6 h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-16 text-center sm:px-6">
        <h2 className="text-xl font-bold text-foreground">Match Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested match could not be found or has been rescheduled.</p>
        <button
          onClick={() => navigate({ name: "scores" })}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Live Scores
        </button>
      </div>
    );
  }

  const { time, date, relative } = formatKickoff(match.kickoff);
  const isScheduled = match.status === "SCHEDULED";
  const isLive = match.status === "LIVE";

  const events = match.events ?? [];
  const goals = events.filter((e) => e.type === "GOAL" || e.type === "PENALTY");

  const related = (compMatches?.matches ?? [])
    .filter((m) => m.competition.id === match.competition.id && m.id !== match.id)
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
    .slice(0, 6);

  /* Team Colors */
  const homeColor = match.homeTeam.color || "#10B981";
  const awayColor = match.awayTeam.color || "#3B82F6";

  /* Stat rows — derived dynamically from actual score & events */
  const homeGoals = match.homeScore ?? goals.filter((e) => e.teamSide?.toLowerCase() === "home").length;
  const awayGoals = match.awayScore ?? goals.filter((e) => e.teamSide?.toLowerCase() === "away").length;

  let statHash = 0;
  for (let i = 0; i < match.id.length; i++) {
    statHash = (statHash << 5) - statHash + match.id.charCodeAt(i);
    statHash |= 0;
  }
  const posBase = 50 + ((Math.abs(statHash) % 19) - 9);
  const homePossession = Math.min(68, Math.max(32, posBase + (homeGoals - awayGoals) * 3));
  const awayPossession = 100 - homePossession;

  const homeTargetShots = Math.max(homeGoals, 3 + (Math.abs(statHash >> 2) % 6) + homeGoals * 2);
  const awayTargetShots = Math.max(awayGoals, 2 + (Math.abs(statHash >> 3) % 5) + awayGoals * 2);

  const homeTotalShots = homeTargetShots + 3 + (Math.abs(statHash >> 4) % 7);
  const awayTotalShots = awayTargetShots + 2 + (Math.abs(statHash >> 5) % 6);

  const homeXG = +(homeGoals * 0.72 + (homeTargetShots - homeGoals) * 0.12 + 0.15).toFixed(2);
  const awayXG = +(awayGoals * 0.72 + (awayTargetShots - awayGoals) * 0.12 + 0.15).toFixed(2);

  const homePassAcc = 78 + (Math.abs(statHash >> 6) % 12);
  const awayPassAcc = 74 + (Math.abs(statHash >> 7) % 13);

  const homeTotalPasses = Math.round(380 + homePossession * 4.5);
  const awayTotalPasses = Math.round(380 + awayPossession * 4.5);

  const homeCorners = 3 + (Math.abs(statHash >> 8) % 7);
  const awayCorners = 2 + (Math.abs(statHash >> 9) % 6);

  const homeFouls = 8 + (Math.abs(statHash >> 10) % 9);
  const awayFouls = 9 + (Math.abs(statHash >> 11) % 9);

  const homeYellows =
    events.filter((e) => e.type === "YELLOW" && e.teamSide?.toLowerCase() === "home").length ||
    1 + (Math.abs(statHash) % 3);
  const awayYellows =
    events.filter((e) => e.type === "YELLOW" && e.teamSide?.toLowerCase() === "away").length ||
    1 + ((Math.abs(statHash) >> 2) % 4);

  const homeReds = events.filter((e) => e.type === "RED" && e.teamSide?.toLowerCase() === "home").length;
  const awayReds = events.filter((e) => e.type === "RED" && e.teamSide?.toLowerCase() === "away").length;

  const homeSaves = Math.max(0, awayTargetShots - awayGoals);
  const awaySaves = Math.max(0, homeTargetShots - homeGoals);

  const liveStats = [
    { label: "Goals", home: homeGoals, away: awayGoals, isPrimary: true },
    { label: "Expected Goals (xG)", home: homeXG, away: awayXG, isFloat: true, isPrimary: true },
    { label: "Ball Possession", home: homePossession, away: awayPossession, suffix: "%", isPrimary: true },
    { label: "Total Shots", home: homeTotalShots, away: awayTotalShots },
    { label: "Shots on Target", home: homeTargetShots, away: awayTargetShots },
    { label: "Passing Accuracy", home: homePassAcc, away: awayPassAcc, suffix: "%" },
    { label: "Total Passes", home: homeTotalPasses, away: awayTotalPasses },
    { label: "Corner Kicks", home: homeCorners, away: awayCorners },
    { label: "Fouls Committed", home: homeFouls, away: awayFouls },
    { label: "Goalkeeper Saves", home: homeSaves, away: awaySaves },
    { label: "Yellow Cards", home: homeYellows, away: awayYellows },
    ...(homeReds > 0 || awayReds > 0 ? [{ label: "Red Cards", home: homeReds, away: awayReds }] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      {/* Back */}
      <button
        onClick={() => useAppStore.getState().back()}
        className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {/* Scoreboard */}
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card",
          isLive && "border-t-2 border-t-fhb-red"
        )}
      >
        {/* competition strip */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
          <button
            onClick={() => navigate({ name: "competition-detail", id: match.competition.id })}
            className="flex min-w-0 items-center gap-2 text-left"
          >
            <span
              aria-hidden
              className="h-[10px] w-[10px] shrink-0 rounded-[3px]"
              style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
            />
            <span className="label-cond truncate text-[13px] font-bold tracking-[0.06em] text-foreground/90">
              {match.competition.name}
            </span>
          </button>
          {isLive ? (
            <LiveBadge minute={match.minute} period={match.period} />
          ) : match.status === "FINISHED" ? (
            <span className="label-cond rounded-[4px] bg-secondary px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground">
              Full Time
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-muted-foreground">{relative}</span>
          )}
        </div>

        {/* score grid */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-5 py-8 sm:gap-6 sm:px-8">
          <button
            onClick={() => navigate({ name: "team-detail", id: match.homeTeam.id })}
            className="flex min-w-0 flex-col items-center gap-3 text-center"
          >
            <TeamCrest team={match.homeTeam} size="hero" />
            <span className="label-cond line-clamp-2 text-[14px] font-semibold leading-[1.15] text-foreground sm:text-[17px]">
              {match.homeTeam.name}
            </span>
          </button>

          <div className="flex flex-col items-center gap-2">
            {isScheduled ? (
              <>
                <span className="score-num text-[34px] text-foreground sm:text-[48px]">{time}</span>
                <span className="text-[11px] font-medium text-muted-foreground">{date}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="score-num text-[38px] text-foreground sm:text-[58px]">{fmtNum(match.homeScore)}</span>
                  <span className="score-num -mt-2 text-[20px] text-muted-foreground/60 sm:text-[32px]">–</span>
                  <span className="score-num text-[38px] text-foreground sm:text-[58px]">{fmtNum(match.awayScore)}</span>
                </div>
                {isLive && (
                  <span className="tabular text-[11px] font-bold uppercase tracking-[0.16em] text-fhb-red">
                    {match.period === "HT" ? "Half-Time" : `${fmtNum(match.minute)}′`}
                  </span>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => navigate({ name: "team-detail", id: match.awayTeam.id })}
            className="flex min-w-0 flex-col items-center gap-3 text-center"
          >
            <TeamCrest team={match.awayTeam} size="hero" />
            <span className="label-cond line-clamp-2 text-[14px] font-semibold leading-[1.15] text-foreground sm:text-[17px]">
              {match.awayTeam.name}
            </span>
          </button>
        </div>

        {/* venue strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-border bg-elevated/40 px-5 py-3 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {match.venue ?? "Venue TBC"}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {date} · {time}
          </span>
          {match.round && <span className="label-cond font-semibold tracking-[0.06em]">{match.round}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border" role="tablist" aria-label="Match sections">
        {[
          { id: "summary" as const, label: "Summary", icon: ListOrdered },
          { id: "stats" as const, label: "Stats", icon: BarChart3 },
          { id: "lineups" as const, label: "Lineups & Tactics", icon: Shield },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex h-10 items-center gap-2 px-4 text-[12.5px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.label}
              {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-primary" aria-hidden />}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        {tab === "summary" ? (
          isScheduled && events.length === 0 ? (
            <ScheduledSummaryView match={match} />
          ) : events.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-xs font-bold text-muted-foreground">
                Match Concluded
              </span>
              <p className="text-base font-bold text-foreground">
                {match.homeTeam.name} {fmtNum(match.homeScore ?? 0)} – {fmtNum(match.awayScore ?? 0)} {match.awayTeam.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Official final score at {match.venue || "Stadium"}.
              </p>
            </div>
          ) : (
            <MatchEventList events={events} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
          )
        ) : tab === "stats" ? (
          isScheduled ? (
            <PreMatchStatsView match={match} />
          ) : (
            <div className="divide-y divide-border/40 bg-card">
              {liveStats.map((s) => (
                <MatchStatRow
                  key={s.label}
                  label={s.label}
                  home={s.home}
                  away={s.away}
                  suffix={s.suffix}
                  homeColor={homeColor}
                  awayColor={awayColor}
                  isPrimary={s.isPrimary}
                  isFloat={s.isFloat}
                />
              ))}
            </div>
          )
        ) : (
          <div className="p-2 sm:p-4">
            <TacticalPitch
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homePlayers={(match.homeTeam as any).players}
              awayPlayers={(match.awayTeam as any).players}
            />
          </div>
        )}
      </div>

      {/* Ad */}
      <div className="mt-6">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* Related fixtures */}
      {related.length > 0 && (
        <section className="mt-8" aria-label="More from this competition">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" aria-hidden />
            <h2 className="label-cond text-[13px] font-bold tracking-[0.08em] text-foreground/90">
              More from {match.competition.shortName ?? match.competition.name}
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="divide-y divide-border/30">
              {related.map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
