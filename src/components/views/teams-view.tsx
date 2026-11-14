"use client";

import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Player, Standing, TeamRef } from "@/lib/types";
import { NATIONAL_TEAM_INITIALS, POSITION_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { TeamCrest } from "@/components/football/team-badge";
import { MatchCard, MatchRow } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { formatKickoff, fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Activity, CalendarDays, ChevronLeft, ChevronRight, Flag, Search, Shield, Trophy, Users, X } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   Teams — club directory + club hub.
   TeamsView:      search + All/Domestic/International chips,
                   league-grouped crest grid, national-teams rail.
   TeamDetailView: focused 860px club page — hero band, next match,
                   recent results, squad by position, league position.
   ════════════════════════════════════════════════════════════════ */

/** Competition ref as returned by the teams API (includes country). */
type TeamCompetition = CompetitionRef & { country?: string | null };

/** Team row from GET /api/teams. */
type TeamListItem = TeamRef & {
  city: string;
  stadium: string;
  founded: number;
  description: string | null;
  standings?: Array<{ position: number; competition: TeamCompetition }>;
  _count?: { players: number };
};

/** Team payload from GET /api/teams/:id (adds the full squad). */
type TeamDetailData = {
  team: TeamListItem & { players?: Player[] };
  matches: Match[];
  standings: Array<Standing & { competition: { id: string; name: string; shortName: string } }>;
};

/** Section of the directory grid (a league, national teams, or search results). */
type TeamSection = {
  id: string;
  title: string;
  kicker: string;
  items: TeamListItem[];
};

const isNationalTeam = (t: { initials: string }) => NATIONAL_TEAM_INITIALS.includes(t.initials);

/** Editorial league order: BFL first, then the big European leagues. */
const COUNTRY_ORDER = ["Bangladesh", "England", "Spain", "Italy", "Germany", "France"];

/** Squad display order — keeper through to attack. */
const SQUAD_POSITIONS = ["GK", "DF", "MF", "FW"];

type TeamFilter = "ALL" | "DOMESTIC" | "INTERNATIONAL";

const TEAM_FILTERS: Array<{ key: TeamFilter; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "DOMESTIC", label: "Domestic" },
  { key: "INTERNATIONAL", label: "International" },
];

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 21 → "21st" … */
function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${fmtNum(n)}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}

/** League of a team row (first standings entry), if any. */
function leagueOf(t: TeamListItem): TeamCompetition | undefined {
  return t.standings?.[0]?.competition;
}

/** Pure helper — client-side search across name, short name and city. */
function searchTeams(all: TeamListItem[], query: string): TeamListItem[] {
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.shortName ?? "").toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q)
  );
}

/** Pure helper — group clubs by league in editorial order (BFL first). */
function groupClubsByLeague(clubs: TeamListItem[]): Array<{ comp: TeamCompetition; items: TeamListItem[] }> {
  const byComp = new Map<string, { comp: TeamCompetition; items: TeamListItem[] }>();
  for (const t of clubs) {
    const comp = leagueOf(t);
    if (!comp) continue;
    const existing = byComp.get(comp.id);
    byComp.set(comp.id, existing ? { ...existing, items: [...existing.items, t] } : { comp, items: [t] });
  }
  return Array.from(byComp.values()).sort((a, b) => {
    const ia = COUNTRY_ORDER.indexOf(a.comp.country ?? "");
    const ib = COUNTRY_ORDER.indexOf(b.comp.country ?? "");
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.comp.name.localeCompare(b.comp.name);
  });
}

/** Pure helper — sections to render for the current filter / search. */
function buildSections(opts: {
  query: string;
  filter: TeamFilter;
  clubs: TeamListItem[];
  national: TeamListItem[];
}): TeamSection[] {
  const { query, filter, clubs, national } = opts;
  const list: TeamSection[] = [];

  if (query) {
    const pool = filter === "INTERNATIONAL" ? national : filter === "DOMESTIC" ? clubs : [...clubs, ...national];
    list.push({
      id: "search",
      title: `Results for “${query}”`,
      kicker: `${fmtNum(pool.length)} ${pool.length === 1 ? "team" : "teams"}`,
      items: pool,
    });
    return list;
  }

  if (filter !== "INTERNATIONAL") {
    for (const g of groupClubsByLeague(clubs)) {
      list.push({
        id: g.comp.id,
        title: g.comp.country === "Bangladesh" ? "BFL Clubs" : g.comp.name,
        kicker: g.comp.country === "Bangladesh" ? "bangladesh football league" : (g.comp.country ?? "league").toLowerCase(),
        items: g.items,
      });
    }
  }
  if (filter !== "DOMESTIC" && national.length > 0) {
    list.push({ id: "national", title: "National Teams", kicker: "international squads", items: national });
  }
  return list;
}

