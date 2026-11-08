"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Standing, CompetitionRef } from "@/lib/types";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamBadge } from "@/components/football/team-badge";
import { SectionHeader } from "@/components/football/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { Trophy, Goal } from "lucide-react";

export function StandingsView() {
  const navigate = useAppStore((s) => s.navigate);
  const [tab, setTab] = useState<"table" | "scorers">("table");

  const { data: compsData } = useQuery<{ competitions: Array<CompetitionRef & { _count?: { matches: number } }> }>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
  });

  const leagueComp = compsData?.competitions?.find((c) => c.type === "LEAGUE");
  const [compId, setCompId] = useState<string | null>(null);
  const activeId = compId ?? leagueComp?.id ?? null;

  const { data, isLoading } = useQuery<{ standings: Standing[]; topScorers: Array<{ id: string; name: string; goals: number; assists: number; position: string; team: { id: string; name: string; initials: string; color: string } | null }> }>({
    queryKey: ["standings", activeId],
    queryFn: async () => {
      const res = await fetch(`/api/standings${activeId ? `?competitionId=${activeId}` : ""}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!activeId,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <Trophy className="h-6 w-6 text-fhb-gold" aria-hidden />
        লিগ টেবিল ও পরিসংখ্যান
      </h1>

      {/* Competition selector */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {(compsData?.competitions ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setCompId(c.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
              activeId === c.id ? "border-primary/60 bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "table" | "scorers")} className="mb-5">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="table" className="text-xs font-bold">
            পয়েন্ট টেবিল
          </TabsTrigger>
          <TabsTrigger value="scorers" className="text-xs font-bold">
            সেরা গোলদাতা
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : tab === "table" ? (
        (data?.standings?.length ?? 0) > 0 ? (
          <>
            <StandingsTable standings={data!.standings} />
            <div className="mt-4 flex flex-wrap gap-4 rounded-xl border bg-card p-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-fhb-gold" /> চ্যাম্পিয়ন জোন
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-fhb-red" /> রেলিগেশন জোন
              </span>
              <span>জ = জয় • ড = ড্র • হ = হার • গড = গোল ব্যবধান</span>
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            এই টুর্নামেন্টে কাপ ফরম্যাট চলছে — লিগ টেবিল প্রযোজ্য নয়। ম্যাচ দেখুন{" "}
            <button onClick={() => navigate({ name: "scores" })} className="font-semibold text-primary">
              লাইভ স্কোর
            </button>{" "}
            পেজে।
          </p>
        )
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          {(data?.topScorers ?? []).map((p, i) => (
            <button
              key={p.id}
              onClick={() => navigate({ name: "player-detail", id: p.id })}
              className="flex w-full items-center gap-3 border-b border-border/40 p-3.5 text-left transition-colors last:border-0 hover:bg-accent/40 sm:gap-4"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold ${
                  i === 0 ? "bg-fhb-gold/20 text-fhb-gold" : i < 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {toBn(i + 1)}
              </span>
              {p.team && <TeamBadge team={p.team} size="sm" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{p.team?.name ?? "—"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-center">
                <div>
                  <p className="flex items-center gap-1 font-display text-lg font-bold text-primary">
                    <Goal className="h-3.5 w-3.5" aria-hidden />
                    {toBn(p.goals)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">গোল</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{toBn(p.assists)}</p>
                  <p className="text-[9px] text-muted-foreground">অ্যাসিস্ট</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
