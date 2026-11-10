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
      <div className="overflow-hidden rounded-md border border-white/12 bg-[#0a0e1c] shadow-lg">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_auto] gap-0 border-b border-white/15 bg-[#060914] px-4 py-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">#</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Club</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white text-right">Pts</span>
        </div>
        <table className="w-full">
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-white/10 transition-colors last:border-0 hover:bg-white/10"
              >
                <td className="relative w-10 py-3 pl-4">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: zoneColor(s.position) }}
                  />
                  <span className="tabular block text-center font-black text-[12px] text-white group-hover:text-[#ff1e46]">
                    {fmtNum(s.position)}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <TeamCrest team={s.team} size="sm" />
                    <span className="truncate text-[13px] font-extrabold text-white group-hover:text-[#00e5ff]">
                      {s.team.shortName ?? s.team.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-3">
                    {showForm && s.form && (
                      <span className="hidden sm:block">
                        <FormDots form={s.form} />
                      </span>
                    )}
                    <span className="tabular font-black text-[15px] text-white px-2 py-0.5 rounded bg-white/10 border border-white/20">
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
    <div className="overflow-x-auto rounded-md border border-white/12 bg-[#0a0e1c] shadow-xl fhb-scroll">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-white/15 bg-[#060914]">
            <th className="w-12 py-3 pl-4 text-left text-[10.5px] font-black uppercase tracking-widest text-white">#</th>
            <th className="py-3 text-left text-[10.5px] font-black uppercase tracking-widest text-white">Club</th>
            <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">P</th>
            <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">W</th>
            <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">D</th>
            <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">L</th>
            <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">GF:GA</th>
            <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">GD</th>
            {showForm && <th className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-widest text-white">Form</th>}
            <th className="py-3 pr-5 text-center text-[11px] font-black uppercase tracking-widest text-[#ff1e46]">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const gd = s.goalsFor - s.goalsAgainst;
            return (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-white/10 transition-colors last:border-0 hover:bg-white/10"
              >
                <td className="relative py-3 pl-4">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: zoneColor(s.position) }}
                  />
                  <span className="tabular block text-center font-black text-[12px] text-white group-hover:text-[#ff1e46]">
                    {fmtNum(s.position)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <TeamCrest team={s.team} size="sm" />
                    <span className="text-[13.5px] font-extrabold text-white group-hover:text-[#00e5ff]">
                      {s.team.name}
                    </span>
                  </div>
                </td>
                <td className="tabular px-3 py-3 text-center text-[13px] font-bold text-[#cbd5e1]">{fmtNum(s.played)}</td>
                <td className="tabular px-3 py-3 text-center text-[13px] font-extrabold text-white">{fmtNum(s.won)}</td>
                <td className="tabular px-3 py-3 text-center text-[13px] font-bold text-[#cbd5e1]">{fmtNum(s.drawn)}</td>
                <td className="tabular px-3 py-3 text-center text-[13px] font-bold text-[#cbd5e1]">{fmtNum(s.lost)}</td>
                <td className="tabular px-3 py-3 text-center text-[13px] font-bold text-[#cbd5e1]">
                  {fmtNum(s.goalsFor)}:{fmtNum(s.goalsAgainst)}
                </td>
                <td className={cn(
                  "tabular px-3 py-3 text-center text-[13px] font-black",
                  gd > 0 ? "text-emerald-400" : gd < 0 ? "text-[#ff1e46]" : "text-white"
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
                  <span className="inline-block px-2.5 py-0.5 rounded bg-[#ff1e46]/25 border border-[#ff1e46]/50 shadow-sm">
                    {fmtNum(s.points)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Zone legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 px-5 py-3 bg-[#060914]">
        {[
          { color: "#F59E0B", label: "Champions" },
          { color: "#22C55E", label: "UCL Qualification" },
          { color: "#3B82F6", label: "UEL Qualification" },
          { color: "#EF4444", label: "Relegation" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-2 text-[11px] font-bold text-white">
            <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
