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
    <div className="border border-white/[0.07] bg-[#0d0d10] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#060608] px-4 py-2.5">
        <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-white">
          <span className="text-red-500">{icon}</span>
          {title}
        </h3>
        {meta && <span className="text-[10px] font-bold text-white/30 uppercase">{meta}</span>}
      </div>
      <div className="divide-y divide-white/[0.04]">
        {leaders.slice(0, 6).map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
          >
            <span className={cn(
              "tabular w-5 shrink-0 text-center font-black text-xs leading-none",
              i === 0 ? "text-amber-400" : i < 3 ? "text-red-400" : "text-white/20"
            )}>
              {i + 1}
            </span>
            {p.team && <TeamCrest team={p.team} size="sm" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-bold text-white/80 group-hover:text-white">
                {p.name}
              </span>
              <span className="block truncate text-[10px] text-white/30">{p.team?.name ?? "—"}</span>
            </span>
            <span className="tabular shrink-0 font-black text-sm text-white">{fmtNum(p[valueKey])}</span>
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
      <div className="mb-6 border-b border-white/[0.07] pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-5 w-1 bg-red-600 shrink-0" aria-hidden />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            OFFICIAL LEAGUE TABLES & STANDINGS
          </span>
        </div>
        <h1 className="font-black text-[26px] sm:text-[34px] text-white leading-tight">
          {language === "bn" ? "পয়েন্ট টেবিল ও গোলস্কোরার" : "Points Table & Standings"}
        </h1>
        <p className="text-[12.5px] text-white/40 mt-1">
          Real-time standings, form guide, goal difference and golden boot races across all leagues.
        </p>
      </div>

      {/* ── Competition selector tabs ── */}
      <div className="reveal mb-6 flex items-center gap-0 border-b border-white/[0.07] overflow-x-auto no-scrollbar">
        {compsData ? (
          comps.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompId(c.id)}
              className={cn(
                "shrink-0 pb-3 pt-1 px-4 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2",
                activeId === c.id
                  ? "border-red-500 text-white"
                  : "border-transparent text-white/40 hover:text-white/80"
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.accentColor ?? "#dc2626" }}
              />
              {c.shortName || c.name}
            </button>
          ))
        ) : (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-24 bg-white/[0.04]" />)
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
            <div className="border border-white/[0.07] bg-[#0d0d10] p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[9.5px] font-black uppercase tracking-widest text-red-400">
                  {activeComp.country} · {activeComp.type}
                </span>
                <h2 className="text-lg font-black text-white">{activeComp.name}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-white/50">
                  Season {activeComp.season}
                </span>
                <span className="border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-white/50">
                  {fmtNum(activeComp._count?.matches ?? 0)} Matches
                </span>
              </div>
            </div>
          )}

          {booting ? (
            <Skeleton className="h-[460px] bg-white/[0.04]" />
          ) : standings.length > 0 ? (
            <StandingsTable standings={standings} />
          ) : activeComp ? (
            <div className="border border-white/[0.07] bg-[#0d0d10] p-12 text-center">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="font-black text-white text-base">Cup Knockout Tournament</p>
              <p className="mt-1 text-xs text-white/40">This competition is played as knockout rounds. View ties in Live Scores.</p>
              <button
                onClick={() => navigate({ name: "scores" })}
                className="mt-4 bg-red-600 px-4 py-2 text-xs font-black uppercase text-white"
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
