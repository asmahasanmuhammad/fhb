"use client";

import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Player, TeamRef } from "@/lib/types";
import { POSITION_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Activity, ChevronDown, ChevronLeft, Flag, Search, Users, X } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   Players — dense player index + focused player page.
   PlayersView:      position chips, national toggle, sort select,
                     debounced API search, compact stat-strip cards.
   PlayerDetailView: 860px profile band, stat tiles, season summary,
                     bio and teammates.
   ════════════════════════════════════════════════════════════════ */

/** Player rows from /api/players carry an optional photo. */
type PlayerWithPhoto = Player & { photoUrl?: string | null };

/** Player + teammates payload from GET /api/players/:id (team carries full club info). */
type PlayerDetailData = {
  player: PlayerWithPhoto & { team: (TeamRef & { stadium?: string; founded?: number }) | null };
  similar: PlayerWithPhoto[];
};

const POSITION_CHIPS = [
  { key: "ALL", label: "All" },
  { key: "GK", label: "GK" },
  { key: "DF", label: "DF" },
  { key: "MF", label: "MF" },
  { key: "FW", label: "FW" },
] as const;

type SortId = "goals" | "rating" | "name";

const SORT_OPTIONS: Array<{ id: SortId; label: string }> = [
  { id: "goals", label: "Top Goals" },
  { id: "rating", label: "Top Rating" },
  { id: "name", label: "Name A–Z" },
];

/** One in-feed ad after the eighth card. */
const AD_AFTER = 8;

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Position label helper (chips/tooltips/labels). */
const posLabel = (pos: string) => POSITION_LABELS[pos] ?? pos;

/** Initials for the avatar tile fallback (no photo, no shirt number). */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Ratio formatted to two decimals, safe on zero appearances. */
function perGame(n: number, apps: number): string {
  return apps > 0 ? (n / apps).toFixed(2) : "0.00";
}

/* ════════════════════════════════════════════════════════════════
   PlayersView — player index
   ════════════════════════════════════════════════════════════════ */

