"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Player, Standing, TeamRef } from "@/lib/types";
import { NATIONAL_TEAM_INITIALS, POSITION_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { TeamCrest } from "@/components/football/team-badge";
import { MatchRow } from "@/components/football/match-card";
import { AdSlot } from "@/components/football/ad-slot";
import { FormDots } from "@/components/football/live-badge";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronRight,
  Flag,
  MapPin,
  Search,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   Teams — professional club directory (OneFootball/FotMob grade)
   TeamsView:      search + league filter chips, grouped crest grid
   TeamDetailView: club hero, grouped squad, fixtures, info rail
   ════════════════════════════════════════════════════════════════ */

/** Competition ref as returned by the teams API (includes country). */
type TeamCompetition = CompetitionRef & { country?: string | null };

/** Team row from GET /api/teams. */
type TeamListItem = TeamRef & {
  city: string;
  stadium: string;
  founded: number;
  color2?: string;
  description: string | null;
  standings?: Array<{ position: number; competition: TeamCompetition }>;
  _count?: { players: number };
};

/** Team payload from GET /api/teams/:id (adds the full squad). */
type TeamDetailTeam = TeamListItem & { players?: Player[] };

type TeamDetailData = {
  team: TeamDetailTeam;
  matches: Match[];
  standings: Array<Standing & { competition: { id: string; name: string; shortName: string } }>;
};

const isNationalTeam = (t: { initials: string }) => NATIONAL_TEAM_INITIALS.includes(t.initials);

/** Editorial league order: BFL first, then the big European leagues. */
const COUNTRY_ORDER = ["Bangladesh", "England", "Spain", "Italy", "Germany", "France"];

const SQUAD_POSITIONS = ["GK", "DF", "MF", "FW"];

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

/* ════════════════════════════════════════════════════════════
   TeamsView — club directory
   ════════════════════════════════════════════════════════════ */

export function TeamsView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());

  const { data, isLoading } = useQuery<{ teams: TeamListItem[] }>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      return res.json().then((j) => j.data);
    },
  });

  /** Search runs client-side across name, short name and city. */
  const teams = useMemo(() => {
    const all = data?.teams ?? [];
    if (!debouncedQuery) return all;
    const q = debouncedQuery.toLowerCase();
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.shortName ?? "").toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
    );
  }, [data, debouncedQuery]);
  const national = useMemo(() => teams.filter(isNationalTeam), [teams]);
  const clubs = useMemo(() => teams.filter((t) => !isNationalTeam(t)), [teams]);
  const leagueOf = (t: TeamListItem) => t.standings?.[0]?.competition;

  /** League sections in editorial order (BFL first). */
  const leagueGroups = useMemo(() => {
    const byComp = new Map<string, { comp: TeamCompetition; items: TeamListItem[] }>();
    for (const t of clubs) {
      const comp = leagueOf(t);
      if (!comp) continue;
      const group = byComp.get(comp.id) ?? { comp, items: [] };
      group.items.push(t);
      byComp.set(comp.id, group);
    }
    return [...byComp.values()].sort((a, b) => {
      const ia = COUNTRY_ORDER.indexOf(a.comp.country ?? "");
      const ib = COUNTRY_ORDER.indexOf(b.comp.country ?? "");
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs]);

  const unaffiliated = useMemo(() => clubs.filter((t) => !leagueOf(t)), [clubs]);

  /** Filter chips — All, BFL Clubs, each league, International. */
  const chips = useMemo(() => {
    const leagueChips = leagueGroups.map((g) => ({
      key: g.comp.country ?? g.comp.id,
      label: g.comp.country === "Bangladesh" ? "BFL Clubs" : g.comp.shortName,
      count: g.items.length,
    }));
    return [
      { key: "ALL", label: "All", count: teams.length },
      ...leagueChips,
      { key: "NATIONAL", label: "International", count: national.length },
    ];
  }, [teams.length, national.length, leagueGroups]);

  const activeChip = chips.find((c) => c.key === filter);

  /** Sections to render for the current filter / search. */
  const sections = useMemo(() => {
    type Section = { id: string; title: string; kicker: string; accent?: "red"; items: TeamListItem[] };
    const list: Section[] = [];

    if (debouncedQuery) {
      const items = teams.filter(
        (t) =>
          filter === "ALL" ||
          (filter === "NATIONAL" ? isNationalTeam(t) : leagueOf(t)?.country === filter)
      );
      list.push({
        id: "search",
        title: `Results for "${debouncedQuery}"`,
        kicker: `${fmtNum(items.length)} ${items.length === 1 ? "team" : "teams"}`,
        items,
      });
      return list;
    }

    if (filter === "ALL") {
      for (const g of leagueGroups) {
        list.push({
          id: g.comp.id,
          title: g.comp.country === "Bangladesh" ? "BFL Clubs" : g.comp.name,
          kicker:
            g.comp.country === "Bangladesh"
              ? "bangladesh football league"
              : (g.comp.country ?? "league").toLowerCase(),
          items: g.items,
        });
      }
      if (unaffiliated.length) {
        list.push({ id: "unaffiliated", title: "More Clubs", kicker: "other competitions", items: unaffiliated });
      }
      if (national.length) {
        list.push({ id: "national", title: "National Teams", kicker: "international", accent: "red", items: national });
      }
    } else if (filter === "NATIONAL") {
      if (national.length) {
        list.push({ id: "national", title: "National Teams", kicker: "international", accent: "red", items: national });
      }
    } else {
      const g = leagueGroups.find((x) => (x.comp.country ?? x.comp.id) === filter);
      if (g) {
        list.push({
          id: g.comp.id,
          title: g.comp.country === "Bangladesh" ? "BFL Clubs" : g.comp.name,
          kicker:
            g.comp.country === "Bangladesh"
              ? "bangladesh football league"
              : (g.comp.country ?? "league").toLowerCase(),
          items: g.items,
        });
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filter, teams, leagueGroups, unaffiliated, national]);

  const visibleSections = sections.filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Teams & Clubs"
        kicker="club directory"
        subtitle="115 clubs and national teams — domestic and international"
        icon={<Shield className="h-5 w-5" aria-hidden />}
      >
        {!isLoading && teams.length > 0 && (
          <div className="hidden shrink-0 gap-5 sm:flex" aria-label="Directory stats">
            {[
              [fmtNum(clubs.length), "Clubs"],
              [fmtNum(leagueGroups.length), "Leagues"],
              [fmtNum(national.length), "National teams"],
            ].map(([value, label]) => (
              <div key={label} className="text-right">
                <p className="tabular font-display text-lg font-bold leading-none text-foreground">{value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}
      </PageHeader>

      {/* ── Search + league filter chips ─────────────────────────── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Filter teams by league">
          {chips.map((chip) => (
            <button
              key={chip.key}
              role="tab"
              aria-selected={filter === chip.key}
              onClick={() => setFilter(chip.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-[11.5px] font-bold transition-colors",
                filter === chip.key
                  ? "border-primary/50 bg-primary/12 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "tabular rounded px-1 text-[10px] font-bold leading-[1.4]",
                  filter === chip.key ? "bg-primary/15" : "bg-muted text-muted-foreground"
                )}
              >
                {fmtNum(chip.count)}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-72 xl:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs, cities…"
            aria-label="Search teams"
            className="h-9 rounded-lg border-border bg-card pl-9 pr-9 text-[13px]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* ── Directory grid ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-[164px] rounded-xl" />
          ))}
        </div>
      ) : visibleSections.length === 0 ? (
        <div className="reveal mt-6 flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Search className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">No teams found</p>
          <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
            {debouncedQuery
              ? `Nothing matches "${debouncedQuery}"${activeChip && activeChip.key !== "ALL" ? ` in ${activeChip.label}` : ""}. Try another spelling or clear the filter.`
              : "No clubs are listed under this filter yet."}
          </p>
        </div>
      ) : (
        <div className={cn("space-y-8", debouncedQuery ? "mt-6" : "mt-6")}>
          {visibleSections.map((section) => (
            <section key={section.id} className="reveal" aria-label={section.title}>
              <SectionHeader
                title={section.title}
                kicker={section.kicker}
                accent={section.accent}
                icon={
                  section.accent === "red" ? <Flag className="h-3.5 w-3.5" aria-hidden /> : undefined
                }
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {section.items.map((t) => (
                  <TeamCard key={t.id} team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* In-feed ad after the directory */}
      <div className="reveal mt-8">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}

/* ── Directory card — real crest, club-colour edge, league meta ── */

function TeamCard({ team, onClick }: { team: TeamListItem; onClick: () => void }) {
  const league = team.standings?.[0]?.competition;
  const position = team.standings?.[0]?.position;
  const national = isNationalTeam(team);
  const squadSize = team._count?.players ?? 0;

  return (
    <button
      onClick={onClick}
      title={team.name}
      className="card-lift group relative flex w-full flex-col rounded-xl border border-border bg-card p-4 pl-[18px] text-left"
    >
      {/* Club-colour accent edge */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: team.color }}
      />

      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 items-center">
          <TeamCrest team={team} size="lg" />
        </span>
        <ChevronRight
          className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
          aria-hidden
        />
      </div>

      <h3 className="mt-3 truncate font-display text-sm font-bold leading-tight tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
        {team.name}
      </h3>
      <p className="mt-1 truncate text-[11.5px] leading-tight text-muted-foreground">
        {team.city}
        {squadSize > 0 ? ` · ${fmtNum(squadSize)} ${squadSize === 1 ? "player" : "players"}` : ""}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
        <span className="min-w-0 truncate text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {national ? "International" : (league?.shortName ?? "Unaffiliated")}
        </span>
        {position != null ? (
          <span className="tabular shrink-0 rounded bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {ordinal(position)}
          </span>
        ) : (
          <span className="tabular shrink-0 text-[10px] font-semibold text-muted-foreground/80">
            Est. {fmtNum(team.founded)}
          </span>
        )}
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   TeamDetailView — club page
   ════════════════════════════════════════════════════════════ */

export function TeamDetailView({ teamId }: { teamId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();
  const [squadFilter, setSquadFilter] = useState<string>("ALL");

  const { data, isLoading } = useQuery<TeamDetailData>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6" aria-hidden>
        <Skeleton className="h-5 w-44 rounded-md" />
        <Skeleton className="mt-4 h-52 rounded-xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <Skeleton className="h-[420px] rounded-xl" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-[220px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.team) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <button
          onClick={() => navigate({ name: "teams" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Teams
        </button>
        <div className="mt-4 flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">Team not found</p>
          <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
            This club profile is no longer available. Head back to the directory to browse all teams.
          </p>
        </div>
      </div>
    );
  }

  const { team, matches, standings } = data;
  const players = team.players ?? [];
  const national = isNationalTeam(team);

  const recent = matches.filter((m) => m.status !== "SCHEDULED").slice(0, 5);
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED")
    .reverse()
    .slice(0, 5);

  /** Squad grouped by position (GK → DF → MF → FW, unknown codes appended). */
  const groupOrder = [
    ...SQUAD_POSITIONS,
    ...Array.from(
      new Set(players.map((p) => p.position).filter((pos) => !SQUAD_POSITIONS.includes(pos)))
    ),
  ];
  const groups = groupOrder
    .map((pos) => ({ pos, items: players.filter((p) => p.position === pos) }))
    .filter((g) => g.items.length > 0);
  const visibleGroups = squadFilter === "ALL" ? groups : groups.filter((g) => g.pos === squadFilter);
  const hasFixtures = recent.length > 0 || upcoming.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* Breadcrumb back to the directory */}
      <nav className="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
        <button
          onClick={() => navigate({ name: "teams" })}
          className="flex items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Teams
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
        <span className="font-semibold text-foreground">{team.shortName ?? team.name}</span>
      </nav>

      {/* ── Club hero ────────────────────────────────────────────── */}
      <section
        className="stadium-panel pitch-pattern edge-lit relative mt-4 overflow-hidden rounded-xl border border-border"
        aria-label={`${team.name} profile`}
      >
        {/* Club-colour accent edge */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: team.color }}
        />
        {/* Watermark initials (desktop only — keeps the mobile hero clean) */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-8 hidden select-none font-display text-[8rem] font-bold leading-none text-white/[0.04] sm:block sm:text-[11rem]"
        >
          {team.initials}
        </span>

        <div className="relative flex flex-wrap items-center gap-5 p-5 pl-6 sm:gap-6 sm:p-7 sm:pl-8">
          <TeamCrest team={team} size="match" />
          <div className="min-w-0 flex-1">
            {national && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-primary/12 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-primary">
                <Flag className="h-3 w-3" aria-hidden /> National Team
              </span>
            )}
            <h1 className="display-hero text-[1.7rem] leading-tight text-foreground sm:text-4xl">
              {team.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <HeroChip icon={<MapPin className="h-3 w-3" aria-hidden />} text={team.city} />
              <HeroChip icon={<Building2 className="h-3 w-3" aria-hidden />} text={team.stadium} />
              <HeroChip icon={<CalendarDays className="h-3 w-3" aria-hidden />} text={`Founded ${fmtNum(team.founded)}`} />
              {standings[0] && (
                <HeroChip icon={<Trophy className="h-3 w-3" aria-hidden />} text={standings[0].competition.name} />
              )}
            </div>
          </div>
        </div>

        {team.description && (
          <p className="relative max-w-[65ch] border-t border-border/60 px-5 py-4 pl-6 text-[13px] leading-relaxed text-muted-foreground sm:px-7 sm:pl-8">
            {team.description}
          </p>
        )}

        {standings.length > 0 && (
          <div className="relative flex flex-wrap gap-2 border-t border-border/60 px-5 py-3.5 pl-6 sm:px-7 sm:pl-8">
            {standings.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-[11.5px] font-semibold text-foreground/90"
              >
                <Trophy className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                Currently {ordinal(s.position)} in {s.competition.shortName}
                <span className="tabular text-muted-foreground">· {fmtNum(s.points)} pts</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Content + rail ───────────────────────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-8">
          {/* Squad */}
          <section className="reveal" aria-label="Squad">
            <SectionHeader
              title="Squad"
              kicker={`first-team roster · ${fmtNum(players.length)} ${players.length === 1 ? "player" : "players"}`}
            />
            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-foreground">No squad data available</p>
                <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
                  The full roster for this club has not been published yet.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="no-scrollbar mb-3 flex w-fit gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1"
                  role="tablist"
                  aria-label="Filter squad by position"
                >
                  {["ALL", ...groups.map((g) => g.pos)].map((key) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={squadFilter === key}
                      onClick={() => setSquadFilter(key)}
                      title={key === "ALL" ? "All positions" : (POSITION_LABELS[key] ?? key)}
                      className={cn(
                        "shrink-0 rounded-md px-3 py-1.5 text-[11.5px] font-bold transition-colors",
                        squadFilter === key
                          ? "bg-elevated text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {key === "ALL" ? "All" : key}
                    </button>
                  ))}
                </div>
                <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
                  {/* Column labels */}
                  <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2">
                    <span className="w-7 shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">#</span>
                    <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Player</span>
                    <span className="w-9 shrink-0 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Apps</span>
                    <span className="w-9 shrink-0 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Gls</span>
                    <span className="w-11 shrink-0 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Rtg</span>
                    <span className="w-4 shrink-0" aria-hidden />
                  </div>
                  {visibleGroups.map((g) => (
                    <div key={g.pos}>
                      <p className="flex items-center gap-2 border-b border-border bg-elevated/40 px-4 py-1.5">
                        <span className="eyebrow text-primary">
                          {(POSITION_LABELS[g.pos] ?? g.pos)}s
                        </span>
                        <span className="tabular text-[10px] font-bold text-muted-foreground">
                          {fmtNum(g.items.length)}
                        </span>
                      </p>
                      <div className="divide-y divide-border/60">
                        {g.items.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => navigate({ name: "player-detail", id: p.id })}
                            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                          >
                            <span className="tabular w-7 shrink-0 text-center font-display text-[13px] font-bold text-muted-foreground transition-colors group-hover:text-primary">
                              {p.jerseyNumber != null ? fmtNum(p.jerseyNumber) : "–"}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5">
                                <span className="truncate text-[13px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                                  {p.name}
                                </span>
                                {p.isNationalTeam && (
                                  <Flag className="h-3 w-3 shrink-0 text-primary" aria-label="National team player" />
                                )}
                              </span>
                              <span className="mt-0.5 block truncate text-[10.5px] leading-tight text-muted-foreground">
                                {p.nationality}
                              </span>
                            </span>
                            <span className="tabular w-9 shrink-0 text-right text-xs text-muted-foreground">
                              {fmtNum(p.appearances)}
                            </span>
                            <span className="tabular w-9 shrink-0 text-right text-xs font-semibold text-foreground">
                              {fmtNum(p.goals)}
                            </span>
                            <span className="tabular w-11 shrink-0 text-right text-xs font-bold text-primary">
                              {fmtNum(p.rating.toFixed(1))}
                            </span>
                            <span className="flex w-4 shrink-0 justify-center">
                              <ChevronRight
                                className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                aria-hidden
                              />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Fixtures & results */}
          <section className="reveal" aria-label="Fixtures and results">
            <SectionHeader
              title="Fixtures & Results"
              kicker={hasFixtures ? "recent form and schedule" : "no matches on record"}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <MatchPanel
                label="Recent results"
                emptyNote="No results yet this season."
                matches={recent}
              />
              <MatchPanel
                label="Upcoming fixtures"
                emptyNote="No upcoming fixtures scheduled."
                matches={upcoming}
              />
            </div>
          </section>
        </div>

        {/* ── Rail: league position, club info, ad ─────────────────── */}
        <aside className="min-w-0 lg:col-span-4" aria-label="Club information">
          <div className="space-y-4">
            {standings.length > 0 && (
              <div className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card">
                <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
                  <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
                  <span className="eyebrow text-foreground">League Position</span>
                </p>
                <div className="divide-y divide-border/60">
                  {standings.map((s) => {
                    const gd = s.goalsFor - s.goalsAgainst;
                    return (
                      <div key={s.id} className="p-4">
                        <p className="text-[12.5px] font-semibold text-foreground">{s.competition.name}</p>
                        <div className="mt-2.5 flex items-end justify-between gap-3">
                          <p className="tabular font-display text-4xl font-bold leading-none text-primary">
                            {ordinal(s.position)}
                          </p>
                          <div className="text-right">
                            <p className="tabular font-display text-xl font-bold leading-none text-foreground">
                              {fmtNum(s.points)}
                              <span className="ml-1 text-[11px] font-semibold text-muted-foreground">pts</span>
                            </p>
                            <p className="tabular mt-1 text-[10.5px] text-muted-foreground">
                              {fmtNum(s.played)} played
                            </p>
                          </div>
                        </div>
                        <p className="tabular mt-3 text-[11px] font-semibold text-muted-foreground">
                          {fmtNum(s.won)}W · {fmtNum(s.drawn)}D · {fmtNum(s.lost)}L
                          <span className={cn("ml-2", gd >= 0 ? "text-primary" : "text-fhb-red")}>
                            GD {gd >= 0 ? "+" : ""}
                            {fmtNum(gd)}
                          </span>
                        </p>
                        {s.form && (
                          <div className="mt-3 flex items-center justify-between">
                            <span className="eyebrow text-muted-foreground">Form</span>
                            <FormDots form={s.form} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => navigate({ name: "standings" })}
                  className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
                >
                  League table
                  <ChevronRight className="h-3 w-3" aria-hidden />
                </button>
              </div>
            )}

            <div className="reveal edge-lit overflow-hidden rounded-xl border border-border bg-card">
              <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
                <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden />
                <span className="eyebrow text-foreground">Club Info</span>
              </p>
              <dl className="divide-y divide-border/60">
                <InfoRow icon={<MapPin className="h-3.5 w-3.5" aria-hidden />} label="City" value={team.city} />
                <InfoRow icon={<Building2 className="h-3.5 w-3.5" aria-hidden />} label="Stadium" value={team.stadium} />
                <InfoRow icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden />} label="Founded" value={fmtNum(team.founded)} />
                <InfoRow
                  icon={<Users className="h-3.5 w-3.5" aria-hidden />}
                  label="Squad size"
                  value={`${fmtNum(players.length)} ${players.length === 1 ? "player" : "players"}`}
                />
              </dl>
            </div>

            <div className="reveal">
              <AdSlot placement="SIDEBAR" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Small building blocks ─────────────────────────────────────── */

function HeroChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
      <span className="text-primary/80">{icon}</span>
      {text}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="flex shrink-0 items-center gap-2 text-[11.5px] text-muted-foreground">
        <span className="text-primary/70">{icon}</span>
        {label}
      </dt>
      <dd className="truncate text-[12px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function MatchPanel({
  label,
  matches,
  emptyNote,
}: {
  label: string;
  matches: Match[];
  emptyNote: string;
}) {
  return (
    <div className="edge-lit h-full overflow-hidden rounded-xl border border-border bg-card">
      <p className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="eyebrow text-muted-foreground">{label}</span>
        {matches.length > 0 && (
          <span className="tabular text-[10px] font-bold text-muted-foreground">{fmtNum(matches.length)}</span>
        )}
      </p>
      {matches.length > 0 ? (
        <div className="divide-y divide-border/60">
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} showCompetition />
          ))}
        </div>
      ) : (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">{emptyNote}</p>
      )}
    </div>
  );
}