/* ════════════════════════════════════════════════════════════════
   TeamsView — club directory
   ════════════════════════════════════════════════════════════════ */

export function TeamsView() {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);

  const [filter, setFilter] = useState<TeamFilter>("ALL");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());

  const { data, isLoading } = useQuery<{ teams: TeamListItem[] }>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      return res.json().then((j) => j.data);
    },
  });

  const allTeams = data?.teams ?? [];
  const allClubs = allTeams.filter((t) => !isNationalTeam(t));
  const allNational = allTeams.filter(isNationalTeam);

  /* Search runs inside the active filter. */
  const searched = searchTeams(allTeams, debouncedQuery);
  const visibleClubs = searched.filter((t) => !isNationalTeam(t));
  const visibleNational = searched.filter(isNationalTeam);

  const sections = buildSections({
    query: debouncedQuery,
    filter,
    clubs: visibleClubs,
    national: visibleNational,
  }).filter((s) => s.items.length > 0);

  /* Result count line under the controls. */
  const countLine = debouncedQuery
    ? `${fmtNum(searched.length)} ${searched.length === 1 ? "result" : "results"} for “${debouncedQuery}”`
    : filter === "DOMESTIC"
      ? `${fmtNum(allClubs.length)} clubs`
      : filter === "INTERNATIONAL"
        ? `${fmtNum(allNational.length)} national teams`
        : `${fmtNum(allClubs.length)} clubs · ${fmtNum(allNational.length)} national teams`;

  const rail = (
    <>
      {allNational.length > 0 && (
        <RailCard title="National Teams">
          <div className="divide-y divide-border/40">
            {allNational.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate({ name: "team-detail", id: t.id })}
                className="row-hover group flex w-full items-center gap-2.5 px-4 py-2.5 text-left"
              >
                <TeamCrest team={t} size="xs" />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t.name}
                </span>
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </RailCard>
      )}
      <AdSlot placement="SIDEBAR" />
    </>
  );

  return (
    <PageLayout rail={rail}>
      <PageHeader
        title="Teams"
        kicker="clubs & national sides"
        icon={<Shield className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Every club and national side covered by FHBD — domestic leagues and international squads."
      />

      {/* ── Controls: search + filter chips ── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter teams">
          {TEAM_FILTERS.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === "ALL"
                ? allTeams.length
                : f.key === "DOMESTIC"
                  ? allClubs.length
                  : allNational.length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground/75 hover:border-white/20 hover:text-foreground"
                )}
              >
                {f.label}
                <span className={cn("tabular text-[10.5px]", active ? "opacity-80" : "text-muted-foreground")}>
                  {fmtNum(count)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full xl:w-72 xl:flex-none">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs, cities…"
            aria-label="Search teams"
            className="h-9 rounded-[6px] border-border bg-card pl-10 pr-10 text-[13px]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="tap-target absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11.5px] text-muted-foreground">{countLine}</p>

      {/* ── Directory grid ── */}
      {isLoading ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <Skeleton className="mx-auto h-9 w-9 rounded-lg" />
              <Skeleton className="mx-auto mt-3 h-4 w-3/4" />
              <Skeleton className="mx-auto mt-2 h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="reveal mt-3 rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">No teams found</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            {debouncedQuery
              ? `Nothing matches “${debouncedQuery}” under the current filter. Try another spelling or clear the search.`
              : "No teams are listed under this filter yet."}
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("ALL");
            }}
            className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
          >
            Show All Teams
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="mt-3">
          {sections.map((section, idx) => (
            <Fragment key={section.id}>
              <section className={idx === 0 ? "reveal" : "reveal mt-10"} aria-label={section.title}>
                <SectionHeader
                  title={section.title}
                  kicker={section.kicker}
                  icon={section.id === "national" ? <Flag className="h-3.5 w-3.5" aria-hidden /> : undefined}
                  actionLabel={section.id === "search" || section.id === "national" ? undefined : "Hub"}
                  actionView={
                    section.id === "search" || section.id === "national"
                      ? undefined
                      : { name: "competition-detail", id: section.id }
                  }
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {section.items.map((t) => (
                    <TeamCard key={t.id} team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
                  ))}
                </div>
              </section>
              {/* In-feed ad after the first grid section */}
              {idx === 0 && sections.length > 1 && (
                <div className="reveal mt-10">
                  <AdSlot placement="IN_FEED" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

/* ── Directory card — crest, name, city/league meta ── */

function TeamCard({ team, onClick }: { team: TeamListItem; onClick: () => void }) {
  const league = leagueOf(team);
  const national = isNationalTeam(team);
  const meta = national ? "National side" : league ? `${team.city} · ${league.shortName ?? league.name}` : team.city;

  return (
    <button
      onClick={onClick}
      title={team.name}
      className="card-lift group flex w-full flex-col items-center rounded-lg border border-border bg-card p-4 text-center"
    >
      <TeamCrest team={team} size="lg" />
      <h3
        className="mt-3 w-full truncate text-[14px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
        title={team.name}
      >
        {team.name}
      </h3>
      <p className="mt-1 w-full truncate text-[11px] text-muted-foreground" title={meta}>
        {meta}
      </p>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   TeamDetailView — focused club page (860px)
   ════════════════════════════════════════════════════════════════ */

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-[12.5px] font-semibold text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

export function TeamDetailView({ teamId }: { teamId: string }) {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);

  const { data, isLoading } = useQuery<TeamDetailData>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}`);
      return res.json().then((j) => j.data);
    },
  });

  /* Full league table for the "League Position" section (the team API
     only returns the club's own row, not the whole table). */
  const primaryStanding = data?.standings?.[0];
  const { data: leagueData, isLoading: leagueLoading } = useQuery<{ standings: Standing[] }>({
    queryKey: ["standings", primaryStanding?.competition.id],
    queryFn: async () => {
      const res = await fetch(`/api/standings?competitionId=${primaryStanding!.competition.id}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!primaryStanding,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7" aria-hidden>
        <Skeleton className="h-8 w-24 rounded-[6px]" />
        <Skeleton className="mt-4 h-44 rounded-xl" />
        <div className="mt-10">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-4 h-40 rounded-lg" />
        </div>
        <div className="mt-10">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-4 h-56 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data?.team) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <button
          onClick={() => useAppStore.getState().back()}
          className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="rounded-lg border border-border bg-card px-4 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">Team not found</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            This club profile is no longer available. Head back to the directory to browse all teams.
          </p>
          <button
            onClick={() => navigate({ name: "teams" })}
            className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
          >
            Back to Teams
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  const { team, matches, standings } = data;
  const players = team.players ?? [];
  const national = isNationalTeam(team);
  const primaryComp = primaryStanding?.competition;

  /* Fixtures arrive kickoff-desc — flip for "next", keep desc for recent. */
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
  const nextMatch = upcoming[0];
  const recent = matches.filter((m) => m.status !== "SCHEDULED").slice(0, 5);

  /* Squad grouped GK → DF → MF → FW (unknown codes appended). */
  const groupOrder = [
    ...SQUAD_POSITIONS,
    ...Array.from(new Set(players.map((p) => p.position).filter((pos) => !SQUAD_POSITIONS.includes(pos)))),
  ];
  const squadGroups = groupOrder
    .map((pos) => ({ pos, items: players.filter((p) => p.position === pos) }))
    .filter((g) => g.items.length > 0);

  /* League table rows — always include the club's own row. */
  const leagueStandings = leagueData?.standings ?? [];
  const teamRow = leagueStandings.find((s) => s.team.id === teamId);
  const tableLimit = teamRow
    ? Math.min(Math.max(10, teamRow.position + 2), Math.max(leagueStandings.length, 10))
    : 10;

  const nextOpponent = nextMatch
    ? nextMatch.homeTeam.id === teamId
      ? nextMatch.awayTeam
      : nextMatch.homeTeam
    : null;

  const facts: Array<{ label: string; value: string }> = [
    ...(primaryComp ? [{ label: "League", value: primaryComp.shortName ?? primaryComp.name }] : []),
    ...(teamRow ? [{ label: "Position", value: `${ordinal(teamRow.position)} · ${fmtNum(teamRow.points)} pts` }] : []),
    ...(nextMatch
      ? [{ label: "Next Match", value: `${formatKickoff(nextMatch.kickoff).relative} vs ${nextOpponent?.shortName ?? nextOpponent?.name ?? "TBC"}` }]
      : []),
    { label: "Founded", value: fmtNum(team.founded) },
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

      {/* ── Hero band ── */}
      <section
        className="reveal overflow-hidden rounded-xl border border-border bg-card"
        aria-label={`${team.name} profile`}
      >
        <div className="flex flex-wrap items-center gap-5 p-5 sm:p-6">
          <TeamCrest team={team} size="match" />
          <div className="min-w-0 flex-1">
            {national && (
              <span className="label-cond mb-2 inline-flex items-center gap-1.5 rounded-[4px] bg-secondary px-2 py-1 text-[10px] font-bold text-primary">
                <Flag className="h-3 w-3" aria-hidden /> National Team
              </span>
            )}
            <h1 className="label-cond truncate text-[24px] font-bold leading-none text-foreground sm:text-[26px]" title={team.name}>
              {team.name}
            </h1>
            <p className="mt-2 truncate text-[12.5px] text-muted-foreground" title={`${team.city} · ${team.stadium}`}>
              {team.city} · {team.stadium}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-border px-5 py-4 sm:grid-cols-4 sm:px-6">
          {facts.map((f) => (
            <FactCell key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </section>

      {/* ── Next match ── */}
      <section className="reveal mt-10" aria-label="Next match">
        <SectionHeader
          title="Next Match"
          kicker="upcoming fixture"
          icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden />}
        />
        {nextMatch ? (
          <MatchCard match={nextMatch} />
        ) : (
          <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No fixtures scheduled</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check back closer to matchday for confirmed kick-offs.
            </p>
          </div>
        )}
      </section>

      {/* ── Recent results ── */}
      <section className="reveal mt-10" aria-label="Recent results">
        <SectionHeader
          title="Recent Results"
          kicker="last five"
          icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
        />
        {recent.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="divide-y divide-border/40">
              {recent.map((m) => (
                <MatchRow key={m.id} match={m} showCompetition />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No results yet this season</p>
            <p className="mt-1 text-xs text-muted-foreground">Finished matches will appear here once recorded.</p>
          </div>
        )}
      </section>

      {/* ── Squad ── */}
      <section className="reveal mt-10" aria-label="Squad">
        <SectionHeader
          title="Squad"
          kicker={players.length > 0 ? `${fmtNum(players.length)} players` : "first team"}
          icon={<Users className="h-3.5 w-3.5" aria-hidden />}
        />
        {squadGroups.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No squad data published yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The full roster for this club has not been released.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {squadGroups.map((g, gi) => (
              <div key={g.pos} className={gi > 0 ? "border-t border-border" : undefined}>
                <div className="flex items-center justify-between bg-elevated/60 px-4 py-2">
                  <span className="label-cond text-[11.5px] font-bold tracking-[0.08em] text-foreground/85">
                    {POSITION_LABELS[g.pos] ?? g.pos}s
                  </span>
                  <span className="tabular text-[10.5px] text-muted-foreground">{fmtNum(g.items.length)}</span>
                </div>
                <div className="divide-y divide-border/40">
                  {g.items.map((p) => (
                    <SquadRow key={p.id} player={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* In-feed ad between sections */}
      <div className="reveal mt-10">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ── League position ── */}
      {primaryComp && (
        <section className="reveal mt-10" aria-label="League position">
          <SectionHeader
            title="League Position"
            kicker={primaryComp.name.toLowerCase()}
            icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="Full Table"
            actionView={{ name: "standings" }}
          />
          {leagueLoading && leagueStandings.length === 0 ? (
            <Skeleton className="h-[420px] rounded-lg" />
          ) : (
            <StandingsTable
              standings={leagueStandings}
              highlightTeamId={teamId}
              compact
              limit={tableLimit}
            />
          )}
        </section>
      )}
    </div>
  );
}

/* ── Squad row — number, name, position chip, season meta ── */

function SquadRow({ player }: { player: Player & { photoUrl?: string | null } }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <button
      onClick={() => navigate({ name: "player-detail", id: player.id })}
      className="row-hover group flex w-full items-center gap-3 px-4 py-2.5 text-left"
    >
      <span className="tabular w-6 shrink-0 text-center text-[13px] font-semibold text-muted-foreground transition-colors group-hover:text-primary">
        {player.jerseyNumber != null ? fmtNum(player.jerseyNumber) : "–"}
      </span>
      {player.photoUrl ? (
        <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          <img
            src={player.photoUrl}
            alt={player.name}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
        {player.name}
      </span>
      <span className="label-cond shrink-0 rounded-[4px] bg-secondary px-1.5 py-[3px] text-[10px] font-bold text-muted-foreground">
        {player.position}
      </span>
      <span className="tabular shrink-0 text-[11px] text-muted-foreground">
        {fmtNum(player.appearances)} apps · {fmtNum(player.goals)} gls
      </span>
    </button>
  );
}
