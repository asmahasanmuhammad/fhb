"use client";

import { cn } from "@/lib/utils";
import type { TeamRef } from "@/lib/types";

export function TeamBadge({
  team,
  size = "md",
  className,
}: {
  team: TeamRef | { name: string; initials: string; color: string; color2?: string };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "w-6 h-6 text-[8px] rounded",
    sm: "w-8 h-8 text-[10px] rounded-md",
    md: "w-11 h-11 text-xs rounded-lg",
    lg: "w-14 h-14 text-sm rounded-xl",
    xl: "w-20 h-20 text-lg rounded-2xl",
  };
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-display font-bold tracking-wider text-white shadow-inner",
        sizes[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${team.color ?? "#10B981"} 0%, ${team.color2 ?? "#064E3B"} 100%)`,
        border: `1.5px solid ${team.color ?? "#10B981"}55`,
        textShadow: "0 1px 2px rgba(0,0,0,0.4)",
      }}
      title={team.name}
    >
      {team.initials || team.name.slice(0, 2).toUpperCase()}
    </div>
  );
}
