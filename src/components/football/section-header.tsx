"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { View } from "@/store/app-store";

/**
 * FHB 4.0 — Section header.
 * Quiet, editorial: kicker + bold title + action link + hairline.
 * No decorative bars, no boxes — hierarchy does the work.
 */
export function SectionHeader({
  title,
  kicker,
  accent = "primary",
  icon,
  actionLabel,
  actionView,
  className,
}: {
  title: string;
  kicker?: string;
  accent?: "primary" | "red" | "gold";
  icon?: React.ReactNode;
  actionLabel?: string;
  actionView?: View;
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const accentText =
    accent === "red" ? "text-fhb-red" : accent === "gold" ? "text-fhb-gold" : "text-primary";

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {kicker && (
            <p className={cn("kicker mb-1 flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-bold uppercase tracking-wider", accentText)}>
              {icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
              {kicker}
            </p>
          )}
          <h2 className="text-[20px] font-bold leading-tight tracking-[-0.015em] text-foreground sm:text-[23px]">
            {title}
          </h2>
        </div>
        {actionLabel && actionView && (
          <button
            onClick={() => navigate(actionView)}
            className="group flex shrink-0 items-center gap-1.5 pb-0.5 text-[12.5px] sm:text-[13px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-3 h-px w-full bg-border" aria-hidden />
    </div>
  );
}

/**
 * Page header for top-level views — title, optional back affordance,
 * actions slot. Used by every top-level view for consistent rhythm.
 */
export function PageHeader({
  title,
  subtitle,
  kicker,
  icon,
  back,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  icon?: React.ReactNode;
  back?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const goBack = useAppStore((s) => s.back);
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {back && (
            <button
              onClick={goBack}
              className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-border bg-card text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          <div className="min-w-0">
            {kicker && (
              <p className="kicker mb-1.5 flex items-center gap-1.5 text-primary">
                {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
                {kicker}
              </p>
            )}
            <h1 className="text-[24px] font-bold leading-none tracking-[-0.015em] text-foreground sm:text-[30px]">
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
      <div className="mt-4 h-px w-full bg-border" aria-hidden />
    </div>
  );
}

/**
 * League group header — divider row above a block of fixtures
 * grouped by competition (Sofascore-style grouping).
 */
export function LeagueGroupHeader({
  name,
  meta,
  color,
  onClick,
  count,
}: {
  name: string;
  meta?: string;
  color?: string;
  onClick?: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
        onClick ? "hover:bg-white/[0.03]" : "cursor-default"
      )}
    >
      <span
        aria-hidden
        className="h-[14px] w-[3px] shrink-0 rounded-full"
        style={{ backgroundColor: color ?? "var(--primary)" }}
      />
      <span className="label-cond truncate text-[12.5px] font-bold tracking-[0.06em] text-foreground/90">
        {name}
      </span>
      {meta && <span className="truncate text-[11px] text-muted-foreground">{meta}</span>}
      {count != null && (
        <span className="tabular shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
          {fmtCount(count)}
        </span>
      )}
      {onClick && (
        <ArrowRight
          className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </button>
  );
}

function fmtCount(n: number) {
  return String(n);
}
