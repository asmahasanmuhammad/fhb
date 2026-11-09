"use client";

import { TeamCrest } from "./team-badge";
import { LiveBadge } from "./live-badge";
import { formatKickoff, fmtNum } from "@/lib/format";
import type { Match, MatchEvent } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

/** Aggregate scorers: "N. Williams 23', 45'" instead of repeated rows. */
function aggregateScorers(events: MatchEvent[] | undefined, side: "home" | "away") {
  const goals = (events ?? []).filter((e) => e.type === "GOAL" && e.teamSide === side);
  const byName = new Map<string, number[]>();
  for (const g of goals) {
    const key = g.playerName ?? "Unknown";
    byName.set(key, [...(byName.get(key) ?? []), g.minute]);
  }
  return Array.from(byName.entries()).map(([name, minutes]) => ({ name, minutes }));
}

function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

/**
 * Broadcast match row (FotMob/SofaScore style).
 * Dense list row: compact status column, stacked teams with real crests,
 * right-anchored score cluster, aggregated goal scorers.
 */
export function MatchRow({
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
  const homeScorers = aggregateScorers(match.events, "home");
  const awayScorers = aggregateScorers(match.events, "away");

  return (
    <button
      onClick={onClick ?? (() => navigate({ name: "match-detail", id: match.id }))}
      className={cn(
        "group relative flex w-full items-stretch text-left transition-colors",
        status === "LIVE" ? "bg-fhb-red/[0.045]" : "hover:bg-white/[0.025]",
        className
      )}
      aria-label={`View match: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* Status column */}
      <div className="flex w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-border/50 sm:w-[52px]">
        {status === "LIVE" ? (
          <>
            <span className="tabular font-display text-[15px] font-bold leading-none text-fhb-red">
              {period === "HT" ? "HT" : `${fmtNum(minute ?? 0)}′`}
            </span>
            <span className="live-dot h-1 w-1 rounded-full bg-fhb-red" aria-hidden />
          </>
        ) : status === "FINISHED" ? (
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">FT</span>
        ) : (
          <>
            <span className="tabular font-display text-[13px] font-semibold leading-none text-foreground/85">
              {ko.time}
            </span>
            <span className="text-[9px] font-medium leading-none text-muted-foreground">
              {ko.relative === "Today" || ko.relative === "Tomorrow" || ko.relative === "Yesterday"
                ? ko.relative
                : ko.date.split(",")[0]}
            </span>
          </>
        )}
      </div>

      {/* Teams + scorers */}
      <div className="min-w-0 flex-1 py-2.5 pl-3 sm:pl-4">
        {showCompetition && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground">
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-[2px]"
              style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">
              {match.competition.shortName ?? match.competition.name}
              {match.round ? ` · ${match.round}` : match.matchday ? ` · MD ${fmtNum(match.matchday)}` : ""}
            </span>
          </p>
        )}
        <div className="space-y-1">
          <TeamLine team={match.homeTeam} score={homeScore} won={homeWon} status={status} scorers={homeScorers} />
          <TeamLine team={match.awayTeam} score={awayScore} won={awayWon} status={status} scorers={awayScorers} />
        </div>
      </div>

      {/* Chevron */}
      <div className="flex w-7 shrink-0 items-center justify-center pr-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>

      {status === "LIVE" && <span aria-hidden className="absolute inset-y-0 left-0 w-[2.5px] bg-fhb-red" />}
    </button>
  );
}

/** One team line: crest, name, aggregated scorer sub-line, tabular score. */
function TeamLine({
  team,
  score,
  won,
  status,
  scorers,
}: {
  team: Match["homeTeam"];
  score: number | null;
  won: boolean;
  status: Match["status"];
  scorers: Array<{ name: string; minutes: number[] }>;
}) {
  const showScore = status !== "SCHEDULED";
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <TeamCrest team={team} size="sm" />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[13px] leading-tight",
            won || status === "LIVE" || status === "SCHEDULED"
              ? "font-semibold text-foreground"
              : "font-medium text-muted-foreground"
          )}
        >
          {team.name}
        </span>
        {status === "FINISHED" && scorers.length > 0 && (
          <span className="mt-0.5 block truncate text-[10.5px] leading-tight text-muted-foreground/85">
            {scorers.slice(0, 2).map((s, i) => (
              <span key={s.name}>
                {i > 0 && ", "}
                {shortName(s.name)} {s.minutes.map((m) => `${fmtNum(m)}′`).join(", ")}
              </span>
            ))}
            {scorers.length > 2 && ` +${scorers.length - 2} more`}
          </span>
        )}
      </div>
      <span
        className={cn(
          "tabular w-6 shrink-0 text-right font-display text-[15px] font-bold leading-none",
          status === "SCHEDULED"
            ? "hidden"
            : status === "LIVE"
              ? "text-fhb-red"
              : won
                ? "text-foreground"
                : "text-muted-foreground"
        )}
      >
        {showScore && fmtNum(score ?? 0)}
      </span>
    </div>
  );
}

/**
 * Featured match card — hero/broadcast treatment for the top match.
 * Panel with depth, big crests, prominent score/time, venue + CTA footer.
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
  const homeScorers = aggregateScorers(match.events, "home");
  const awayScorers = aggregateScorers(match.events, "away");

  return (
    <button
      onClick={onClick ?? (() => navigate({ name: "match-detail", id: match.id }))}
      className={cn(
        "stadium-panel pitch-pattern edge-lit card-lift group relative flex h-full w-full flex-col overflow-hidden rounded-xl border text-left",
        status === "LIVE" ? "border-fhb-red/40" : "border-border",
        className
      )}
      aria-label={`View match: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* Competition strip */}
      {showCompetition && (
        <div className="relative flex items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-foreground/90">
            <span
              className="h-[8px] w-[8px] shrink-0 rounded-[2px]"
              style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
              aria-hidden
            />
            <span className="truncate">{match.competition.name}</span>
            {match.round && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {match.round}
              </span>
            )}
          </span>
          {status === "LIVE" ? (
            <LiveBadge minute={minute} period={period} size="sm" />
          ) : status === "FINISHED" ? (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">FT</span>
          ) : (
            <span className="shrink-0 rounded bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {ko.relative === "Today" || ko.relative === "Tomorrow" || ko.relative === "Yesterday"
                ? ko.relative
                : ko.date.split(",")[0]}
            </span>
          )}
        </div>
      )}

      {/* Teams + score */}
      <div className="relative grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-6 sm:gap-4 sm:px-6 sm:py-8">
        <TeamBlock team={match.homeTeam} scorers={homeScorers} status={status} />
        <div className="px-1 text-center">
          {status === "SCHEDULED" ? (
            <>
              <p className="tabular font-display text-[30px] font-bold leading-none text-foreground sm:text-[34px]">
                {ko.time}
              </p>
              <p className="mt-2.5 inline-block rounded-full border border-border bg-card/70 px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                Kick-off {ko.relative}
              </p>
            </>
          ) : (
            <>
              <p className="tabular font-display text-[32px] font-bold leading-none text-foreground sm:text-4xl">
                {fmtNum(homeScore ?? 0)}
                <span className="mx-1.5 font-semibold text-muted-foreground/40">–</span>
                {fmtNum(awayScore ?? 0)}
              </p>
              <p className="mt-2.5">
                <LiveBadge minute={minute} period={period} size="sm" />
              </p>
            </>
          )}
        </div>
        <TeamBlock team={match.awayTeam} scorers={awayScorers} status={status} />
      </div>

      {/* Footer with CTA */}
      <div className="relative flex items-center justify-between gap-2 border-t border-border/70 bg-card/40 px-4 py-2.5 sm:px-6">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
          <span className="truncate">{match.venue ?? match.competition.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-primary/12 px-2.5 py-1 text-[11px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          Match Centre
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}

function TeamBlock({
  team,
  scorers,
  status,
}: {
  team: Match["homeTeam"];
  scorers: Array<{ name: string; minutes: number[] }>;
  status: Match["status"];
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
      <TeamCrest team={team} size="match" />
      <div className="min-w-0">
        <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground sm:text-sm">
          {team.name}
        </p>
        {status === "FINISHED" && scorers.length > 0 && (
          <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground/85">
            {scorers.map((s, i) => (
              <span key={s.name}>
                {i > 0 && ", "}
                {shortName(s.name)} {s.minutes.map((m) => `${fmtNum(m)}′`).join(", ")}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
