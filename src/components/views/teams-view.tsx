"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Match, Player, Standing, TeamRef } from "@/lib/types";
import { TeamBadge } from "@/components/football/team-badge";
import { MatchCard } from "@/components/football/match-card";
import { SectionHeader, PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";
import { Users, MapPin, CalendarDays, ChevronRight, Trophy, ArrowLeft, Building2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

type TeamItem = TeamRef & {
  city: string;
  stadium: string;
  founded: number;
  color2: string;
  description: string | null;
  _count?: { players: number };
};

export function TeamsView() {
  const navigate = useAppStore((s) => s.navigate);
  const { data, isLoading } = useQuery<{ teams: TeamItem[] }>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      return res.json().then((j) => j.data);
    },
  });

  const teams = data?.teams ?? [];
  const clubs = teams.filter((t) => !["BAN", "IND", "MDV"].includes(t.initials));
  const national = teams.filter((t) => ["BAN", "IND", "MDV"].includes(t.initials));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="ক্লাব ও দলসমূহ"
        subtitle="বিপিএল ক্লাব থেকে জাতীয় দল — সবার সম্পূর্ণ প্রোফাইল"
        icon={<Users className="h-5 w-5" aria-hidden />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <SectionHeader title="বিপিএল ক্লাব" kicker="league" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((t) => (
              <TeamCard key={t.id} team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
            ))}
          </div>
          <div className="mt-10">
            <SectionHeader title="জাতীয় দল" kicker="international" accent="red" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {national.map((t) => (
                <TeamCard key={t.id} team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TeamCard({ team, onClick }: { team: TeamItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-lift group relative overflow-hidden rounded-lg border border-border bg-card p-5 text-left"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: team.color }}
      />
      <div className="flex items-start justify-between">
        <TeamBadge team={team} size="lg" />
        <ChevronRight
          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug text-foreground">{team.name}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{team.shortName}</p>
      <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden /> {team.city}
        </p>
        <p className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden /> {team.stadium}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden /> প্রতিষ্ঠা {toBn(team.founded)}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px]">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary/70" aria-hidden /> স্কোয়াড {toBn(team._count?.players ?? 0)} জন
        </span>
        <span className="font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">প্রোফাইল →</span>
      </div>
    </button>
  );
}

export function TeamDetailView({ teamId }: { teamId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const back = useAppStore((s) => s.back);
  const [squadFilter, setSquadFilter] = useState<string>("ALL");

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
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  const { team, matches, standings } = data;
  const players: Player[] = (team as unknown as { players?: Player[] }).players ?? [];
  const positions = ["GK", "DF", "MF", "FW"];
  const filteredPlayers = squadFilter === "ALL" ? players : players.filter((p) => p.position === squadFilter);
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").reverse();
  const finished = matches.filter((m) => m.status !== "SCHEDULED");
  const isNational = ["BAN", "IND", "MDV"].includes(team.initials);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label="ফিরে যান"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* Team header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <span aria-hidden className="absolute inset-y-0 left-0 w-[4px]" style={{ backgroundColor: team.color }} />
        <div className="pitch-pattern p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-5">
            <TeamBadge team={team} size="xl" />
            <div className="min-w-0 flex-1">
              {isNational && (
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-fhb-red/15 px-2 py-0.5 text-[10px] font-bold text-fhb-red">
                  <Flag className="h-3 w-3" aria-hidden /> জাতীয় দল
                </span>
              )}
              <h1 className="font-display text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl">
                {team.name}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{team.shortName}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary/70" aria-hidden /> {team.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary/70" aria-hidden /> {team.stadium}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-primary/70" aria-hidden /> প্রতিষ্ঠা {toBn(team.founded)}
                </span>
              </div>
            </div>
          </div>
          {team.description && (
            <p className="mt-4 max-w-2xl border-l-[3px] border-primary/50 pl-3 text-xs leading-relaxed text-foreground/75">
              {team.description}
            </p>
          )}
          {standings.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {standings.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 text-[11px] font-bold text-foreground"
                >
                  <Trophy className="h-3 w-3 text-primary" aria-hidden />
                  {s.competition.shortName}:
                  <span className="text-primary">{toBn(s.position)} তম</span>
                  <span className="text-muted-foreground">· {toBn(s.points)} পয়েন্ট</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Squad */}
      <section className="mt-9" aria-label="স্কোয়াড">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
            স্কোয়াড
            <span className="tabular rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {toBn(players.length)}
            </span>
          </h2>
          <div className="flex gap-1.5">
            {["ALL", ...positions].map((p) => (
              <button
                key={p}
                onClick={() => setSquadFilter(p)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-[11px] font-bold transition-colors",
                  squadFilter === p
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {p === "ALL" ? "সব" : POSITION_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {filteredPlayers.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            এই পজিশনে কোনো খেলোয়াড় নেই।
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="divide-y divide-border/60">
              {filteredPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate({ name: "player-detail", id: p.id })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
                >
                  <span
                    className="tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold text-white"
                    style={{ backgroundColor: team.color, boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.25)" }}
                    aria-hidden
                  >
                    {p.jerseyNumber ?? "–"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-bold text-foreground">
                      {p.name}
                      {p.isNationalTeam && (
                        <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          জাতীয় দল
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {POSITION_LABELS[p.position] ?? p.position} · রেটিং {toBn(p.rating.toFixed(1))}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="tabular font-display text-base font-bold text-primary">{toBn(p.goals)}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">গোল</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Matches */}
      <section className="mt-9" aria-label="ম্যাচসমূহ">
        <h2 className="mb-4 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
          সাম্প্রতিক ও আসন্ন ম্যাচ
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/50 p-3.5">
            <p className="mb-3 border-b border-border pb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              সর্বশেষ
            </p>
            <div className="space-y-3">
              {finished.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3.5">
            <p className="mb-3 border-b border-border pb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              আসছে
            </p>
            <div className="space-y-3">
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
