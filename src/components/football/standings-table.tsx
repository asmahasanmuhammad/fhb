"use client";

import { TeamCrest } from "./team-badge";
import { FormDots } from "./live-badge";
import { fmtNum } from "@/lib/format";
import type { Standing } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

/**
 * League table — zone bars, tabular numerals, form squares.
 * Broadcast graphics-grade hierarchy.
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

  const zoneBar = (pos: number) =>
    pos === 1
      ? "bg-fhb-gold"
      : pos <= 3
        ? "bg-primary"
        : relegated(pos)
          ? "bg-fhb-red"
          : "bg-transparent";

  if (compact) {
    return (
      <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <td className="relative w-9 py-3 pl-4">
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-2 left-0 w-[3px] rounded-r", zoneBar(s.position))}
                  />
                  <span className="tabular block text-center font-display text-xs font-bold text-muted-foreground group-hover:text-primary">
                    {fmtNum(s.position)}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <TeamCrest team={s.team} size="sm" />
                    <span className="truncate text-[13px] font-semibold text-foreground">{s.team.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-3.5">
                    {showForm && s.form && (
                      <span className="hidden sm:block">
                        <FormDots form={s.form} />
                      </span>
                    )}
                    <span className="flex flex-col items-end leading-none">
                      <span className="tabular font-display text-base font-bold text-foreground">{fmtNum(s.points)}</span>
                      <span className="tabular mt-1 text-[9px] text-muted-foreground">{fmtNum(s.played)} played</span>
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

  return (
    <div className="edge-lit overflow-x-auto rounded-xl border border-border bg-card fhb-scroll">
      <table className="w-full min-w-[680px]">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-10 py-2.5 pl-4 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">#</th>
            <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Club</th>
            <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">P</th>
            <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">W</th>
            <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">D</th>
            <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">L</th>
            <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Goals</th>
            <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">GD</th>
            {showForm && <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Form</th>}
            <th className="py-2.5 pr-5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-primary">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const gd = s.goalsFor - s.goalsAgainst;
            return (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <td className="relative py-3 pl-4">
                  <span aria-hidden className={cn("absolute inset-y-2 left-0 w-[3px] rounded-r", zoneBar(s.position))} />
                  <span className="tabular block text-center font-display text-xs font-bold text-muted-foreground group-hover:text-primary">
                    {fmtNum(s.position)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <TeamCrest team={s.team} size="sm" />
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary">{s.team.name}</span>
                  </div>
                </td>
                <td className="tabular px-2 py-3 text-center text-xs text-muted-foreground">{fmtNum(s.played)}</td>
                <td className="tabular px-2 py-3 text-center text-xs font-semibold text-foreground">{fmtNum(s.won)}</td>
                <td className="tabular px-2 py-3 text-center text-xs text-muted-foreground">{fmtNum(s.drawn)}</td>
                <td className="tabular px-2 py-3 text-center text-xs text-muted-foreground">{fmtNum(s.lost)}</td>
                <td className="tabular px-2 py-3 text-center text-xs text-muted-foreground">
                  {fmtNum(s.goalsFor)}:{fmtNum(s.goalsAgainst)}
                </td>
                <td className={cn("tabular px-2 py-3 text-center text-xs font-semibold", gd > 0 ? "text-primary" : gd < 0 ? "text-fhb-red" : "text-muted-foreground")}>
                  {gd > 0 ? "+" : ""}
                  {fmtNum(gd)}
                </td>
                {showForm && (
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      <FormDots form={s.form} />
                    </div>
                  </td>
                )}
                <td className="tabular py-3 pr-5 text-center font-display text-lg font-bold text-foreground">
                  {fmtNum(s.points)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
