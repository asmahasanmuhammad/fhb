"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Player } from "@/lib/types";
import { TeamBadge } from "@/components/football/team-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";
import { Flame, ChevronRight, Flag, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlayersView() {
  const navigate = useAppStore((s) => s.navigate);
  const [position, setPosition] = useState("ALL");
  const [nationalOnly, setNationalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"goals" | "rating">("goals");

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
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <Flame className="h-6 w-6 text-fhb-red" aria-hidden />
        খেলোয়াড়
      </h1>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {["ALL", "GK", "DF", "MF", "FW"].map((p) => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                position === p ? "border-primary/60 bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "ALL" ? "সব" : POSITION_LABELS[p]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNationalOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
            nationalOnly ? "border-primary/60 bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Flag className="h-3 w-3" aria-hidden /> জাতীয় দল
        </button>
        <div className="ml-auto flex gap-1.5">
          {(["goals", "rating"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                sortBy === s ? "border-fhb-gold/60 bg-fhb-gold/15 text-fhb-gold" : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "goals" ? "সর্বোচ্চ গোল" : "সেরা রেটিং"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">কোনো খেলোয়াড় পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} onClick={() => navigate({ name: "player-detail", id: p.id })} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card-lift group rounded-xl border bg-card p-4 text-left">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-base font-bold text-white shadow-md"
          style={{
            background: player.team
              ? `linear-gradient(135deg, ${player.team.color}, ${player.team.color2 ?? "#065F46"})`
              : "linear-gradient(135deg, #006A4E, #F42A41)",
          }}
          aria-hidden
        >
          {player.jerseyNumber ?? "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold group-hover:text-primary">
            {player.name}
            {player.isNationalTeam && <Flag className="h-3 w-3 shrink-0 text-primary" aria-label="জাতীয় দলের খেলোয়াড়" />}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {POSITION_LABELS[player.position] ?? player.position} • {player.team?.name ?? "জাতীয় দল"}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-muted/50 p-2 text-center">
        {[
          [toBn(player.goals), "গোল"],
          [toBn(player.assists), "অ্যাসিস্ট"],
          [toBn(player.appearances), "ম্যাচ"],
          [toBn(player.rating.toFixed(1)), "রেটিং"],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="font-display text-sm font-bold">{v}</p>
            <p className="text-[9px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

export function PlayerDetailView({ playerId }: { playerId: string }) {
  const navigate = useAppStore((s) => s.navigate);
  const back = useAppStore((s) => s.back);

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
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const p = data.player;
  const isGK = p.position === "GK";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-4 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
        ← ফিরে যান
      </button>

      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{
          background: p.team
            ? `linear-gradient(150deg, ${p.team.color}26 0%, transparent 70%)`
            : "linear-gradient(150deg, #006A4E26 0%, #F42A4118 70%)",
        }}
      >
        <div className="flex flex-wrap items-center gap-5">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-2xl font-display text-3xl font-bold text-white shadow-xl"
            style={{
              background: p.team
                ? `linear-gradient(135deg, ${p.team.color}, ${p.team.color2 ?? "#065F46"})`
                : "linear-gradient(135deg, #006A4E, #F42A41)",
            }}
            aria-hidden
          >
            {p.jerseyNumber ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">{p.name}</h1>
              {p.isNationalTeam && (
                <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  <Flag className="h-3 w-3" aria-hidden /> জাতীয় দল
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-fhb-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-fhb-gold">
                <Star className="h-3 w-3" aria-hidden /> {toBn(p.rating.toFixed(1))}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {POSITION_LABELS[p.position] ?? p.position} • {p.team ? p.team.name : "জাতীয় দল"} • {p.nationality}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {p.birthYear && <span>🎂 জন্ম {toBn(p.birthYear)}</span>}
              {p.heightCm && <span>📏 {toBn(p.heightCm)} সেমি</span>}
              {p.jerseyNumber != null && <span>👕 জার্সি #{toBn(p.jerseyNumber)}</span>}
            </div>
          </div>
          {p.team && (
            <button onClick={() => navigate({ name: "team-detail", id: p.team!.id })} className="shrink-0" aria-label={`${p.team.name} দল দেখুন`}>
              <TeamBadge team={p.team} size="lg" className="transition-transform hover:scale-110" />
            </button>
          )}
        </div>
        {p.bio && <p className="mt-4 border-l-4 border-primary/50 pl-3 text-sm leading-relaxed text-foreground/80">{p.bio}</p>}
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          [toBn(p.appearances), "ম্যাচ খেলেছেন"],
          [toBn(p.goals), "গোল"],
          [toBn(p.assists), "অ্যাসিস্ট"],
          [toBn(isGK ? p.cleanSheets : p.rating.toFixed(1)), isGK ? "ক্লিন-শিট" : "গড় রেটিং"],
          [toBn(Math.round(p.rating * 10)) + "%", "ফর্ম ইনডেক্স"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-xl border bg-card p-4 text-center">
            <p className="font-display text-2xl font-bold text-primary">{v}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      {/* Similar players */}
      {data.similar.length > 0 && (
        <section className="mt-8" aria-label="একই পজিশনের খেলোয়াড়">
          <h2 className="mb-4 font-display text-lg font-bold tracking-wide">একই দলের {POSITION_LABELS[p.position] ?? p.position}রা</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.similar.map((s) => (
              <PlayerCard key={s.id} player={s} onClick={() => navigate({ name: "player-detail", id: s.id })} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
