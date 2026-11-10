"use client";

import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { TeamCrest } from "@/components/football/team-badge";
import { LiveBadge } from "@/components/football/live-badge";
import type { Match, MatchEvent } from "@/lib/types";
import { formatKickoff, fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, Goal, Repeat, Square } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Live-data merge — any MatchRow/Hero becomes live automatically
   when the socket service pushes an update for its match id.
   ──────────────────────────────────────────────────────────────── */
function useLiveMatch(match: Match) {
  const live = useLiveScores();
  const lm = live.matches.find((m) => m.id === match.id);
  if (!lm) return match;
  return {
    ...match,
    status: "LIVE" as const,
    minute: lm.minute,
    period: lm.period,
    homeScore: lm.homeScore,
    awayScore: lm.awayScore,
  };
}

/* ────────────────────────────────────────────────────────────────
   MatchRow — the dense fixture/result row used everywhere.
   FotMob rhythm: [status 44px | home → | score | ← away], 44px
   height, hairline dividers. Winner bold, loser dimmed (FT).
   ──────────────────────────────────────────────────────────────── */
export function MatchRow({
  match: raw,
  showCompetition = false,
  showVenue = false,
  className,
}: {
  match: Match;
  showCompetition?: boolean;
  showVenue?: boolean;
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const match = useLiveMatch(raw);

  const { time } = formatKickoff(match.kickoff);
  const isScheduled = match.status === "SCHEDULED";
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const homeWon = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <button
      onClick={() => navigate({ name: "match-detail", id: match.id })}
      className={cn(
        "row-hover group flex w-full flex-col px-4 text-left",
        showCompetition ? "py-1.5" : "py-[6px]",
        isLive && "bg-fhb-red/[0.045]",
        className
      )}
    >
      {showCompetition && (
        <span className="mb-1 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <span
            aria-hidden
            className="h-[8px] w-[8px] rounded-[2px]"
            style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
          />
          <span className="truncate font-medium">{match.competition.shortName ?? match.competition.name}</span>
          {match.round && <span className="truncate opacity-70">· {match.round}</span>}
        </span>
      )}
      <span className="flex items-center gap-2">
        {/* status cell */}
        <span className="tabular w-[44px] shrink-0 text-center text-[11px] font-bold">
          {isLive ? (
            <span className={cn(match.period === "HT" ? "text-fhb-gold" : "text-fhb-red")}>
              {match.period === "HT" ? "HT" : `${fmtNum(match.minute)}′`}
            </span>
          ) : isFinished ? (
            <span className="text-muted-foreground">FT</span>
          ) : (
            <span className="text-muted-foreground group-hover:text-foreground">{time}</span>
          )}
        </span>

        {/* home */}
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span
            className={cn(
              "truncate text-right text-[13px] leading-tight",
              homeWon
                ? "font-bold text-foreground"
                : isFinished
                  ? "font-medium text-foreground/55"
                  : "font-medium text-foreground/85"
            )}
          >
            {teamDisplayName(match.homeTeam)}
          </span>
          <TeamCrest team={match.homeTeam} size="xs" />
        </span>

        {/* score */}
        <span className="flex w-[58px] shrink-0 items-center justify-center gap-1">
          {isScheduled ? (
            <span className="text-[11px] font-medium text-muted-foreground/60">–</span>
          ) : (
            <>
              <span
                className={cn(
                  "tabular text-[14px] font-bold",
                  homeWon || isLive ? "text-foreground" : isFinished ? "text-foreground/60" : "text-foreground/80"
                )}
              >
                {fmtNum(match.homeScore)}
              </span>
              <span className="text-[11px] text-muted-foreground/60">–</span>
              <span
                className={cn(
                  "tabular text-[14px] font-bold",
                  awayWon || isLive ? "text-foreground" : isFinished ? "text-foreground/60" : "text-foreground/80"
                )}
              >
                {fmtNum(match.awayScore)}
              </span>
            </>
          )}
        </span>

        {/* away */}
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <TeamCrest team={match.awayTeam} size="xs" />
          <span
            className={cn(
              "truncate text-[13px] leading-tight",
              awayWon
                ? "font-bold text-foreground"
                : isFinished
                  ? "font-medium text-foreground/55"
                  : "font-medium text-foreground/85"
            )}
          >
            {teamDisplayName(match.awayTeam)}
          </span>
        </span>
      </span>

      {showVenue && match.venue && (
        <span className="mt-0.5 pl-[52px] text-[10.5px] text-muted-foreground/70">{match.venue}</span>
      )}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
   MatchCard — medium scoreboard card for grids and rails.
   ──────────────────────────────────────────────────────────────── */
export function MatchCard({ match: raw, className }: { match: Match; className?: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const match = useLiveMatch(raw);
  const { time, relative } = formatKickoff(match.kickoff);
  const isScheduled = match.status === "SCHEDULED";
  const isLive = match.status === "LIVE";

  return (
    <button
      onClick={() => navigate({ name: "match-detail", id: match.id })}
      className={cn(
        "card-lift group flex w-full flex-col overflow-hidden rounded-lg border bg-card p-4 text-left",
        isLive ? "border-fhb-red/40" : "border-border",
        className
      )}
    >
      <span className="mb-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            aria-hidden
            className="h-[8px] w-[8px] shrink-0 rounded-[2px]"
            style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
          />
          <span className="truncate">{match.competition.shortName ?? match.competition.name}</span>
          {match.round && <span className="hidden truncate opacity-70 sm:inline">· {match.round}</span>}
        </span>
        {isLive ? (
          <LiveBadge minute={match.minute} period={match.period} size="sm" />
        ) : match.status === "FINISHED" ? (
          <span className="label-cond rounded-[4px] bg-secondary px-1.5 py-[3px] text-[10px] font-bold text-muted-foreground">
            FT
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {relative}
          </span>
        )}
      </span>

      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-2.5">
          <span className="flex items-center gap-2">
            <TeamCrest team={match.homeTeam} size="sm" />
            <span className="truncate text-[13px] font-semibold text-foreground">{teamDisplayName(match.homeTeam)}</span>
          </span>
          <span className="flex items-center gap-2">
            <TeamCrest team={match.awayTeam} size="sm" />
            <span className="truncate text-[13px] font-semibold text-foreground">{teamDisplayName(match.awayTeam)}</span>
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-center gap-1">
          {isScheduled ? (
            <>
              <span className="score-num text-[20px] text-muted-foreground/70">{time}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {relative}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="score-num text-[28px] text-foreground">{fmtNum(match.homeScore)}</span>
              <span className="score-num pb-1 text-[18px] text-muted-foreground/60">–</span>
              <span className="score-num text-[28px] text-foreground">{fmtNum(match.awayScore)}</span>
            </span>
          )}
        </span>
      </span>

      {match.venue && (
        <span className="mt-3 truncate border-t border-border pt-2.5 text-[10.5px] text-muted-foreground">
          {match.venue}
        </span>
      )}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
   teamDisplayName — long club/national names fall back to their
   short name so rows never truncate ("Bangladesh National Football
   Team" → "Bangladesh").
   ──────────────────────────────────────────────────────────────── */
export function teamDisplayName(team: { name: string; shortName?: string | null }): string {
  if (team.name.length <= 18) return team.name;
  return team.shortName ?? team.name;
}

/* ────────────────────────────────────────────────────────────────
   MatchHeroCard — featured match scoreboard (home hero).
   Flat broadcast panel: league strip, stacked Sofascore-style
   rows (crest · name · score), red top-rule when live.
   ──────────────────────────────────────────────────────────────── */
export function MatchHeroCard({ match: raw, className }: { match: Match; className?: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const match = useLiveMatch(raw);
  const { time, date, relative } = formatKickoff(match.kickoff);
  const isScheduled = match.status === "SCHEDULED";
  const isLive = match.status === "LIVE";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6",
        isLive && "border-t-2 border-t-fhb-red",
        className
      )}
    >
      {/* competition strip */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="h-[10px] w-[10px] shrink-0 rounded-[3px]"
            style={{ backgroundColor: match.competition.accentColor ?? "var(--primary)" }}
          />
          <span className="label-cond truncate text-[13px] font-bold tracking-[0.06em] text-foreground/90">
            {match.competition.shortName ?? match.competition.name}
          </span>
          {(match.round || match.matchday) && (
            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
              {match.round ?? `Matchday ${fmtNum(match.matchday)}`}
            </span>
          )}
        </span>
        {isLive ? (
          <LiveBadge minute={match.minute} period={match.period} />
        ) : match.status === "FINISHED" ? (
          <span className="label-cond shrink-0 rounded-[4px] bg-secondary px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground">
            Full Time
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 rounded-[4px] bg-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            <span className="hidden sm:inline">{relative}</span>
            <span className="sm:hidden">Kick-off {time}</span>
          </span>
        )}
      </div>

      {/* scoreboard — stacked Sofascore-style rows: crest · name · score.
          Never clips at any card width. */}
      <div className="mt-5 flex flex-1 flex-col justify-center gap-1.5">
        {[
          { team: match.homeTeam, score: match.homeScore, side: "Home" as const },
          { team: match.awayTeam, score: match.awayScore, side: "Away" as const },
        ].map((row) => {
          const isWinner =
            match.status !== "SCHEDULED" &&
            row.score != null &&
            (row.side === "Home"
              ? (match.homeScore ?? 0) > (match.awayScore ?? 0)
              : (match.awayScore ?? 0) > (match.homeScore ?? 0));
          return (
            <div key={row.side} className="flex min-w-0 items-center gap-3 py-1.5">
              <TeamCrest team={row.team} size="lg" />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "label-cond block truncate text-[15px] font-semibold leading-tight tracking-[0.04em] sm:text-[17px]",
                    isWinner || isLive || isScheduled ? "text-foreground" : "text-foreground/60"
                  )}
                  title={row.team.name}
                >
                  {teamDisplayName(row.team)}
                </span>
                <span className="mt-0.5 block text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                  {row.side}
                </span>
              </span>
              {!isScheduled && (
                <span
                  className={cn(
                    "score-num tabular shrink-0 text-[30px] sm:text-[38px]",
                    isWinner ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {fmtNum(row.score)}
                </span>
              )}
            </div>
          );
        })}
        {/* rail between/below rows — live minute or kickoff time */}
        <div className="mt-1 flex items-center justify-center gap-2.5">
          <span className="h-px flex-1 bg-border" aria-hidden />
          {isScheduled ? (
            <span className="flex items-baseline gap-2">
              <span className="score-num text-[22px] text-foreground sm:text-[26px]">{time}</span>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {relative}
              </span>
            </span>
          ) : isLive ? (
            <p className="tabular text-[11px] font-bold uppercase tracking-[0.16em] text-fhb-red">
              {match.period === "HT" ? "Half-Time" : `${fmtNum(match.minute)}′`}
            </p>
          ) : (
            <span className="label-cond text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Full Time
            </span>
          )}
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
      </div>

      {/* footer strip */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="min-w-0 truncate text-[11.5px] text-muted-foreground">
          {match.venue ?? "Venue TBC"} · {date}
        </p>
        <button
          onClick={() => navigate({ name: "match-detail", id: match.id })}
          className="group/cta flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] bg-primary px-3.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-95"
        >
          Match Centre
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   MatchEventList — centre-spine timeline (match detail).
   ──────────────────────────────────────────────────────────────── */
function EventIcon({ type }: { type: string }) {
  if (type === "GOAL" || type === "PENALTY")
    return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary"><Goal className="h-3.5 w-3.5" aria-hidden /></span>;
  if (type === "RED")
    return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fhb-red/15"><Square className="h-3 w-3 fill-fhb-red text-fhb-red" aria-hidden /></span>;
  if (type === "YELLOW")
    return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fhb-gold/15"><Square className="h-3 w-3 fill-fhb-gold text-fhb-gold" aria-hidden /></span>;
  if (type === "SUB")
    return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground"><Repeat className="h-3.5 w-3.5" aria-hidden /></span>;
  return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground"><Clock className="h-3.5 w-3.5" aria-hidden /></span>;
}

export function MatchEventList({
  events,
  homeTeam,
  awayTeam,
}: {
  events: MatchEvent[];
  homeTeam: Match["homeTeam"];
  awayTeam: Match["awayTeam"];
}) {
  if (events.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        No events recorded for this match yet.
      </p>
    );
  }
  const sorted = [...events].sort((a, b) => a.minute - b.minute);
  return (
    <div className="relative">
      <span aria-hidden className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-border md:block" />
      <div className="divide-y divide-border/40">
        {sorted.map((ev) => {
          const isHome = ev.teamSide === "home";
          return (
            <div
              key={ev.id}
              className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0.5 px-4 py-3 md:grid-cols-[1fr_auto_1fr]"
            >
              <div
                className={cn(
                  "flex min-w-0 items-center gap-2.5",
                  isHome ? "md:col-start-1 md:justify-end" : "hidden md:col-start-1 md:flex"
                )}
              >
                {isHome && (
                  <>
                    <p className="truncate text-right text-[13px] font-semibold text-foreground">
                      {ev.playerName}
                      {ev.detail && <span className="block text-[11px] font-normal text-muted-foreground">{ev.detail}</span>}
                    </p>
                    <EventIcon type={ev.type} />
                  </>
                )}
              </div>
              <span className="tabular relative z-10 order-first flex h-7 w-11 shrink-0 items-center justify-center rounded-[4px] bg-secondary text-[11px] font-bold text-foreground md:order-none md:col-start-2">
                {fmtNum(ev.minute)}′
              </span>
              <div
                className={cn(
                  "flex min-w-0 items-center gap-2.5",
                  !isHome ? "md:col-start-3 md:justify-start" : "hidden md:col-start-3 md:flex"
                )}
              >
                {!isHome && (
                  <>
                    <EventIcon type={ev.type} />
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {ev.playerName}
                      {ev.detail && <span className="block text-[11px] font-normal text-muted-foreground">{ev.detail}</span>}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="sr-only">
        Key events for {homeTeam.name} versus {awayTeam.name}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   StatBar — dual-sided comparison bar (match/team/player stats).
   ──────────────────────────────────────────────────────────────── */
export function StatBar({
  label,
  home,
  away,
  suffix = "",
}: {
  label: string;
  home: number;
  away: number;
  suffix?: string;
}) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-[12.5px]">
        <span className="tabular font-bold text-foreground">{fmtNum(home)}{suffix}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="tabular font-bold text-foreground">{fmtNum(away)}{suffix}</span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div className="flex flex-1 justify-end rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${homePct}%` }} />
        </div>
        <div className="flex flex-1 rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>
    </div>
  );
}
