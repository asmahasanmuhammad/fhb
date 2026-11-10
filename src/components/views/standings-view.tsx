"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { Trophy, Goal, Target, ChevronRight } from "lucide-react";

type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  _count?: { matches: number };
};

type Scorer = {
  id: string;
  name: string;
  goals: number;
  assists: number;
  position: string;
  team: { id: string; name: string; initials: string; color: string } | null;
};

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
    <div className="rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/12 bg-[#050812] px-4 py-2.5">
        <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-white">
          <span className="text-[#ff1e46]">{icon}</span>
          {title}
        </h3>
        {meta && <span className="text-[10px] font-black text-white uppercase px-1.5 py-0.5 rounded bg-white/10">{meta}</span>}
      </div>
      <div className="divide-y divide-white/10">
        {leaders.slice(0, 6).map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/10"
          >
            <span className={cn(
              "tabular w-6 shrink-0 text-center font-black text-xs leading-none",
              i === 0 ? "text-amber-400 font-black text-[13px]" : i < 3 ? "text-[#ff1e46] font-black text-[13px]" : "text-white"
            )}>
              {i + 1}
            </span>
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-800">
              {p.photoUrl ? (
                <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover object-top" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[9px] font-black text-white">
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {p.team && <TeamCrest team={p.team} size="sm" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-extrabold text-white transition-colors group-hover:text-[#00e5ff]">
                {p.name}
              </span>
              <span className="block truncate text-[10.5px] font-semibold text-[#cbd5e1]">{p.team?.name ?? "—"}</span>
            </span>
            <span className="tabular shrink-0 font-black text-sm text-white px-2 py-0.5 rounded bg-white/10 border border-white/20">{fmtNum(p[valueKey])}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StandingsView() {
  const navigate = useAppStore((s) => s.navigate);
  const language = useAppStore((s) => s.language);
  useReveal();

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
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Editorial Header ── */}
      <div className="mb-6 border-b border-white/12 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-5 w-1.5 bg-[#ff1e46] rounded-full shrink-0 shadow-[0_0_8px_#ff1e46]" aria-hidden />
          <span className="text-[10.5px] font-black uppercase tracking-widest text-[#ff1e46]">
            OFFICIAL LEAGUE TABLES & STANDINGS
          </span>
        </div>
        <h1 className="font-black text-[28px] sm:text-[36px] text-white leading-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
          Points Table & Standings
        </h1>
        <p className="text-[14px] text-[#cbd5e1] font-medium mt-1">
          Real-time standings, form guide, goal difference and golden boot races across all leagues.
        </p>
      </div>

      {/* ── Competition selector tabs ── */}
      <div className="reveal mb-6 flex items-center gap-1 border-b border-white/12 overflow-x-auto no-scrollbar pb-1">
        {compsData ? (
          comps.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompId(c.id)}
              className={cn(
                "shrink-0 pb-3 pt-1.5 px-4 text-[13px] font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
                activeId === c.id
                  ? "border-[#ff1e46] text-white shadow-[0_2px_8px_rgba(255,30,70,0.4)]"
                  : "border-transparent text-[#cbd5e1] hover:text-white hover:bg-white/5 rounded-t"
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: c.accentColor ?? "#ff1e46" }}
              />
              {c.shortName || c.name}
            </button>
          ))
        ) : (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-24 bg-white/10" />)
        )}
      </div>

      {/* Leaderboard ad */}
      <div className="reveal mb-8">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main table column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Competition detail ribbon */}
          {activeComp && (
            <div className="rounded-md border border-white/12 bg-[#090d19] p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ff1e46]">
                  {activeComp.country} · {activeComp.type}
                </span>
                <h2 className="text-xl font-black text-white">{activeComp.name}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded border border-white/15 bg-white/10 px-3 py-1 text-white font-bold">
                  Season {activeComp.season}
                </span>
                <span className="rounded border border-white/15 bg-white/10 px-3 py-1 text-white font-bold">
                  {fmtNum(activeComp._count?.matches ?? 0)} Matches
                </span>
              </div>
            </div>
          )}

          {booting ? (
            <Skeleton className="h-[460px] bg-white/10 rounded-md" />
          ) : standings.length > 0 ? (
            <StandingsTable standings={standings} />
          ) : activeComp ? (
            <div className="rounded-md border border-white/12 bg-[#090d19] p-12 text-center shadow-lg">
              <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-400" />
              <p className="font-black text-white text-lg">Cup Knockout Tournament</p>
              <p className="mt-1 text-sm text-[#cbd5e1] font-medium">This competition is played as knockout rounds. View ties in Live Scores.</p>
              <button
                onClick={() => navigate({ name: "scores" })}
                className="mt-5 rounded bg-[#ff1e46] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-[#e01438] shadow-[0_0_12px_rgba(255,30,70,0.4)]"
              >
                Go to Scores
              </button>
            </div>
          ) : null}
        </div>

        {/* Right sidebar — Top Scorers & Assists */}
        <aside className="lg:col-span-4 space-y-5">
          <LeaderPanel
            title="Golden Boot · Top Scorers"
            icon={<Goal className="h-4 w-4" />}
            leaders={scorers}
            valueKey="goals"
            meta="Goals"
          />

          <LeaderPanel
            title="Playmaker · Most Assists"
            icon={<Target className="h-4 w-4" />}
            leaders={assistLeaders}
            valueKey="assists"
            meta="Assists"
          />

          <AdSlot placement="SIDEBAR" className="min-h-[250px]" />
        </aside>
      </div>
    </div>
  );
}
