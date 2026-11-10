"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamRef } from "@/lib/types";

export type BadgeTeam = TeamRef | { name: string; initials: string; color: string; color2?: string; logoUrl?: string | null };

/**
 * FHB 4.0 — Club crest.
 * Real logo on a soft white tile (Sofascore-style rounded square);
 * flat club-colour monogram tile as fallback. No drop shadows —
 * a 1px inset ring provides the edge.
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
  const pxMap = { xs: 18, sm: 22, md: 28, lg: 36, xl: 48, hero: 60, match: 88 }[size];
  const radiusMap = { xs: 4, sm: 5, md: 6, lg: 8, xl: 10, hero: 12, match: 16 }[size];

  if (team.logoUrl) {
    const logoPx = Math.round(pxMap * 0.78);
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-[oklch(0.955_0.005_255)]",
          "ring-1 ring-inset ring-black/10",
          className
        )}
        style={{ width: pxMap, height: pxMap, borderRadius: radiusMap }}
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

  // Fallback — flat club-colour monogram tile
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-display font-bold uppercase leading-none tracking-wide text-white",
        "ring-1 ring-inset ring-white/12",
        className
      )}
      style={{
        width: pxMap,
        height: pxMap,
        fontSize: Math.max(9, Math.round(pxMap * 0.38)),
        borderRadius: radiusMap,
        background: `color-mix(in oklab, ${team.color ?? "#2f9e64"} 72%, black 28%)`,
      }}
      title={team.name}
    >
      {team.initials || team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}

/** Backwards-compatible alias */
export const TeamBadge = TeamCrest;
