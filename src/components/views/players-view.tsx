"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Player } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { TeamBadge } from "@/components/football/team-badge";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";
import { Flame, ChevronRight, Flag, Star, ArrowLeft, Cake, Ruler, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlayersView() {
  const navigate = useAppStore((s) => s.navigate);
  const [position, setPosition] = useState("ALL");
  const [nationalOnly, setNationalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"goals" | "rating">("goals");
  useReveal();

  const { data, isLoading } = useQuery<{ players: Player[] }>({
    queryKey: ["players", position, nationalOnly, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({ sort: sortBy });
      if (position !== "ALL") params.set("position", position);
      if (nationalOnly) params.set("national", "true");
      const res = await fetch(`/api/players?${params}`);
      return res.json().then((j) => j.data);
    },
  });

  const players = data?.players ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="Players"
        kicker="player index"
        subtitle="Stats, ratings and performance — all in one view"
        icon={<Flame className="h-5 w-5" aria-hidden />}
      />

      {/* Filters */}
      <div className="mb-7 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex flex-wrap gap-1.5">
          {["ALL", "GK", "DF", "MF", "FW"].map((p) => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                position === p
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "ALL" ? "All" : POSITION_LABELS[p]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNationalOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-bold transition-all active:scale-95",
            nationalOnly
              ? "border-fhb-red/50 bg-fhb-red/15 text-fhb-red"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Flag className="h-3 w-3" aria-hidden /> National Team
        </button>
        <div className="ml-auto flex rounded-full border border-border bg-muted/40 p-1">
          {(["goals", "rating"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[11px] font-bold transition-all",
                sortBy === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "goals" ? "Top Goals" : "Best Rating"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="edge-lit rounded-2xl border border-border bg-card p-14 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Flame className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">No players found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <div key={p.id} className="reveal">
              <PlayerCard player={p} onClick={() => navigate({ name: "player-detail", id: p.id })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-lift edge-lit group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-left sm:p-5"
    >
      <div className="flex items-center gap-3.5">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
          style={{
            background: player.team
              ? `linear-gradient(160deg, ${player.team.color}, ${player.team.color2 ?? player.team.color})`
              : "var(--primary)",
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.28), inset 0 -2px 4px rgba(0,0,0,0.25)",
          }}
          aria-hidden
        >
          {player.jerseyNumber ?? "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-foreground group-hover:text-primary">
            {player.name}
            {player.isNationalTeam && <Flag className="h-3 w-3 shrink-0 text-primary" aria-label="National team player" />}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {POSITION_LABELS[player.position] ?? player.position} · {player.team?.name ?? "National Team"}
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-xl border border-border bg-background/50 py-3 text-center">
        {[
          [fmtNum(player.goals), "Goals"],
          [fmtNum(player.assists), "Assists"],
          [fmtNum(player.appearances), "Matches"],
          [fmtNum(player.rating.toFixed(1)), "Rating"],
        ].map(([v, l], i) => (
          <div key={l} className={cn("px-1", i > 0 && "border-l border-border")}>
            <p className="tabular font-display text-sm font-bold text-foreground">{v}</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

export function PlayerDetailView({ playerId }: { playerId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const back = useAppStore((s) => s.back);
  useReveal();

  const { data, isLoading } = useQuery<{ player: Player; similar: Player[] }>({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const res = await fetch(`/api/players/${playerId}`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !data?.player) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 pt-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const p = data.player;
  const isGK = p.position === "GK";
  const teamColor = p.team?.color ?? "#12805c";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-14 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* ═══ Player hero — club color cinematic ═══ */}
      <div
        className="noise relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${teamColor} 24%, oklch(0.14 0.014 168)), oklch(0.13 0.014 168) 62%)`,
        }}
      >
        <span className="pitch-pattern absolute inset-0" aria-hidden />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-8 select-none font-display text-[9rem] font-bold leading-none text-white/[0.05] sm:text-[12rem]"
        >
          {p.jerseyNumber ?? "?"}
        </span>

        <div className="relative flex flex-wrap items-center gap-6">
          <span
            className="flex h-24 w-24 items-center justify-center rounded-2xl font-display text-4xl font-bold text-white"
            style={{
              background: p.team
                ? `linear-gradient(160deg, ${p.team.color}, ${p.team.color2 ?? p.team.color})`
                : "var(--primary)",
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.28), inset 0 -5px 8px rgba(0,0,0,0.28), 0 10px 24px -8px rgba(0,0,0,0.55)",
            }}
            aria-hidden
          >
            {p.jerseyNumber ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display-hero text-2xl text-foreground sm:text-4xl">{p.name}</h1>
              {p.isNationalTeam && (
                <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-[11px] font-bold text-primary">
                  <Flag className="h-3 w-3" aria-hidden /> National Team
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-fhb-gold/20 px-3 py-1 text-[11px] font-bold text-fhb-gold">
                <Star className="h-3 w-3" aria-hidden /> {fmtNum(p.rating.toFixed(1))}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {POSITION_LABELS[p.position] ?? p.position} · {p.team ? p.team.name : "National Team"} · {p.nationality}
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {p.birthYear && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm">
                  <Cake className="h-3.5 w-3.5 text-primary" aria-hidden /> Born {fmtNum(p.birthYear)}
                </span>
              )}
              {p.heightCm && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm">
                  <Ruler className="h-3.5 w-3.5 text-primary" aria-hidden /> {fmtNum(p.heightCm)} cm
                </span>
              )}
              {p.jerseyNumber != null && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm">
                  <Shirt className="h-3.5 w-3.5 text-primary" aria-hidden /> Jersey #{fmtNum(p.jerseyNumber)}
                </span>
              )}
            </div>
          </div>
          {p.team && (
            <button
              onClick={() => navigate({ name: "team-detail", id: p.team!.id })}
              className="shrink-0 transition-transform hover:scale-105"
              aria-label={`View ${p.team.name} team`}
            >
              <TeamBadge team={p.team} size="hero" />
            </button>
          )}
        </div>
        {p.bio && (
          <p className="relative mt-5 max-w-2xl border-l-[3px] border-primary/60 pl-4 text-[13px] leading-relaxed text-foreground/75">
            {p.bio}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="reveal mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {[
          [fmtNum(p.appearances), "Appearances"],
          [fmtNum(p.goals), "Goals"],
          [fmtNum(p.assists), "Assists"],
          [fmtNum(isGK ? p.cleanSheets : p.rating.toFixed(1)), isGK ? "Clean Sheets" : "Avg Rating"],
          [fmtNum(Math.round(p.rating * 10)) + "%", "Form Index"],
        ].map(([v, l]) => (
          <div key={l} className="edge-lit rounded-2xl border border-border bg-card p-4 text-center transition-transform hover:-translate-y-0.5">
            <p className="tabular font-display text-2xl font-bold text-primary sm:text-[1.7rem]">{v}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      {/* Similar players */}
      {data.similar.length > 0 && (
        <section className="reveal mt-10" aria-label="Players in the same position">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="font-display-bn text-lg font-bold text-foreground">
              {POSITION_LABELS[p.position] ?? p.position}s from the same team
            </h2>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.similar.map((s) => (
              <PlayerCard key={s.id} player={s} onClick={() => navigate({ name: "player-detail", id: s.id })} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
