"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import type { Match } from "@/lib/types";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * FHB 4.0 — Live score ticker strip.
 * Broadcast-style live rail pinned to the very top of every page.
 * Live matches first (with ticking minute), then today's results,
 * then next kick-offs. Click any pill → Match Centre.
 * Desktop: infinite marquee. Mobile: native horizontal scroll.
 */

function shortLabel(name: string | undefined, initials: string | undefined, limit = 3) {
  if (!name) return initials ?? "—";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, limit).toUpperCase();
  return parts
    .slice(0, limit)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function TickerPill({ match }: { match: Match }) {
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  const lm = live.matches.find((m) => m.id === match.id);
  const isLive = match.status === "LIVE" || !!lm;
  const isFinished = !isLive && match.status === "FINISHED";
  const home = lm?.homeScore ?? match.homeScore;
  const away = lm?.awayScore ?? match.awayScore;

  return (
    <button
      onClick={() => navigate({ name: "match-detail", id: match.id })}
      className="group flex h-[26px] shrink-0 items-center gap-2 rounded-[5px] px-2.5 text-left transition-colors hover:bg-white/[0.06]"
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}${isLive ? " — live" : ""}`}
    >
      <span
        className={cn(
          "label-cond tabular w-[34px] shrink-0 text-center text-[11px] font-bold leading-none",
          isLive ? "text-fhb-red" : "text-muted-foreground/80"
        )}
      >
        {isLive
          ? lm?.period === "HT"
            ? "HT"
            : `${fmtNum(lm?.minute ?? match.minute)}′`
          : isFinished
            ? "FT"
            : "—"}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-[11.5px] font-semibold leading-none text-foreground/85">
          {match.homeTeam.shortName?.slice(0, 3).toUpperCase() ?? shortLabel(match.homeTeam.name, match.homeTeam.initials)}
        </span>
        <span
          className={cn(
            "tabular rounded-[3px] px-1.5 py-[2px] text-[11px] font-bold leading-none",
            isLive ? "bg-white/[0.08] text-foreground" : "text-foreground/90"
          )}
        >
          {isLive || isFinished ? `${fmtNum(home)} - ${fmtNum(away)}` : "vs"}
        </span>
        <span className="text-[11.5px] font-semibold leading-none text-foreground/85">
          {match.awayTeam.shortName?.slice(0, 3).toUpperCase() ?? shortLabel(match.awayTeam.name, match.awayTeam.initials)}
        </span>
      </span>
    </button>
  );
}

export function ScoreTicker() {
  const { data } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "ticker"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=10&limit=80");
      return res.json().then((j) => j.data);
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const navigate = useAppStore((s) => s.navigate);

  const items = useMemo(() => {
    const all = data?.matches ?? [];
    const live = all.filter((m) => m.status === "LIVE");
    const todayStr = new Date().toDateString();
    const finishedToday = all.filter(
      (m) => m.status === "FINISHED" && new Date(m.kickoff).toDateString() === todayStr
    );
    const next = all
      .filter((m) => m.status === "SCHEDULED")
      .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
      .slice(0, 10);
    return [...live, ...finishedToday, ...next].slice(0, 18);
  }, [data]);

  const liveCount = items.filter((m) => m.status === "LIVE").length;

  return (
    <div
      className="relative z-[60] flex h-9 items-stretch border-b border-border bg-[#080d1a]/95"
      role="region"
      aria-label="Live score ticker"
    >
      {/* Brand rail */}
      <button
        onClick={() => navigate({ name: "scores" })}
        className="flex shrink-0 items-center gap-2 border-r border-border px-3.5 sm:px-4"
        aria-label="Go to live scores"
      >
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-[7px] w-[7px] rounded-[2px]",
              liveCount > 0 ? "live-dot bg-fhb-red" : "bg-muted-foreground/60"
            )}
            aria-hidden
          />
          <span className="label-cond text-[12px] font-bold tracking-[0.08em] text-foreground/90">
            {liveCount > 0 ? "Live" : "Scores"}
          </span>
        </span>
        {liveCount > 0 && (
          <span className="tabular rounded-[3px] bg-fhb-red px-1.5 py-[1px] text-[10px] font-bold leading-[15px] text-white">
            {fmtNum(liveCount)}
          </span>
        )}
      </button>

      {/* Scores rail */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex h-full items-center px-4">
            <span className="label-cond text-[11px] tracking-[0.08em] text-muted-foreground/70">
              No matches in play — next fixtures shown shortly
            </span>
          </div>
        ) : (
          <>
            {/* Mobile / tablet: native scroll */}
            <div className="no-scrollbar flex h-full items-center gap-1 overflow-x-auto px-2 md:hidden">
              {items.map((m) => (
                <TickerPill key={m.id} match={m} />
              ))}
            </div>
            {/* Desktop: marquee only when there are enough items to loop
                without visible repetition; otherwise a static scroll row */}
            <div className="relative hidden h-full md:block">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[oklch(0.108_0.004_264)] to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[oklch(0.108_0.004_264)] to-transparent" aria-hidden />
              <div className="fhb-scroll h-full overflow-x-auto">
                <div
                  className={
                    items.length >= 8
                      ? "marquee-track flex h-full w-max items-center gap-1 px-2"
                      : "flex h-full w-max items-center gap-1 px-2"
                  }
                >
                  {(items.length >= 8 ? [...items, ...items] : items).map((m, i) => (
                    <TickerPill key={`${m.id}-${i}`} match={m} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right meta */}
      <div className="hidden shrink-0 items-center gap-3 border-l border-border px-4 lg:flex">
        <span className="label-cond text-[11px] font-semibold tracking-[0.08em] text-muted-foreground/80">
          Football Hub Bangladesh
        </span>
      </div>
    </div>
  );
}
