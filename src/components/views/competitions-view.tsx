"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Goal,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Table2,
} from "lucide-react";
import type { CompetitionRef, Match, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { useAppStore } from "@/store/app-store";
import { MatchRow } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fmtNum, formatKickoff } from "@/lib/format";

/* ════════════════════════════════════════════════════════════════
   Competitions hub + competition detail.
   Hub: featured domestic heroes, type filter chips, directory grid.
   Detail: flat hero band, underline tabs (Standings / Fixtures &
   Results / Top Scorers), day-grouped fixture list, scorer table.
   ════════════════════════════════════════════════════════════════ */

type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  logoUrl?: string | null;
  _count?: { matches: number };
};

type TopScorer = {
  id: string;
  name: string;
  goals: number;
  assists: number;
  position: string | null;
  team: { id: string; name: string; initials: string; color: string; color2?: string; logoUrl?: string | null } | null;
};

type TabId = "standings" | "fixtures" | "scorers";

const TYPE_LABELS: Record<string, string> = {
  LEAGUE: "League",
  CUP: "Cup",
  INTERNATIONAL: "International",
};

const TYPE_FILTERS: Array<{ key: string; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "LEAGUE", label: "League" },
  { key: "CUP", label: "Cup" },
  { key: "INTERNATIONAL", label: "International" },
];

/** Domestic-first editorial ordering: BFL, national cup, region, then the world A–Z. */
function orderCompetitions(comps: Competition[]): Competition[] {
  const rank = (c: Competition) => {
    if (c.country === "Bangladesh") return c.type === "LEAGUE" ? 0 : 1;
    if (c.country === "SAFF Region") return 2;
    return 3;
  };
  return [...comps].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/* ────────────────────────────────────────────────────────────────
   Featured hero card — accent tile, meta chips, quiet description.
   ──────────────────────────────────────────────────────────────── */
function FeaturedCompetitionCard({ competition }: { competition: Competition }) {
  const navigate = useAppStore((s) => s.navigate);
  const accent = competition.accentColor ?? "#2CD96B";
  const typeLabel = TYPE_LABELS[competition.type] ?? competition.type;
  const matchCount = competition._count?.matches ?? 0;

  return (
    <button
      onClick={() => navigate({ name: "competition-detail", id: competition.id })}
      className="card-lift group flex h-full w-full flex-col rounded-xl border border-border bg-card p-5 text-left"
      aria-label={`View ${competition.name} tables and fixtures`}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          <Trophy className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="label-cond rounded-[4px] px-2 py-[3px] text-[10px] font-bold tracking-[0.08em] text-white"
              style={{ backgroundColor: accent }}
            >
              {typeLabel}
            </span>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              {competition.country}
            </span>
          </div>
          <h3 className="label-cond mt-2 truncate text-[20px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {competition.shortName}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{competition.name}</p>
        </div>
      </div>

      {competition.description && (
        <p className="mt-3.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {competition.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5 text-[11px]">
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden /> Season {competition.season}
          </span>
          <span className="tabular shrink-0">{fmtNum(matchCount)} matches</span>
        </span>
        <span className="label-cond flex shrink-0 items-center gap-1 text-[10.5px] font-bold tracking-[0.06em] text-primary">
          Explore
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
   Directory tile — the CompetitionsStrip pattern from home-view.
   ──────────────────────────────────────────────────────────────── */
function CompetitionTile({ competition }: { competition: Competition }) {
  const navigate = useAppStore((s) => s.navigate);
  const accent = competition.accentColor ?? "#2CD96B";
  const typeLabel = TYPE_LABELS[competition.type] ?? competition.type;

  return (
    <button
      onClick={() => navigate({ name: "competition-detail", id: competition.id })}
      className="card-lift group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 text-left"
      aria-label={`View ${competition.name}`}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Trophy className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="label-cond block truncate text-[13.5px] font-bold text-foreground">
          {competition.shortName ?? competition.name}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">{competition.name}</span>
      </span>
      <span className="label-cond shrink-0 rounded-[4px] bg-secondary px-1.5 py-[3px] text-[9.5px] font-bold tracking-[0.06em] text-muted-foreground">
        {typeLabel}
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   CompetitionsView — hub directory with rail.
   ════════════════════════════════════════════════════════════════ */
export function CompetitionsView() {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data, isLoading } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions", "directory"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
    staleTime: 5 * 60_000,
  });

  const comps = data?.competitions ?? [];
  const ordered = orderCompetitions(comps);
  const featured = typeFilter === "ALL" ? ordered.slice(0, 2) : [];
  const directory =
    typeFilter === "ALL" ? ordered.slice(2) : ordered.filter((c) => c.type === typeFilter);
  const leagues = ordered.filter((c) => c.type === "LEAGUE").slice(0, 6);
  const activeFilterLabel = TYPE_FILTERS.find((f) => f.key === typeFilter)?.label ?? "All";

  const rail = (
    <>
      <RailCard
        title="Quick Tables"
        action={
          <button
            onClick={() => navigate({ name: "standings" })}
            className="flex items-center gap-0.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            All tables <ChevronRight className="h-3 w-3" aria-hidden />
          </button>
        }
      >
        {leagues.length === 0 ? (
          <div className="space-y-2 p-4" aria-hidden>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-6 w-full rounded-[5px]" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {leagues.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ name: "standings" })}
                className="row-hover flex w-full items-center gap-2.5 px-4 py-2.5 text-left"
              >
                <span
                  aria-hidden
                  className="h-[8px] w-[8px] shrink-0 rounded-[2px]"
                  style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
                />
                <span className="label-cond min-w-0 flex-1 truncate text-[12.5px] font-bold text-foreground/90">
                  {c.shortName}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">{c.country}</span>
              </button>
            ))}
          </div>
        )}
      </RailCard>

      <AdSlot placement="SIDEBAR" />
    </>
  );

  return (
    <PageLayout rail={rail}>
      <PageHeader
        title="Competitions"
        kicker="domestic & worldwide"
        icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
        subtitle="From the BFL to the Champions League — tables, fixtures and top scorers."
      />

      {isLoading ? (
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-hidden>
            <Skeleton className="h-[210px] rounded-xl" />
            <Skeleton className="h-[210px] rounded-xl" />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-hidden>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[68px] rounded-lg" />
            ))}
          </div>
        </div>
      ) : comps.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">No competitions tracked yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The FHB desk is setting up coverage — check back soon.
          </p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="reveal grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Featured competitions">
              {featured.map((c) => (
                <FeaturedCompetitionCard key={c.id} competition={c} />
              ))}
            </section>
          )}

          <div className="reveal mt-6">
            <AdSlot placement="IN_FEED" />
          </div>

          <section className="reveal mt-8" aria-label="All competitions">
            <SectionHeader
              title="All Competitions"
              kicker="full coverage"
              icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
            />
            <div
              className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1"
              role="group"
              aria-label="Filter competitions by type"
            >
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  aria-pressed={typeFilter === f.key}
                  className={cn(
                    "h-8 shrink-0 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
                    typeFilter === f.key
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground/75 hover:border-white/20"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {directory.length === 0 ? (
              <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No {activeFilterLabel.toLowerCase()} competitions in coverage
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try another filter — the FHB desk tracks {fmtNum(comps.length)} competitions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {directory.map((c) => (
                  <CompetitionTile key={c.id} competition={c} />
                ))}
              </div>
            )}
          </section>

          <section className="reveal mt-10 xl:hidden" aria-label="Sidebar promotion">
            <AdSlot placement="SIDEBAR" />
          </section>
        </>
      )}
    </PageLayout>
  );
}

