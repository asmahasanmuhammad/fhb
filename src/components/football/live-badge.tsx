"use client";

import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";

/**
 * FHB 4.0 — LIVE chip. Flat red tile, ticking minute.
 * No glow — the red is the signal.
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
    period === "HT" ? "HT" : period === "FT" ? "FT" : minute != null ? `${fmtNum(minute)}′` : "LIVE";
  const isTerminal = period === "HT" || period === "FT";
  return (
    <span
      className={cn(
        "minute-tick label-cond inline-flex items-center gap-1 rounded-[4px] font-bold leading-none",
        isTerminal ? "bg-secondary text-muted-foreground" : "bg-fhb-red text-white",
        size === "sm" ? "px-1.5 py-[3px] text-[10px] tracking-[0.06em]" : "px-2 py-[5px] text-[11px] tracking-[0.08em]",
        compact && "px-1.5"
      )}
    >
      {!isTerminal && <span className="live-dot inline-block h-[6px] w-[6px] rounded-[1.5px] bg-white" aria-hidden />}
      {isTerminal ? label : `LIVE ${label}`}
    </span>
  );
}

/**
 * Form guide squares — W/D/L, tight 4px chips.
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
            "tabular flex h-[18px] w-[18px] items-center justify-center rounded-[4px] text-[9px] font-bold leading-none",
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
