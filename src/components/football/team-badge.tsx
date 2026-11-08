"use client";

import { cn } from "@/lib/utils";
import type { TeamRef } from "@/lib/types";

export type BadgeTeam = TeamRef | { name: string; initials: string; color: string; color2?: string };

/**
 * Crest-style team badge: flat club-color disc, hairline ring,
 * Oswald initials. Professional, print-like — no gradients.
 */
export function TeamBadge({
  team,
  size = "md",
  className,
}: {
  team: BadgeTeam;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "w-6 h-6 text-[9px] rounded-md",
    sm: "w-8 h-8 text-[10px] rounded-md",
    md: "w-10 h-10 text-xs rounded-lg",
    lg: "w-12 h-12 text-sm rounded-lg",
    xl: "w-16 h-16 text-lg rounded-xl",
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
        backgroundColor: team.color ?? "#12805c",
        color: "#ffffff",
        boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.22)",
      }}
      title={team.name}
    >
      {team.initials || team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}
