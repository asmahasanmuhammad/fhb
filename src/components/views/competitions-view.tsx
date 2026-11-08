"use client";

import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Standing } from "@/lib/types";
import { MatchCard } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { Shield, ChevronRight, Trophy, ArrowLeft, CalendarDays, MapPin, Zap } from "lucide-react";

type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  _count?: { matches: number };
};

const TYPE_LABELS: Record<string, string> = {
  LEAGUE: "লিগ",
  CUP: "কাপ",
  INTERNATIONAL: "আন্তর্জাতিক",
};

export function CompetitionsView() {
  const navigate = useAppStore((s) => s.navigate);
  const { data, isLoading } = useQuery<{ competitions: Competition[] }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="টুর্নামেন্ট ও কম্পিটিশন"
        subtitle="বিপিএল থেকে সাফ চ্যাম্পিয়নশিপ — সব কম্পিটিশনের কেন্দ্র"
        icon={<Shield className="h-5 w-5" aria-hidden />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data?.competitions ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: "competition-detail", id: c.id })}
              className="card-lift group relative overflow-hidden rounded-lg border border-border bg-card p-5 text-left"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
              />
              <div className="flex items-start justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: c.accentColor ?? "var(--primary)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.25)" }}
                  aria-hidden
                >
                  <Trophy className="h-5 w-5 text-white" />
                </span>
                <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                  {TYPE_LABELS[c.type] ?? c.type}
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold leading-snug text-foreground">{c.name}</h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                সিজন {c.season} · {c.country}
              </p>
              {c.description && (
                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">{c.description}</p>
              )}
              <p className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-primary">
                  <Zap className="h-3.5 w-3.5" aria-hidden /> {toBn(c._count?.matches ?? 0)} ম্যাচ ট্র্যাক করা হচ্ছে
                </span>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  aria-hidden
                />
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompetitionDetailView({ competitionId }: { competitionId: string }) {
  const back = useAppStore((s) => s.back);
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
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  const { competition, standings, matches } = data;
  const finished = matches.filter((m) => m.status === "FINISHED");
  const upcoming = matches.filter((m) => m.status !== "FINISHED").reverse();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label="ফিরে যান"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[4px]"
          style={{ backgroundColor: competition.accentColor ?? "var(--primary)" }}
        />
        <div className="pitch-pattern p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: competition.accentColor ?? "var(--primary)",
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)",
              }}
              aria-hidden
            >
              <Trophy className="h-7 w-7 text-white" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl">
                {competition.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary/70" aria-hidden />
                সিজন {competition.season} · {competition.country}
              </p>
            </div>
          </div>
          {competition.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">{competition.description}</p>
          )}
        </div>
      </div>

      {standings.length > 0 && (
        <section className="mt-9" aria-label="স্ট্যান্ডিং">
          <h2 className="mb-4 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
            পয়েন্ট টেবিল
            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {TYPE_LABELS[competition.type] ?? competition.type}
            </span>
          </h2>
          <StandingsTable standings={standings} />
        </section>
      )}

      <section className="mt-9" aria-label="ম্যাচসমূহ">
        <h2 className="mb-4 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
          ম্যাচসমূহ
          <span className="tabular rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {toBn(matches.length)}
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/50 p-3.5">
            <p className="mb-3 flex items-center gap-2 border-b border-border pb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" aria-hidden /> ফলাফল
            </p>
            <div className="space-y-3">
              {finished.slice(0, 6).map((m) => (
                <MatchCard key={m.id} match={m} showCompetition={false} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3.5">
            <p className="mb-3 flex items-center gap-2 border-b border-border pb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" aria-hidden /> আসন্ন
            </p>
            <div className="space-y-3">
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
