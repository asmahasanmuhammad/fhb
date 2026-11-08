"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Player } from "@/lib/types";
import { TeamBadge } from "@/components/football/team-badge";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { toBn } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";
import { Flame, ChevronRight, Flag, Star, ArrowLeft, Cake, Ruler, Shirt } from "lucide-react";
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="খেলোয়াড়"
        subtitle="পরিসংখ্যান, রেটিং ও পারফরম্যান্স — সব এক ভিউতে"
        icon={<Flame className="h-5 w-5" aria-hidden />}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "GK", "DF", "MF", "FW"].map((p) => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[11px] font-bold transition-colors",
                position === p
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "ALL" ? "সব" : POSITION_LABELS[p]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNationalOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-bold transition-colors",
            nationalOnly
              ? "border-fhb-red/50 bg-fhb-red/15 text-fhb-red"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Flag className="h-3 w-3" aria-hidden /> জাতীয় দল
        </button>
        <div className="ml-auto flex rounded-lg border border-border bg-muted/40 p-1">
          {(["goals", "rating"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-[11px] font-bold transition-all",
                sortBy === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          কোনো খেলোয়াড় পাওয়া যায়নি।
        </p>
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
    <button onClick={onClick} className="card-lift group rounded-lg border border-border bg-card p-4 text-left">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-display text-base font-bold text-white"
          style={{
            background: player.team ? player.team.color : "var(--primary)",
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.25)",
          }}
          aria-hidden
        >
          {player.jerseyNumber ?? "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-foreground group-hover:text-primary">
            {player.name}
            {player.isNationalTeam && <Flag className="h-3 w-3 shrink-0 text-primary" aria-label="জাতীয় দলের খেলোয়াড়" />}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {POSITION_LABELS[player.position] ?? player.position} · {player.team?.name ?? "জাতীয় দল"}
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <div className="mt-3.5 grid grid-cols-4 divide-x divide-border rounded-md border border-border bg-background/50 py-2.5 text-center">
        {[
          [toBn(player.goals), "গোল"],
          [toBn(player.assists), "অ্যাসিস্ট"],
          [toBn(player.appearances), "ম্যাচ"],
          [toBn(player.rating.toFixed(1)), "রেটিং"],
        ].map(([v, l], i) => (
          <div key={l} className={i === 0 ? "" : "border-l border-border"}>
            <p className="tabular font-display text-sm font-bold text-foreground">{v}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{l}</p>
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
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const p = data.player;
  const isGK = p.position === "GK";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label="ফিরে যান"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[4px]"
          style={{ backgroundColor: p.team?.color ?? "var(--primary)" }}
        />
        <div className="pitch-pattern p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-5">
            <span
              className="flex h-20 w-20 items-center justify-center rounded-xl font-display text-3xl font-bold text-white"
              style={{
                background: p.team ? p.team.color : "var(--primary)",
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25), inset 0 -4px 0 rgba(0,0,0,0.2)",
              }}
              aria-hidden
            >
              {p.jerseyNumber ?? "?"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl">
                  {p.name}
                </h1>
                {p.isNationalTeam && (
                  <span className="flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                    <Flag className="h-3 w-3" aria-hidden /> জাতীয় দল
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-md bg-fhb-gold/15 px-2 py-0.5 text-[11px] font-bold text-fhb-gold">
                  <Star className="h-3 w-3" aria-hidden /> {toBn(p.rating.toFixed(1))}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {POSITION_LABELS[p.position] ?? p.position} · {p.team ? p.team.name : "জাতীয় দল"} · {p.nationality}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
                {p.birthYear && (
                  <span className="flex items-center gap-1.5">
                    <Cake className="h-3.5 w-3.5 text-primary/70" aria-hidden /> জন্ম {toBn(p.birthYear)}
                  </span>
                )}
                {p.heightCm && (
                  <span className="flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-primary/70" aria-hidden /> {toBn(p.heightCm)} সেমি
                  </span>
                )}
                {p.jerseyNumber != null && (
                  <span className="flex items-center gap-1.5">
                    <Shirt className="h-3.5 w-3.5 text-primary/70" aria-hidden /> জার্সি #{toBn(p.jerseyNumber)}
                  </span>
                )}
              </div>
            </div>
            {p.team && (
              <button
                onClick={() => navigate({ name: "team-detail", id: p.team!.id })}
                className="shrink-0 transition-transform hover:scale-105"
                aria-label={`${p.team.name} দল দেখুন`}
              >
                <TeamBadge team={p.team} size="lg" />
              </button>
            )}
          </div>
          {p.bio && (
            <p className="mt-4 max-w-2xl border-l-[3px] border-primary/50 pl-3 text-sm leading-relaxed text-foreground/80">
              {p.bio}
            </p>
          )}
        </div>
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
          <div key={l} className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="tabular font-display text-2xl font-bold text-primary">{v}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      {/* Similar players */}
      {data.similar.length > 0 && (
        <section className="mt-9" aria-label="একই পজিশনের খেলোয়াড়">
          <h2 className="mb-4 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
            একই দলের {POSITION_LABELS[p.position] ?? p.position}রা
          </h2>
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
