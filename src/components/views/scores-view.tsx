"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import type { Match } from "@/lib/types";
import { MatchCard } from "@/components/football/match-card";
import { TeamBadge } from "@/components/football/team-badge";
import { LiveBadge } from "@/components/football/live-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatKickoff, toBn } from "@/lib/format";
import { Zap, MapPin, CalendarDays, Clock, Goal, Flag, ArrowLeftRight, Timer, FileText, ArrowLeft } from "lucide-react";

type Tab = "live" | "upcoming" | "finished";

export function ScoresView() {
  const [tab, setTab] = useState<Tab>("live");
  const live = useLiveScores();
  const liveConnected = live.connected;

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
    live: matches.filter((m) => m.status === "LIVE").length,
    upcoming: matches.filter((m) => m.status === "SCHEDULED").length,
    finished: matches.filter((m) => m.status === "FINISHED").length,
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="লাইভ স্কোর ও ফিক্সচার"
        subtitle="রিয়েল-টাইম আপডেট, কিক-অফ থেকে ফাইনাল হুইসেল পর্যন্ত"
        icon={<Zap className="h-5 w-5" aria-hidden />}
      >
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-bold",
            liveConnected
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted text-muted-foreground"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-[2px]", liveConnected ? "live-dot bg-primary" : "bg-muted-foreground")} aria-hidden />
          {liveConnected ? "রিয়েল-টাইম কানেক্টেড" : "অফলাইন মোড"}
        </span>
      </PageHeader>

      {/* Segmented tabs */}
      <div className="mb-6 flex rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="ম্যাচ ফিল্টার">
        {(
          [
            ["live", "লাইভ", counts.live],
            ["upcoming", "আসছে", counts.upcoming],
            ["finished", "ফলাফল", counts.finished],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition-all",
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {key === "live" && <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />}
            {label}
            <span className="tabular rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {toBn(count)}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {tab === "live"
              ? "এই মুহূর্তে কোনো ম্যাচ লাইভ নেই। ফিক্সচার দেখুন!"
              : tab === "upcoming"
                ? "কোনো আসন্ন ম্যাচ নেই।"
                : "কোনো সম্পন্ন ম্যাচ নেই।"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([compName, list]) => (
            <section key={compName} aria-label={compName}>
              <h2 className="mb-3 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
                {compName}
                <span className="tabular rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {toBn(list.length)}
                </span>
              </h2>
              <div className="space-y-3">
                {list.map((m) => (
                  <MatchCard key={m.id} match={m} showCompetition={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-8">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}

export function MatchDetailView({ matchId }: { matchId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const back = useAppStore((s) => s.back);
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
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-64 rounded-lg" />
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

  const eventIcon = (type: string, className?: string) => {
    switch (type) {
      case "GOAL":
        return <Goal className={cn("h-4 w-4", className)} aria-hidden />;
      case "YELLOW":
        return <span className="h-3.5 w-2.5 rounded-[2px] bg-yellow-400/90" aria-label="হলুদ কার্ড" />;
      case "RED":
        return <span className="h-3.5 w-2.5 rounded-[2px] bg-fhb-red" aria-label="লাল কার্ড" />;
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
    type === "GOAL" ? "গোল" : type === "YELLOW" ? "হলুদ কার্ড" : type === "RED" ? "লাল কার্ড" : type === "SUB" ? "বদলি" : type === "HT" ? "হাফ-টাইম" : type === "FT" ? "সম্পন্ন" : "ইভেন্ট";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label="ফিরে যান"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* ===== Scoreboard ===== */}
      <div className="pitch-pattern overflow-hidden rounded-xl border border-border bg-card">
        {/* Comp strip */}
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5 sm:px-6">
          <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-foreground">
            <span
              className="h-2 w-2 rounded-[2px]"
              style={{ backgroundColor: m.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">{m.competition.name}</span>
            <span className="hidden text-muted-foreground sm:inline">
              {m.round ? `• ${m.round}` : m.matchday ? `• রাউন্ড ${toBn(m.matchday)}` : ""}
            </span>
          </span>
          {status === "LIVE" && <LiveBadge minute={minute} period={period} />}
          {status === "FINISHED" && (
            <span className="rounded-sm bg-muted px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              সম্পন্ন
            </span>
          )}
          {status === "SCHEDULED" && (
            <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 font-display text-[10px] font-bold text-primary">
              {ko.relative}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-8 sm:gap-6 sm:px-6 sm:py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamBadge team={m.homeTeam} size="xl" />
            <p className="max-w-[10rem] text-sm font-bold leading-tight sm:text-base">{m.homeTeam.name}</p>
          </div>
          <div className="shrink-0 px-2 text-center">
            {status === "SCHEDULED" ? (
              <>
                <p className="tabular font-display text-4xl font-bold leading-none sm:text-5xl">{ko.time}</p>
                <p className="mt-2 text-xs text-muted-foreground">{ko.date}</p>
              </>
            ) : (
              <>
                <p className="tabular font-display text-5xl font-bold leading-none text-foreground sm:text-[4rem]">
                  {toBn(homeScore ?? 0)}
                  <span className="mx-2 text-muted-foreground/40 sm:mx-3">-</span>
                  {toBn(awayScore ?? 0)}
                </p>
                {status === "LIVE" && (
                  <p className="mt-3">
                    <LiveBadge minute={minute} period={period} />
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamBadge team={m.awayTeam} size="xl" />
            <p className="max-w-[10rem] text-sm font-bold leading-tight sm:text-base">{m.awayTeam.name}</p>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/30 text-center">
          {[
            { icon: <MapPin className="h-3.5 w-3.5" aria-hidden />, label: "ভেন্যু", value: m.venue ?? "—" },
            { icon: <CalendarDays className="h-3.5 w-3.5" aria-hidden />, label: "তারিখ", value: ko.date },
            { icon: <Clock className="h-3.5 w-3.5" aria-hidden />, label: "কিক-অফ", value: ko.time },
          ].map((meta) => (
            <div key={meta.label} className="px-2 py-3">
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

      {/* ===== Events timeline ===== */}
      <section className="mt-8" aria-label="ম্যাচ ইভেন্ট">
        <h2 className="mb-3 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
          ম্যাচ ইভেন্ট
        </h2>
        {events.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {status === "SCHEDULED"
              ? "ম্যাচ শুরু হলে ইভেন্টগুলো এখানে লাইভ যুক্ত হবে।"
              : "কোনো ইভেন্ট রেকর্ড করা হয়নি।"}
          </p>
        ) : (
          <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-card">
            {events
              .slice()
              .sort((a, b) => b.minute - a.minute)
              .map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    e.teamSide === "away" && "flex-row-reverse text-right"
                  )}
                >
                  <span className="tabular flex h-7 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 font-display text-xs font-bold text-muted-foreground">
                    {toBn(e.minute)}′
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      e.type === "GOAL"
                        ? "bg-primary/15 text-primary"
                        : e.type === "RED"
                          ? "bg-fhb-red/15 text-fhb-red"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {eventIcon(e.type)}
                  </span>
                  <div className={cn("min-w-0 flex-1", e.teamSide === "away" && "text-right")}>
                    <p className="truncate text-sm font-semibold text-foreground">{e.playerName ?? e.detail}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {eventLabel(e.type)}
                      <span className="mx-1" aria-hidden>·</span>
                      {e.teamSide === "home" ? m.homeTeam.name : e.teamSide === "away" ? m.awayTeam.name : ""}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Live commentary note */}
      {status === "LIVE" && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-fhb-red/30 bg-fhb-red/5 p-4">
          <span className="live-dot mt-1 h-2 w-2 shrink-0 rounded-[2px] bg-fhb-red" aria-hidden />
          <div>
            <p className="text-xs font-bold text-fhb-red">রিয়েল-টাইম আপডেট চালু</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              এই ম্যাচের স্কোর ও ইভেন্ট WebSocket-এর মাধ্যমে লাইভ আপডেট হচ্ছে — রিফ্রেশ করার দরকার নেই।
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
