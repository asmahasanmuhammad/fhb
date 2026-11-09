"use client";

import { cn } from "@/lib/utils";
import type { TeamRef } from "@/lib/types";

export type BadgeTeam = TeamRef | { name: string; initials: string; color: string; color2?: string };

/**
 * Club crest — layered disc with club colors, inner ring,
 * hairline highlight & drop shade. Print-grade, no cheap gradients.
 */
export function TeamBadge({
  team,
  size = "md",
  className,
}: {
  team: BadgeTeam;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
}) {
  const sizes = {
    xs: "w-6 h-6 text-[9px] rounded-[7px]",
    sm: "w-8 h-8 text-[11px] rounded-[9px]",
    md: "w-10 h-10 text-[13px] rounded-[11px]",
    lg: "w-12 h-12 text-base rounded-[13px]",
    xl: "w-16 h-16 text-xl rounded-[18px]",
    hero: "w-20 h-20 text-2xl rounded-[22px] sm:w-24 sm:h-24 sm:text-3xl",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-display font-bold uppercase tracking-wider leading-none",
        sizes[size],
        className
      )}
      style={{
        background: `linear-gradient(160deg, ${team.color ?? "#12805c"} 0%, ${
          team.color2 ?? "color-mix(in oklab, " + (team.color ?? "#12805c") + " 62%, black)"
        } 100%)`,
        color: "#ffffff",
        boxShadow:
          "inset 0 0 0 1.5px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.28), inset 0 2px 3px rgba(255,255,255,0.14), 0 4px 10px -4px rgba(0,0,0,0.5)",
      }}
      title={team.name}
    >
      {team.initials || team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}
