"use client";

import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Standing } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { MatchCard } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { Shield, ChevronRight, Trophy, ArrowLeft, CalendarDays, MapPin, Zap } from "lucide-react";

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

export function CompetitionsView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();
  const { data, isLoading } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="Tournaments & Competitions"
        kicker="competitions"
        subtitle="From the BPL to the SAFF Championship — every competition in one place"
        icon={<Shield className="h-5 w-5" aria-hidden />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(data?.competitions ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: "competition-detail", id: c.id })}
              className="card-lift group relative w-full overflow-hidden rounded-2xl border border-border bg-card text-left"
            >
              {/* Accent band */}
              <span
                aria-hidden
                className="relative block h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${c.accentColor ?? "var(--primary)"}, color-mix(in oklab, ${c.accentColor ?? "var(--primary)"} 55%, transparent))` }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: c.accentColor ?? "var(--primary)",
                      boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.28), inset 0 -3px 5px rgba(0,0,0,0.25)",
                    }}
                    aria-hidden
                  >
                    <Trophy className="h-5 w-5 text-white" />
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                    {TYPE_LABELS[c.type] ?? c.type}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
                  {c.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                  Season {c.season} · {c.country}
                </p>
                {c.description && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-foreground/70">{c.description}</p>
                )}
                <p className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Zap className="h-3.5 w-3.5" aria-hidden /> {fmtNum(c._count?.matches ?? 0)} matches tracked
                  </span>
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompetitionDetailView({ competitionId }: { competitionId: string }) {
  const back = useAppStore((s) => s.back);
  useReveal();
  const { data, isLoading } = useQuery<{
    competition: Competition;
    standings: Standing[];
    matches: Match[];
    topScorers: Array<{ id: string; name: string; goals: number; team: { id: string; name: string; initials: string; color: string } | null }>;
  }>({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/competitions/${competitionId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !data?.competition) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { competition, standings, matches } = data;
  const finished = matches.filter((m) => m.status === "FINISHED");
  const upcoming = matches.filter((m) => m.status !== "FINISHED").reverse();
  const accent = competition.accentColor ?? "#12805c";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* ═══ Competition hero ═══ */}
      <div
        className="noise relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 26%, oklch(0.14 0.014 168)), oklch(0.13 0.014 168) 62%)`,
        }}
      >
        <span className="pitch-pattern absolute inset-0" aria-hidden />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[9rem] font-bold leading-none text-white/[0.05] sm:text-[11rem]"
        >
          {competition.shortName?.slice(0, 3) ?? "FHB"}
        </span>

        <div className="relative flex flex-wrap items-center gap-5">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: accent,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.28), inset 0 -4px 8px rgba(0,0,0,0.25), 0 10px 22px -8px rgba(0,0,0,0.5)",
            }}
            aria-hidden
          >
            <Trophy className="h-8 w-8 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1.5 text-[10px] text-primary">{TYPE_LABELS[competition.type] ?? competition.type} · {competition.country}</p>
            <h1 className="display-hero text-2xl text-foreground sm:text-4xl">{competition.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary/70" aria-hidden />
              Season {competition.season} · {fmtNum(matches.length)} matches
            </p>
          </div>
        </div>
        {competition.description && (
          <p className="relative mt-5 max-w-2xl border-l-[3px] border-primary/60 pl-4 text-[13px] leading-relaxed text-foreground/75">
            {competition.description}
          </p>
        )}
      </div>

      {standings.length > 0 && (
        <section className="reveal mt-10" aria-label="Standings">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="font-display-bn text-lg font-bold text-foreground">Points Table</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {TYPE_LABELS[competition.type] ?? competition.type}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <StandingsTable standings={standings} />
        </section>
      )}

      <section className="reveal mt-10" aria-label="Matches">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="font-display-bn text-lg font-bold text-foreground">Matches</h2>
          <span className="tabular rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {fmtNum(matches.length)}
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="edge-lit rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2.5 border-b border-border/70 pb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fhb-gold/12 text-fhb-gold">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              Results
            </p>
            <div className="space-y-3.5">
              {finished.slice(0, 6).map((m) => (
                <MatchCard key={m.id} match={m} showCompetition={false} />
              ))}
            </div>
          </div>
          <div className="edge-lit rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2.5 border-b border-border/70 pb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
              </span>
              Upcoming
            </p>
            <div className="space-y-3.5">
              {upcoming.slice(0, 6).map((m) => (
                <MatchCard key={m.id} match={m} showCompetition={false} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
