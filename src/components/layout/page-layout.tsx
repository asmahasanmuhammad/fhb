"use client";

import { cn } from "@/lib/utils";

/**
 * FHB 4.0 — Page layout primitives.
 * Every rebuilt view composes its content inside PageLayout, which
 * owns the max-width strategy and the optional 300px right rail
 * (sticky, desktop-xl only). Full-bleed views (shorts, live-tv,
 * admin) skip PageLayout and manage their own chrome.
 *
 * Usage:
 *   <PageLayout rail={<RightRailWidgets … />}>
 *     …main column sections…
 *   </PageLayout>
 */

export function PageLayout({
  children,
  rail,
  width = "normal",
  className,
}: {
  children: React.ReactNode;
  rail?: React.ReactNode;
  width?: "narrow" | "normal" | "wide";
  className?: string;
}) {
  const maxW =
    width === "wide" ? "max-w-[1600px]" : width === "narrow" ? "max-w-[840px]" : "w-full";

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-7 px-4 pb-24 lg:pb-16 pt-5 sm:px-6 lg:pt-7",
        maxW,
        rail && "xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8",
        className
      )}
    >
      <div className="min-w-0">{children}</div>
      {rail && (
        <aside className="hidden min-w-0 xl:block" aria-label="Sidebar">
          <div className="sticky top-[108px] space-y-5">{rail}</div>
        </aside>
      )}
    </div>
  );
}

/** Sidebar widget card — the standard rail container. */
export function RailCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:py-3.5">
          <h3 className="label-cond text-[13.5px] sm:text-[14.5px] font-bold tracking-[0.06em] text-foreground">
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className={cn(bodyClassName ?? "")}>{children}</div>
    </section>
  );
}

/** Section block for main column — consistent vertical rhythm. */
export function Section({
  children,
  className,
  id,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn("reveal", className)}>
      {children}
    </section>
  );
}
