"use client";

import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import type { CompetitionRef, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamCrest } from "@/components/football/team-badge";
import { FormDots } from "@/components/football/live-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Trophy, Goal, Zap, ChevronRight } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   Standings — league tables hub.
   "All" stacks every table that exists (BFL first, then the big
   leagues); selecting a competition narrows to its table, scorers
   and form leaders. One shared query key per competition keeps the
   chip switches instant.
   ════════════════════════════════════════════════════════════════ */

/** Full competition record as served by /api/competitions. */
type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  _count?: { matches: number };
};

/** /api/standings?competitionId= response body. */
type StandingsData = {
  standings: Standing[];
  competition: Competition | null;
  topScorers: Scorer[];
};

type Scorer = {
  id: string;
  name: string;
  goals: number;
  assists: number;
  position: string;
  team: { id: string; name: string; initials: string; color: string; color2?: string; logoUrl?: string | null } | null;
};

const TYPE_LABELS: Record<string, string> = {
  LEAGUE: "League",
  CUP: "Cup",
  INTERNATIONAL: "International",
};

/**
 * Chip rail order — domestic league first, then cups, region, Europe, world.
 * Each entry is a list of lowercase aliases matched against shortName + name.
 */
const COMPETITION_ORDER: string[][] = [
  ["bfl", "bangladesh football league"],
  ["federation cup", "fed cup"],
  ["saff"],
  ["premier league", "epl"],
  ["laliga", "la liga"],
  ["serie a"],
  ["bundesliga"],
  ["ligue 1"],
  ["ucl", "champions league"],
  ["world cup", "wc2026", "wc 2026"],
];

function competitionRank(c: Competition): number {
  const hay = `${c.shortName} ${c.name}`.toLowerCase();
  for (let i = 0; i < COMPETITION_ORDER.length; i++) {
    if (COMPETITION_ORDER[i].some((alias) => hay.includes(alias))) return i;
  }
  return COMPETITION_ORDER.length;
}

/** Chips in broadcast priority order — BFL first, unmatched competitions last. */
function orderedCompetitions(comps: Competition[]): Competition[] {
  return [...comps].sort((a, b) => {
    const ra = competitionRank(a);
    const rb = competitionRank(b);
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });
}

/** Wins inside the last five form entries. */
function formWins(form: string | null | undefined): number {
  if (!form) return 0;
  return form.slice(-5).split("").filter((c) => c === "W").length;
}

/** A standings row paired with the competition it belongs to. */
type FormEntry = { standing: Standing; compLabel: string };

/** Best recent-form teams (most last-5 wins, then points, then table position). */
function formLeaders(entries: FormEntry[], count = 5): FormEntry[] {
  return [...entries]
    .sort((a, b) => {
      const wa = formWins(a.standing.form);
      const wb = formWins(b.standing.form);
      if (wa !== wb) return wb - wa;
      if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
      return a.standing.position - b.standing.position;
    })
    .slice(0, count);
}

/* ── Shared blocks ─────────────────────────────────────────────── */

function CompChip({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border bg-card text-foreground/75 hover:border-white/20 hover:text-foreground"
      )}
    >
      <span aria-hidden className="h-[7px] w-[7px] rounded-[2px]" style={{ backgroundColor: color }} />
      {label}
    </button>
  );
}

function ScorerRow({ scorer, rank }: { scorer: Scorer; rank: number }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <button
      onClick={() => navigate({ name: "player-detail", id: scorer.id })}
      className="row-hover group flex w-full items-center gap-3 px-4 py-2.5 text-left"
    >
      <span
        className={cn(
          "score-num w-5 shrink-0 text-center text-[16px] font-bold leading-none",
          rank <= 3 ? "text-primary" : "text-muted-foreground/60"
        )}
      >
        {rank}
      </span>
      {scorer.team && <TeamCrest team={scorer.team} size="xs" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">
          {scorer.name}
        </span>
        <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
          {scorer.team?.name ?? "Unattached"}
        </span>
      </span>
      <span className="flex shrink-0 items-baseline gap-1">
        <span className="tabular text-[15px] font-bold leading-none text-foreground">{fmtNum(scorer.goals)}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">G</span>
        <span className="tabular ml-1.5 text-[12.5px] font-medium leading-none text-muted-foreground">
          {fmtNum(scorer.assists)}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">A</span>
      </span>
    </button>
  );
}

