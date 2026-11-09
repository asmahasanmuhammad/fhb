"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { useReveal } from "@/hooks/use-reveal";
import type { Match } from "@/lib/types";
import { MatchCard } from "@/components/football/match-card";
import { TeamBadge } from "@/components/football/team-badge";
import { LiveBadge } from "@/components/football/live-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatKickoff, fmtNum } from "@/lib/format";
import { Zap, MapPin, CalendarDays, Clock, Goal, Flag, ArrowLeftRight, Timer, FileText, ArrowLeft } from "lucide-react";

type Tab = "live" | "upcoming" | "finished";

export function ScoresView() {
  const [userTab, setUserTab] = useState<Tab | null>(null);
  const live = useLiveScores();
  const liveConnected = live.connected;
  useReveal();

  const { data, isLoading } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "scores"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=60&limit=150");
      return res.json().then((j) => j.data);
    },
    refetchInterval: 60_000, // fallback refresh for socket-less situations
  });

  const matches = useMemo(() => {
    const all = data?.matches ?? [];
    const liveIds = new Set(live.matches.map((m) => m.id));
    return all.map((m) => (liveIds.has(m.id) ? { ...m, status: "LIVE" as const } : m));
  }, [data, live.matches]);

  const liveCount = matches.filter((m) => m.status === "LIVE").length;
  // Smart default tab: land on "live" only when matches are actually live
  const tab: Tab = userTab ?? (matches.length > 0 && liveCount === 0 ? "upcoming" : "live");

  const grouped = useMemo(() => {
    const filterFn =
      tab === "live"
        ? (m: Match) => m.status === "LIVE"
        : tab === "upcoming"
          ? (m: Match) => m.status === "SCHEDULED"
          : (m: Match) => m.status === "FINISHED";
    const filtered = matches.filter(filterFn);
    const byComp = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = m.competition.name;
      if (!byComp.has(key)) byComp.set(key, []);
      byComp.get(key)!.push(m);
    }
    for (const list of byComp.values()) {
      list.sort((a, b) =>
        tab === "upcoming" ? +new Date(a.kickoff) - +new Date(b.kickoff) : +new Date(b.kickoff) - +new Date(a.kickoff)
      );
    }
    return [...byComp.entries()];
  }, [matches, tab]);

  const counts = {
    live: liveCount,
    upcoming: matches.filter((m) => m.status === "SCHEDULED").length,
    finished: matches.filter((m) => m.status === "FINISHED").length,
  };

  const selectTab = (t: Tab) => setUserTab(t);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="Live Scores & Fixtures"
        kicker="match centre"
        subtitle="Real-time updates, from kick-off to the final whistle"
        icon={<Zap className="h-5 w-5" aria-hidden />}
      >
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold",
            liveConnected
              ? "border-primary/35 bg-primary/10 text-primary"
              : "border-border bg-muted text-muted-foreground"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-[2px]", liveConnected ? "live-dot bg-primary" : "bg-muted-foreground")} aria-hidden />
          {liveConnected ? "Real-time connected" : "Offline mode"}
        </span>
      </PageHeader>

      {/* Segmented tabs — broadcast switcher */}
      <div className="mb-7 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-muted/40 p-1.5" role="tablist" aria-label="Match filter">
        {(
          [
            ["live", "Live", counts.live, "bg-fhb-red text-white"],
            ["upcoming", "Upcoming", counts.upcoming, "bg-primary text-primary-foreground"],
            ["finished", "Results", counts.finished, "bg-elevated text-foreground"],
          ] as const
        ).map(([key, label, count, activeCls]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => selectTab(key)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.97]",
              tab === key ? cn(activeCls, "shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]") : "text-muted-foreground hover:text-foreground"
            )}
          >
            {key === "live" && tab !== "live" && <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />}
            {label}
            <span
              className={cn(
                "tabular rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                tab === key ? "bg-black/20" : "bg-muted"
              )}
            >
              {fmtNum(count)}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="edge-lit rounded-2xl border border-border bg-card p-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Zap className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">
            {tab === "live"
              ? "No live matches right now. Check the fixtures!"
              : tab === "upcoming"
                ? "No upcoming matches."
                : "No finished matches."}
          </p>
        </div>
      ) : (
        <div className="space-y-9">
          {grouped.map(([compName, list]) => (
            <section key={compName} className="reveal" aria-label={compName}>
              <h2 className="mb-4 flex items-center gap-3">
                <span className="flex h-8 items-center gap-2.5 rounded-full border border-border bg-card pl-1.5 pr-4">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: list[0].competition.accentColor ?? "var(--primary)" }}
                    aria-hidden
                  >
                    {list[0].competition.shortName?.slice(0, 2)}
                  </span>
                  <span className="text-[13px] font-bold text-foreground">{compName}</span>
                  <span className="tabular rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {fmtNum(list.length)}
                  </span>
                </span>
                <span className="h-px flex-1 bg-border" aria-hidden />
              </h2>
              <div className="space-y-3.5">
                {list.map((m) => (
                  <MatchCard key={m.id} match={m} showCompetition={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="reveal mt-10">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}

export function MatchDetailView({ matchId }: { matchId: string }) {
  const back = useAppStore((s) => s.back);
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  const liveData = live.matches.find((m) => m.id === matchId);

  const { data, isLoading } = useQuery<{ match: Match & { events: Array<{ id: string; minute: number; type: string; teamSide: string | null; playerName: string | null; detail: string | null }> } }>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`);
      return res.json().then((j) => j.data);
    },
    refetchInterval: liveData ? 15_000 : false,
  });

  if (isLoading || !data?.match) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
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

  const eventIcon = (type: string, className?: string) => {
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
  };

  const eventLabel = (type: string) =>
    type === "GOAL" ? "Goal" : type === "YELLOW" ? "Yellow Card" : type === "RED" ? "Red Card" : type === "SUB" ? "Substitution" : type === "HT" ? "Half-Time" : type === "FT" ? "Full-Time" : "Event";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-14 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* ═══ Scoreboard — cinematic broadcast panel ═══ */}
      <div className="noise stadium-panel pitch-pattern edge-lit relative overflow-hidden rounded-3xl border border-border/70">
        {/* Comp strip */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-black/20 px-5 py-3 backdrop-blur-sm sm:px-7">
          <span className="flex min-w-0 items-center gap-2.5 text-xs font-bold text-foreground">
            <span
              className="h-2 w-2 rounded-[3px]"
              style={{ backgroundColor: m.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">{m.competition.name}</span>
            <span className="hidden text-muted-foreground sm:inline">
              {m.round ? `• ${m.round}` : m.matchday ? `• Round ${fmtNum(m.matchday)}` : ""}
            </span>
          </span>
          {status === "LIVE" && <LiveBadge minute={minute} period={period} />}
          {status === "FINISHED" && (
            <span className="rounded-md bg-muted px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Finished
            </span>
          )}
          {status === "SCHEDULED" && (
            <span className="rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-primary">
              {ko.relative}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-9 sm:gap-6 sm:px-7 sm:py-12">
          <button
            onClick={() => navigate({ name: "team-detail", id: m.homeTeam.id })}
            className="group flex flex-col items-center gap-3.5 text-center"
          >
            <TeamBadge team={m.homeTeam} size="hero" className="transition-transform group-hover:scale-105" />
            <p className={cn("max-w-[10rem] text-sm font-bold leading-tight transition-colors group-hover:text-primary sm:text-base", !homeWon && awayWon && "text-muted-foreground")}>
              {m.homeTeam.name}
            </p>
          </button>
          <div className="shrink-0 px-2 text-center">
            {status === "SCHEDULED" ? (
              <>
                <p className="tabular font-display text-4xl font-bold leading-none sm:text-5xl">{ko.time}</p>
                <p className="mt-2.5 text-xs text-muted-foreground">{ko.date}</p>
              </>
            ) : (
              <>
                <p className="tabular font-display text-5xl font-bold leading-none text-foreground sm:text-[4.5rem]">
                  {fmtNum(homeScore ?? 0)}
                  <span className="mx-2 text-muted-foreground/35 sm:mx-3">-</span>
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
          <button
            onClick={() => navigate({ name: "team-detail", id: m.awayTeam.id })}
            className="group flex flex-col items-center gap-3.5 text-center"
          >
            <TeamBadge team={m.awayTeam} size="hero" className="transition-transform group-hover:scale-105" />
            <p className={cn("max-w-[10rem] text-sm font-bold leading-tight transition-colors group-hover:text-primary sm:text-base", !awayWon && homeWon && "text-muted-foreground")}>
              {m.awayTeam.name}
            </p>
          </button>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/60 bg-black/20 text-center backdrop-blur-sm">
          {[
            { icon: <MapPin className="h-3.5 w-3.5" aria-hidden />, label: "Venue", value: m.venue ?? "—" },
            { icon: <CalendarDays className="h-3.5 w-3.5" aria-hidden />, label: "Date", value: ko.date },
            { icon: <Clock className="h-3.5 w-3.5" aria-hidden />, label: "Kick-off", value: ko.time },
          ].map((meta) => (
            <div key={meta.label} className="px-2 py-3.5">
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {meta.icon}
                {meta.label}
              </p>
              <p className="mt-1 truncate text-[11px] font-medium text-foreground" title={meta.value}>
                {meta.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Events timeline — SofaScore-style two-sided feed ═══ */}
      <section className="mt-9" aria-label="Match events">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="font-display-bn text-lg font-bold text-foreground">Match Events</h2>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        {events.length === 0 ? (
          <div className="edge-lit rounded-2xl border border-border bg-card p-10 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Timer className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">
              {status === "SCHEDULED"
                ? "Events will appear here live once the match kicks off."
                : "No events recorded yet."}
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Center line */}
            <span className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-border/70 sm:block" aria-hidden />
            {events
              .slice()
              .sort((a, b) => b.minute - a.minute)
              .map((e) => {
                const isHome = e.teamSide === "home";
                const isAway = e.teamSide === "away";
                const isNeutral = !isHome && !isAway;
                return (
                  <div
                    key={e.id}
                    className={cn(
                      "relative flex items-center gap-3 border-b border-border/50 px-4 py-3.5 last:border-0 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6",
                      isNeutral && "sm:bg-muted/30"
                    )}
                  >
                    {/* Home side */}
                    <div className={cn("min-w-0 sm:flex sm:items-center sm:justify-end sm:gap-3", !isHome && "sm:invisible")}>
                      <div className="sm:text-right">
                        <p className="truncate text-[13px] font-semibold text-foreground">{e.playerName ?? e.detail}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {eventLabel(e.type)} · {isHome ? m.homeTeam.name : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex",
                          e.type === "GOAL"
                            ? "bg-primary/15 text-primary"
                            : e.type === "RED"
                              ? "bg-fhb-red/15 text-fhb-red"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {eventIcon(e.type)}
                      </span>
                    </div>

                    {/* Minute chip */}
                    <span className="tabular order-first flex h-8 min-w-[3.25rem] shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 px-2 font-display text-xs font-bold text-muted-foreground sm:order-none sm:mx-auto">
                      {fmtNum(e.minute)}′
                    </span>

                    {/* Away side */}
                    <div className={cn("hidden min-w-0 sm:flex sm:items-center sm:gap-3", !isAway && "sm:invisible")}>
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          e.type === "GOAL"
                            ? "bg-primary/15 text-primary"
                            : e.type === "RED"
                              ? "bg-fhb-red/15 text-fhb-red"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {eventIcon(e.type)}
                      </span>
                      <div>
                        <p className="truncate text-[13px] font-semibold text-foreground">{e.playerName ?? e.detail}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {eventLabel(e.type)} · {isAway ? m.awayTeam.name : ""}
                        </p>
                      </div>
                    </div>

                    {/* Mobile: single row fallback shows event text next to chip */}
                    <div className="min-w-0 flex-1 sm:hidden">
                      <p className="truncate text-[13px] font-semibold text-foreground">{e.playerName ?? e.detail}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {eventLabel(e.type)} · {isHome ? m.homeTeam.name : isAway ? m.awayTeam.name : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Live commentary note */}
      {status === "LIVE" && (
        <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-fhb-red/30 bg-fhb-red/5 p-4.5 p-4">
          <span className="live-dot mt-1 h-2 w-2 shrink-0 rounded-[2px] bg-fhb-red" aria-hidden />
          <div>
            <p className="text-xs font-bold text-fhb-red">Real-time updates on</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This match's score and events update live over WebSocket — no refresh needed.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}
