"use client";

import { TeamCrest } from "./team-badge";
import { LiveBadge } from "./live-badge";
import { formatKickoff, fmtNum } from "@/lib/format";
import type { Match, MatchEvent } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { cn } from "@/lib/utils";
import { ChevronRight, Tv } from "lucide-react";

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
 * FHB 3.0 — FotMob / LiveScore style match row.
 * Sharp, dense, broadcast — no rounded corners, tight layout.
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
        "group relative flex w-full items-stretch text-left transition-all border-b border-white/10",
        status === "LIVE"
          ? "bg-[#ff1e46]/[0.08] hover:bg-[#ff1e46]/[0.14]"
          : "hover:bg-white/[0.06]",
        className
      )}
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* Live indicator bar — left edge */}
      {status === "LIVE" && (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#ff1e46] shadow-[0_0_8px_#ff1e46]" aria-hidden />
      )}

      {/* Status column */}
      <div className="flex w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-white/12 py-3 sm:w-[60px] bg-black/20">
        {status === "LIVE" ? (
          <>
            <span className="tabular font-black text-[14px] leading-none text-[#ff1e46] tracking-tight drop-shadow-[0_0_6px_rgba(255,30,70,0.5)]">
              {period === "HT" ? "HT" : `${fmtNum(minute ?? 0)}'`}
            </span>
            <span className="live-dot mt-0.5 h-1.5 w-1.5 rounded-full bg-[#ff1e46] shadow-[0_0_6px_#ff1e46]" aria-hidden />
          </>
        ) : status === "FINISHED" ? (
          <span className="text-[10.5px] font-black uppercase tracking-widest text-[#94a3b8] px-1.5 py-0.5 bg-white/10 rounded">FT</span>
        ) : (
          <>
            <span className="tabular font-extrabold text-[13px] leading-none text-white">
              {ko.time}
            </span>
            <span className="text-[9.5px] font-bold leading-none text-[#cbd5e1] mt-0.5">
              {ko.relative === "Today" || ko.relative === "Tomorrow" || ko.relative === "Yesterday"
                ? ko.relative.slice(0, 3).toUpperCase()
                : ko.date.split(",")[0]}
            </span>
          </>
        )}
      </div>

      {/* Teams + scorers */}
      <div className="min-w-0 flex-1 py-2.5 pl-3 sm:pl-4">
        {showCompetition && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-black text-white">
            <span
              className="h-[7px] w-[7px] rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: match.competition.accentColor ?? "#ff1e46" }}
              aria-hidden
            />
            <span className="truncate uppercase tracking-wide text-white">
              {match.competition.shortName ?? match.competition.name}
              {match.round ? ` · ${match.round}` : match.matchday ? ` · MD${fmtNum(match.matchday)}` : ""}
            </span>
          </p>
        )}
        <div className="space-y-1.5">
          <TeamLine team={match.homeTeam} score={homeScore} won={homeWon} status={status} scorers={homeScorers} />
          <TeamLine team={match.awayTeam} score={awayScore} won={awayWon} status={status} scorers={awayScorers} />
        </div>
      </div>

      {/* Chevron */}
      <div className="flex w-6 shrink-0 items-center justify-center pr-1 opacity-0 transition-opacity group-hover:opacity-100">
        <ChevronRight className="h-4 w-4 text-white" aria-hidden />
      </div>
    </button>
  );
}

function TeamLine({
  team, score, won, status, scorers,
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
        <span className={cn(
          "block truncate text-[13px] leading-tight font-extrabold",
          won || status === "LIVE"
            ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
            : "text-[#f1f5f9]"
        )}>
          {team.name}
        </span>
        {status === "FINISHED" && scorers.length > 0 && (
          <span className="mt-0.5 block truncate text-[10.5px] leading-tight text-[#94a3b8] font-medium">
            {scorers.slice(0, 2).map((s, i) => (
              <span key={s.name}>
                {i > 0 && ", "}
                {shortName(s.name)} {s.minutes.map((m) => `${fmtNum(m)}'`).join(", ")}
              </span>
            ))}
            {scorers.length > 2 && ` +${scorers.length - 2}`}
          </span>
        )}
      </div>
      <span className={cn(
        "tabular w-6 shrink-0 text-right font-black text-[15px] leading-none",
        status === "SCHEDULED"
          ? "invisible"
          : status === "LIVE"
            ? "text-[#ff1e46] drop-shadow-[0_0_8px_rgba(255,30,70,0.6)]"
            : "text-white"
      )}>
        {showScore && fmtNum(score ?? 0)}
      </span>
    </div>
  );
}

