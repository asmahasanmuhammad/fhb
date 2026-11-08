"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { View } from "@/store/app-store";

/**
 * Broadcast-style section header:
 * colored kicker bar + Oswald title + hairline rule + action link.
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
  const accentBar =
    accent === "red" ? "bg-fhb-red" : accent === "gold" ? "bg-fhb-gold" : "bg-primary";
  const accentText =
    accent === "red" ? "text-fhb-red" : accent === "gold" ? "text-fhb-gold" : "text-primary";

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-3">
        <span className={cn("h-6 w-1 rounded-full", accentBar)} aria-hidden />
        <h2 className="flex min-w-0 items-center gap-2 font-display text-base font-bold tracking-wide text-foreground sm:text-lg">
          {icon && <span className={accentText}>{icon}</span>}
          {title}
          {kicker && (
            <span className="hidden rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
              {kicker}
            </span>
          )}
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden />
        {actionLabel && actionView && (
          <button
            onClick={() => navigate(actionView)}
            className="group flex shrink-0 items-center gap-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Standard page header for top-level views — consistent across the platform.
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  back,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  back?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const goBack = useAppStore((s) => s.back);
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {back && (
            <button
              onClick={goBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="ফিরে যান"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          {icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold leading-tight tracking-wide text-foreground sm:text-2xl">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Layout shell for top-level views (kept for compatibility).
 */
export function ViewShell({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cnShell(wide)}>
      <PageHeader title={title} />
      {children}
    </div>
  );
}

function cnShell(wide: boolean) {
  return `mx-auto w-full px-4 py-6 sm:px-6 ${wide ? "max-w-7xl" : "max-w-4xl"} sm:py-8`;
}
