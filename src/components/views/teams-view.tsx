"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Match, Player, Standing, TeamRef, CompetitionRef } from "@/lib/types";
import { NATIONAL_TEAM_INITIALS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { TeamBadge } from "@/components/football/team-badge";
import { MatchCard } from "@/components/football/match-card";
import { SectionHeader, PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";
import { Users, MapPin, CalendarDays, ChevronRight, Trophy, ArrowLeft, Building2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

type TeamItem = TeamRef & {
  city: string;
  stadium: string;
  founded: number;
  color2: string;
  description: string | null;
  standings?: Array<Standing & { competition: CompetitionRef }>;
  _count?: { players: number };
};

export function TeamsView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();
  const { data, isLoading } = useQuery<{ teams: TeamItem[] }>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      return res.json().then((j) => j.data);
    },
  });

  const teams = data?.teams ?? [];
  const national = teams.filter((t) => NATIONAL_TEAM_INITIALS.includes(t.initials));
  const clubs = teams.filter((t) => !NATIONAL_TEAM_INITIALS.includes(t.initials));

  const leagueOf = (t: TeamItem) => t.standings?.[0]?.competition;
  const COUNTRY_FILTERS: Array<{ key: string; label: string }> = [
    { key: "ALL", label: "All" },
    { key: "Bangladesh", label: "Bangladesh" },
    { key: "England", label: "England" },
    { key: "Spain", label: "Spain" },
    { key: "Italy", label: "Italy" },
    { key: "Germany", label: "Germany" },
    { key: "France", label: "France" },
    { key: "NATIONAL", label: "National Teams" },
  ];
  const [country, setCountry] = useState("ALL");

  const groups: Array<{ title: string; kicker: string; accent?: "red" | "gold"; items: TeamItem[] }> = [];
  if (country === "ALL") {
    const bdClubs = clubs.filter((t) => leagueOf(t)?.country === "Bangladesh");
    const euClubs = clubs.filter((t) => leagueOf(t)?.country && leagueOf(t)!.country !== "Bangladesh");
    if (bdClubs.length) groups.push({ title: "BFL Clubs", kicker: "bangladesh football league", items: bdClubs });
    for (const c of ["England", "Spain", "Italy", "Germany", "France"]) {
      const items = euClubs.filter((t) => leagueOf(t)?.country === c);
      if (items.length) {
        const comp = leagueOf(items[0]);
        groups.push({ title: comp?.name ?? c, kicker: c.toLowerCase(), items });
      }
    }
    const other = clubs.filter((t) => !leagueOf(t));
    if (other.length) groups.push({ title: "More Clubs", kicker: "other competitions", items: other });
    if (national.length) groups.push({ title: "National Teams", kicker: "international", accent: "red", items: national });
  } else if (country === "NATIONAL") {
    if (national.length) groups.push({ title: "National Teams", kicker: "international", accent: "red", items: national });
  } else {
    const items =
      country === "Bangladesh"
        ? clubs.filter((t) => leagueOf(t)?.country === "Bangladesh")
        : clubs.filter((t) => leagueOf(t)?.country === country);
    const label = COUNTRY_FILTERS.find((f) => f.key === country)?.label ?? country;
    if (items.length) {
      const comp = leagueOf(items[0]);
      groups.push({ title: comp?.name ?? label, kicker: country.toLowerCase(), items });
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="Clubs & Teams"
        kicker="clubs & national teams"
        subtitle="From the BFL to the Premier League — 115 clubs and national teams, complete profiles for everyone"
        icon={<Users className="h-5 w-5" aria-hidden />}
      />

      {/* Country filter */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by country">
        {COUNTRY_FILTERS.map((f) => {
          const count =
            f.key === "ALL" ? teams.length
            : f.key === "NATIONAL" ? national.length
            : clubs.filter((t) => leagueOf(t)?.country === f.key).length;
          if (f.key !== "ALL" && f.key !== "NATIONAL" && count === 0) return null;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={country === f.key}
              onClick={() => setCountry(f.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95",
                country === f.key
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {f.label}
              <span className="tabular rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold">{fmtNum(count)}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {groups.map((g) => (
            <div key={g.title} className="mt-8 first:mt-0">
              <SectionHeader title={g.title} kicker={g.kicker} accent={g.accent} />
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((t) => (
                  <div key={t.id} className="reveal">
                    <TeamCard team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function TeamCard({ team, onClick }: { team: TeamItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-lift group relative w-full overflow-hidden rounded-2xl border border-border bg-card text-left"
    >
      {/* Club color band */}
      <span
        aria-hidden
        className="relative block h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color2 ?? team.color})` }}
      />
      {/* Watermark crest */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 select-none font-display text-[7rem] font-bold leading-none text-white/[0.04]"
      >
        {team.initials}
      </span>

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <TeamBadge team={team} size="xl" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-primary/50 group-hover:text-primary">
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
        <h3 className="mt-4 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
          {team.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{team.shortName}</p>
        <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden /> {team.city}
          </p>
          <p className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden /> {team.stadium}
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden /> Founded {fmtNum(team.founded)}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary/70" aria-hidden /> Squad of {fmtNum(team._count?.players ?? 0)}
          </span>
          <span className="font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">Profile →</span>
        </div>
      </div>
    </button>
  );
}

export function TeamDetailView({ teamId }: { teamId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const back = useAppStore((s) => s.back);
  const [squadFilter, setSquadFilter] = useState<string>("ALL");
  useReveal();

  const { data, isLoading } = useQuery<{
    team: TeamItem;
    matches: Match[];
    standings: Array<Standing & { competition: { id: string; name: string; shortName: string } }>;
  }>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !data?.team) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { team, matches, standings } = data;
  const players: Player[] = (team as unknown as { players?: Player[] }).players ?? [];
  const positions = ["GK", "DF", "MF", "FW"];
  const filteredPlayers = squadFilter === "ALL" ? players : players.filter((p) => p.position === squadFilter);
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").reverse();
  const finished = matches.filter((m) => m.status !== "SCHEDULED");
  const isNational = NATIONAL_TEAM_INITIALS.includes(team.initials);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* ═══ Team hero — club color cinematic header ═══ */}
      <div
        className="noise relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${team.color} 26%, oklch(0.14 0.014 168)), oklch(0.13 0.014 168) 62%)`,
        }}
      >
        <span className="pitch-pattern absolute inset-0" aria-hidden />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[10rem] font-bold leading-none text-white/[0.05] sm:text-[13rem]"
        >
          {team.initials}
        </span>

        <div className="relative flex flex-wrap items-center gap-6">
          <TeamBadge team={team} size="hero" />
          <div className="min-w-0 flex-1">
            {isNational && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-fhb-red/20 px-3 py-1 text-[10px] font-bold text-fhb-red">
                <Flag className="h-3 w-3" aria-hidden /> National Team
              </span>
            )}
            <h1 className="display-hero text-2xl text-foreground sm:text-4xl">{team.name}</h1>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {[
                { icon: <MapPin className="h-3.5 w-3.5" aria-hidden />, text: team.city },
                { icon: <Building2 className="h-3.5 w-3.5" aria-hidden />, text: team.stadium },
                { icon: <CalendarDays className="h-3.5 w-3.5" aria-hidden />, text: `Founded ${fmtNum(team.founded)}` },
              ].map((chip) => (
                <span
                  key={chip.text}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm"
                >
                  <span className="text-primary">{chip.icon}</span>
                  {chip.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {team.description && (
          <p className="relative mt-5 max-w-2xl border-l-[3px] border-primary/60 pl-4 text-[13px] leading-relaxed text-foreground/75">
            {team.description}
          </p>
        )}

        {standings.length > 0 && (
          <div className="relative mt-5 flex flex-wrap gap-2">
            {standings.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card/70 px-3 py-1.5 text-[11px] font-bold text-foreground backdrop-blur-sm"
              >
                <Trophy className="h-3 w-3 text-primary" aria-hidden />
                {s.competition.shortName}:
                <span className="text-primary">#{fmtNum(s.position)}</span>
                <span className="text-muted-foreground">· {fmtNum(s.points)} pts</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Squad */}
      <section className="reveal mt-10" aria-label="Squad">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 font-display-bn text-lg font-bold text-foreground">
            Squad
            <span className="tabular rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {fmtNum(players.length)}
            </span>
            <span className="h-px w-10 bg-border" aria-hidden />
          </h2>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {["ALL", ...positions].map((p) => (
              <button
                key={p}
                onClick={() => setSquadFilter(p)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                  squadFilter === p
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {p === "ALL" ? "All" : POSITION_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {filteredPlayers.length === 0 ? (
          <div className="edge-lit rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No players in this position.
          </div>
        ) : (
          <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border/50">
              {filteredPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate({ name: "player-detail", id: p.id })}
                  className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-accent/50 sm:px-5"
                >
                  <span
                    className="tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white"
                    style={{
                      backgroundColor: team.color,
                      boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.28), inset 0 -2px 4px rgba(0,0,0,0.25)",
                    }}
                    aria-hidden
                  >
                    {p.jerseyNumber ?? "–"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-bold text-foreground group-hover:text-primary">
                      {p.name}
                      {p.isNationalTeam && (
                        <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          National Team
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {POSITION_LABELS[p.position] ?? p.position} · Rating {fmtNum(p.rating.toFixed(1))}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="tabular font-display text-base font-bold text-primary">{fmtNum(p.goals)}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Goals</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Matches */}
      <section className="reveal mt-10" aria-label="Matches">
        <h2 className="mb-5 flex items-center gap-3 font-display-bn text-lg font-bold text-foreground">
          Recent & Upcoming Matches
          <span className="h-px w-10 bg-border" aria-hidden />
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="edge-lit rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2.5 border-b border-border/70 pb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fhb-gold/12 text-fhb-gold">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              Latest
            </p>
            <div className="space-y-3.5">
              {finished.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
          <div className="edge-lit rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2.5 border-b border-border/70 pb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              </span>
              Upcoming
            </p>
            <div className="space-y-3.5">
              {upcoming.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
