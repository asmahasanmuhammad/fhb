"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamRef } from "@/lib/types";

export type BadgeTeam = TeamRef | { name: string; initials: string; color: string; color2?: string; logoUrl?: string | null };

/**
 * Club crest — real logo (transparent PNG) when available,
 * flat single-colour monogram chip as disciplined fallback.
 */
export function TeamCrest({
  team,
  size = "md",
  className,
}: {
  team: BadgeTeam;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero" | "match";
  className?: string;
}) {
  if (team.logoUrl) {
    const chipPx = { xs: 20, sm: 26, md: 34, lg: 42, xl: 58, hero: 76, match: 100 }[size];
    const logoPx = Math.round(chipPx * 0.82);
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 select-none items-center justify-center rounded-full",
          "bg-[oklch(0.955_0.005_255)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),0_2px_5px_-2px_rgba(0,0,0,0.5)]",
          className
        )}
        style={{ width: chipPx, height: chipPx }}
        title={team.name}
      >
        <span className="relative block" style={{ width: logoPx, height: logoPx }}>
          <Image
            src={team.logoUrl}
            alt={`${team.name} crest`}
            fill
            sizes={`${logoPx}px`}
            className="object-contain"
            unoptimized
          />
        </span>
      </span>
    );
  }

  // Fallback — flat club-colour monogram chip
  const fallbackPx = { xs: 18, sm: 24, md: 30, lg: 38, xl: 52, hero: 68, match: 88 }[size];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-display font-bold uppercase tracking-wide leading-none",
        className
      )}
      style={{
        width: fallbackPx,
        height: fallbackPx,
        fontSize: Math.max(9, Math.round(fallbackPx * 0.34)),
        borderRadius: Math.round(fallbackPx * 0.22),
        background: `color-mix(in oklab, ${team.color ?? "#2f9e64"} 78%, black 22%)`,
        color: "#ffffff",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14), 0 2px 6px -2px rgba(0,0,0,0.5)",
      }}
      title={team.name}
    >
      {team.initials || team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}

/** Backwards-compatible alias */
export const TeamBadge = TeamCrest;
