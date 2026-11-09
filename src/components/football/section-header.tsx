"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { View } from "@/store/app-store";

/**
 * Editorial section header — eyebrow kicker, big Oswald-style title,
 * hairline rule, quiet action. No colored bars, no clutter.
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
    <div className={cn("mb-5", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {kicker && (
            <p className={cn("eyebrow mb-1.5 flex items-center gap-2 text-[10px]", accentText)}>
              {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
              {kicker}
              <span className={cn("h-px w-6", accent === "red" ? "bg-fhb-red/50" : accent === "gold" ? "bg-fhb-gold/50" : "bg-primary/50")} aria-hidden />
            </p>
          )}
          <h2 className="font-display-bn text-xl font-bold leading-tight tracking-tight text-foreground sm:text-[1.55rem]">
            {title}
          </h2>
        </div>
        {actionLabel && actionView && (
          <button
            onClick={() => navigate(actionView)}
            className="group flex shrink-0 items-center gap-1 pb-0.5 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2" aria-hidden>
        <span className={cn("h-[3px] w-10 rounded-full", accent === "red" ? "bg-fhb-red" : accent === "gold" ? "bg-fhb-gold" : "bg-primary")} />
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/**
 * Page header for top-level views — big title, back affordance, slot for actions.
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
    <div className={cn("mb-7", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {back && (
            <button
              onClick={goBack}
              className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
              aria-label="ফিরে যান"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          <div className="min-w-0">
            {kicker && (
              <p className="eyebrow mb-1 flex items-center gap-2 text-[10px] text-primary">
                {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
                {kicker}
              </p>
            )}
            <h1 className="font-display-bn text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
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
