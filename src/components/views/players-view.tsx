"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Player } from "@/lib/types";
import { POSITION_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { TeamCrest } from "@/components/football/team-badge";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Cake,
  ChevronRight,
  Flag,
  Flame,
  Ruler,
  Search,
  Users,
  X,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   Players — leaderboard-grade player index
   PlayersView:      position tabs, national toggle, search, sort
   PlayerDetailView: hero, season stat tiles, bio, squad depth
   ════════════════════════════════════════════════════════════════ */

const POSITION_TABS = [
  { key: "ALL", label: "All" },
  { key: "GK", label: "GK" },
  { key: "DF", label: "DF" },
  { key: "MF", label: "MF" },
  { key: "FW", label: "FW" },
];

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Subtle left-edge coding by role — deeper green = more attacking. */
function positionEdge(position: string): string {
  switch (position) {
    case "GK":
      return "bg-white/25";
    case "DF":
      return "bg-primary/30";
    case "MF":
      return "bg-primary/55";
    case "FW":
      return "bg-primary";
    default:
      return "bg-primary/40";
  }
}

/** The stat that defines the role — shown large on the card. */
function keyStat(p: Player): { label: string; value: string } {
  switch (p.position) {
    case "GK":
      return { label: "Clean sheets", value: fmtNum(p.cleanSheets) };
    case "DF":
      return { label: "Apps", value: fmtNum(p.appearances) };
    case "MF":
      return { label: "Assists", value: fmtNum(p.assists) };
    default:
      return { label: "Goals", value: fmtNum(p.goals) };
  }
}

/** Remaining season stats — always exactly three short-label cells. */
function footerStats(p: Player): Array<{ label: string; value: string }> {
  const all = [
    { label: "Apps", value: fmtNum(p.appearances) },
    { label: "Goals", value: fmtNum(p.goals) },
    { label: "Assists", value: fmtNum(p.assists) },
    { label: "Rating", value: fmtNum(p.rating.toFixed(1)) },
  ];
  // Keepers: clean sheets already headline the card, drop assists for a tidy trio.
  if (p.position === "GK") return all.filter((s) => s.label !== "Assists");
  return all.filter((s) => s.label !== keyStat(p).label);
}

/* ════════════════════════════════════════════════════════════
   PlayersView — player index
   ════════════════════════════════════════════════════════════ */

export function PlayersView() {
  const navigate = useAppStore((s) => s.navigate);
  const language = useAppStore((s) => s.language);
  useReveal();

  const [position, setPosition] = useState("ALL");
  const [nationalOnly, setNationalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"goals" | "rating">("goals");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());

  const { data, isLoading } = useQuery<{ players: Player[] }>({
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

  const players = useMemo(() => data?.players ?? [], [data]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Editorial Header ── */}
      <div className="mb-6 border-b border-white/[0.07] pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-5 w-1 bg-red-600 shrink-0" aria-hidden />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            OFFICIAL PLAYER LEADERBOARD & STATS
          </span>
        </div>
        <h1 className="font-black text-[26px] sm:text-[34px] text-white leading-tight">
          {language === "bn" ? "খেলোয়াড় সূচি ও পরিসংখ্যান" : "Players & Top Performers"}
        </h1>
        <p className="text-[12.5px] text-white/40 mt-1">
          Top goalscorers, playmakers and national team stars across the Bangladesh Premier League and world football.
        </p>
      </div>

      {/* Leaderboard ad */}
      <div className="reveal mb-8">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      {/* ── Filters: position tabs + national toggle | search + sort ── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between border-b border-white/[0.07] pb-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="no-scrollbar flex gap-1 overflow-x-auto border border-white/[0.08] bg-[#060608] p-1"
            role="tablist"
            aria-label="Filter by position"
          >
            {POSITION_TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={position === tab.key}
                onClick={() => setPosition(tab.key)}
                className={cn(
                  "shrink-0 px-3 py-1.5 text-[11px] font-black uppercase transition-colors",
                  position === tab.key
                    ? "bg-red-600 text-white"
                    : "text-white/40 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setNationalOnly((v) => !v)}
            aria-pressed={nationalOnly}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border px-3 py-2 text-[11px] font-black uppercase transition-colors",
              nationalOnly
                ? "border-red-500 bg-red-600/15 text-red-400"
                : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white"
            )}
          >
            <Flag className="h-3 w-3" aria-hidden /> National Team
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 xl:w-64 xl:flex-none">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players..."
              aria-label="Search players"
              className="h-10 w-full border border-white/[0.1] bg-white/[0.04] pl-9 pr-9 text-xs text-white placeholder:text-white/30 focus:border-red-500/60 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
          <div
            className="flex shrink-0 border border-white/[0.08] bg-[#060608] p-1"
            role="group"
            aria-label="Sort players"
          >
            {(["goals", "rating"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                aria-pressed={sortBy === s}
                className={cn(
                  "px-3 py-1 text-[11px] font-black uppercase transition-colors",
                  sortBy === s ? "bg-red-600 text-white" : "text-white/40 hover:text-white"
                )}
              >
                {s === "goals" ? "Top Goals" : "Top Rating"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Player grid ── */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] bg-white/[0.04]" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#0d0d10] px-6 py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="font-black text-lg text-white">No players found</p>
          <p className="mt-1 text-xs text-white/40">Try searching with a different name or clear filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((p, i) => (
            <PlayerCard
              key={p.id}
              player={p}
              rank={i + 1}
              onClick={() => navigate({ name: "player-detail", id: p.id })}
            />
          ))}
        </div>
      )}

      {/* In-feed ad after the index */}
      <div className="reveal mt-8">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  rank,
  onClick,
}: {
  player: Player;
  rank: number;
  onClick: () => void;
}) {
  const key = keyStat(player);
  const footer = footerStats(player);

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden border border-white/[0.07] bg-[#0d0d10] text-left transition-all hover:border-white/20 hover:bg-white/[0.02]"
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", positionEdge(player.position))} />

      <div className="flex items-center gap-3 px-4 pb-3 pl-5 pt-4">
        <span className="tabular font-black text-xs text-white/30 w-5 text-center">
          {fmtNum(rank)}
        </span>
        {player.team ? (
          <TeamCrest team={player.team} size="md" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/[0.05] font-black text-[10px] text-white/40">
            NT
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-black text-white group-hover:text-red-400 transition-colors">
            {player.name}
          </p>
          <p className="text-[11px] text-white/40 truncate mt-0.5">
            {POSITION_LABELS[player.position] ?? player.position} · {player.team?.name ?? "National Team"}
          </p>
          <p className="text-[10px] text-white/30 truncate">{player.nationality}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular font-black text-xl text-white">{key.value}</p>
          <p className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider">{key.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-t border-white/[0.06] bg-[#060608]">
        {footer.map((stat) => (
          <div key={stat.label} className="px-2 py-2 text-center">
            <p className="tabular font-black text-[12px] text-white/80">{stat.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">{stat.label}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   PlayerDetailView — player page
   ════════════════════════════════════════════════════════════ */

export function PlayerDetailView({ playerId }: { playerId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  const { data, isLoading } = useQuery<{ player: Player; similar: Player[] }>({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const res = await fetch(`/api/players/${playerId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6" aria-hidden>
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="mt-4 h-56 rounded-xl" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-40 rounded-xl" />
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <button
          onClick={() => navigate({ name: "players" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Players
        </button>
        <div className="mt-4 flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">Player not found</p>
          <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
            This player profile is no longer available. Head back to the index to browse all players.
          </p>
        </div>
      </div>
    );
  }

  const p = data.player;
  const teamColor = p.team?.color ?? "#1E9E50";
  const positionLabel = POSITION_LABELS[p.position] ?? p.position;

  const tiles = [
    { label: "Appearances", value: fmtNum(p.appearances) },
    { label: "Goals", value: fmtNum(p.goals) },
    { label: "Assists", value: fmtNum(p.assists) },
    { label: "Clean Sheets", value: fmtNum(p.cleanSheets) },
    { label: "Avg Rating", value: fmtNum(p.rating.toFixed(1)) },
    { label: "Form Index", value: `${fmtNum(Math.round(p.rating * 10))}%` },
  ];

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* Breadcrumb back to the index */}
      <nav className="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
        <button
          onClick={() => navigate({ name: "players" })}
          className="flex items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Players
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
        <span className="font-semibold text-foreground">{p.name}</span>
      </nav>

      {/* ── Player hero ──────────────────────────────────────────── */}
      <section
        className="stadium-panel pitch-pattern edge-lit relative mt-4 overflow-hidden rounded-xl border border-border"
        aria-label={`${p.name} profile`}
      >
        {/* Club-colour accent edge */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: teamColor }}
        />
        {/* Watermark jersey number (desktop only — keeps the mobile hero clean) */}
        {p.jerseyNumber != null && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-8 hidden select-none font-display text-[8rem] font-bold leading-none text-white/[0.04] sm:block sm:text-[11rem]"
          >
            {fmtNum(p.jerseyNumber)}
          </span>
        )}

        <div className="relative flex flex-wrap items-center gap-5 p-5 pl-6 sm:gap-6 sm:p-7 sm:pl-8">
          {/* Jersey tile — big tabular number */}
          <span
            aria-hidden
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-white/10 sm:h-24 sm:w-24"
            style={{ backgroundColor: `color-mix(in oklab, ${teamColor} 20%, transparent)` }}
          >
            <span className="tabular font-display text-4xl font-bold leading-none text-foreground sm:text-5xl">
              {p.jerseyNumber != null ? fmtNum(p.jerseyNumber) : "–"}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/12 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-primary">
                {positionLabel}
              </span>
              {p.isNationalTeam && (
                <span className="flex items-center gap-1.5 rounded-md border border-border bg-card/70 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-foreground/85">
                  <Flag className="h-3 w-3 text-primary" aria-hidden /> National Team
                </span>
              )}
            </div>
            <h1 className="display-hero mt-2 text-[1.7rem] leading-tight text-foreground sm:text-4xl">
              {p.name}
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {p.nationality}
              {p.team ? ` · ${p.team.name}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.birthYear != null && (
                <span className="flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
                  <Cake className="h-3 w-3 text-primary/80" aria-hidden /> Born {fmtNum(p.birthYear)}
                </span>
              )}
              {p.heightCm != null && (
                <span className="flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
                  <Ruler className="h-3 w-3 text-primary/80" aria-hidden /> {fmtNum(p.heightCm)} cm
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
                <span className="tabular text-primary/80">{fmtNum(p.rating.toFixed(1))}</span>
                Avg rating
              </span>
            </div>
          </div>

          {/* Team link */}
          {p.team && (
            <button
              onClick={() => navigate({ name: "team-detail", id: p.team!.id })}
              className="group flex shrink-0 flex-col items-center gap-2 rounded-lg border border-border bg-card/60 p-3.5 transition-colors hover:border-primary/40"
              aria-label={`View ${p.team.name}`}
            >
              <TeamCrest team={p.team} size="lg" />
              <span className="flex items-center gap-1 text-[11px] font-bold text-foreground/90 transition-colors group-hover:text-primary">
                {p.team.shortName ?? p.team.name}
                <ChevronRight className="h-3 w-3" aria-hidden />
              </span>
            </button>
          )}
        </div>

        {p.bio && (
          <p className="relative max-w-[65ch] border-t border-border/60 px-5 py-4 pl-6 text-[13px] leading-relaxed text-muted-foreground sm:px-7 sm:pl-8">
            {p.bio}
          </p>
        )}
      </section>

      {/* ── Season stats ─────────────────────────────────────────── */}
      <section className="reveal mt-6" aria-label="Season statistics">
        <SectionHeader title="Season Stats" kicker="current campaign" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="edge-lit rounded-xl border border-border bg-card p-4 text-center">
              <p className="tabular font-display text-2xl font-bold leading-none text-foreground">{tile.value}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {tile.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Squad depth: similar players ─────────────────────────── */}
      {data.similar.length > 0 && (
        <section className="reveal mt-8" aria-label={`More ${positionLabel}s`}>
          <SectionHeader
            title={`${positionLabel}s at ${p.team?.name ?? "the club"}`}
            kicker="squad depth"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {data.similar.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate({ name: "player-detail", id: s.id })}
                className="card-lift group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left"
              >
                <span
                  aria-hidden
                  className={cn("h-10 w-[3px] shrink-0 rounded-full", positionEdge(s.position))}
                />
                {s.team ? (
                  <TeamCrest team={s.team} size="sm" />
                ) : (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[9px] font-bold text-muted-foreground"
                    aria-hidden
                  >
                    NT
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {s.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                    {POSITION_LABELS[s.position] ?? s.position} · #{s.jerseyNumber != null ? fmtNum(s.jerseyNumber) : "–"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3.5 text-right">
                  <div>
                    <p className="tabular font-display text-[13px] font-bold leading-none text-foreground">
                      {fmtNum(s.goals)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Gls</p>
                  </div>
                  <div>
                    <p className="tabular font-display text-[13px] font-bold leading-none text-foreground">
                      {fmtNum(s.assists)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Ast</p>
                  </div>
                  <div>
                    <p className="tabular font-display text-[13px] font-bold leading-none text-primary">
                      {fmtNum(s.rating.toFixed(1))}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Rtg</p>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
