"use client";

import { TeamBadge } from "./team-badge";
import { FormDots } from "./live-badge";
import { toBn } from "@/lib/format";
import type { Standing } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

/**
 * FotMob-grade standings table — zone bars, tabular numerals, form squares.
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

  if (compact) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-accent/40"
              >
                <td className="relative w-8 py-2.5 pl-3">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-1.5 left-0 w-[3px] rounded-r",
                      s.position === 1 ? "bg-fhb-gold" : s.position <= 3 ? "bg-primary" : relegated(s.position) ? "bg-fhb-red" : "bg-transparent"
                    )}
                  />
                  <span className="tabular block text-center font-display text-xs font-bold text-muted-foreground">
                    {toBn(s.position)}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge team={s.team} size="xs" />
                    <span className="truncate text-xs font-semibold text-foreground sm:text-[13px]">{s.team.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center justify-end gap-3">
                    {showForm && s.form && <span className="hidden sm:block"><FormDots form={s.form} /></span>}
                    <span className="tabular w-8 text-right font-display text-sm font-bold text-foreground">{toBn(s.points)}</span>
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
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[680px]">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-10 py-2.5 pl-3 text-left font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
            <th className="py-2.5 text-left font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ক্লাব</th>
            <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">খেলা</th>
            <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">জ</th>
            <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ড</th>
            <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">হ</th>
            <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">গোল</th>
            <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">গড</th>
            {showForm && <th className="px-2 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ফর্ম</th>}
            <th className="py-2.5 pr-4 text-center font-display text-[10px] font-bold uppercase tracking-widest text-primary">পয়েন্ট</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const gd = s.goalsFor - s.goalsAgainst;
            return (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="group cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/40"
              >
                <td className="relative py-2.5 pl-3">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-1.5 left-0 w-[3px] rounded-r",
                      s.position === 1 ? "bg-fhb-gold" : s.position <= 3 ? "bg-primary" : relegated(s.position) ? "bg-fhb-red" : "bg-transparent"
                    )}
                  />
                  <span className="tabular block text-center font-display text-xs font-bold text-muted-foreground">
                    {toBn(s.position)}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge team={s.team} size="sm" />
                    <span className="text-[13px] font-semibold text-foreground">{s.team.name}</span>
                  </div>
                </td>
                <td className="tabular px-2 py-2.5 text-center text-xs text-muted-foreground">{toBn(s.played)}</td>
                <td className="tabular px-2 py-2.5 text-center text-xs font-semibold text-foreground">{toBn(s.won)}</td>
                <td className="tabular px-2 py-2.5 text-center text-xs text-muted-foreground">{toBn(s.drawn)}</td>
                <td className="tabular px-2 py-2.5 text-center text-xs text-muted-foreground">{toBn(s.lost)}</td>
                <td className="tabular px-2 py-2.5 text-center text-xs text-muted-foreground">
                  {toBn(s.goalsFor)}:{toBn(s.goalsAgainst)}
                </td>
                <td className={cn("tabular px-2 py-2.5 text-center text-xs font-semibold", gd > 0 ? "text-primary" : gd < 0 ? "text-fhb-red" : "text-muted-foreground")}>
                  {gd > 0 ? "+" : ""}
                  {toBn(gd)}
                </td>
                {showForm && (
                  <td className="px-2 py-2.5">
                    <div className="flex justify-center">
                      <FormDots form={s.form} />
                    </div>
                  </td>
                )}
                <td className="tabular py-2.5 pr-4 text-center font-display text-base font-bold text-foreground">
                  {toBn(s.points)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
