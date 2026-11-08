"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Standing, CompetitionRef } from "@/lib/types";
import { StandingsTable } from "@/components/football/standings-table";
import { TeamBadge } from "@/components/football/team-badge";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { toBn } from "@/lib/format";
import { Trophy, Goal, Zap, Medal } from "lucide-react";

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

  const { data, isLoading } = useQuery<{
    standings: Standing[];
    topScorers: Array<{ id: string; name: string; goals: number; assists: number; position: string; team: { id: string; name: string; initials: string; color: string } | null }>;
  }>({
    queryKey: ["standings", activeId],
    queryFn: async () => {
      const res = await fetch(`/api/standings${activeId ? `?competitionId=${activeId}` : ""}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!activeId,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="লিগ টেবিল ও পরিসংখ্যান"
        subtitle="পয়েন্ট টেবিল, ফর্ম গাইড ও সেরা গোলদাতার তালিকা"
        icon={<Trophy className="h-5 w-5" aria-hidden />}
      />

      {/* Competition selector */}
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {(compsData?.competitions ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setCompId(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-bold transition-colors",
              activeId === c.id
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-[2px]"
              style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            {c.name}
          </button>
        ))}
      </div>

      {/* Table / scorers segmented control */}
      <div className="mb-6 flex max-w-sm rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="টেবিল ভিউ">
        {(
          [
            ["table", "পয়েন্ট টেবিল", <Trophy key="t" className="h-3.5 w-3.5" aria-hidden />],
            ["scorers", "সেরা গোলদাতা", <Goal key="g" className="h-3.5 w-3.5" aria-hidden />],
          ] as const
        ).map(([key, label, icon]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition-all",
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : tab === "table" ? (
        (data?.standings?.length ?? 0) > 0 ? (
          <>
            <StandingsTable standings={data!.standings} />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-1 rounded-sm bg-fhb-gold" /> চ্যাম্পিয়ন জোন
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-1 rounded-sm bg-fhb-red" /> রেলিগেশন জোন
              </span>
              <span className="ml-auto border-l border-border pl-4">জ = জয় · ড = ড্র · হ = হার · গড = গোল ব্যবধান</span>
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            এই টুর্নামেন্টে কাপ ফরম্যাট চলছে — লিগ টেবিল প্রযোজ্য নয়। ম্যাচ দেখুন{" "}
            <button
              onClick={() => navigate({ name: "scores" })}
              className="font-bold text-primary hover:underline"
            >
              লাইভ স্কোর
            </button>{" "}
            পেজে।
          </p>
        )
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {(data?.topScorers ?? []).map((p, i) => (
            <button
              key={p.id}
              onClick={() => navigate({ name: "player-detail", id: p.id })}
              className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-accent/40 sm:gap-4"
            >
              <span
                className={cn(
                  "tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold",
                  i === 0
                    ? "bg-fhb-gold/20 text-fhb-gold"
                    : i < 3
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {toBn(i + 1)}
              </span>
              {p.team && <TeamBadge team={p.team} size="sm" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{p.team?.name ?? "—"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-5 text-center">
                <div className="w-12">
                  <p className="tabular flex items-center justify-center gap-1 font-display text-lg font-bold text-primary">
                    <Goal className="h-3.5 w-3.5" aria-hidden />
                    {toBn(p.goals)}
                  </p>
                  <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">গোল</p>
                </div>
                <div className="w-12">
                  <p className="tabular font-display text-lg font-bold text-foreground">{toBn(p.assists)}</p>
                  <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">অ্যাসিস্ট</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Cross-links */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => navigate({ name: "scores" })}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Zap className="h-4 w-4" aria-hidden /> লাইভ স্কোরে যান
        </button>
        <button
          onClick={() => navigate({ name: "players" })}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Medal className="h-4 w-4" aria-hidden /> সব খেলোয়াড়
        </button>
      </div>
    </div>
  );
}
