"use client";

import { cn } from "@/lib/utils";
import { toBn } from "@/lib/format";

/**
 * Broadcast-style LIVE chip — red square dot + minute in Oswald caps.
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
    period === "HT" ? "হাফ-টাইম" : period === "FT" ? "শেষ" : minute != null ? `${toBn(minute)}′` : "লাইভ";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-fhb-red/40 bg-fhb-red/10 font-display font-bold uppercase text-fhb-red",
        size === "sm" ? "px-1.5 py-0.5 text-[10px] tracking-wider" : "px-2 py-0.5 text-[11px] tracking-wider",
        compact && "px-1.5"
      )}
    >
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
      {period === "HT" || period === "FT" ? label : `লাইভ ${label}`}
    </span>
  );
}

/**
 * Form guide squares — W/D/L with Bengali letters.
 */
export function FormDots({ form }: { form: string | null | undefined }) {
  if (!form) return null;
  const styles: Record<string, string> = {
    W: "bg-primary text-primary-foreground",
    D: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    L: "bg-fhb-red/90 text-white",
  };
  const labels: Record<string, string> = { W: "জ", D: "ড", L: "হ" };
  return (
    <div className="flex items-center gap-1">
      {form.split("").map((c, i) => (
        <span
          key={i}
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] text-[9px] font-bold leading-none",
            styles[c] ?? styles.D
          )}
          title={{ W: "জয়", D: "ড্র", L: "হার" }[c] ?? ""}
        >
          {labels[c] ?? "ড"}
        </span>
      ))}
    </div>
  );
}
