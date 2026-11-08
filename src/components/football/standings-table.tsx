"use client";

import { TeamBadge } from "./team-badge";
import { FormDots } from "./live-badge";
import { toBn } from "@/lib/format";
import type { Standing } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function StandingsTable({
  standings,
  compact = false,
  showForm = true,
}: {
  standings: Standing[];
  compact?: boolean;
  showForm?: boolean;
}) {
  const navigate = useAppStore((s) => s.navigate);
  if (compact) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <tbody>
            {standings.slice(0, 5).map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-accent/50"
              >
                <td className="w-8 py-2.5 pl-3 text-center font-display text-xs text-muted-foreground">{toBn(s.position)}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <TeamBadge team={s.team} size="xs" />
                    <span className="truncate text-xs font-semibold sm:text-sm">{s.team.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-right font-display text-sm font-bold">{toBn(s.points)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-[11px] uppercase text-muted-foreground">
            <th className="py-3 pl-3 text-center font-medium">#</th>
            <th className="py-3 text-left font-medium">ক্লাব</th>
            <th className="px-2 py-3 text-center font-medium">খেলা</th>
            <th className="px-2 py-3 text-center font-medium">জ</th>
            <th className="px-2 py-3 text-center font-medium">ড</th>
            <th className="px-2 py-3 text-center font-medium">হ</th>
            <th className="px-2 py-3 text-center font-medium">গোল</th>
            <th className="px-2 py-3 text-center font-medium">গড</th>
            {showForm && <th className="px-2 py-3 text-center font-medium">ফর্ম</th>}
            <th className="py-3 pr-4 text-center font-medium">পয়েন্ট</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const gd = s.goalsFor - s.goalsAgainst;
            return (
              <tr
                key={s.id}
                onClick={() => navigate({ name: "team-detail", id: s.team.id })}
                className={cn(
                  "cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/40",
                  s.position === 1 && "bg-primary/5",
                  s.position >= standings.length - 1 && "bg-fhb-red/5"
                )}
              >
                <td className="py-2.5 pl-3 text-center font-display text-xs">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded",
                      s.position === 1 && "bg-fhb-gold/20 text-fhb-gold",
                      s.position === 2 && "bg-muted text-foreground",
                      s.position === 3 && "bg-orange-500/15 text-orange-400",
                      s.position > 3 && "text-muted-foreground"
                    )}
                  >
                    {toBn(s.position)}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge team={s.team} size="sm" />
                    <span className="font-semibold">{s.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{toBn(s.played)}</td>
                <td className="px-2 py-2.5 text-center">{toBn(s.won)}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{toBn(s.drawn)}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{toBn(s.lost)}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">
                  {toBn(s.goalsFor)}:{toBn(s.goalsAgainst)}
                </td>
                <td className={cn("px-2 py-2.5 text-center font-medium", gd > 0 ? "text-primary" : gd < 0 ? "text-fhb-red" : "")}>
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
                <td className="py-2.5 pr-4 text-center font-display text-base font-bold text-primary">{toBn(s.points)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
