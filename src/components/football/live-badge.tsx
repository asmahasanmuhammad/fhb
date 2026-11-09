"use client";

import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";

/**
 * Broadcast LIVE chip — pulsing red dot + minute.
 */
export function LiveBadge({
  minute,
  period,
  compact = false,
  size = "md",
}: {
  minute?: number | null;
  period?: string | null;
  compact?: boolean;
  size?: "sm" | "md";
}) {
  const label =
    period === "HT" ? "Half-Time" : period === "FT" ? "Full-Time" : minute != null ? `${fmtNum(minute)}′` : "LIVE";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-fhb-red/45 bg-fhb-red/12 font-display font-bold uppercase text-fhb-red",
        size === "sm" ? "px-1.5 py-0.5 text-[10px] tracking-wider" : "px-2 py-0.5 text-[11px] tracking-wider",
        compact && "px-1.5"
      )}
    >
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
      {period === "HT" || period === "FT" ? label : `LIVE ${label}`}
    </span>
  );
}

/**
 * Form guide squares — W/D/L.
 */
export function FormDots({ form }: { form: string | null | undefined }) {
  if (!form) return null;
  const styles: Record<string, string> = {
    W: "bg-primary text-primary-foreground",
    D: "bg-elevated text-muted-foreground ring-1 ring-inset ring-border",
    L: "bg-fhb-red/90 text-white",
  };
  const labels: Record<string, string> = { W: "W", D: "D", L: "L" };
  return (
    <div className="flex items-center gap-1">
      {form.split("").map((c, i) => (
        <span
          key={i}
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[9px] font-bold leading-none",
            styles[c] ?? styles.D
          )}
          title={{ W: "Win", D: "Draw", L: "Loss" }[c] ?? ""}
        >
          {labels[c] ?? "D"}
        </span>
      ))}
    </div>
  );
}
