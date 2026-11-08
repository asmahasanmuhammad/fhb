"use client";

import { TeamBadge } from "./team-badge";
import { LiveBadge } from "./live-badge";
import { formatKickoff, toBn } from "@/lib/format";
import type { Match } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

/**
 * Universal match card. Live matches auto-refresh via WebSocket.
 */
export function MatchCard({
  match,
  showCompetition = true,
  onClick,
}: {
  match: Match;
  showCompetition?: boolean;
  onClick?: () => void;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  const liveData = live.matches.find((m) => m.id === match.id);

  const status = liveData ? "LIVE" : match.status;
  const homeScore = liveData ? liveData.homeScore : match.homeScore;
  const awayScore = liveData ? liveData.awayScore : match.awayScore;
  const minute = liveData ? liveData.minute : match.minute;
  const period = liveData ? liveData.period : match.period;
  const ko = formatKickoff(match.kickoff);

  return (
    <button
      onClick={onClick ?? (() => navigate({ name: "match-detail", id: match.id }))}
      className="card-lift group w-full rounded-xl border bg-card p-3.5 text-left"
      aria-label={`${match.homeTeam.name} বনাম ${match.awayTeam.name} ম্যাচ দেখুন`}
    >
      {showCompetition && (
        <div className="mb-2.5 flex items-center justify-between gap-2 min-w-0">
          <span className="min-w-0 truncate text-[11px] font-medium text-muted-foreground">
            {match.competition.name}
            {match.round ? ` • ${match.round}` : match.matchday ? ` • রাউন্ড ${toBn(match.matchday)}` : ""}
          </span>
          {status === "LIVE" ? (
            <LiveBadge minute={minute} period={period} />
          ) : status === "FINISHED" ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-semibold text-muted-foreground">
              শেষ
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-display text-[10px] font-semibold text-primary">
              {ko.relative} • {ko.time}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Home team */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamBadge team={match.homeTeam} size="md" />
          <p
            className={cn(
              "min-w-0 truncate text-sm font-semibold",
              status !== "SCHEDULED" && (homeScore ?? 0) > (awayScore ?? 0) && "text-primary"
            )}
          >
            {match.homeTeam.name}
          </p>
        </div>

        {/* Score / kickoff time */}
        <div className="shrink-0 px-1">
          {status === "SCHEDULED" ? (
            <div className="rounded-lg bg-muted px-3 py-1.5 text-center">
              <p className="font-display text-base font-bold leading-tight">{ko.time}</p>
            </div>
          ) : (
            <div
              className={cn(
                "rounded-lg px-3 py-1.5 text-center font-display text-2xl font-bold leading-none tracking-wider",
                status === "LIVE" ? "bg-fhb-red/10 text-fhb-red" : "bg-muted text-foreground"
              )}
            >
              {toBn(homeScore ?? 0)}
              <span className="mx-1 text-muted-foreground/50">-</span>
              {toBn(awayScore ?? 0)}
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <p
            className={cn(
              "min-w-0 truncate text-sm font-semibold",
              status !== "SCHEDULED" && (awayScore ?? 0) > (homeScore ?? 0) && "text-primary"
            )}
          >
            {match.awayTeam.name}
          </p>
          <TeamBadge team={match.awayTeam} size="md" />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{match.venue ?? "ভেন্যু নির্ধারিত হয়নি"}</span>
        </span>
        <span className="shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100">বিস্তারিত →</span>
      </div>
    </button>
  );
}
