"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Match, Player, Standing, TeamRef } from "@/lib/types";
import { TeamBadge } from "@/components/football/team-badge";
import { MatchCard } from "@/components/football/match-card";
import { SectionHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";
import { Users, MapPin, CalendarDays, ChevronRight } from "lucide-react";
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <Users className="h-6 w-6 text-primary" aria-hidden />
        ক্লাব ও দলসমূহ
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <SectionHeader title="বিপিএল ক্লাব" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((t) => (
              <TeamCard key={t.id} team={t} onClick={() => navigate({ name: "team-detail", id: t.id })} />
            ))}
          </div>
          <div className="mt-8">
            <SectionHeader title="জাতীয় দল" />
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
      className="card-lift group relative overflow-hidden rounded-xl border bg-card p-5 text-left"
      style={{ background: `linear-gradient(160deg, ${team.color}14 0%, transparent 60%)` }}
    >
      <div className="flex items-start justify-between">
        <TeamBadge team={team} size="lg" />
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug">{team.name}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{team.shortName}</p>
      <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden /> {team.city}
        </p>
        <p className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden /> প্রতিষ্ঠা {toBn(team.founded)}
        </p>
        <p className="flex items-center gap-1.5">
          <Users className="h-3 w-3 shrink-0" aria-hidden /> স্কোয়াড {toBn(team._count?.players ?? 0)} জন
        </p>
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
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const { team, matches, standings } = data;
  const players: Player[] = (team as unknown as { players?: Player[] }).players ?? [];
  const positions = ["GK", "DF", "MF", "FW"];
  const filteredPlayers = squadFilter === "ALL" ? players : players.filter((p) => p.position === squadFilter);
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").reverse();
  const finished = matches.filter((m) => m.status !== "SCHEDULED");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
        ← ফিরে যান
      </button>

      {/* Team header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{ background: `linear-gradient(150deg, ${team.color}22 0%, transparent 70%)` }}
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <TeamBadge team={team} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.shortName}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>📍 {team.city}</span>
              <span>🏟️ {team.stadium}</span>
              <span>📅 প্রতিষ্ঠা {toBn(team.founded)}</span>
            </div>
          </div>
        </div>
        {team.description && <p className="mt-4 max-w-2xl text-xs leading-relaxed text-foreground/75">{team.description}</p>}
        {standings.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {standings.map((s) => (
              <span key={s.id} className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                {s.competition.shortName}: {toBn(s.position)} তম • {toBn(s.points)} পয়েন্ট
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Squad */}
      <section className="mt-8" aria-label="স্কোয়াড">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold tracking-wide">স্কোয়াড ({toBn(players.length)})</h2>
          <div className="flex gap-1.5">
            {["ALL", ...positions].map((p) => (
              <button
                key={p}
                onClick={() => setSquadFilter(p)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-bold transition-colors",
                  squadFilter === p ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p === "ALL" ? "সব" : POSITION_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {filteredPlayers.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">এই পজিশনে কোনো খেলোয়াড় নেই।</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredPlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate({ name: "player-detail", id: p.id })}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color2})` }}
                  aria-hidden
                >
                  {p.jerseyNumber ?? "–"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                    {p.name}
                    {p.isNationalTeam && <span className="rounded bg-primary/15 px-1 text-[9px] font-bold text-primary">জাতীয় দল</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {POSITION_LABELS[p.position] ?? p.position} • রেটিং {toBn(p.rating.toFixed(1))}
                  </p>
                </div>
                <div className="shrink-0 text-center">
                  <p className="font-display text-base font-bold text-primary">{toBn(p.goals)}</p>
                  <p className="text-[9px] text-muted-foreground">গোল</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Matches */}
      <section className="mt-8" aria-label="ম্যাচসমূহ">
        <h2 className="mb-4 font-display text-lg font-bold tracking-wide">সাম্প্রতিক ও আসন্ন ম্যাচ</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">সর্বশেষ</p>
            <div className="space-y-3">
              {finished.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">আসছে</p>
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
