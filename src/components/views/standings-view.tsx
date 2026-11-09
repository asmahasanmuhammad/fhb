"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { Trophy, Goal, Target, Zap, Medal, ChevronRight } from "lucide-react";

/** Full competition record as served by /api/competitions. */
type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  _count?: { matches: number };
};

const TYPE_LABELS: Record<string, string> = {
  LEAGUE: "League",
  CUP: "Cup",
  INTERNATIONAL: "International",
};

type Scorer = {
  id: string;
  name: string;
  goals: number;
  assists: number;
  position: string;
  team: { id: string; name: string; initials: string; color: string } | null;
};

/** Zone legend — mirrors the colour bars rendered by StandingsTable. */
function ZoneLegend() {
  const items = [
    { cls: "bg-fhb-gold", label: "Champion" },
    { cls: "bg-primary", label: "Championship places" },
    { cls: "bg-fhb-red", label: "Relegation zone" },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-[11px] text-muted-foreground">
      {items.map((z) => (
        <span key={z.label} className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-[2px]", z.cls)} aria-hidden />
          {z.label}
        </span>
      ))}
      <span className="ml-auto hidden pl-4 sm:block">P Played · W Won · D Drawn · L Lost · GD Goal difference</span>
    </div>
  );
}

/** Right-rail ranked list — FotMob-style goals/assists leader panel. */
function LeaderPanel({
  title,
  icon,
  leaders,
  valueKey,
  meta,
}: {
  title: string;
  icon: ReactNode;
  leaders: Scorer[];
  valueKey: "goals" | "assists";
  meta?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <section className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card" aria-label={title}>
      <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-[-0.01em] text-foreground">
          <span className="text-primary">{icon}</span>
          {title}
        </h3>
        {meta && <span className="eyebrow shrink-0 text-muted-foreground">{meta}</span>}
      </header>
      <div className="divide-y divide-border/60">
        {leaders.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
          >
            <span className="tabular w-4 shrink-0 text-center font-display text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary">
              {fmtNum(i + 1)}
            </span>
            {p.team && <TeamCrest team={p.team} size="sm" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">
                {p.name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">{p.team?.name ?? "—"}</span>
            </span>
            <span className="tabular shrink-0 font-display text-base font-bold text-primary">{fmtNum(p[valueKey])}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function StandingsView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  // ── Competition catalogue ──
  const { data: compsData } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  const comps = compsData?.competitions ?? [];
  const [compId, setCompId] = useState<string | null>(null);
  const leagueComp = comps.find((c) => c.type === "LEAGUE");
  const activeId = compId ?? leagueComp?.id ?? null;
  const activeComp = comps.find((c) => c.id === activeId) ?? null;

  // ── Table + player stats for the selected competition ──
  const { data, isLoading } = useQuery<{ standings: Standing[]; topScorers: Scorer[] }>({
    queryKey: ["standings", activeId],
    queryFn: async () => {
      const res = await fetch(`/api/standings${activeId ? `?competitionId=${activeId}` : ""}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!activeId,
  });

  const standings = data?.standings ?? [];
  const scorers = data?.topScorers ?? [];
  const assistLeaders = scorers
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .slice(0, 6);

  const booting = !compsData || (!!activeId && isLoading);

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="League Tables"
        kicker="standings"
        subtitle="Domestic and international competitions"
        icon={<Trophy className="h-5 w-5" aria-hidden />}
      />

      {/* ── Competition pill rail ── */}
      <div
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3.5 sm:mx-0 sm:px-0"
        role="group"
        aria-label="Competition selector"
      >
        {compsData
          ? comps.map((c) => (
              <button
                key={c.id}
                onClick={() => setCompId(c.id)}
                aria-pressed={activeId === c.id}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  activeId === c.id
                    ? "border-border bg-elevated text-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
                  aria-hidden
                />
                {c.shortName || c.name}
              </button>
            ))
          : [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />)}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ═══ Main column — league strip + table ═══ */}
        <div className="min-w-0 lg:col-span-8">
          {/* League header strip */}
          <section className="reveal edge-lit relative overflow-hidden rounded-xl border border-border bg-card" aria-label="Competition header">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{ backgroundColor: activeComp?.accentColor ?? "var(--primary)" }}
            />
            <span aria-hidden className="pitch-pattern absolute inset-0 opacity-50" />
            <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 pl-5 sm:px-5 sm:pl-6">
              <div className="min-w-0">
                <p className="eyebrow flex items-center gap-2 text-primary">
                  {TYPE_LABELS[activeComp?.type ?? ""] ?? activeComp?.type ?? "Competition"}
                  <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                  {activeComp?.country ?? "—"}
                </p>
                <h2 className="mt-1.5 truncate font-display text-lg font-bold tracking-[-0.01em] text-foreground sm:text-xl">
                  {activeComp?.name ?? "Select a competition"}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="tabular rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  Season {activeComp?.season ?? "—"}
                </span>
                <span className="tabular rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {fmtNum(activeComp?._count?.matches ?? 0)} matches
                </span>
              </div>
            </div>
          </section>

          {/* Table / states */}
          <div className="mt-4">
            {booting ? (
              <Skeleton className="h-[460px] rounded-xl" />
            ) : standings.length > 0 ? (
              <section className="reveal" aria-label="Standings table">
                <StandingsTable standings={standings} />
                <ZoneLegend />
              </section>
            ) : activeComp ? (
              <div className="reveal edge-lit rounded-xl border border-border bg-card p-10 text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Trophy className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-display text-sm font-bold text-foreground">No league table for the {activeComp.name}</p>
                <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  This competition uses a cup format — follow every tie live on the{" "}
                  <button onClick={() => navigate({ name: "scores" })} className="font-semibold text-primary hover:underline">
                    Live Scores
                  </button>{" "}
                  page.
                </p>
                <button
                  onClick={() => navigate({ name: "competition-detail", id: activeComp.id })}
                  className="mx-auto mt-5 flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Competition hub
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ) : (
              <div className="edge-lit rounded-xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">Choose a competition from the rail above to view its table.</p>
              </div>
            )}
          </div>

          {/* Quiet cross-links */}
          <div className="reveal mt-8 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate({ name: "scores" })}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Zap className="h-3.5 w-3.5" aria-hidden /> Live Scores
            </button>
            <button
              onClick={() => navigate({ name: "players" })}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Medal className="h-3.5 w-3.5" aria-hidden /> All Players
            </button>
          </div>
        </div>

        {/* ═══ Right rail — leaders + sidebar ad ═══ */}
        <aside className="min-w-0 space-y-6 lg:col-span-4" aria-label="Player statistics">
          {booting ? (
            <>
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-52 rounded-xl" />
            </>
          ) : scorers.length > 0 ? (
            <>
              <LeaderPanel
                title="Top Scorers"
                icon={<Goal className="h-4 w-4" aria-hidden />}
                leaders={scorers.slice(0, 10)}
                valueKey="goals"
                meta={activeComp?.shortName}
              />
              {assistLeaders.length > 0 && (
                <LeaderPanel
                  title="Top Assists"
                  icon={<Target className="h-4 w-4" aria-hidden />}
                  leaders={assistLeaders}
                  valueKey="assists"
                  meta={activeComp?.shortName}
                />
              )}
            </>
          ) : activeComp ? (
            <div className="edge-lit rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-xs text-muted-foreground">No player statistics recorded for this competition yet.</p>
            </div>
          ) : null}
          <div className="reveal">
            <AdSlot placement="SIDEBAR" />
          </div>
        </aside>
      </div>
    </div>
  );
}