/* ────────────────────────────────────────────────────────────────
   Fixtures — grouped by kickoff day with a quiet date label row.
   ──────────────────────────────────────────────────────────────── */
function groupMatchesByDay(matches: Match[]) {
  const groups = new Map<string, { key: string; ts: number; matches: Match[] }>();
  for (const m of matches) {
    const d = new Date(m.kickoff);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const ts = d.setHours(0, 0, 0, 0);
    const existing = groups.get(key);
    if (existing) existing.matches.push(m);
    else groups.set(key, { key, ts, matches: [m] });
  }
  return Array.from(groups.values()).sort((a, b) => a.ts - b.ts);
}

function FixtureDayList({ matches }: { matches: Match[] }) {
  const groups = groupMatchesByDay(matches);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="divide-y divide-border/60">
        {groups.map((g) => {
          const { date, relative } = formatKickoff(g.matches[0].kickoff);
          const isSpecial = relative !== date;
          return (
            <section key={g.key}>
              <div className="flex items-center justify-between gap-2 border-b border-border bg-elevated/50 px-4 py-2">
                <span className="label-cond truncate text-[12px] font-bold tracking-[0.06em] text-foreground/90">
                  {date}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {isSpecial && (
                    <span className="label-cond rounded-[4px] bg-primary/15 px-1.5 py-[2px] text-[9.5px] font-bold tracking-[0.06em] text-primary">
                      {relative}
                    </span>
                  )}
                  <span className="tabular rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {fmtNum(g.matches.length)}
                  </span>
                </span>
              </div>
              <div className="divide-y divide-border/40">
                {g.matches.map((m) => (
                  <MatchRow key={m.id} match={m} showVenue />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Top scorers — rank tile, crest, goals + assists columns.
   ──────────────────────────────────────────────────────────────── */
function ScorersTable({ scorers }: { scorers: TopScorer[] }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card" aria-label="Top scorers">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_44px_52px] items-center gap-2 border-b border-border bg-elevated/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span className="text-center">#</span>
        <span>Player</span>
        <span className="text-center">Goals</span>
        <span className="text-center">Assists</span>
      </div>
      <div className="divide-y divide-border/50">
        {scorers.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="row-hover grid w-full grid-cols-[28px_minmax(0,1fr)_44px_52px] items-center gap-2 px-4 py-2.5 text-left"
          >
            <span
              className={cn(
                "tabular flex h-6 w-6 items-center justify-center rounded-[4px] text-[11px] font-bold",
                i === 0
                  ? "bg-fhb-gold/15 text-fhb-gold"
                  : i < 3
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <span className="flex min-w-0 items-center gap-2.5">
              {p.team && <TeamCrest team={p.team} size="xs" />}
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-foreground">{p.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {p.team?.name ?? "Unattached"}
                </span>
              </span>
            </span>
            <span className="tabular text-center text-[14px] font-bold text-primary">{fmtNum(p.goals)}</span>
            <span className="tabular text-center text-[13px] font-semibold text-foreground/70">
              {fmtNum(p.assists ?? 0)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CompetitionDetailView — hero band + underline tabs.
   ════════════════════════════════════════════════════════════════ */
export function CompetitionDetailView({ competitionId }: { competitionId: string }) {
  useReveal();
  const [userTab, setUserTab] = useState<TabId | null>(null);

  const { data: tableData, isLoading } = useQuery<{
    standings: Standing[];
    competition: Competition | null;
    topScorers: TopScorer[];
  }>({
    queryKey: ["standings", "competition", competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/standings?competitionId=${competitionId}`);
      return res.json().then((j) => j.data);
    },
  });

  const { data: matchesData, isLoading: matchesLoading } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "window", "90d"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=90&limit=200");
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[980px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="mt-5 h-[150px] w-full rounded-xl" />
        <div className="mt-6 flex gap-1" aria-hidden>
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-44 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <Skeleton className="mt-5 h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!tableData?.competition) {
    return (
      <div className="mx-auto w-full max-w-[980px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <button
          onClick={() => useAppStore.getState().back()}
          className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">Competition not found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This competition may have been retired by the FHB desk.
          </p>
        </div>
      </div>
    );
  }

  const { competition, standings, topScorers } = tableData;
  const accent = competition.accentColor ?? "#2CD96B";
  const typeLabel = TYPE_LABELS[competition.type] ?? competition.type;
  const hasTable = standings.length > 0;
  // Smart default — cups land on fixtures because there is no table to show.
  const tab: TabId = userTab ?? (hasTable ? "standings" : "fixtures");

  const compMatches = (matchesData?.matches ?? [])
    .filter((m) => m.competition.id === competitionId)
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));

  const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
    { id: "standings", label: "Standings", icon: Table2 },
    { id: "fixtures", label: "Fixtures & Results", icon: CalendarDays },
    { id: "scorers", label: "Top Scorers", icon: Goal },
  ];

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      {/* Back */}
      <button
        onClick={() => useAppStore.getState().back()}
        className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {/* Hero band */}
      <section className="reveal overflow-hidden rounded-xl border border-border bg-card" aria-label="Competition header">
        <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px]"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <Trophy className="h-7 w-7" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="label-cond rounded-[4px] px-2 py-[3px] text-[10px] font-bold tracking-[0.08em] text-white"
                style={{ backgroundColor: accent }}
              >
                {typeLabel}
              </span>
              <span className="label-cond rounded-[4px] bg-secondary px-2 py-[3px] text-[10px] font-bold tracking-[0.06em] text-muted-foreground">
                {competition.country}
              </span>
              <span className="label-cond rounded-[4px] bg-secondary px-2 py-[3px] text-[10px] font-bold tracking-[0.06em] text-muted-foreground">
                Season {competition.season}
              </span>
              <span className="tabular rounded-[4px] bg-secondary px-2 py-[3px] text-[10px] font-bold tracking-[0.06em] text-muted-foreground">
                {fmtNum(compMatches.length)} matches
              </span>
            </div>
            <h1 className="label-cond mt-2.5 text-[22px] font-bold leading-none text-foreground sm:text-[26px]">
              {competition.name}
            </h1>
          </div>
        </div>
        {competition.description && (
          <p className="border-t border-border px-5 py-3.5 text-[12.5px] leading-relaxed text-muted-foreground sm:px-6">
            {competition.description}
          </p>
        )}
      </section>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border" role="tablist" aria-label="Competition sections">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setUserTab(t.id)}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-2 px-4 text-[12.5px] font-semibold transition-colors",
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
      <div className="mt-5">
        {tab === "standings" &&
          (hasTable ? (
            <section className="reveal" aria-label="Standings table">
              <StandingsTable standings={standings} />
            </section>
          ) : (
            <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">No league table for this competition</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {competition.shortName} is played in a knockout format — follow the results instead.
              </p>
              <button
                onClick={() => setUserTab("fixtures")}
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
              >
                View fixtures <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ))}

        {tab === "fixtures" &&
          (matchesLoading ? (
            <div className="space-y-2" aria-hidden>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : compMatches.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">No matches in the current window</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fixtures appear here as soon as this competition has games inside the 90-day window.
              </p>
            </div>
          ) : (
            <section className="reveal" aria-label="Fixtures and results">
              <FixtureDayList matches={compMatches} />
            </section>
          ))}

        {tab === "scorers" &&
          (topScorers.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">No scorer records yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Goals and assists land here once the data desk has processed this competition.
              </p>
            </div>
          ) : (
            <section className="reveal" aria-label="Top scorers">
              <ScorersTable scorers={topScorers} />
            </section>
          ))}
      </div>

      {/* Ad between content sections */}
      <div className="reveal mt-6">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}
