"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { MatchRow } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { Shield, Trophy, Goal, Zap, ChevronRight, ChevronLeft, CalendarDays, Flag } from "lucide-react";

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

/* ═══════════════════════════════════════════════════════════════════
   Competitions hub — editorial grid of every competition we cover
   ═══════════════════════════════════════════════════════════════════ */
export function CompetitionsView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  const { data, isLoading } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  const comps = data?.competitions ?? [];

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Competitions"
        kicker="competitions"
        subtitle="Leagues and tournaments we cover"
        icon={<Shield className="h-5 w-5" aria-hidden />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : comps.length === 0 ? (
        <div className="edge-lit rounded-xl border border-border bg-card p-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Shield className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">No competitions are being tracked yet. Check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comps.map((c) => (
              <div key={c.id} className="reveal h-full">
                <button
                  onClick={() => navigate({ name: "competition-detail", id: c.id })}
                  className="card-lift edge-lit group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card p-4 pl-5 text-left sm:p-5 sm:pl-6"
                  aria-label={`View ${c.name} table and fixtures`}
                >
                  {/* Accent edge bar */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-display text-[13px] font-bold tracking-wide text-white"
                        style={{
                          backgroundColor: c.accentColor ?? "var(--primary)",
                          boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.22), inset 0 -3px 6px rgba(0,0,0,0.28)",
                        }}
                      >
                        {(c.shortName || c.name).slice(0, 3).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[15px] font-bold tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
                          {c.name}
                        </h3>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-display text-[10px] font-bold text-muted-foreground">
                            {c.shortName || c.name.slice(0, 3).toUpperCase()}
                          </span>
                          {c.country}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {TYPE_LABELS[c.type] ?? c.type}
                    </span>
                  </div>

                  {c.description && (
                    <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                  )}

                  <div className="mt-auto pt-4">
                    <p className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-[11px] font-semibold">
                      <span className="tabular flex min-w-0 items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                        <span className="truncate">
                          Season {c.season} · {fmtNum(c._count?.matches ?? 0)} matches
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-primary">
                        Table &amp; fixtures
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="reveal mt-8">
            <AdSlot placement="IN_FEED" />
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Competition detail — broadcast hero, table + fixtures tabs, stat rail
   ═══════════════════════════════════════════════════════════════════ */
export function CompetitionDetailView({ competitionId }: { competitionId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();
  const [userTab, setUserTab] = useState<"table" | "matches" | null>(null);

  const { data, isLoading } = useQuery<{
    competition: Competition;
    standings: Standing[];
    matches: Match[];
    topScorers: Array<{
      id: string;
      name: string;
      goals: number;
      assists?: number;
      position?: string;
      team: { id: string; name: string; initials: string; color: string } | null;
    }>;
  }>({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/competitions/${competitionId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !data?.competition) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-5 w-44 rounded-md" />
        <Skeleton className="mt-4 h-44 rounded-xl" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-xl lg:col-span-8" />
          <Skeleton className="h-72 rounded-xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  const { competition, standings, matches, topScorers } = data;
  const accent = competition.accentColor ?? "#12805c";
  const typeLabel = TYPE_LABELS[competition.type] ?? competition.type;
  const shortLabel = competition.shortName || competition.name;
  const hasTable = standings.length > 0;
  const tab = userTab ?? (hasTable ? "table" : "matches");

  // API returns matches by kickoff desc — results stay newest-first, fixtures flip to soonest-first
  const results = matches.filter((m) => m.status === "FINISHED");
  const fixtures = matches.filter((m) => m.status !== "FINISHED").slice().reverse();

  const matchPanel = (
    title: string,
    icon: ReactNode,
    list: Match[],
    emptyNote: string,
  ) => (
    <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <h3 className="flex items-center gap-2.5 font-display text-sm font-bold tracking-[-0.01em] text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/12 text-primary">{icon}</span>
          {title}
        </h3>
        <span className="tabular text-[11px] font-semibold text-muted-foreground">{fmtNum(list.length)}</span>
      </header>
      {list.length > 0 ? (
        <div className="divide-y divide-border/60">
          {list.slice(0, 10).map((m) => (
            <MatchRow key={m.id} match={m} showCompetition={false} />
          ))}
        </div>
      ) : (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">{emptyNote}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Breadcrumb back to the hub ── */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs">
        <button
          onClick={() => navigate({ name: "competitions" })}
          className="flex items-center gap-1 font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Competitions
        </button>
        <span className="text-muted-foreground/40" aria-hidden>
          /
        </span>
        <span className="truncate font-semibold text-foreground">{shortLabel}</span>
      </nav>

      {/* ── Hero band ── */}
      <section
        className="reveal noise stadium-panel pitch-pattern edge-lit relative overflow-hidden rounded-xl border border-border/70"
        aria-label="Competition header"
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: `linear-gradient(115deg, color-mix(in oklab, ${accent} 22%, transparent), transparent 58%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-7 select-none font-display text-[8rem] font-bold leading-none text-white/[0.05] sm:text-[10rem]"
        >
          {shortLabel.slice(0, 3).toUpperCase()}
        </span>

        <div className="relative flex flex-wrap items-center gap-4 p-5 sm:gap-5 sm:p-7">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:h-16 sm:w-16"
            style={{
              backgroundColor: accent,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.24), inset 0 -4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Trophy className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow flex items-center gap-2 text-primary">
              {typeLabel}
              <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
              {competition.country}
            </p>
            <h1 className="display-hero mt-1.5 text-[1.7rem] text-foreground sm:text-3xl">{competition.name}</h1>
            <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary/80" aria-hidden /> Season {competition.season}
              </span>
              <span className="tabular flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary/80" aria-hidden /> {fmtNum(matches.length)} matches
              </span>
            </p>
          </div>
        </div>

        {competition.description && (
          <p
            className="relative mx-5 mb-5 max-w-2xl border-l-2 pl-4 text-[13px] leading-relaxed text-foreground/75 sm:mx-7 sm:mb-7"
            style={{ borderColor: `color-mix(in oklab, ${accent} 60%, transparent)` }}
          >
            {competition.description}
          </p>
        )}
      </section>

      {/* ── Content: 8-col sections + 4-col stat rail ── */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {hasTable && (
            <div
              className="mb-5 grid w-full max-w-sm grid-cols-2 gap-1 rounded-xl border border-border bg-muted/40 p-1"
              role="tablist"
              aria-label="Competition sections"
            >
              {(
                [
                  ["table", "Standings"],
                  ["matches", "Fixtures & Results"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setUserTab(key)}
                  className={cn(
                    "rounded-lg py-2 text-xs font-bold transition-colors",
                    tab === key
                      ? "bg-elevated text-foreground shadow-[0_6px_16px_-10px_rgba(0,0,0,0.7)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {tab === "table" && hasTable ? (
            <section className="reveal" aria-label="Standings table">
              <StandingsTable standings={standings} />
              <ZoneLegend />
            </section>
          ) : (
            <section className="reveal space-y-6" aria-label="Fixtures and results">
              {matchPanel("Recent results", <Flag className="h-3.5 w-3.5" aria-hidden />, results, "No results yet — this competition has not kicked off.")}
              {matchPanel("Upcoming fixtures", <CalendarDays className="h-3.5 w-3.5" aria-hidden />, fixtures, "No upcoming fixtures scheduled.")}
            </section>
          )}
        </div>

        {/* Stat rail */}
        <aside className="min-w-0 space-y-6 lg:col-span-4" aria-label="Statistics">
          {topScorers.length > 0 && (
            <section className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card" aria-label="Top scorers">
              <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-[-0.01em] text-foreground">
                  <Goal className="h-4 w-4 text-primary" aria-hidden />
                  Top scorers
                </h3>
                <span className="eyebrow shrink-0 text-muted-foreground">{shortLabel}</span>
              </header>
              <div className="divide-y divide-border/60">
                {topScorers.slice(0, 8).map((p, i) => (
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
                    <span className="tabular shrink-0 font-display text-base font-bold text-primary">{fmtNum(p.goals)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <div className="reveal">
            <AdSlot placement="SIDEBAR" />
          </div>
        </aside>
      </div>
    </div>
  );
}
