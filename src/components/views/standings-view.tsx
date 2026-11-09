"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Standing, CompetitionRef } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamBadge } from "@/components/football/team-badge";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { Trophy, Goal, Zap, Medal } from "lucide-react";

export function StandingsView() {
  const navigate = useAppStore((s) => s.navigate);
  const [tab, setTab] = useState<"table" | "scorers">("table");
  useReveal();

  const { data: compsData } = useQuery<{ competitions: Array<CompetitionRef & { _count?: { matches: number } }> }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  const leagueComp = compsData?.competitions?.find((c) => c.type === "LEAGUE");
  const [compId, setCompId] = useState<string | null>(null);
  const activeId = compId ?? leagueComp?.id ?? null;

  const { data, isLoading } = useQuery<{
    standings: Standing[];
    topScorers: Array<{ id: string; name: string; goals: number; assists: number; position: string; team: { id: string; name: string; initials: string; color: string } | null }>;
  }>({
    queryKey: ["standings", activeId],
    queryFn: async () => {
      const res = await fetch(`/api/standings${activeId ? `?competitionId=${activeId}` : ""}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!activeId,
  });

  const scorers = data?.topScorers ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="League Table & Stats"
        kicker="standings"
        subtitle="Points table, form guide and top scorers"
        icon={<Trophy className="h-5 w-5" aria-hidden />}
      />

      {/* Competition selector */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {(compsData?.competitions ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setCompId(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95",
              activeId === c.id
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-[3px]"
              style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            {c.name}
          </button>
        ))}
      </div>

      {/* Table / scorers segmented control */}
      <div className="mb-7 grid max-w-sm grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/40 p-1.5" role="tablist" aria-label="Table view">
        {(
          [
            ["table", "Points Table", <Trophy key="t" className="h-3.5 w-3.5" aria-hidden />],
            ["scorers", "Top Scorers", <Goal key="g" className="h-3.5 w-3.5" aria-hidden />],
          ] as const
        ).map(([key, label, icon]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.97]",
              tab === key ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : tab === "table" ? (
        (data?.standings?.length ?? 0) > 0 ? (
          <div className="reveal">
            <StandingsTable standings={data!.standings} />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-1 rounded-sm bg-fhb-gold" /> Championship zone
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-1 rounded-sm bg-fhb-red" /> Relegation zone
              </span>
              <span className="ml-auto border-l border-border pl-4">W = Win · D = Draw · L = Loss · GD = Goal Difference</span>
            </div>
          </div>
        ) : (
          <div className="edge-lit rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              This tournament uses a cup format — no league table applies. See the{" "}
              <button
                onClick={() => navigate({ name: "scores" })}
                className="font-bold text-primary hover:underline"
              >
                Live Scores
              </button>{" "}
              page.
            </p>
          </div>
        )
      ) : (
        <div className="reveal space-y-4">
          {/* Podium — top scorer hero cards */}
          {scorers.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {scorers.slice(0, 3).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => navigate({ name: "player-detail", id: p.id })}
                  className={cn(
                    "card-lift edge-lit relative overflow-hidden rounded-2xl border p-5 text-left",
                    i === 0 ? "gold-panel border-fhb-gold/30" : "border-border bg-card"
                  )}
                >
                  {i === 0 && (
                    <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-fhb-gold/20 font-display text-sm font-bold text-fhb-gold">
                      {fmtNum(1)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "tabular flex h-8 w-8 items-center justify-center rounded-xl font-display text-sm font-bold",
                      i === 0 ? "bg-fhb-gold/20 text-fhb-gold" : i < 3 ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {fmtNum(i + 1)}
                  </span>
                  <div className="mt-3.5 flex items-center gap-3">
                    {p.team && <TeamBadge team={p.team} size="lg" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{p.team?.name ?? "—"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end gap-4 border-t border-border/60 pt-3.5">
                    <div>
                      <p className="tabular flex items-center gap-1.5 font-display text-2xl font-bold leading-none text-primary">
                        <Goal className="h-4 w-4" aria-hidden />
                        {fmtNum(p.goals)}
                      </p>
                      <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Goals</p>
                    </div>
                    <div>
                      <p className="tabular font-display text-2xl font-bold leading-none text-foreground">{fmtNum(p.assists)}</p>
                      <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Assists</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {/* Rest of the list */}
          {scorers.length > 3 && (
            <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
              {scorers.slice(3).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => navigate({ name: "player-detail", id: p.id })}
                  className="group flex w-full items-center gap-3.5 border-b border-border/50 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-accent/50 sm:gap-4 sm:px-5"
                >
                  <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted font-display text-sm font-bold text-muted-foreground group-hover:text-primary">
                    {fmtNum(i + 4)}
                  </span>
                  {p.team && <TeamBadge team={p.team} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.team?.name ?? "—"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6 text-center">
                    <div className="w-12">
                      <p className="tabular flex items-center justify-center gap-1 font-display text-lg font-bold text-primary">
                        <Goal className="h-3.5 w-3.5" aria-hidden />
                        {fmtNum(p.goals)}
                      </p>
                      <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Goals</p>
                    </div>
                    <div className="w-12">
                      <p className="tabular font-display text-lg font-bold text-foreground">{fmtNum(p.assists)}</p>
                      <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Assists</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cross-links */}
      <div className="reveal mt-9 flex flex-wrap gap-3">
        <button
          onClick={() => navigate({ name: "scores" })}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        >
          <Zap className="h-4 w-4" aria-hidden /> Go to Live Scores
        </button>
        <button
          onClick={() => navigate({ name: "players" })}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        >
          <Medal className="h-4 w-4" aria-hidden /> All Players
        </button>
      </div>
    </div>
  );
}
