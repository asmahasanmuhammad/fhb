"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { View } from "@/store/app-store";

/**
 * FHB 3.0 — Sky Sports-grade section header.
 * Red accent bar left of title, tight uppercase tracking.
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
  accent?: "primary" | "red" | "gold" | "blue" | "green";
  icon?: React.ReactNode;
  actionLabel?: string;
  actionView?: View;
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const barColor = {
    primary: "bg-red-600",
    red: "bg-red-600",
    gold: "bg-amber-500",
    blue: "bg-blue-600",
    green: "bg-emerald-600",
  }[accent];

  return (
    <div className={cn("mb-5", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("h-5 w-1 shrink-0", barColor)} aria-hidden />
          <div className="min-w-0">
            {kicker && (
              <p className="eyebrow text-[9px] text-white/35 mb-0.5 flex items-center gap-1.5">
                {icon && <span className="[&>svg]:h-3 [&>svg]:w-3">{icon}</span>}
                {kicker}
              </p>
            )}
            <h2 className="font-black text-[14px] uppercase tracking-[0.05em] text-white sm:text-[15px]">
              {title}
            </h2>
          </div>
        </div>
        {actionLabel && actionView && (
          <button
            onClick={() => navigate(actionView)}
            className="group flex shrink-0 items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-white/35 transition-colors hover:text-red-400"
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
 * Page hero header — full-bleed, broadcast style.
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
    <div className={cn("mb-7 border-b border-white/[0.07] pb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {back && (
            <button
              onClick={goBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.1] bg-white/[0.04] text-white/50 transition-all hover:border-white/20 hover:text-white active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          <div className="min-w-0">
            {kicker && (
              <p className="eyebrow text-[9.5px] text-red-500 mb-1.5 flex items-center gap-1.5">
                {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
                {kicker}
              </p>
            )}
            <h1 className="font-black text-[26px] leading-tight text-white sm:text-[32px] lg:text-[36px]">
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-[13px] text-white/40">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
