"use client";

import { TeamBadge } from "./team-badge";
import { LiveBadge } from "./live-badge";
import { formatKickoff, fmtNum } from "@/lib/format";
import type { Match } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { cn } from "@/lib/utils";
import { MapPin, ChevronRight } from "lucide-react";

/**
 * Broadcast-grade match card (FotMob/SofaScore style):
 * stacked team rows + tabular score column + status edge for LIVE.
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
  const homeWon = status === "FINISHED" && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWon = status === "FINISHED" && (awayScore ?? 0) > (homeScore ?? 0);

  return (
    <button
      onClick={onClick ?? (() => navigate({ name: "match-detail", id: match.id }))}
      className={cn(
        "card-lift edge-lit group relative w-full overflow-hidden rounded-xl border bg-card p-3.5 text-left sm:p-4",
        status === "LIVE" ? "border-fhb-red/30" : "border-border",
        className
      )}
      aria-label={`View match: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* LIVE status edge */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          status === "LIVE" ? "bg-fhb-red" : "bg-transparent"
        )}
      />

      {/* Competition meta strip */}
      {showCompetition && (
        <div className="mb-3 flex min-w-0 items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <span className="flex min-w-0 items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span
              className="h-2 w-2 shrink-0 rounded-[3px]"
              style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">
              {match.competition.shortName ?? match.competition.name}
              {match.round ? ` • ${match.round}` : match.matchday ? ` • Round ${fmtNum(match.matchday)}` : ""}
            </span>
          </span>
          {status === "LIVE" ? (
            <LiveBadge minute={minute} period={period} size="sm" />
          ) : status === "FINISHED" ? (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              FT
            </span>
          ) : (
            <span className="shrink-0 rounded-md border border-primary/35 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {ko.relative === "Today" || ko.relative === "Tomorrow" || ko.relative === "Yesterday" ? ko.relative : ko.date.split(",")[0]}
            </span>
          )}
        </div>
      )}

      {/* Team rows */}
      <div className="space-y-2.5">
        <TeamRow team={match.homeTeam} score={homeScore} won={homeWon} status={status} />
        <TeamRow team={match.awayTeam} score={awayScore} won={awayWon} status={status} />
      </div>

      {/* Footer meta */}
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[10px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{match.venue ?? "Venue TBD"}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {status === "SCHEDULED" && (
            <span className="tabular mr-1 font-display font-semibold text-foreground/80">{ko.time}</span>
          )}
          <span className="flex items-center gap-0.5 font-semibold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Match Centre
            <ChevronRight className="h-3 w-3" aria-hidden />
          </span>
        </span>
      </div>
    </button>
  );
}

/** Stacked team row — badge, name, tabular score. */
function TeamRow({
  team,
  score,
  won,
  status,
}: {
  team: Match["homeTeam"];
  score: number | null;
  won: boolean;
  status: Match["status"];
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <TeamBadge team={team} size="sm" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px] leading-snug sm:text-sm",
          won || status === "SCHEDULED" || status === "LIVE" ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
        )}
      >
        {team.name}
      </span>
      <span
        className={cn(
          "tabular shrink-0 font-display text-lg font-bold leading-none sm:text-xl",
          won ? "text-foreground" : status === "SCHEDULED" ? "hidden" : status === "LIVE" ? "text-fhb-red" : "text-muted-foreground"
        )}
      >
        {status !== "SCHEDULED" && fmtNum(score ?? 0)}
      </span>
    </div>
  );
}
