"use client";

import { cn } from "@/lib/utils";
import { toBn } from "@/lib/format";

export function LiveBadge({ minute, period, compact = false }: { minute?: number | null; period?: string | null; compact?: boolean }) {
  const label = period === "HT" ? "হাফ-টাইম" : period === "FT" ? "শেষ" : minute != null ? `${toBn(minute)}′` : "লাইভ";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-fhb-red/15 px-2 py-0.5 font-display text-[11px] font-semibold text-fhb-red ring-1 ring-fhb-red/40",
        compact && "px-1.5"
      )}
    >
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
      {period === "HT" || period === "FT" ? label : `লাইভ ${label}`}
    </span>
  );
}

export function FormDots({ form }: { form: string | null | undefined }) {
  if (!form) return null;
  const colors: Record<string, string> = {
    W: "bg-primary text-primary-foreground",
    D: "bg-muted-foreground/40 text-foreground",
    L: "bg-fhb-red/80 text-white",
  };
  const labels: Record<string, string> = { W: "জ", D: "ড", L: "হ" };
  return (
    <div className="flex items-center gap-1">
      {form.split("").map((c, i) => (
        <span
          key={i}
          className={cn("flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold", colors[c] ?? colors.D)}
          title={{ W: "জয়", D: "ড্র", L: "হার" }[c] ?? ""}
        >
          {labels[c] ?? "ড"}
        </span>
      ))}
    </div>
  );
}
