"use client";

import React, { useState } from "react";
import { Shield, Sparkles, Activity, Eye, Zap, Flame, Award, ChevronRight } from "lucide-react";
import type { TeamRef, Player } from "@/lib/types";
import { TeamCrest } from "@/components/football/team-badge";
import { cn } from "@/lib/utils";

export interface PitchPlayerNode {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  role: string;
  isCaptain?: boolean;
  rating?: number;
}

interface TacticalPitchProps {
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homePlayers?: PitchPlayerNode[];
  awayPlayers?: PitchPlayerNode[];
  homeFormation?: string;
  awayFormation?: string;
  compact?: boolean;
}

interface PitchPosition {
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  role: string;
}

export function TacticalPitch({
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  homeFormation = "4-3-3",
  awayFormation = "4-2-3-1",
  compact = false,
}: TacticalPitchProps) {
  const [pitchMode, setPitchMode] = useState<"both" | "home" | "away">("both");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PitchPlayerNode | null>(null);

  // Default coordinate layouts for full 22-man tactical pitch
  // Home team on bottom half defending south goal, attacking north (y: 55 to 94)
  // Away team on top half defending north goal, attacking south (y: 6 to 45)
  const homeFormationCoordinates: PitchPosition[] = [
    { x: 50, y: 92, role: "GK" },
    { x: 16, y: 76, role: "LB" },
    { x: 38, y: 79, role: "CB" },
    { x: 62, y: 79, role: "CB" },
    { x: 84, y: 76, role: "RB" },
    { x: 30, y: 64, role: "CM" },
    { x: 50, y: 67, role: "CDM" },
    { x: 70, y: 64, role: "CM" },
    { x: 20, y: 53, role: "LW" },
    { x: 50, y: 50, role: "ST" },
    { x: 80, y: 53, role: "RW" },
  ];

  const awayFormationCoordinates: PitchPosition[] = [
    { x: 50, y: 8, role: "GK" },
    { x: 84, y: 22, role: "LB" },
    { x: 62, y: 19, role: "CB" },
    { x: 38, y: 19, role: "CB" },
    { x: 16, y: 22, role: "RB" },
    { x: 38, y: 32, role: "CDM" },
    { x: 62, y: 32, role: "CDM" },
    { x: 50, y: 40, role: "CAM" },
    { x: 80, y: 42, role: "LW" },
    { x: 20, y: 42, role: "RW" },
    { x: 50, y: 46, role: "ST" },
  ];

  // Single team focused coordinates (entire pitch view)
  const singleTeamCoordinates: PitchPosition[] = [
    { x: 50, y: 88, role: "GK" },
    { x: 18, y: 70, role: "LB" },
    { x: 38, y: 73, role: "CB" },
    { x: 62, y: 73, role: "CB" },
    { x: 82, y: 70, role: "RB" },
    { x: 30, y: 50, role: "CM" },
    { x: 50, y: 55, role: "CDM" },
    { x: 70, y: 50, role: "CM" },
    { x: 22, y: 28, role: "LW" },
    { x: 50, y: 22, role: "ST" },
    { x: 78, y: 28, role: "RW" },
  ];

  // Default Bangladeshi and international stars fallback if not provided
  const activeHomePlayers: PitchPlayerNode[] =
    homePlayers && homePlayers.length >= 11
      ? homePlayers.slice(0, 11)
      : [
          { id: "h1", name: "Anisur Rahman", number: 1, position: "GK", role: "GK", isCaptain: false, rating: 7.9 },
          { id: "h2", name: "Bishwanath Ghosh", number: 12, position: "DF", role: "RB", isCaptain: false, rating: 7.5 },
          { id: "h3", name: "Tariq Kazi", number: 4, position: "DF", role: "CB", isCaptain: false, rating: 8.3 },
          { id: "h4", name: "Topu Barman", number: 2, position: "DF", role: "CB", isCaptain: true, rating: 8.1 },
          { id: "h5", name: "Rahmat Mia", number: 3, position: "DF", role: "LB", isCaptain: false, rating: 7.4 },
          { id: "h6", name: "Sohel Rana", number: 8, position: "MF", role: "CM", isCaptain: false, rating: 7.8 },
          { id: "h7", name: "Miguel Figueira", number: 10, position: "MF", role: "CAM", isCaptain: false, rating: 8.8 },
          { id: "h8", name: "Masuk Mia Zoni", number: 6, position: "MF", role: "CDM", isCaptain: false, rating: 7.6 },
          { id: "h9", name: "Rakib Hossain", number: 11, position: "FW", role: "RW", isCaptain: false, rating: 8.2 },
          { id: "h10", name: "Dorielton Gomes", number: 9, position: "FW", role: "ST", isCaptain: false, rating: 8.5 },
          { id: "h11", name: "Robinho", number: 7, position: "FW", role: "LW", isCaptain: false, rating: 8.9 },
        ];

  const activeAwayPlayers: PitchPlayerNode[] =
    awayPlayers && awayPlayers.length >= 11
      ? awayPlayers.slice(0, 11)
      : [
          { id: "a1", name: "Shahidul Alam", number: 1, position: "GK", role: "GK", isCaptain: false, rating: 7.3 },
          { id: "a2", name: "Nurul Naium", number: 2, position: "DF", role: "LB", isCaptain: false, rating: 7.1 },
          { id: "a3", name: "Youkouba", number: 5, position: "DF", role: "CB", isCaptain: false, rating: 7.7 },
          { id: "a4", name: "Rezaul Karim", number: 4, position: "DF", role: "CB", isCaptain: true, rating: 7.5 },
          { id: "a5", name: "Riyadul Rafi", number: 14, position: "DF", role: "RB", isCaptain: false, rating: 7.2 },
          { id: "a6", name: "Ridoy Hossain", number: 16, position: "MF", role: "CDM", isCaptain: false, rating: 7.4 },
          { id: "a7", name: "Jonathan Reis", number: 10, position: "MF", role: "CAM", isCaptain: false, rating: 8.0 },
          { id: "a8", name: "Mohamed Sohel", number: 8, position: "MF", role: "CDM", isCaptain: false, rating: 7.3 },
          { id: "a9", name: "Foysal Fahim", number: 17, position: "FW", role: "RW", isCaptain: false, rating: 8.1 },
          { id: "a10", name: "Cornelius Stewart", number: 9, position: "FW", role: "ST", isCaptain: false, rating: 8.4 },
          { id: "a11", name: "Emeka Ogbugh", number: 11, position: "FW", role: "LW", isCaptain: false, rating: 7.8 },
        ];

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-[#0b101d] p-4 sm:p-5 shadow-2xl overflow-hidden">
      {/* Tactical Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-xs">
            📐
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase font-condensed">
              2D Tactical Pitch &amp; Formation Board
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">
              {homeTeam.name} ({homeFormation}) vs {awayTeam.name} ({awayFormation})
            </p>
          </div>
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-1.5 bg-[#06080f] border border-white/15 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setPitchMode("both")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
              pitchMode === "both"
                ? "bg-red-600 text-white font-black shadow-md shadow-red-600/30"
                : "text-slate-300 hover:text-white"
            )}
          >
            22-Man (H2H)
          </button>
          <button
            onClick={() => setPitchMode("home")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
              pitchMode === "home"
                ? "bg-red-600 text-white font-black shadow-md shadow-red-600/30"
                : "text-slate-300 hover:text-white"
            )}
          >
            {homeTeam.shortName || homeTeam.initials || "HOME"}
          </button>
          <button
            onClick={() => setPitchMode("away")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
              pitchMode === "away"
                ? "bg-sky-500 text-slate-950 font-black shadow-sm"
                : "text-slate-300 hover:text-white"
            )}
          >
            {awayTeam.shortName || awayTeam.initials || "AWAY"}
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer",
              showHeatmap ? "bg-amber-400 text-slate-950 font-black" : "text-slate-300 hover:text-amber-400"
            )}
            title="Toggle Tactical Heatmap"
          >
            <Flame className="w-3 h-3" />
            <span className="hidden sm:inline">Heatmap</span>
          </button>
        </div>
      </div>

      {/* The Football Pitch Canvas */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.5] md:aspect-[4/4] max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#064e3b] select-none">
        {/* Grass Cut Striping (Alternating vertical bands) */}
        <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-25">
          <div className="bg-emerald-400/10" />
          <div className="bg-black/10" />
          <div className="bg-emerald-400/10" />
          <div className="bg-black/10" />
          <div className="bg-emerald-400/10" />
          <div className="bg-black/10" />
        </div>

        {/* Pitch Lines (Tactical Regulation Markings) */}
        <div className="absolute inset-3 border-2 border-white/40 rounded-sm pointer-events-none">
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/40 -translate-y-1/2" />
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
          {/* Center Spot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

          {/* Top Penalty Area (Away) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white/40" />
          {/* Top Goal Area */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b-2 border-x-2 border-white/40" />
          {/* Top Penalty Spot */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
          {/* Top Penalty Arc */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-8 border-b-2 border-white/40 rounded-b-full" />

          {/* Bottom Penalty Area (Home) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white/40" />
          {/* Bottom Goal Area */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t-2 border-x-2 border-white/40" />
          {/* Bottom Penalty Spot */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
          {/* Bottom Penalty Arc */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-16 h-8 border-t-2 border-white/40 rounded-t-full" />

          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-full" />
          <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-full" />
        </div>

        {/* Heatmap Simulation Overlay */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-rose-500/35 rounded-full blur-2xl" />
            <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-amber-500/30 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-44 bg-emerald-400/25 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/6 w-28 h-28 bg-blue-500/30 rounded-full blur-2xl" />
            <div className="absolute bottom-1/4 right-1/6 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl" />
          </div>
        )}

        {/* Home Team Players (Bottom / Crimson) */}
        {(pitchMode === "both" || pitchMode === "home") &&
          activeHomePlayers.map((player, idx) => {
            const coords =
              pitchMode === "home"
                ? singleTeamCoordinates[idx] || { x: 50, y: 50, role: player.role }
                : homeFormationCoordinates[idx] || { x: 50, y: 50, role: player.role };

            return (
              <div
                key={`home_${player.id}`}
                onClick={() => setSelectedPlayer(player)}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
              >
                <div
                  className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-lg ring-2 ring-white/90 group-hover:scale-125 group-hover:ring-emerald-400 transition-all"
                  style={{ backgroundColor: homeTeam.color || "#e11d48" }}
                >
                  <span>{player.number}</span>
                  {player.isCaptain && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                      C
                    </span>
                  )}
                </div>
                <div className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm border border-white/20 text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap shadow group-hover:border-emerald-400">
                  {player.name.split(" ").pop()}
                </div>
              </div>
            );
          })}

        {/* Away Team Players (Top / Sky Blue) */}
        {(pitchMode === "both" || pitchMode === "away") &&
          activeAwayPlayers.map((player, idx) => {
            const coords =
              pitchMode === "away"
                ? singleTeamCoordinates[idx] || { x: 50, y: 50, role: player.role }
                : awayFormationCoordinates[idx] || { x: 50, y: 50, role: player.role };

            return (
              <div
                key={`away_${player.id}`}
                onClick={() => setSelectedPlayer(player)}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
              >
                <div
                  className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-lg ring-2 ring-white/90 group-hover:scale-125 group-hover:ring-amber-400 transition-all"
                  style={{ backgroundColor: awayTeam.color || "#0284c7" }}
                >
                  <span>{player.number}</span>
                  {player.isCaptain && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                      C
                    </span>
                  )}
                </div>
                <div className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm border border-white/20 text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap shadow group-hover:border-amber-400">
                  {player.name.split(" ").pop()}
                </div>
              </div>
            );
          })}
      </div>

      {/* Selected Player Tactical Intelligence Drawer */}
      {selectedPlayer && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-emerald-400 text-base">
              #{selectedPlayer.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm">{selectedPlayer.name}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                  {selectedPlayer.role}
                </span>
                {selectedPlayer.isCaptain && (
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                    Captain
                  </span>
                )}
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                  ★ {selectedPlayer.rating ?? 8.2}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Matchday Intelligence • 91% Pass Accuracy • 3 Key Passes • 2 Shots on Target
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedPlayer(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
