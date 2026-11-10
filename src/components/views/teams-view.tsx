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

type TeamCompetition = CompetitionRef & { country?: string | null };

type TeamListItem = TeamRef & {
  city: string;
  stadium: string;
  founded: number;
  color2?: string;
  description: string | null;
  standings?: Array<{ position: number; competition: TeamCompetition }>;
  _count?: { players: number };
};

type TeamDetailTeam = TeamListItem & { players?: Player[] };

type TeamDetailData = {
  team: TeamDetailTeam;
  matches: Match[];
  standings: Array<Standing & { competition: { id: string; name: string; shortName: string } }>;
};

const isNationalTeam = (t: { initials: string }) => NATIONAL_TEAM_INITIALS.includes(t.initials);
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

function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${fmtNum(n)}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}

export function TeamsView() {
  const navigate = useAppStore((s) => s.navigate);
  const language = useAppStore((s) => s.language);
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
  }, [clubs]);

  const unaffiliated = useMemo(() => clubs.filter((t) => !leagueOf(t)), [clubs]);

  const chips = useMemo(() => {
    const leagueChips = leagueGroups.map((g) => ({
      key: g.comp.country ?? g.comp.id,
      label: g.comp.country === "Bangladesh" ? "BFL (Bangladesh)" : g.comp.shortName,
      count: g.items.length,
    }));
    return [
      { key: "ALL", label: "All Clubs", count: teams.length },
      ...leagueChips,
      { key: "NATIONAL", label: "National Teams", count: national.length },
    ];
  }, [teams.length, national.length, leagueGroups]);

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
        title: `Search: "${debouncedQuery}"`,
        kicker: `${fmtNum(items.length)} clubs found`,
        items,
      });
      return list;
    }

    if (filter === "ALL") {
      for (const g of leagueGroups) {
        list.push({
          id: g.comp.id,
          title: g.comp.country === "Bangladesh" ? "Bangladesh Premier League (BFL)" : g.comp.name,
          kicker: g.comp.country === "Bangladesh" ? "domestic football" : (g.comp.country ?? "league").toLowerCase(),
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
          title: g.comp.country === "Bangladesh" ? "Bangladesh Premier League (BFL)" : g.comp.name,
          kicker: g.comp.country === "Bangladesh" ? "domestic football" : (g.comp.country ?? "league").toLowerCase(),
          items: g.items,
        });
      }
    }
    return list;
  }, [debouncedQuery, filter, teams, leagueGroups, unaffiliated, national]);

  const visibleSections = sections.filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Editorial Header ── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-5 w-1 bg-red-500 shadow-[0_0_10px_rgba(255,30,70,0.8)] shrink-0" aria-hidden />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              OFFICIAL CLUB DIRECTORY
            </span>
          </div>
          <h1 className="font-black text-[26px] sm:text-[34px] text-white leading-tight drop-shadow-sm">
            {language === "bn" ? "ক্লাব ও দলসমূহ" : "Teams & Clubs Hub"}
          </h1>
          <p className="text-[13px] text-slate-300 font-medium mt-1">
            Official profiles for {fmtNum(teams.length)} domestic BFL clubs, European giants and national teams.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs, cities, stadiums..."
            className="w-full h-10 border border-white/20 bg-[#0b101d] pl-9 pr-8 text-xs font-semibold text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 focus:outline-none rounded"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── League Filter Tabs ── */}
      <div className="reveal mb-6 flex items-center gap-0 border-b border-white/15 overflow-x-auto no-scrollbar">
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={cn(
              "shrink-0 pb-3 pt-1 px-4 text-[12px] font-black uppercase tracking-wider border-b-2 transition-colors",
              filter === chip.key
                ? "border-red-500 text-white shadow-[0_4px_12px_rgba(255,30,70,0.3)]"
                : "border-transparent text-slate-300 hover:text-white"
            )}
          >
            {chip.label}
            <span className="ml-1.5 text-[10.5px] font-bold text-slate-400">({fmtNum(chip.count)})</span>
          </button>
        ))}
      </div>

      {/* Leaderboard ad */}
      <div className="reveal mb-8">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      {/* ── Teams Directory Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] bg-[#0b101d]" />
          ))}
        </div>
      ) : visibleSections.length === 0 ? (
        <div className="border border-white/15 bg-[#0b101d] px-6 py-16 text-center rounded">
          <Shield className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="font-black text-lg text-white">No teams match your search</p>
          <p className="mt-1 text-xs text-slate-300">Try searching with a different spelling or clear the filter.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleSections.map((section) => (
            <section key={section.id} className="reveal">
              {/* Section title with red bar */}
              <div className="flex items-center gap-2.5 mb-4 border-b border-white/15 pb-2.5">
                <span className="h-4 w-1 bg-red-500 shadow-[0_0_8px_rgba(255,30,70,0.8)]" />
                <h2 className="font-black text-[15px] uppercase tracking-wider text-white">
                  {section.title}
                </h2>
                <span className="ml-auto text-[11px] font-black text-slate-300 uppercase tracking-widest">
                  {section.kicker}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {section.items.map((t) => (
                  <TeamCard key={t.id} team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Bottom in-feed ad */}
      <div className="reveal mt-10">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}

function TeamCard({ team, onClick }: { team: TeamListItem; onClick: () => void }) {
  const league = team.standings?.[0]?.competition;
  const position = team.standings?.[0]?.position;
  const national = isNationalTeam(team);

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col justify-between border border-white/15 bg-[#0b101d] p-4 text-left transition-all hover:border-red-500/60 hover:bg-[#11172a] hover:shadow-[0_4px_20px_rgba(255,30,70,0.15)] rounded"
    >
      {/* Club color left accent */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: team.color || "#ff1e46" }}
      />

      {/* Top crest + badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <TeamCrest team={team} size="md" />
        {position != null ? (
          <span className="px-2 py-0.5 text-[9.5px] font-black uppercase text-red-300 bg-red-600/30 border border-red-500/40 rounded">
            {ordinal(position)}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-300">
            Est. {team.founded}
          </span>
        )}
      </div>

      {/* Name + stadium info */}
      <div>
        <p className="font-black text-[14.5px] text-white leading-tight group-hover:text-red-400 transition-colors line-clamp-1 drop-shadow-sm">
          {team.name}
        </p>
        <p className="mt-1 text-[11.5px] text-slate-300 font-medium truncate">
          {team.city} · {team.stadium}
        </p>
      </div>

      {/* Footer league */}
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10.5px] font-black uppercase tracking-wider text-slate-300">
        <span>{national ? "National Team" : (league?.shortName ?? "BFL")}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

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
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-56 bg-[#0b101d]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[400px] lg:col-span-8 bg-[#0b101d]" />
          <Skeleton className="h-[400px] lg:col-span-4 bg-[#0b101d]" />
        </div>
      </div>
    );
  }

  if (!data?.team) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <button
          onClick={() => navigate({ name: "teams" })}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Teams
        </button>
        <div className="border border-white/15 bg-[#0b101d] px-6 py-16 text-center rounded">
          <p className="font-black text-white text-base">Club profile not found</p>
        </div>
      </div>
    );
  }

  const { team, matches, standings } = data;
  const players = team.players ?? [];
  const national = isNationalTeam(team);

  const recent = matches.filter((m) => m.status !== "SCHEDULED").slice(0, 5);
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").reverse().slice(0, 5);

  const groupOrder = [
    ...SQUAD_POSITIONS,
    ...Array.from(new Set(players.map((p) => p.position).filter((pos) => !SQUAD_POSITIONS.includes(pos)))),
  ];
  const groups = groupOrder
    .map((pos) => ({ pos, items: players.filter((p) => p.position === pos) }))
    .filter((g) => g.items.length > 0);
  const visibleGroups = squadFilter === "ALL" ? groups : groups.filter((g) => g.pos === squadFilter);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate({ name: "teams" })}
        className="flex items-center gap-1.5 text-[11px] font-black text-slate-300 hover:text-white mb-4 uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Teams Directory
      </button>

      {/* ── Club Hero Banner ── */}
      <div className="relative border border-white/20 bg-[#0b101d] p-6 sm:p-8 overflow-hidden mb-8 rounded shadow-xl">
        {/* Accent strip */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: team.color || "#ff1e46" }}
        />

        {/* Ambient glow */}
        <div className="absolute inset-0 stadium-glow pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center gap-6">
          <TeamCrest team={team} size="match" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-red-600/25 border border-red-500/40 text-red-300 rounded">
                {national ? "National Football Team" : (standings[0]?.competition.name ?? "Official Club")}
              </span>
              <span className="text-slate-400 text-[11px]">·</span>
              <span className="text-slate-300 text-[11px] font-bold">Est. {team.founded}</span>
            </div>
            <h1 className="font-black text-2xl sm:text-4xl text-white leading-tight drop-shadow-sm">
              {team.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="flex items-center gap-1 border border-white/15 bg-white/[0.05] px-3 py-1 font-semibold rounded">
                <MapPin className="h-3 w-3 text-red-400" /> {team.city}
              </span>
              <span className="flex items-center gap-1 border border-white/15 bg-white/[0.05] px-3 py-1 font-semibold rounded">
                <Building2 className="h-3 w-3 text-red-400" /> {team.stadium}
              </span>
              <span className="flex items-center gap-1 border border-white/15 bg-white/[0.05] px-3 py-1 font-semibold rounded">
                <Users className="h-3 w-3 text-red-400" /> {fmtNum(players.length)} Registered Players
              </span>
            </div>
          </div>
        </div>

        {team.description && (
          <p className="mt-5 pt-4 border-t border-white/10 text-[13px] text-slate-200 font-medium leading-relaxed max-w-3xl">
            {team.description}
          </p>
        )}
      </div>

      {/* ── Content Grid ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Squad list */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/15 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 bg-red-500 shadow-[0_0_8px_rgba(255,30,70,0.8)]" />
                <h2 className="font-black text-[15px] uppercase tracking-wider text-white">First Team Squad</h2>
              </div>
              <span className="text-[11px] font-black text-slate-300">{fmtNum(players.length)} Players</span>
            </div>

            {/* Position filter */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
              {["ALL", ...groups.map((g) => g.pos)].map((key) => (
                <button
                  key={key}
                  onClick={() => setSquadFilter(key)}
                  className={cn(
                    "px-3 py-1 text-[11px] font-black uppercase rounded transition-colors",
                    squadFilter === key ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "border border-white/15 bg-[#0b101d] text-slate-300 hover:text-white"
                  )}
                >
                  {key === "ALL" ? "All" : key}
                </button>
              ))}
            </div>

            {/* Squad Table */}
            <div className="border border-white/15 bg-[#0b101d] rounded overflow-hidden shadow-lg">
              <div className="flex items-center gap-3 border-b border-white/15 bg-[#06080f] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <span className="w-8">#</span>
                <span className="flex-1">Player</span>
                <span className="w-12 text-center">Pos</span>
                <span className="w-12 text-center">Apps</span>
                <span className="w-12 text-center">Goals</span>
                <span className="w-12 text-right">Rating</span>
              </div>
              <div className="divide-y divide-white/10">
                {visibleGroups.flatMap((g) => g.items).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate({ name: "player-detail", id: p.id })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="w-8 tabular font-mono font-black text-[12px] text-slate-400">
                      {p.jerseyNumber ?? "–"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[13.5px] text-white hover:text-red-400 truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-300">{p.nationality}</p>
                    </div>
                    <span className="w-12 text-center text-[11.5px] font-black text-red-400">{p.position}</span>
                    <span className="w-12 text-center text-[12px] font-bold text-slate-200">{p.appearances}</span>
                    <span className="w-12 text-center text-[12px] font-black text-white">{p.goals}</span>
                    <span className="w-12 text-right tabular font-black text-[13px] text-emerald-400">
                      {p.rating.toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fixtures */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/15 pb-2.5">
              <span className="h-4 w-1 bg-red-500 shadow-[0_0_8px_rgba(255,30,70,0.8)]" />
              <h2 className="font-black text-[15px] uppercase tracking-wider text-white">Fixtures & Results</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/15 bg-[#0b101d] rounded overflow-hidden shadow">
                <p className="border-b border-white/15 bg-[#06080f] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Recent Results
                </p>
                <div className="divide-y divide-white/10">
                  {recent.length > 0 ? (
                    recent.map((m) => <MatchRow key={m.id} match={m} showCompetition={false} />)
                  ) : (
                    <p className="p-4 text-xs font-semibold text-slate-400 text-center">No recent matches</p>
                  )}
                </div>
              </div>
              <div className="border border-white/15 bg-[#0b101d] rounded overflow-hidden shadow">
                <p className="border-b border-white/15 bg-[#06080f] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Upcoming Fixtures
                </p>
                <div className="divide-y divide-white/10">
                  {upcoming.length > 0 ? (
                    upcoming.map((m) => <MatchRow key={m.id} match={m} showCompetition={false} />)
                  ) : (
                    <p className="p-4 text-xs font-semibold text-slate-400 text-center">No upcoming fixtures</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {standings[0] && (
            <div className="border border-white/15 bg-[#0b101d] p-5 rounded shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">League Standing</span>
              </div>
              <p className="text-[13.5px] font-black text-white mb-2">{standings[0].competition.name}</p>
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-black text-4xl text-red-500 drop-shadow-[0_0_12px_rgba(255,30,70,0.4)]">{ordinal(standings[0].position)}</span>
                <span className="text-xl font-black text-white">{standings[0].points} <span className="text-xs font-bold text-slate-300">pts</span></span>
              </div>
              <p className="text-xs font-semibold text-slate-300">{standings[0].won}W · {standings[0].drawn}D · {standings[0].lost}L</p>
              {standings[0].form && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10.5px] font-black text-slate-300 uppercase tracking-wider">Form</span>
                  <FormDots form={standings[0].form} />
                </div>
              )}
            </div>
          )}

          <AdSlot placement="SIDEBAR" className="min-h-[250px]" />
        </div>
      </div>
    </div>
  );
}
