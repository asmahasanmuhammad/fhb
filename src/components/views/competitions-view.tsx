"use client";

import { useQuery } from "@tanstack/react-query";
import type { CompetitionRef, Match, Standing } from "@/lib/types";
import { MatchCard } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { Shield, ChevronRight, Trophy } from "lucide-react";

type Competition = CompetitionRef & {
  season: string;
  country: string;
  description: string | null;
  _count?: { matches: number };
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

  const typeLabels: Record<string, string> = {
    LEAGUE: "লিগ",
    CUP: "কাপ",
    INTERNATIONAL: "আন্তর্জাতিক",
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <Shield className="h-6 w-6 text-primary" aria-hidden />
        টুর্নামেন্ট ও কম্পিটিশন
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data?.competitions ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: "competition-detail", id: c.id })}
              className="card-lift group relative overflow-hidden rounded-xl border bg-card p-5 text-left"
              style={{ background: `linear-gradient(160deg, ${c.accentColor ?? "#10B981"}1c 0%, transparent 65%)` }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
                  style={{ background: `linear-gradient(135deg, ${c.accentColor ?? "#10B981"}, #065F46)` }}
                  aria-hidden
                >
                  <Trophy className="h-6 w-6 text-white" />
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
              </div>
              <h3 className="mt-3 text-base font-bold">{c.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {typeLabels[c.type] ?? c.type} • সিজন {toBn(c.season.replace("-", "-"))}
              </p>
              {c.description && <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">{c.description}</p>}
              <p className="mt-3 text-[11px] font-semibold text-primary">{toBn(c._count?.matches ?? 0)} ম্যাচ ট্র্যাক করা হচ্ছে</p>
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
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const { competition, standings, matches, topScorers } = data;
  const finished = matches.filter((m) => m.status === "FINISHED");
  const upcoming = matches.filter((m) => m.status !== "FINISHED").reverse();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
        ← ফিরে যান
      </button>

      <div
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{ background: `linear-gradient(150deg, ${competition.accentColor ?? "#10B981"}26 0%, transparent 70%)` }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${competition.accentColor ?? "#10B981"}, #065F46)` }}
            aria-hidden
          >
            <Trophy className="h-7 w-7 text-white" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">{competition.name}</h1>
            <p className="text-sm text-muted-foreground">
              সিজন {competition.season} • {competition.country}
            </p>
          </div>
        </div>
        {competition.description && <p className="mt-4 text-sm leading-relaxed text-foreground/80">{competition.description}</p>}
      </div>

      {standings.length > 0 && (
        <section className="mt-8" aria-label="স্ট্যান্ডিং">
          <h2 className="mb-4 font-display text-lg font-bold tracking-wide">পয়েন্ট টেবিল</h2>
          <StandingsTable standings={standings} />
        </section>
      )}

      <section className="mt-8" aria-label="ম্যাচসমূহ">
        <h2 className="mb-4 font-display text-lg font-bold tracking-wide">ম্যাচসমূহ</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">ফলাফল</p>
            <div className="space-y-3">
              {finished.slice(0, 6).map((m) => (
                <MatchCard key={m.id} match={m} showCompetition={false} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">আসন্ন</p>
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
