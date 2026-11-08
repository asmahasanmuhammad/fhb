"use client";

import { TeamBadge } from "./team-badge";
import { LiveBadge } from "./live-badge";
import { formatKickoff, toBn } from "@/lib/format";
import type { Match } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { cn } from "@/lib/utils";
import { MapPin, ChevronRight } from "lucide-react";

/**
 * Broadcast-grade match card — data-dense, tabular score,
 * status edge for LIVE, restrained hover.
 */
export function MatchCard({
  match,
  showCompetition = true,
  onClick,
  className,
}: {
  match: Match;
  showCompetition?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  const liveData = live.matches.find((m) => m.id === match.id);

  const status = liveData ? ("LIVE" as const) : match.status;
  const homeScore = liveData ? liveData.homeScore : match.homeScore;
  const awayScore = liveData ? liveData.awayScore : match.awayScore;
  const minute = liveData ? liveData.minute : match.minute;
  const period = liveData ? liveData.period : match.period;
  const ko = formatKickoff(match.kickoff);
  const homeWon = status !== "SCHEDULED" && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWon = status !== "SCHEDULED" && (awayScore ?? 0) > (homeScore ?? 0);

  return (
    <button
      onClick={onClick ?? (() => navigate({ name: "match-detail", id: match.id }))}
      className={cn(
        "card-lift group relative w-full overflow-hidden rounded-lg border bg-card p-3 text-left sm:p-3.5",
        status === "LIVE" ? "border-fhb-red/25" : "border-border",
        className
      )}
      aria-label={`${match.homeTeam.name} বনাম ${match.awayTeam.name} ম্যাচ দেখুন`}
    >
      {/* Status edge */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          status === "LIVE" ? "bg-fhb-red" : "bg-transparent"
        )}
      />

      {/* Competition meta */}
      {showCompetition && (
        <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">
              {match.competition.shortName ?? match.competition.name}
              {match.round ? ` • ${match.round}` : match.matchday ? ` • রাউন্ড ${toBn(match.matchday)}` : ""}
            </span>
          </span>
          {status === "LIVE" ? (
            <LiveBadge minute={minute} period={period} size="sm" />
          ) : status === "FINISHED" ? (
            <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              শেষ
            </span>
          ) : (
            <span className="shrink-0 rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-display text-[10px] font-bold text-primary">
              {ko.relative}
            </span>
          )}
        </div>
      )}

      {/* Score row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Home */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 text-right">
          <span
            className={cn(
              "min-w-0 truncate text-[13px] font-semibold leading-snug sm:text-sm",
              homeWon ? "text-foreground" : status === "SCHEDULED" ? "text-foreground" : awayWon ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {match.homeTeam.name}
          </span>
          <TeamBadge team={match.homeTeam} size="sm" />
        </div>

        {/* Score / kickoff */}
        <div className="shrink-0">
          {status === "SCHEDULED" ? (
            <div className="rounded-md border bg-background px-3 py-1.5 text-center">
              <p className="tabular font-display text-base font-bold leading-none">{ko.time}</p>
              <p className="mt-1 hidden text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
                {ko.relative === "আজ" || ko.relative === "আগামীকাল" ? ko.relative : ko.date.split(",")[0]}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "tabular rounded-md px-2.5 py-1 text-center font-display text-2xl font-bold leading-none",
                status === "LIVE" ? "text-fhb-red" : "text-foreground"
              )}
            >
              {toBn(homeScore ?? 0)}
              <span className="mx-1 text-muted-foreground/40">-</span>
              {toBn(awayScore ?? 0)}
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <TeamBadge team={match.awayTeam} size="sm" />
          <span
            className={cn(
              "min-w-0 truncate text-[13px] font-semibold leading-snug sm:text-sm",
              awayWon ? "text-foreground" : status === "SCHEDULED" ? "text-foreground" : homeWon ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Venue meta */}
      <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{match.venue ?? "ভেন্যু নির্ধারিত হয়নি"}</span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          ম্যাচ সেন্টার
          <ChevronRight className="h-3 w-3" aria-hidden />
        </span>
      </div>
    </button>
  );
}
