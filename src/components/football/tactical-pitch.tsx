"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Shield, Flame, User, Award, ExternalLink, X, ChevronDown, ChevronUp } from "lucide-react";
import type { TeamRef, Player } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { TeamCrest } from "@/components/football/team-badge";
import { getTeamStartingXI, getFormationPositions, type PitchPosition } from "@/lib/team-lineups";
import { cn } from "@/lib/utils";

export interface PitchPlayerNode {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  role: string;
  isCaptain?: boolean;
  rating?: number;
  photoUrl?: string | null;
  goals?: number;
  yellowCard?: boolean;
  redCard?: boolean;
}

interface TacticalPitchProps {
  matchId?: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homePlayers?: PitchPlayerNode[];
  awayPlayers?: PitchPlayerNode[];
  homeSubs?: PitchPlayerNode[];
  awaySubs?: PitchPlayerNode[];
  homeFormation?: string;
  awayFormation?: string;
  homeManager?: string;
  awayManager?: string;
  compact?: boolean;
}

export function TacticalPitch({
  matchId,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  homeSubs,
  awaySubs,
  homeFormation,
  awayFormation,
  homeManager,
  awayManager,
  compact = false,
}: TacticalPitchProps) {
  const navigate = useAppStore((s) => s.navigate);
  const [pitchMode, setPitchMode] = useState<"both" | "home" | "away">("both");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<(PitchPlayerNode & { teamName: string; teamColor: string }) | null>(null);
  const [showBench, setShowBench] = useState(true);

  // Live match lineup query from database (updates dynamically on admin player edits)
  const { data: apiLineups } = useQuery<{
    home?: { formation: string; manager?: string; lineup: PitchPlayerNode[]; subs: PitchPlayerNode[] };
    away?: { formation: string; manager?: string; lineup: PitchPlayerNode[]; subs: PitchPlayerNode[] };
  }>({
    queryKey: ["lineups", matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const res = await fetch(`/api/matches/${matchId}/lineups`);
      const json = await res.json();
      return json.success ? json.data : null;
    },
    enabled: Boolean(matchId),
    staleTime: 5_000,
  });

  // Dynamic lineup resolution (with real database player portraits & formations)
  const homeDynamic = useMemo(() => {
    if (apiLineups?.home) {
      return {
        formation: homeFormation || apiLineups.home.formation,
        manager: homeManager || apiLineups.home.manager,
        players: apiLineups.home.lineup,
        subs: apiLineups.home.subs,
      };
    }
    return getTeamStartingXI(homeTeam, homePlayers as any);
  }, [homeTeam, homePlayers, apiLineups, homeFormation, homeManager]);

  const awayDynamic = useMemo(() => {
    if (apiLineups?.away) {
      return {
        formation: awayFormation || apiLineups.away.formation,
        manager: awayManager || apiLineups.away.manager,
        players: apiLineups.away.lineup,
        subs: apiLineups.away.subs,
      };
    }
    return getTeamStartingXI(awayTeam, awayPlayers as any);
  }, [awayTeam, awayPlayers, apiLineups, awayFormation, awayManager]);

  const activeHomePlayers: PitchPlayerNode[] =
    homePlayers && homePlayers.length >= 11
      ? homePlayers.slice(0, 11)
      : homeDynamic.players;

  const activeAwayPlayers: PitchPlayerNode[] =
    awayPlayers && awayPlayers.length >= 11
      ? awayPlayers.slice(0, 11)
      : awayDynamic.players;

  const activeHomeSubs: PitchPlayerNode[] = homeSubs || homeDynamic.subs || [];
  const activeAwaySubs: PitchPlayerNode[] = awaySubs || awayDynamic.subs || [];

  const resolvedHomeFormation = homeFormation || homeDynamic.formation || "4-3-3";
  const resolvedAwayFormation = awayFormation || awayDynamic.formation || "4-2-3-1";
  const resolvedHomeManager = homeManager || homeDynamic.manager;
  const resolvedAwayManager = awayManager || awayDynamic.manager;

  // Dynamic Pitch Coordinates calculated based on each team's REAL formation
  const homeSingleCoords = useMemo(
    () => getFormationPositions(resolvedHomeFormation, "single"),
    [resolvedHomeFormation]
  );
  const awaySingleCoords = useMemo(
    () => getFormationPositions(resolvedAwayFormation, "single"),
    [resolvedAwayFormation]
  );
  const homeH2HCoords = useMemo(
    () => getFormationPositions(resolvedHomeFormation, "home_half"),
    [resolvedHomeFormation]
  );
  const awayH2HCoords = useMemo(
    () => getFormationPositions(resolvedAwayFormation, "away_half"),
    [resolvedAwayFormation]
  );

  const homeColor = homeTeam.color || "#e11d48";
  const awayColor = awayTeam.color || "#0284c7";

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-2xl overflow-hidden transition-all">
      {/* Tactical Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-sm">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-extrabold text-foreground tracking-wide uppercase font-display">
                2D Tactical Pitch &amp; Formation Board
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Tactics
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground font-medium mt-0.5">
              <span className="font-bold text-foreground/90">{homeTeam.name}</span> ({resolvedHomeFormation})
              <span className="text-muted-foreground/60 mx-1.5">vs</span>
              <span className="font-bold text-foreground/90">{awayTeam.name}</span> ({resolvedAwayFormation})
            </p>
          </div>
        </div>

        {/* View Mode Switches */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 border border-border p-1 rounded-xl text-[12px] font-bold">
          <button
            onClick={() => setPitchMode("both")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
              pitchMode === "both"
                ? "bg-primary text-white font-black shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={pitchMode === "both"}
          >
            22-Man (H2H)
          </button>
          <button
            onClick={() => setPitchMode("home")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              pitchMode === "home"
                ? "bg-rose-600 text-white font-black shadow-md shadow-rose-600/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={pitchMode === "home"}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: homeColor }} />
            {homeTeam.shortName || homeTeam.initials || "HOME"} ({resolvedHomeFormation})
          </button>
          <button
            onClick={() => setPitchMode("away")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              pitchMode === "away"
                ? "bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={pitchMode === "away"}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: awayColor }} />
            {awayTeam.shortName || awayTeam.initials || "AWAY"} ({resolvedAwayFormation})
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              showHeatmap ? "bg-amber-400 text-slate-950 font-black" : "text-slate-300 hover:text-amber-400"
            )}
            title="Toggle Tactical Heatmap"
            aria-pressed={showHeatmap}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Heatmap</span>
          </button>
        </div>
      </div>

      {/* The Football Pitch Canvas */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.5] md:aspect-[4/4] max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#064e3b] select-none">
        {/* Grass Cut Striping (Alternating vertical bands) */}
        <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-20">
          <div className="bg-emerald-300/10" />
          <div className="bg-black/10" />
          <div className="bg-emerald-300/10" />
          <div className="bg-black/10" />
          <div className="bg-emerald-300/10" />
          <div className="bg-black/10" />
        </div>

        {/* Pitch Lines (Tactical Regulation Markings) */}
        <div className="absolute inset-3 border-2 border-white/50 rounded-sm pointer-events-none">
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/50 -translate-y-1/2" />
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50" />
          {/* Center Spot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />

          {/* Top Penalty Area (Away) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-20 border-b-2 border-x-2 border-white/50" />
          {/* Top Goal Area */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-26 h-8 border-b-2 border-x-2 border-white/50" />
          {/* Top Penalty Spot */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80" />
          {/* Top Penalty Arc */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-8 border-b-2 border-white/50 rounded-b-full" />

          {/* Bottom Penalty Area (Home) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-52 h-20 border-t-2 border-x-2 border-white/50" />
          {/* Bottom Goal Area */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-26 h-8 border-t-2 border-x-2 border-white/50" />
          {/* Bottom Penalty Spot */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80" />
          {/* Bottom Penalty Arc */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-16 h-8 border-t-2 border-white/50 rounded-t-full" />

          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br-full" />
          <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-white/50 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-white/50 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl-full" />
        </div>

        {/* Tactical Heatmap Overlay */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 animate-in fade-in">
            <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-rose-500/35 rounded-full blur-2xl" />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-amber-500/30 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-48 bg-emerald-400/25 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/6 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl" />
            <div className="absolute bottom-1/4 right-1/6 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />
          </div>
        )}

        {/* ── HOME TEAM PLAYERS (Bottom attacking Upwards) ── */}
        {(pitchMode === "both" || pitchMode === "home") &&
          activeHomePlayers.map((player, idx) => {
            const coords =
              pitchMode === "home"
                ? homeSingleCoords[idx] || { x: 50, y: 70, role: player.role }
                : homeH2HCoords[idx] || { x: 50, y: 70, role: player.role };

            return (
              <div
                key={`home_${player.id}_${idx}`}
                onClick={() => setSelectedPlayer({ ...player, teamName: homeTeam.name, teamColor: homeColor })}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-all duration-500 ease-out hover:z-30 hover:scale-110"
              >
                {/* Player Photo Circle Node */}
                <div className="relative">
                  <div
                    className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-xl ring-2 ring-white/95 group-hover:ring-emerald-400 transition-all bg-slate-900 flex items-center justify-center"
                    style={{ borderColor: homeColor }}
                  >
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-black text-xs text-white">{player.number}</span>
                    )}
                  </div>

                  {/* Jersey number pill */}
                  <span
                    className="absolute -bottom-1 -right-1 px-1 min-w-[17px] h-[17px] rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-md border border-black/40"
                    style={{ backgroundColor: homeColor }}
                  >
                    {player.number}
                  </span>

                  {/* Captaincy (C) badge */}
                  {player.isCaptain && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md border border-white">
                      C
                    </span>
                  )}

                  {/* Goal (⚽) badge */}
                  {player.goals && player.goals > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 h-4 rounded-full bg-emerald-500 text-white font-bold text-[8.5px] shadow-md border border-white">
                      ⚽{player.goals > 1 ? player.goals : ""}
                    </span>
                  )}

                  {/* Yellow Card badge */}
                  {player.yellowCard && (
                    <span className="absolute top-0 right-2 w-2.5 h-3.5 rounded-[1px] bg-amber-300 shadow border border-amber-600" />
                  )}
                </div>

                {/* Player Name & Rating Label Underneath */}
                <div className="mt-1 flex flex-col items-center">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-[9.5px] sm:text-[11px] font-bold text-white whitespace-nowrap shadow-md group-hover:border-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {player.name.split(" ").pop()}
                  </span>
                  <span className="mt-0.5 text-[8.5px] font-mono font-bold text-emerald-300 bg-slate-950/80 px-1 rounded shadow-sm">
                    ★ {player.rating ?? 7.5}
                  </span>
                </div>
              </div>
            );
          })}

        {/* ── AWAY TEAM PLAYERS (Top defending / attacking Downwards) ── */}
        {(pitchMode === "both" || pitchMode === "away") &&
          activeAwayPlayers.map((player, idx) => {
            const coords =
              pitchMode === "away"
                ? awaySingleCoords[idx] || { x: 50, y: 30, role: player.role }
                : awayH2HCoords[idx] || { x: 50, y: 30, role: player.role };

            return (
              <div
                key={`away_${player.id}_${idx}`}
                onClick={() => setSelectedPlayer({ ...player, teamName: awayTeam.name, teamColor: awayColor })}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-all duration-500 ease-out hover:z-30 hover:scale-110"
              >
                {/* Player Photo Circle Node */}
                <div className="relative">
                  <div
                    className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-xl ring-2 ring-white/95 group-hover:ring-sky-400 transition-all bg-slate-900 flex items-center justify-center"
                    style={{ borderColor: awayColor }}
                  >
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-black text-xs text-white">{player.number}</span>
                    )}
                  </div>

                  {/* Jersey number pill */}
                  <span
                    className="absolute -bottom-1 -right-1 px-1 min-w-[17px] h-[17px] rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-md border border-black/40"
                    style={{ backgroundColor: awayColor }}
                  >
                    {player.number}
                  </span>

                  {/* Captaincy (C) badge */}
                  {player.isCaptain && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md border border-white">
                      C
                    </span>
                  )}

                  {/* Goal (⚽) badge */}
                  {player.goals && player.goals > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 h-4 rounded-full bg-emerald-500 text-white font-bold text-[8.5px] shadow-md border border-white">
                      ⚽{player.goals > 1 ? player.goals : ""}
                    </span>
                  )}

                  {/* Yellow Card badge */}
                  {player.yellowCard && (
                    <span className="absolute top-0 right-2 w-2.5 h-3.5 rounded-[1px] bg-amber-300 shadow border border-amber-600" />
                  )}
                </div>

                {/* Player Name & Rating Label Underneath */}
                <div className="mt-1 flex flex-col items-center">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-[9.5px] sm:text-[11px] font-bold text-white whitespace-nowrap shadow-md group-hover:border-sky-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {player.name.split(" ").pop()}
                  </span>
                  <span className="mt-0.5 text-[8.5px] font-mono font-bold text-sky-300 bg-slate-950/80 px-1 rounded shadow-sm">
                    ★ {player.rating ?? 7.4}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Selected Player Tactical Intelligence Modal / Drawer ── */}
      {selectedPlayer && (
        <div className="mt-4 p-4 rounded-xl bg-muted/80 border border-primary/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/40 bg-slate-900 shrink-0">
              {selectedPlayer.photoUrl ? (
                <img src={selectedPlayer.photoUrl} alt={selectedPlayer.name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-black text-xl">
                  #{selectedPlayer.number}
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-foreground text-base">{selectedPlayer.name}</span>
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-white shadow-sm"
                  style={{ backgroundColor: selectedPlayer.teamColor }}
                >
                  #{selectedPlayer.number} {selectedPlayer.role}
                </span>
                {selectedPlayer.isCaptain && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    Captain
                  </span>
                )}
                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Match Rating ★ {selectedPlayer.rating ?? 8.2}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>{selectedPlayer.teamName}</span>
                <span>•</span>
                <span>Position: {selectedPlayer.position}</span>
                {selectedPlayer.goals ? (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{selectedPlayer.goals} Goal(s) Scored</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedPlayer.id) {
                  navigate({ name: "player-detail", id: selectedPlayer.id });
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="View full player stats & profile"
            >
              <User className="w-3.5 h-3.5" />
              View Profile
            </button>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="px-3.5 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Substitutes Bench ── */}
      <div className="mt-5 pt-4 border-t border-border">
        <button
          onClick={() => setShowBench(!showBench)}
          className="flex w-full items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
              Substitutes Bench &amp; Managers
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
            <span>{showBench ? "Hide" : "Show"} Bench</span>
            {showBench ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showBench && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {/* Home Bench */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: homeColor }} />
                  <span className="text-xs font-bold text-foreground">{homeTeam.name} Bench</span>
                </div>
                {resolvedHomeManager && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Manager: <strong className="text-foreground">{resolvedHomeManager}</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeHomeSubs.map((sub) => (
                  <div
                    key={`home_sub_${sub.id}`}
                    onClick={() => setSelectedPlayer({ ...sub, teamName: homeTeam.name, teamColor: homeColor })}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-border/70 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-border flex items-center justify-center">
                      {sub.photoUrl ? (
                        <img src={sub.photoUrl} alt={sub.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-white">{sub.number}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-foreground truncate">{sub.name}</p>
                      <p className="text-[9.5px] text-muted-foreground font-mono">#{sub.number} · {sub.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Bench */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: awayColor }} />
                  <span className="text-xs font-bold text-foreground">{awayTeam.name} Bench</span>
                </div>
                {resolvedAwayManager && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Manager: <strong className="text-foreground">{resolvedAwayManager}</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeAwaySubs.map((sub) => (
                  <div
                    key={`away_sub_${sub.id}`}
                    onClick={() => setSelectedPlayer({ ...sub, teamName: awayTeam.name, teamColor: awayColor })}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-border/70 hover:border-sky-400 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-border flex items-center justify-center">
                      {sub.photoUrl ? (
                        <img src={sub.photoUrl} alt={sub.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-white">{sub.number}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-foreground truncate">{sub.name}</p>
                      <p className="text-[9.5px] text-muted-foreground font-mono">#{sub.number} · {sub.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