export function PlayersView() {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);

  const [position, setPosition] = useState<string>("ALL");
  const [nationalOnly, setNationalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortId>("goals");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());

  const { data, isLoading } = useQuery<{ players: PlayerWithPhoto[] }>({
    queryKey: ["players", position, nationalOnly, sortBy, debouncedQuery || null],
    queryFn: async () => {
      const params = new URLSearchParams({ sort: sortBy });
      if (position !== "ALL") params.set("position", position);
      if (nationalOnly) params.set("national", "true");
      if (debouncedQuery) params.set("q", debouncedQuery);
      const res = await fetch(`/api/players?${params}`);
      return res.json().then((j) => j.data);
    },
  });

  const players = data?.players ?? [];

  /* Rail top scorers — leaders within the current result set. */
  const topScorers = [...players].sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 5);

  const rail = (
    <>
      {topScorers.length > 0 && (
        <RailCard title="Top Scorers">
          <div className="divide-y divide-border/40">
            {topScorers.map((p, i) => (
              <button
                key={p.id}
                onClick={() => navigate({ name: "player-detail", id: p.id })}
                className="row-hover group flex w-full items-center gap-3 px-4 py-2.5 text-left"
              >
                <span
                  className={cn(
                    "score-num w-5 shrink-0 text-center text-[16px] font-bold leading-none",
                    i < 3 ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {i + 1}
                </span>
                {p.team && <TeamCrest team={p.team} size="xs" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-foreground transition-colors group-hover:text-primary">
                    {p.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {p.team?.name ?? "National Team"}
                  </span>
                </span>
                <span className="tabular shrink-0 text-[15px] font-bold leading-none text-foreground">
                  {fmtNum(p.goals)}
                </span>
              </button>
            ))}
          </div>
        </RailCard>
      )}
      <AdSlot placement="SIDEBAR" />
    </>
  );

  return (
    <PageLayout rail={rail}>
      <PageHeader
        title="Players"
        kicker="stars & squad members"
        icon={<Users className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Top scorers, creators and squad players across every competition."
      />

      {/* ── Controls: position chips + national toggle | search + sort ── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by position">
            {POSITION_CHIPS.map((chip) => {
              const active = position === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => setPosition(chip.key)}
                  aria-pressed={active}
                  title={chip.key === "ALL" ? "All positions" : posLabel(chip.key)}
                  className={cn(
                    "flex h-8 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground/75 hover:border-white/20 hover:text-foreground"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setNationalOnly((v) => !v)}
            aria-pressed={nationalOnly}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
              nationalOnly
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card text-foreground/75 hover:border-white/20 hover:text-foreground"
            )}
          >
            <Flag className="h-3 w-3" aria-hidden />
            National Teams
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 xl:w-64 xl:flex-none">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players…"
              aria-label="Search players"
              className="h-9 rounded-[6px] border-border bg-card pl-10 pr-10 text-[13px]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="tap-target absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortId)}
              aria-label="Sort players"
              className="h-9 cursor-pointer appearance-none rounded-[6px] border border-border bg-card pl-3 pr-8 text-[12px] font-semibold text-foreground transition-colors hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11.5px] text-muted-foreground">
        {isLoading
          ? "Loading players…"
          : `${fmtNum(players.length)} ${players.length === 1 ? "player" : "players"}${
              position !== "ALL" ? ` · ${posLabel(position)}s` : ""
            }${nationalOnly ? " · national teams only" : ""}`}
      </p>

      {/* ── Player grid ── */}
      {isLoading ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-[18px] w-9 rounded-[4px]" />
                <Skeleton className="h-[18px] w-7" />
              </div>
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2.5 h-3 w-2/3" />
              <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-border pt-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-9" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="reveal mt-3 rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">No players found</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            {debouncedQuery
              ? `Nothing matches “${debouncedQuery}” under the current filters. Try another name or clear the search.`
              : "No players are listed under the current filters."}
          </p>
          <button
            onClick={() => {
              setQuery("");
              setPosition("ALL");
              setNationalOnly(false);
            }}
            className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="reveal mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {players.map((p, i) => (
            <Fragment key={p.id}>
              <PlayerCard player={p} onClick={() => navigate({ name: "player-detail", id: p.id })} />
              {i === AD_AFTER - 1 && players.length > AD_AFTER && (
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <AdSlot placement="IN_FEED" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

/* ── Index card — position chip, shirt number, stat strip ── */

function PlayerCard({ player, onClick }: { player: PlayerWithPhoto; onClick: () => void }) {
  const team = player.team;
  const stats: Array<[string, string]> = [
    ["G", fmtNum(player.goals)],
    ["A", fmtNum(player.assists)],
    ["Apps", fmtNum(player.appearances)],
    ["Rtg", fmtNum(player.rating.toFixed(1))],
  ];

  return (
    <button
      onClick={onClick}
      className="card-lift group flex w-full flex-col rounded-lg border border-border bg-card p-3.5 text-left"
      aria-label={`View ${player.name}`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2">
          {player.photoUrl ? (
            <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-elevated">
              <img
                src={player.photoUrl}
                alt={player.name}
                className="h-full w-full object-cover object-top"
                loading="lazy"
              />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-[11px] font-bold text-muted-foreground">
              {player.jerseyNumber != null ? fmtNum(player.jerseyNumber) : initialsOf(player.name)}
            </span>
          )}
          <span className="label-cond rounded-[4px] bg-secondary px-1.5 py-[3px] text-[10px] font-bold text-muted-foreground">
            {player.position}
          </span>
        </span>
        {player.jerseyNumber != null && (
          <span className="tabular text-[12px] font-semibold text-muted-foreground">
            #{fmtNum(player.jerseyNumber)}
          </span>
        )}
      </span>

      <span
        className="mt-2.5 block truncate text-[13.5px] font-semibold text-foreground transition-colors group-hover:text-primary"
        title={player.name}
      >
        {player.name}
      </span>

      {team ? (
        <span className="mt-1.5 flex min-w-0 items-center gap-1.5">
          <TeamCrest team={team} size="xs" />
          <span className="truncate text-[11px] text-muted-foreground">{team.shortName ?? team.name}</span>
        </span>
      ) : (
        <span className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          <Flag className="h-3 w-3 shrink-0" aria-hidden />
          National Team
        </span>
      )}

      <span className="mt-3 grid grid-cols-4 divide-x divide-border/50 border-t border-border/50 pt-2.5">
        {stats.map(([label, value]) => (
          <span key={label} className="text-center">
            <span className="tabular block text-[14px] font-bold leading-none text-foreground">{value}</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   PlayerDetailView — focused player page (860px)
   ════════════════════════════════════════════════════════════════ */

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3.5">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="score-num mt-1.5 truncate text-[26px] leading-none text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="tabular text-[13px] font-bold text-foreground">{value}</span>
    </div>
  );
}

function FactChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[4px] bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
      {children}
    </span>
  );
}

export function PlayerDetailView({ playerId }: { playerId: string }) {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);

  const { data, isLoading } = useQuery<PlayerDetailData>({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const res = await fetch(`/api/players/${playerId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7" aria-hidden>
        <Skeleton className="h-8 w-24 rounded-[6px]" />
        <Skeleton className="mt-4 h-48 rounded-xl" />
        <div className="mt-10">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="mt-10 h-40 rounded-lg" />
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <button
          onClick={() => useAppStore.getState().back()}
          className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="rounded-lg border border-border bg-card px-4 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">Player not found</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            This player profile is no longer available. Head back to the index to browse all players.
          </p>
          <button
            onClick={() => navigate({ name: "players" })}
            className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
          >
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  const p = data.player;
  const teamColor = p.team?.color ?? "var(--primary)";
  const isGK = p.position === "GK";
  const positionLabel = posLabel(p.position);
  const age = p.birthYear != null ? Math.max(0, new Date().getFullYear() - p.birthYear) : null;
  const teammates = data.similar.slice(0, 4);

  const tiles: Array<{ label: string; value: string }> = [
    { label: "Goals", value: fmtNum(p.goals) },
    { label: "Assists", value: fmtNum(p.assists) },
    { label: "Appearances", value: fmtNum(p.appearances) },
    { label: "Rating", value: fmtNum(p.rating.toFixed(1)) },
    ...(isGK ? [{ label: "Clean Sheets", value: fmtNum(p.cleanSheets) }] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      {/* Back */}
      <button
        onClick={() => useAppStore.getState().back()}
        className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {/* ── Profile band ── */}
      <section
        className="reveal overflow-hidden rounded-xl border border-border bg-card"
        aria-label={`${p.name} profile`}
      >
        <div className="flex flex-wrap items-center gap-5 p-5 sm:p-6">
          {/* Authentic player photo or shirt-number tile */}
          {p.photoUrl ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated shadow-md">
              <img
                src={p.photoUrl}
                alt={p.name}
                className="h-full w-full object-cover object-top"
              />
            </div>
          ) : (
            <span
              aria-hidden
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated"
            >
              <span className="score-num text-[32px] leading-none" style={{ color: teamColor }}>
                {p.jerseyNumber != null ? fmtNum(p.jerseyNumber) : initialsOf(p.name)}
              </span>
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-cond rounded-[4px] bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                {positionLabel}
              </span>
              {p.isNationalTeam && (
                <span className="label-cond inline-flex items-center gap-1.5 rounded-[4px] bg-secondary px-2 py-1 text-[10px] font-bold text-foreground/85">
                  <Flag className="h-3 w-3 text-primary" aria-hidden /> National Team
                </span>
              )}
            </div>
            <h1 className="mt-2 text-[22px] font-bold leading-tight tracking-[-0.01em] text-foreground sm:text-[24px]">
              {p.name}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
              <span>{p.nationality}</span>
              {p.team && (
                <>
                  <span aria-hidden className="text-muted-foreground/50">·</span>
                  <button
                    onClick={() => navigate({ name: "team-detail", id: p.team!.id })}
                    className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-foreground"
                    aria-label={`View ${p.team.name}`}
                  >
                    <TeamCrest team={p.team} size="xs" />
                    <span className="truncate font-semibold text-foreground/85">{p.team.name}</span>
                  </button>
                </>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {age != null && <FactChip>Age {fmtNum(age)}</FactChip>}
              {p.heightCm != null && <FactChip>{fmtNum(p.heightCm)} cm</FactChip>}
              {p.jerseyNumber != null && <FactChip>Shirt {fmtNum(p.jerseyNumber)}</FactChip>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Season stats ── */}
      <section className="reveal mt-10" aria-label="Season statistics">
        <SectionHeader
          title="Season Stats"
          kicker="current campaign"
          icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
        />
        <div
          className={cn(
            "grid grid-cols-2 gap-3",
            isGK ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-4"
          )}
        >
          {tiles.map((t) => (
            <StatTile key={t.label} label={t.label} value={t.value} />
          ))}
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border/40">
            <SummaryRow label="Goal involvements" value={fmtNum(p.goals + p.assists)} />
            <SummaryRow label="Goals per appearance" value={perGame(p.goals, p.appearances)} />
            <SummaryRow label="Assists per appearance" value={perGame(p.assists, p.appearances)} />
            {isGK && (
              <SummaryRow
                label="Clean-sheet rate"
                value={`${Math.round((p.cleanSheets / Math.max(1, p.appearances)) * 100)}%`}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Bio ── */}
      {p.bio && (
        <section className="reveal mt-10" aria-label="About">
          <SectionHeader title="About" kicker="background" />
          <p className="rounded-lg border border-border bg-card p-5 text-[13px] leading-relaxed text-muted-foreground">
            {p.bio}
          </p>
        </section>
      )}

      {/* In-feed ad */}
      <div className="reveal mt-10">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ── More from the club ── */}
      {p.team && teammates.length > 0 && (
        <section className="reveal mt-10" aria-label={`More from ${p.team.name}`}>
          <SectionHeader
            title={`More from ${p.team.shortName ?? p.team.name}`}
            kicker="teammates"
            icon={<Users className="h-3.5 w-3.5" aria-hidden />}
          />
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="divide-y divide-border/40">
              {teammates.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate({ name: "player-detail", id: s.id })}
                  className="row-hover group flex w-full items-center gap-3 px-4 py-2.5 text-left"
                >
                  <span className="tabular w-7 shrink-0 text-center text-[13px] font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                    {s.jerseyNumber != null ? fmtNum(s.jerseyNumber) : "–"}
                  </span>
                  <TeamCrest team={s.team ?? p.team!} size="xs" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                    {s.name}
                  </span>
                  <span className="label-cond shrink-0 rounded-[4px] bg-secondary px-1.5 py-[3px] text-[10px] font-bold text-muted-foreground">
                    {s.position}
                  </span>
                  <span className="tabular shrink-0 text-[11px] text-muted-foreground">
                    {fmtNum(s.appearances)} apps · {fmtNum(s.goals)} gls
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
