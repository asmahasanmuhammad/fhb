"use client";

import { useAppStore } from "@/store/app-store";
import { TeamCrest } from "@/components/football/team-badge";
import { FormDots } from "@/components/football/live-badge";
import type { Standing } from "@/lib/types";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * FHB 4.0 — League table.
 * Dense, tabular, hairline rows — FotMob rhythm.
 * Zone markers: title (green), relegation (red).
 */
export function StandingsTable({
  standings,
  compact = false,
  limit,
  highlightTeamId,
}: {
  standings: Standing[];
  compact?: boolean;
  limit?: number;
  highlightTeamId?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const rows = (limit ? standings.slice(0, limit) : standings).slice().sort((a, b) => a.position - b.position);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
        <p className="text-sm font-semibold text-foreground">Table not available</p>
        <p className="mt-1 text-xs text-muted-foreground">No standings have been recorded for this competition yet.</p>
      </div>
    );
  }

  const zoneFor = (pos: number, total: number): "champion" | "relegation" | null => {
    if (pos === 1) return "champion";
    if (pos > total - 2 && total >= 8) return "relegation";
    return null;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* header row — compact (rail) keeps the narrow P/GD/Pts grid at every viewport */}
      <div
        className={cn(
          "grid items-center gap-1 border-b border-border bg-elevated/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
          compact
            ? "grid-cols-[26px_1fr_repeat(2,24px)_32px]"
            : "grid-cols-[26px_1fr_repeat(2,24px)_32px] md:grid-cols-[30px_1fr_repeat(5,30px)_36px_100px]"
        )}
      >
        <span className="text-center">#</span>
        <span>Club</span>
        <span className="tabular text-center" title="Played">P</span>
        <span className={cn("tabular hidden text-center", !compact && "md:block")} title="Won">W</span>
        <span className={cn("tabular hidden text-center", !compact && "md:block")} title="Drawn">D</span>
        <span className={cn("tabular hidden text-center", !compact && "md:block")} title="Lost">L</span>
        <span className="tabular text-center" title="Goal difference">GD</span>
        <span className="tabular text-center">Pts</span>
        <span className={cn("hidden text-center", !compact && "md:block")}>Form</span>
      </div>

      <div className="divide-y divide-border/50">
        {rows.map((s) => {
          const gd = s.goalsFor - s.goalsAgainst;
          const zone = zoneFor(s.position, rows.length + (limit ? standings.length - rows.length : 0));
          const isHighlighted = highlightTeamId === s.team.id;
          return (
            <button
              key={s.id}
              onClick={() => navigate({ name: "team-detail", id: s.team.id })}
              className={cn(
                "row-hover grid w-full items-center gap-1 px-4 py-[9px] text-left",
                compact
                  ? "grid-cols-[26px_1fr_repeat(2,24px)_32px]"
                  : "grid-cols-[26px_1fr_repeat(2,24px)_32px] md:grid-cols-[30px_1fr_repeat(5,30px)_36px_100px]",
                isHighlighted && "bg-primary/[0.07]"
              )}
            >
              {/* position + zone chip */}
              <span className="relative flex items-center justify-center">
                <span
                  className="absolute -left-2 h-[62%] w-[3px] rounded-full"
                  style={{
                    backgroundColor:
                      zone === "champion" ? "var(--primary)" : zone === "relegation" ? "var(--fhb-red)" : "transparent",
                  }}
                  aria-hidden
                />
                <span
                  className={cn(
                    "tabular text-[12px] font-bold",
                    zone === "champion" ? "text-primary" : zone === "relegation" ? "text-fhb-red" : "text-muted-foreground"
                  )}
                >
                  {fmtNum(s.position)}
                </span>
              </span>

              {/* club */}
              <span className="flex min-w-0 items-center gap-2">
                <TeamCrest team={s.team} size="xs" />
                <span className={cn("truncate text-[13px]", isHighlighted ? "font-bold text-primary" : "font-medium text-foreground/90")}>
                  {s.team.name}
                </span>
              </span>

              <span className="tabular text-center text-[12px] text-muted-foreground">{fmtNum(s.played)}</span>
              <span className={cn("tabular hidden text-center text-[12px] text-muted-foreground", !compact && "md:block")}>{fmtNum(s.won)}</span>
              <span className={cn("tabular hidden text-center text-[12px] text-muted-foreground", !compact && "md:block")}>{fmtNum(s.drawn)}</span>
              <span className={cn("tabular hidden text-center text-[12px] text-muted-foreground", !compact && "md:block")}>{fmtNum(s.lost)}</span>
              <span className={cn("tabular text-center text-[12px]", gd > 0 ? "text-foreground/80" : "text-muted-foreground")}>
                {gd > 0 ? `+${fmtNum(gd)}` : fmtNum(gd)}
              </span>
              <span className="tabular text-center text-[13px] font-bold text-foreground">{fmtNum(s.points)}</span>
              <span className={cn("hidden items-center justify-center", !compact && "md:flex")}>
                <FormDots form={s.form?.slice(-5)} />
              </span>
            </button>
          );
        })}
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border bg-elevated/40 px-4 py-2.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-[10px] w-[3px] rounded-full bg-primary" aria-hidden /> Champion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[10px] w-[3px] rounded-full bg-fhb-red" aria-hidden /> Relegation
          </span>
          <span className="ml-auto hidden sm:block">Updated after every matchday</span>
        </div>
      )}
    </div>
  );
}
