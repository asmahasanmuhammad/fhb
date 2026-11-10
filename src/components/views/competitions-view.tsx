"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { MatchRow } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { Shield, Trophy, Goal, Zap, ChevronRight, ChevronLeft, CalendarDays, Flag } from "lucide-react";

type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  _count?: { matches: number };
};

const TYPE_LABELS: Record<string, string> = {
  LEAGUE: "League",
  CUP: "Cup",
  INTERNATIONAL: "International",
};

/** Zone legend — mirrors the colour bars rendered by StandingsTable. */
function ZoneLegend() {
  const items = [
    { cls: "bg-amber-400", label: "Champion" },
    { cls: "bg-red-500", label: "Championship places" },
    { cls: "bg-rose-600", label: "Relegation zone" },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-white/15 bg-[#0b101d] px-4 py-3 text-[11px] font-semibold text-slate-300 shadow">
      {items.map((z) => (
        <span key={z.label} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-[2px]", z.cls)} aria-hidden />
          {z.label}
        </span>
      ))}
      <span className="ml-auto hidden pl-4 sm:block text-slate-400">P Played · W Won · D Drawn · L Lost · GD Goal difference</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Competitions hub — editorial grid of every competition we cover
   ═══════════════════════════════════════════════════════════════════ */
export function CompetitionsView() {
  const navigate = useAppStore((s) => s.navigate);
  const language = useAppStore((s) => s.language);
  useReveal();

  const { data, isLoading } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  const comps = data?.competitions ?? [];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Editorial Header ── */}
      <div className="mb-6 border-b border-white/[0.07] pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-5 w-1 bg-red-600 shrink-0" aria-hidden />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            OFFICIAL LEAGUES & TOURNAMENTS
          </span>
        </div>
        <h1 className="font-black text-[26px] sm:text-[34px] text-white leading-tight">
          {language === "bn" ? "প্রতিযোগিতা ও টুর্নামেন্ট" : "Competitions Hub"}
        </h1>
        <p className="text-[12.5px] text-white/40 mt-1">
          Full coverage of the Bangladesh Premier League (BFL), Federation Cup, UEFA Champions League, and top domestic leagues.
        </p>
      </div>

      {/* Leaderboard ad */}
      <div className="reveal mb-8">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 bg-white/[0.04]" />
          ))}
        </div>
      ) : comps.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#0d0d10] p-12 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm font-bold text-white/60">No competitions found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comps.map((c) => (
              <div key={c.id} className="reveal h-full">
                <button
                  onClick={() => navigate({ name: "competition-detail", id: c.id })}
                  className="group relative flex h-full w-full flex-col justify-between border border-white/15 bg-[#0b101d] p-5 text-left transition-all hover:border-red-500/60 hover:bg-[#11172a] hover:shadow-[0_4px_20px_rgba(255,30,70,0.15)] rounded"
                  aria-label={`View ${c.name} table and fixtures`}
                >
                  {/* Accent edge bar */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: c.accentColor ?? "#ff1e46" }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center font-black text-sm text-white rounded shadow"
                          style={{ backgroundColor: c.accentColor ?? "#ff1e46" }}
                        >
                          {(c.shortName || c.name).slice(0, 3).toUpperCase()}
                        </span>
                        <div>
                          <h3 className="font-black text-[15.5px] text-white transition-colors group-hover:text-red-400 drop-shadow-sm">
                            {c.name}
                          </h3>
                          <p className="text-[11.5px] font-black text-slate-300 uppercase tracking-wider mt-0.5">
                            {c.country} · {TYPE_LABELS[c.type] ?? c.type}
                          </p>
                        </div>
                      </div>
                      <span className="border border-white/20 bg-white/10 px-2 py-0.5 text-[9.5px] font-black uppercase text-white rounded">
                        {c.season}
                      </span>
                    </div>

                    {c.description && (
                      <p className="line-clamp-2 text-xs font-medium text-slate-300 leading-relaxed">{c.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-black text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-red-500" />
                      {fmtNum(c._count?.matches ?? 0)} Matches
                    </span>
                    <span className="flex items-center gap-1 text-red-400 group-hover:translate-x-0.5 transition-transform font-black">
                      Standings &amp; Fixtures <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="reveal mt-8">
            <AdSlot placement="IN_FEED" />
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Competition detail — broadcast hero, table + fixtures tabs, stat rail
   ═══════════════════════════════════════════════════════════════════ */
export function CompetitionDetailView({ competitionId }: { competitionId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();
  const [userTab, setUserTab] = useState<"table" | "matches" | null>(null);

  const { data, isLoading } = useQuery<{
    competition: Competition;
    standings: Standing[];
    matches: Match[];
    topScorers: Array<{
      id: string;
      name: string;
      goals: number;
      assists?: number;
      position?: string;
      team: { id: string; name: string; initials: string; color: string } | null;
    }>;
  }>({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/competitions/${competitionId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !data?.competition) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <Skeleton className="h-5 w-44 rounded-md" />
        <Skeleton className="mt-4 h-44 rounded-xl" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-xl lg:col-span-8" />
          <Skeleton className="h-72 rounded-xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  const { competition, standings, matches, topScorers } = data;
  const accent = competition.accentColor ?? "#12805c";
  const typeLabel = TYPE_LABELS[competition.type] ?? competition.type;
  const shortLabel = competition.shortName || competition.name;
  const hasTable = standings.length > 0;
  const tab = userTab ?? (hasTable ? "table" : "matches");

  // API returns matches by kickoff desc — results stay newest-first, fixtures flip to soonest-first
  const results = matches.filter((m) => m.status === "FINISHED");
  const fixtures = matches.filter((m) => m.status !== "FINISHED").slice().reverse();

  const matchPanel = (
    title: string,
    icon: ReactNode,
    list: Match[],
    emptyNote: string,
  ) => (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg">
      <header className="flex items-center justify-between gap-3 border-b border-white/15 bg-[#06080f] px-4 py-3">
        <h3 className="flex items-center gap-2.5 font-display text-sm font-black text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-400">{icon}</span>
          {title}
        </h3>
        <span className="tabular text-[11px] font-black text-slate-300">{fmtNum(list.length)}</span>
      </header>
      {list.length > 0 ? (
        <div className="divide-y divide-white/10">
          {list.slice(0, 10).map((m) => (
            <MatchRow key={m.id} match={m} showCompetition={false} />
          ))}
        </div>
      ) : (
        <p className="px-4 py-8 text-center text-xs font-semibold text-slate-400">{emptyNote}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Breadcrumb back to the hub ── */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs">
        <button
          onClick={() => navigate({ name: "competitions" })}
          className="flex items-center gap-1 font-bold text-slate-300 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Competitions
        </button>
        <span className="text-slate-400" aria-hidden>
          /
        </span>
        <span className="truncate font-bold text-white">{shortLabel}</span>
      </nav>

      {/* ── Hero band ── */}
      <section
        className="reveal relative overflow-hidden rounded-xl border border-white/20 bg-[#0b101d] shadow-xl"
        aria-label="Competition header"
      >
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(115deg, color-mix(in oklab, ${accent} 25%, transparent), transparent 58%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-7 select-none font-display text-[8rem] font-bold leading-none text-white/[0.05] sm:text-[10rem]"
        >
          {shortLabel.slice(0, 3).toUpperCase()}
        </span>

        <div className="relative flex flex-wrap items-center gap-4 p-5 sm:gap-5 sm:p-7">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:h-16 sm:w-16 shadow-lg"
            style={{
              backgroundColor: accent,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.24), inset 0 -4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Trophy className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow flex items-center gap-2 text-red-400 font-black">
              {typeLabel}
              <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden />
              {competition.country}
            </p>
            <h1 className="mt-1.5 text-[1.8rem] font-black text-white drop-shadow-sm sm:text-3xl">{competition.name}</h1>
            <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <CalendarDays className="h-3.5 w-3.5 text-red-400" aria-hidden /> Season {competition.season}
              </span>
              <span className="tabular flex items-center gap-1.5 font-semibold">
                <Zap className="h-3.5 w-3.5 text-red-400" aria-hidden /> {fmtNum(matches.length)} matches
              </span>
            </p>
          </div>
        </div>

        {competition.description && (
          <p
            className="relative mx-5 mb-5 max-w-2xl border-l-2 pl-4 text-[13px] leading-relaxed text-slate-200 font-medium sm:mx-7 sm:mb-7"
            style={{ borderColor: `color-mix(in oklab, ${accent} 80%, transparent)` }}
          >
            {competition.description}
          </p>
        )}
      </section>

      {/* ── Content: 8-col sections + 4-col stat rail ── */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {hasTable && (
            <div
              className="mb-5 grid w-full max-w-sm grid-cols-2 gap-1 rounded-xl border border-white/15 bg-[#06080f] p-1"
              role="tablist"
              aria-label="Competition sections"
            >
              {(
                [
                  ["table", "Standings"],
                  ["matches", "Fixtures & Results"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setUserTab(key)}
                  className={cn(
                    "rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-colors",
                    tab === key
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {tab === "table" && hasTable ? (
            <section className="reveal" aria-label="Standings table">
              <StandingsTable standings={standings} />
              <ZoneLegend />
            </section>
          ) : (
            <section className="reveal space-y-6" aria-label="Fixtures and results">
              {matchPanel("Recent results", <Flag className="h-3.5 w-3.5" aria-hidden />, results, "No results yet — this competition has not kicked off.")}
              {matchPanel("Upcoming fixtures", <CalendarDays className="h-3.5 w-3.5" aria-hidden />, fixtures, "No upcoming fixtures scheduled.")}
            </section>
          )}
        </div>

        {/* Stat rail */}
        <aside className="min-w-0 space-y-6 lg:col-span-4" aria-label="Statistics">
          {topScorers.length > 0 && (
            <section className="reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg" aria-label="Top scorers">
              <header className="flex items-center justify-between gap-3 border-b border-white/15 bg-[#06080f] px-4 py-3">
                <h3 className="flex items-center gap-2 font-display text-sm font-black text-white">
                  <Goal className="h-4 w-4 text-red-500" aria-hidden />
                  Top scorers
                </h3>
                <span className="eyebrow shrink-0 text-slate-300 font-bold">{shortLabel}</span>
              </header>
              <div className="divide-y divide-white/10">
                {topScorers.slice(0, 8).map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => navigate({ name: "player-detail", id: p.id })}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="tabular w-4 shrink-0 text-center font-display text-xs font-black text-slate-400 transition-colors group-hover:text-red-400">
                      {fmtNum(i + 1)}
                    </span>
                    {p.team && <TeamCrest team={p.team} size="sm" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-black text-white transition-colors group-hover:text-red-400">
                        {p.name}
                      </span>
                      <span className="block truncate text-[11px] font-semibold text-slate-300">{p.team?.name ?? "—"}</span>
                    </span>
                    <span className="tabular shrink-0 font-display text-base font-black text-emerald-400">{fmtNum(p.goals)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <div className="reveal">
            <AdSlot placement="SIDEBAR" />
          </div>
        </aside>
      </div>
    </div>
  );
}
