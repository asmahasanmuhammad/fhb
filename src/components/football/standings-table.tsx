"use client";

import { TeamCrest } from "./team-badge";
import { FormDots } from "./live-badge";
import { fmtNum } from "@/lib/format";
import type { Standing } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

/**
 * FHB 3.0 — Premier League / ESPN FC style standings table.
 * Clean carbon surface, sharp zoning bars, tabular numerals.
 */
export function StandingsTable({
  standings,
  compact = false,
  showForm = true,
  limit,
}: {
  standings: Standing[];
  compact?: boolean;
  showForm?: boolean;
  limit?: number;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const rows = limit ? standings.slice(0, limit) : standings;
  const relegated = (pos: number) => pos >= standings.length - 1 && standings.length > 4;

  const zoneColor = (pos: number) =>
    pos === 1
      ? "#F59E0B"      // Champions — gold
      : pos <= 3
        ? "#22C55E"    // UCL — green
        : pos <= 6
          ? "#3B82F6"  // UEL — blue
          : relegated(pos)
            ? "#EF4444" // Relegation — red
            : "transparent";

  /* ── Compact widget ── */
  if (compact) {
    return (
      <div className="overflow-hidden border border-white/[0.07] bg-[#0d0d10]">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_auto] gap-0 border-b border-white/[0.07] bg-[#060608] px-4 py-2">
          <span className="text-[9.5px] font-black uppercase tracking-widest text-white/30">#</span>
          <span className="text-[9.5px] font-black uppercase tracking-widest text-white/30">Club</span>
          <span className="text-[9.5px] font-black uppercase tracking-widest text-white/30 text-right">Pts</span>
        </div>
        <table className="w-full">
          <tbody>
            {rows.map((s, i) => (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <td className="relative w-10 py-2.5 pl-4">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px]"
                    style={{ backgroundColor: zoneColor(s.position) }}
                  />
                  <span className="tabular block text-center font-black text-[11px] text-white/35 group-hover:text-red-400">
                    {fmtNum(s.position)}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <TeamCrest team={s.team} size="sm" />
                    <span className="truncate text-[12.5px] font-bold text-white/75 group-hover:text-white">
                      {s.team.shortName ?? s.team.name}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center justify-end gap-3">
                    {showForm && s.form && (
                      <span className="hidden sm:block">
                        <FormDots form={s.form} />
                      </span>
                    )}
                    <span className="tabular font-black text-[14px] text-white">
                      {fmtNum(s.points)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ── Full table ── */
  return (
    <div className="overflow-x-auto border border-white/[0.07] bg-[#0d0d10] fhb-scroll">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-white/[0.07] bg-[#060608]">
            <th className="w-10 py-2.5 pl-4 text-left text-[9.5px] font-black uppercase tracking-widest text-white/30">#</th>
            <th className="py-2.5 text-left text-[9.5px] font-black uppercase tracking-widest text-white/30">Club</th>
            <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">P</th>
            <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">W</th>
            <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">D</th>
            <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">L</th>
            <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">GF:GA</th>
            <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">GD</th>
            {showForm && <th className="px-3 py-2.5 text-center text-[9.5px] font-black uppercase tracking-widest text-white/30">Form</th>}
            <th className="py-2.5 pr-5 text-center text-[9.5px] font-black uppercase tracking-widest text-red-500">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const gd = s.goalsFor - s.goalsAgainst;
            return (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <td className="relative py-3 pl-4">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px]"
                    style={{ backgroundColor: zoneColor(s.position) }}
                  />
                  <span className="tabular block text-center font-black text-[11px] text-white/35 group-hover:text-red-400">
                    {fmtNum(s.position)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <TeamCrest team={s.team} size="sm" />
                    <span className="text-[13px] font-bold text-white/80 group-hover:text-white">
                      {s.team.name}
                    </span>
                  </div>
                </td>
                <td className="tabular px-3 py-3 text-center text-[12px] text-white/40">{fmtNum(s.played)}</td>
                <td className="tabular px-3 py-3 text-center text-[12px] font-bold text-white/70">{fmtNum(s.won)}</td>
                <td className="tabular px-3 py-3 text-center text-[12px] text-white/40">{fmtNum(s.drawn)}</td>
                <td className="tabular px-3 py-3 text-center text-[12px] text-white/40">{fmtNum(s.lost)}</td>
                <td className="tabular px-3 py-3 text-center text-[12px] text-white/40">
                  {fmtNum(s.goalsFor)}:{fmtNum(s.goalsAgainst)}
                </td>
                <td className={cn(
                  "tabular px-3 py-3 text-center text-[12px] font-bold",
                  gd > 0 ? "text-emerald-400" : gd < 0 ? "text-red-400" : "text-white/40"
                )}>
                  {gd > 0 ? "+" : ""}{fmtNum(gd)}
                </td>
                {showForm && (
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <FormDots form={s.form} />
                    </div>
                  </td>
                )}
                <td className="tabular py-3 pr-5 text-center font-black text-[16px] text-white">
                  {fmtNum(s.points)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Zone legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-white/[0.06] px-5 py-2.5">
        {[
          { color: "#F59E0B", label: "Champions" },
          { color: "#22C55E", label: "UCL Qualification" },
          { color: "#3B82F6", label: "UEL Qualification" },
          { color: "#EF4444", label: "Relegation" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-white/35">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
