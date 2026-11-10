"use client";

import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";

/**
 * FHB 3.0 — Sky Sports-grade LIVE badge.
 * Sharp rectangle, pulsing dot, tight broadcast typography.
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
  size?: "sm" | "md" | "lg";
}) {
  if (period === "FT") {
    return (
      <span className={cn(
        "inline-flex items-center font-black uppercase tracking-widest text-white/40 bg-white/[0.06] px-2 py-0.5",
        size === "sm" ? "text-[9px]" : size === "lg" ? "text-[11px]" : "text-[10px]"
      )}>
        FT
      </span>
    );
  }

  if (period === "HT") {
    return (
      <span className={cn(
        "inline-flex items-center font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5",
        size === "sm" ? "text-[9px]" : size === "lg" ? "text-[11px]" : "text-[10px]"
      )}>
        HT
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5",
      size === "sm" ? "text-[9px]" : size === "lg" ? "text-[12px] px-2.5 py-1" : "text-[10px]",
      compact && "px-1.5"
    )}>
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
      {minute != null ? `${fmtNum(minute)}'` : "LIVE"}
    </span>
  );
}

/**
 * Form squares — W/D/L — Premier League style.
 */
export function FormDots({ form }: { form: string | null | undefined }) {
  if (!form) return null;
  const cfg: Record<string, { bg: string; text: string; title: string }> = {
    W: { bg: "bg-emerald-600", text: "text-white", title: "Win" },
    D: { bg: "bg-white/[0.1]", text: "text-white/50", title: "Draw" },
    L: { bg: "bg-red-600", text: "text-white", title: "Loss" },
  };
  return (
    <div className="flex items-center gap-0.5">
      {form.split("").slice(-5).map((c, i) => {
        const style = cfg[c] ?? cfg.D;
        return (
          <span
            key={i}
            className={cn(
              "flex h-[16px] w-[16px] items-center justify-center text-[9px] font-black leading-none",
              style.bg, style.text
            )}
            title={style.title}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
}