/**
 * FHB 3.0 — Featured match card.
 * Broadcast-grade panel: deep carbon, big team crests, sharp score display.
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
        "group relative flex h-full w-full flex-col overflow-hidden rounded-md border text-left transition-all",
        "bg-gradient-to-b from-[#0e1628] to-[#070b15] shadow-lg",
        status === "LIVE"
          ? "border-[#ff1e46]/60 shadow-[0_0_25px_rgba(255,30,70,0.2)] hover:border-[#ff1e46]"
          : "border-white/15 hover:border-white/35 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)]",
        className
      )}
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      {/* Stadium glow */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        status === "LIVE" ? "stadium-glow-red" : "stadium-glow"
      )} />

      {/* Competition strip */}
      {showCompetition && (
        <div className="relative flex items-center justify-between gap-2 border-b border-white/12 px-4 py-2.5 bg-black/40">
          <span className="flex min-w-0 items-center gap-2 text-[11px] font-black text-white">
            <span
              className="h-[7px] w-[7px] rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: match.competition.accentColor ?? "#ff1e46" }}
              aria-hidden
            />
            <span className="truncate uppercase tracking-wider text-white">
              {match.competition.name}
              {match.round && (
                <span className="ml-1.5 text-white/60">· {match.round}</span>
              )}
            </span>
          </span>
          {status === "LIVE" ? (
            <LiveBadge minute={minute} period={period} size="sm" />
          ) : status === "FINISHED" ? (
            <span className="shrink-0 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white bg-white/15 rounded">FT</span>
          ) : (
            <span className="shrink-0 px-2 py-0.5 text-[10px] font-black text-white bg-[#ff1e46] rounded shadow-sm">
              {ko.relative === "Today" || ko.relative === "Tomorrow" || ko.relative === "Yesterday"
                ? ko.relative.toUpperCase()
                : ko.date.split(",")[0].toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Teams + Score — main body */}
      <div className="relative grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-6 sm:gap-4 sm:px-5 sm:py-7">
        <TeamBlock team={match.homeTeam} scorers={homeScorers} status={status} />

        {/* Score / time center */}
        <div className="shrink-0 px-1 text-center">
          {status === "SCHEDULED" ? (
            <>
              <p className="tabular font-black text-[34px] leading-none text-white sm:text-[40px] drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                {ko.time}
              </p>
              <p className="mt-3 inline-block rounded border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-extrabold text-white uppercase tracking-wider">
                Kick-off {ko.relative}
              </p>
            </>
          ) : (
            <>
              <p className="tabular font-black leading-none text-[36px] sm:text-[44px]">
                <span className={status === "LIVE" ? "text-[#ff1e46] drop-shadow-[0_0_12px_rgba(255,30,70,0.6)]" : "text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"}>
                  {fmtNum(homeScore ?? 0)}
                </span>
                <span className="text-white/40 mx-2">–</span>
                <span className={status === "LIVE" ? "text-[#ff1e46] drop-shadow-[0_0_12px_rgba(255,30,70,0.6)]" : "text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"}>
                  {fmtNum(awayScore ?? 0)}
                </span>
              </p>
              <p className="mt-2.5">
                <LiveBadge minute={minute} period={period} size="sm" />
              </p>
            </>
          )}
        </div>

        <TeamBlock team={match.awayTeam} scorers={awayScorers} status={status} />
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between gap-2 border-t border-white/12 bg-black/40 px-4 py-2.5 sm:px-5">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#cbd5e1] font-semibold">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff1e46]" aria-hidden />
          <span className="truncate">{match.venue ?? match.competition.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded bg-[#ff1e46] px-3 py-1 text-[11px] font-black text-white transition-all group-hover:bg-[#e01438] shadow-[0_0_10px_rgba(255,30,70,0.4)]">
          {status === "LIVE" ? <><Tv className="h-3.5 w-3.5" /> Watch Live</> : <>Match Centre <ChevronRight className="h-3.5 w-3.5" /></>}
        </span>
      </div>
    </button>
  );
}

function TeamBlock({
  team, scorers, status,
}: {
  team: Match["homeTeam"];
  scorers: Array<{ name: string; minutes: number[] }>;
  status: Match["status"];
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
      <TeamCrest team={team} size="match" />
      <div className="min-w-0 w-full">
        <p className="line-clamp-2 text-[14px] font-black leading-tight text-white sm:text-[15px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {team.name}
        </p>
        {status === "FINISHED" && scorers.length > 0 && (
          <p className="mt-1 line-clamp-2 text-[10.5px] font-semibold leading-tight text-[#94a3b8]">
            {scorers.map((s, i) => (
              <span key={s.name}>
                {i > 0 && ", "}
                {shortName(s.name)} {s.minutes.map((m) => `${fmtNum(m)}'`).join(", ")}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
