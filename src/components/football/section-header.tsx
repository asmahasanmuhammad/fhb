"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { View } from "@/store/app-store";

/**
 * Editorial section header — restrained kicker + display title + quiet action.
 * No decorative bars; hairline rule below.
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
            <p className={cn("eyebrow mb-1.5 flex items-center gap-1.5", accentText)}>
              {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
              {kicker}
            </p>
          )}
          <h2 className="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.01em] text-foreground sm:text-[1.55rem]">
            {title}
          </h2>
        </div>
        {actionLabel && actionView && (
          <button
            onClick={() => navigate(actionView)}
            className="group flex shrink-0 items-center gap-1 pb-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-3 h-px w-full bg-border/70" aria-hidden />
    </div>
  );
}

/**
 * Page header for top-level views — display title, back affordance, actions slot.
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
  const navigate = useAppStore((s) => s.navigate);
  const goBack = useAppStore((s) => s.back);
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {back && (
            <button
              onClick={goBack}
              className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          <div className="min-w-0">
            {kicker && (
              <p className="eyebrow mb-1 flex items-center gap-1.5 text-primary">
                {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
                {kicker}
              </p>
            )}
            <h1 className="font-display text-[1.7rem] font-bold leading-tight tracking-[-0.015em] text-foreground sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