function FormLeaderRow({ entry, rank }: { entry: FormEntry; rank: number }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <button
      onClick={() => navigate({ name: "team-detail", id: entry.standing.team.id })}
      className="row-hover group flex w-full items-center gap-3 px-4 py-2.5 text-left"
    >
      <span
        className={cn(
          "score-num w-5 shrink-0 text-center text-[16px] font-bold leading-none",
          rank <= 3 ? "text-primary" : "text-muted-foreground/60"
        )}
      >
        {rank}
      </span>
      <TeamCrest team={entry.standing.team} size="xs" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-foreground transition-colors group-hover:text-primary">
          {entry.standing.team.name}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{entry.compLabel}</span>
      </span>
      <FormDots form={entry.standing.form?.slice(-5)} />
    </button>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt className="shrink-0 text-[11px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-[12px] font-semibold text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   StandingsView
   ════════════════════════════════════════════════════════════════ */

export function StandingsView() {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);
  const [selected, setSelected] = useState<string>("ALL");
  const isAll = selected === "ALL";

  /* ── Competition catalogue (chips) ── */
  const { data: compsData, isLoading: compsLoading } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
    staleTime: 5 * 60_000,
  });

  const comps = orderedCompetitions(compsData?.competitions ?? []);
  const activeChipComp = isAll ? null : comps.find((c) => c.id === selected) ?? null;

  /* ── "All" mode — one standings query per competition ── */
  const tableQueries = useQueries({
    queries: comps.map((c) => ({
      queryKey: ["standings", c.id],
      queryFn: async (): Promise<StandingsData> => {
        const res = await fetch(`/api/standings?competitionId=${c.id}`);
        return res.json().then((j) => j.data);
      },
      enabled: isAll,
      staleTime: 60_000,
    })),
  });

  /* ── Single-competition mode ── */
  const singleQuery = useQuery<StandingsData>({
    queryKey: ["standings", selected],
    queryFn: async () => {
      const res = await fetch(`/api/standings?competitionId=${selected}`);
      return res.json().then((j) => j.data);
    },
    enabled: !isAll,
    staleTime: 60_000,
  });

  /* All-mode tables — only competitions that actually have one. */
  const allTables: Array<{ comp: Competition; data: StandingsData }> = isAll
    ? comps
        .map((c, i) => ({ comp: c, data: tableQueries[i].data }))
        .filter((t): t is { comp: Competition; data: StandingsData } => !!t.data)
        .filter((t) => t.data.standings.length > 0)
    : [];
  const allFirstLoaded = allTables.length > 0;

  /* Single-mode payload — prefer the catalogue record (richer: has match counts). */
  const singleData = singleQuery.data;
  const singleStandings = singleData?.standings ?? [];
  const singleScorers = singleData?.topScorers ?? [];
  const singleComp = activeChipComp ?? singleData?.competition ?? null;

  /* ── Top scorers panel ── */
  const scorers: Scorer[] = isAll
    ? allTables
        .flatMap((t) => t.data.topScorers)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name))
        .slice(0, 10)
    : singleScorers;

  /* ── Form-leader entries for the rail ── */
  const formEntries: FormEntry[] = isAll
    ? allTables.flatMap((t) =>
        t.data.standings.map((s) => ({ standing: s, compLabel: t.comp.shortName ?? t.comp.name }))
      )
    : singleStandings.map((s) => ({ standing: s, compLabel: singleComp?.shortName ?? singleComp?.name ?? "" }));
  const leaders = formLeaders(formEntries);

  /* ── Right rail (xl+): comp meta → ad → form leaders (brief: ad after first widget) ── */
  const rail = (
    <>
      {!isAll && singleComp ? (
        <RailCard title="Competition">
          <dl className="divide-y divide-border/40">
            <MetaRow label="Type" value={TYPE_LABELS[singleComp.type] ?? singleComp.type} />
            <MetaRow label="Country" value={singleComp.country} />
            <MetaRow label="Season" value={singleComp.season} />
            <MetaRow label="Teams" value={fmtNum(singleStandings.length)} />
            <MetaRow label="Matches" value={fmtNum(singleComp._count?.matches ?? 0)} />
          </dl>
        </RailCard>
      ) : null}

      {!isAll && singleComp && <AdSlot placement="SIDEBAR" />}

      {leaders.length > 0 && (
        <RailCard title="Form Leaders">
          <div className="divide-y divide-border/40">
            {leaders.map((e, i) => (
              <FormLeaderRow key={e.standing.id} entry={e} rank={i + 1} />
            ))}
          </div>
        </RailCard>
      )}

      {isAll && <AdSlot placement="SIDEBAR" />}
    </>
  );

  /* ── Chip rail ── */
  const chipsLoading = compsLoading && comps.length === 0;

  return (
    <PageLayout rail={rail}>
      <PageHeader
        title="League Tables"
        kicker="standings"
        icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Every competition table on FHB — domestic leagues and international tournaments, updated after every matchday."
      />

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Competition selector">
        {chipsLoading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-28 shrink-0 rounded-full" />)
        ) : (
          <>
            <CompChip
              active={isAll}
              label="All"
              color="var(--primary)"
              onClick={() => setSelected("ALL")}
            />
            {comps.map((c) => (
              <CompChip
                key={c.id}
                active={selected === c.id}
                label={c.shortName || c.name}
                color={c.accentColor ?? "var(--primary)"}
                onClick={() => setSelected(c.id)}
              />
            ))}
          </>
        )}
      </div>

      {/* ── Tables ── */}
      {isAll ? (
        compsLoading || !allFirstLoaded ? (
          <div className="mt-5 space-y-3" aria-hidden>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[420px] rounded-lg" />
          </div>
        ) : (
          <div>
            {allTables.map((t, i) => (
              <section key={t.comp.id} className={i === 0 ? "reveal mt-5" : "reveal mt-10"} aria-label={`${t.comp.name} table`}>
                <SectionHeader
                  title={t.comp.name}
                  kicker={`${TYPE_LABELS[t.comp.type] ?? t.comp.type} · ${t.comp.country} · season ${t.comp.season}`}
                  actionLabel="Hub"
                  actionView={{ name: "competition-detail", id: t.comp.id }}
                />
                <StandingsTable standings={t.data.standings} />
                {/* In-feed ad after the second table group */}
                {i === 1 && allTables.length > 2 && (
                  <div className="mt-6">
                    <AdSlot placement="IN_FEED" />
                  </div>
                )}
              </section>
            ))}
          </div>
        )
      ) : singleQuery.isLoading || !singleComp ? (
        <div className="mt-5 space-y-3" aria-hidden>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-[420px] rounded-lg" />
        </div>
      ) : singleStandings.length > 0 ? (
        <section className="reveal mt-5" aria-label={`${singleComp.name} standings table`}>
          <SectionHeader
            title={singleComp.name}
            kicker={`${TYPE_LABELS[singleComp.type] ?? singleComp.type} · ${singleComp.country} · season ${singleComp.season}`}
            actionLabel="Hub"
            actionView={{ name: "competition-detail", id: singleComp.id }}
          />
          <StandingsTable standings={singleStandings} />
        </section>
      ) : (
        <div className="reveal mt-5 rounded-lg border border-border bg-card px-4 py-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Trophy className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">No league table for the {singleComp.name}</p>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
            This competition runs as a knockout — follow every tie live on the scores page instead.
          </p>
          <button
            onClick={() => navigate({ name: "scores" })}
            className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden />
            Live Scores
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}

      {/* ── Top scorers ── */}
      {scorers.length > 0 && (
        <section className="reveal mt-10" aria-label="Top scorers">
          <SectionHeader
            title="Top Scorers"
            kicker={isAll ? "all competitions" : (singleComp?.shortName ?? singleComp?.name ?? "golden boot").toLowerCase()}
            icon={<Goal className="h-3.5 w-3.5" aria-hidden />}
          />
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="divide-y divide-border/40">
              {scorers.map((p, i) => (
                <ScorerRow key={`${p.id}-${i}`} scorer={p} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* In-feed ad between the blocks — after the scorers in single mode,
          or in "All" mode when the mid-list slot after the second table didn't fire */}
      {scorers.length > 0 && (!isAll || allTables.length <= 2) && (
        <div className="reveal mt-6">
          <AdSlot placement="IN_FEED" />
        </div>
      )}
    </PageLayout>
  );
}
