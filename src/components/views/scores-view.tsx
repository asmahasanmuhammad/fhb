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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatKickoff, toBn } from "@/lib/format";
import { Zap } from "lucide-react";

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
      tab === "live" ? (m: Match) => m.status === "LIVE" : tab === "upcoming" ? (m: Match) => m.status === "SCHEDULED" : (m: Match) => m.status === "FINISHED";
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

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
          <Zap className="h-6 w-6 text-fhb-red" aria-hidden />
          লাইভ স্কোর ও ফিক্সচার
        </h1>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1",
            liveConnected ? "bg-primary/10 text-primary ring-primary/30" : "bg-muted text-muted-foreground ring-border"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", liveConnected ? "live-dot bg-primary" : "bg-muted-foreground")} />
          {liveConnected ? "রিয়েল-টাইম কানেক্টেড" : "অফলাইন মোড"}
        </span>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-5">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="gap-1.5 text-xs font-bold">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden /> লাইভ ({matches.filter((m) => m.status === "LIVE").length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs font-bold">
            আসছে
          </TabsTrigger>
          <TabsTrigger value="finished" className="text-xs font-bold">
            ফলাফল
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {tab === "live" ? "এই মুহূর্তে কোনো ম্যাচ লাইভ নেই। ফিক্সচার দেখুন!" : tab === "upcoming" ? "কোনো আসন্ন ম্যাচ নেই।" : "কোনো সম্পন্ন ম্যাচ নেই।"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([compName, list]) => (
            <section key={compName} aria-label={compName}>
              <h2 className="mb-3 border-l-4 border-primary pl-2.5 font-display text-sm font-bold tracking-wide">{compName}</h2>
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
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
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

  const eventIcon = (type: string) =>
    type === "GOAL" ? "⚽" : type === "YELLOW" ? "🟨" : type === "RED" ? "🟥" : type === "HT" ? "⏸️" : type === "FT" ? "🔚" : "📝";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
        ← ফিরে যান
      </button>

      {/* Scoreboard */}
      <div className="hero-glow rounded-2xl border bg-card p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">{m.competition.name}{m.round ? ` • ${m.round}` : m.matchday ? ` • রাউন্ড ${toBn(m.matchday)}` : ""}</span>
          {status === "LIVE" && <LiveBadge minute={minute} period={period} />}
          {status === "FINISHED" && <span className="rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-bold text-muted-foreground">সম্পন্ন</span>}
          {status === "SCHEDULED" && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-display text-[10px] font-bold text-primary">{ko.relative}</span>}
        </div>
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          <div className="flex flex-1 flex-col items-center gap-3">
            <TeamBadge team={m.homeTeam} size="xl" />
            <p className="text-center text-sm font-bold">{m.homeTeam.name}</p>
          </div>
          <div className="shrink-0 text-center">
            {status === "SCHEDULED" ? (
              <>
                <p className="font-display text-3xl font-bold sm:text-4xl">{ko.time}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ko.date}</p>
              </>
            ) : (
              <>
                <p className="font-display text-5xl font-bold tabular-nums text-primary sm:text-6xl">
                  {homeScore}<span className="mx-2 text-muted-foreground/40">-</span>{awayScore}
                </p>
                {status === "LIVE" && (
                  <p className="mt-1.5 inline-block rounded-full bg-fhb-red/10 px-3 py-1 font-display text-xs font-bold text-fhb-red">
                    {period === "HT" ? "হাফ-টাইম" : period === "FT" ? "শেষ" : `${toBn(minute)}′ চলছে`}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-3">
            <TeamBadge team={m.awayTeam} size="xl" />
            <p className="text-center text-sm font-bold">{m.awayTeam.name}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-center text-[11px] text-muted-foreground sm:grid-cols-3">
          <span>🏟️ {m.venue ?? "—"}</span>
          <span>📅 {ko.date}</span>
          <span className="col-span-2 sm:col-span-1">🕕 কিক-অফ {ko.time}</span>
        </div>
      </div>

      {/* Events timeline */}
      <section className="mt-6" aria-label="ম্যাচ ইভেন্ট">
        <h2 className="mb-3 font-display text-lg font-bold tracking-wide">ম্যাচ ইভেন্ট</h2>
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {status === "SCHEDULED" ? "ম্যাচ শুরু হলে ইভেন্টগুলো এখানে লাইভ যুক্ত হবে।" : "কোনো ইভেন্ট রেকর্ড করা হয়নি।"}
          </p>
        ) : (
          <div className="relative space-y-1 rounded-xl border bg-card p-4">
            {events
              .slice()
              .sort((a, b) => b.minute - a.minute)
              .map((e) => (
                <div key={e.id} className={`flex items-center gap-3 rounded-lg px-2 py-2 ${e.teamSide === "home" ? "" : "flex-row-reverse text-right"}`}>
                  <span className="w-10 shrink-0 font-display text-sm font-bold text-muted-foreground">{toBn(e.minute)}′</span>
                  <span className="text-lg" aria-hidden>{eventIcon(e.type)}</span>
                  <div className={`min-w-0 flex-1 ${e.teamSide === "away" ? "text-right" : ""}`}>
                    <p className="truncate text-sm font-semibold">{e.playerName ?? e.detail}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {e.type === "GOAL" ? "গোল" : e.type === "YELLOW" ? "হলুদ কার্ড" : e.type === "RED" ? "লাল কার্ড" : e.detail}
                      {e.teamSide === "home" ? ` • ${m.homeTeam.name}` : e.teamSide === "away" ? ` • ${m.awayTeam.name}` : ""}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Live commentary note */}
      {status === "LIVE" && (
        <div className="mt-6 rounded-xl border border-fhb-red/30 bg-fhb-red/5 p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-fhb-red">
            <span className="live-dot h-2 w-2 rounded-full bg-fhb-red" aria-hidden />
            রিয়েল-টাইম আপডেট চালু
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            এই ম্যাচের স্কোর ও ইভেন্ট WebSocket-এর মাধ্যমে লাইভ আপডেট হচ্ছে — রিফ্রেশ করার দরকার নেই!
          </p>
        </div>
      )}
    </div>
  );
}
