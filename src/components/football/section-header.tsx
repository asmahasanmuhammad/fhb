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
    primary: "bg-[#ff1e46] shadow-[0_0_8px_#ff1e46]",
    red: "bg-[#ff1e46] shadow-[0_0_8px_#ff1e46]",
    gold: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    blue: "bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]",
    green: "bg-[#00e676] shadow-[0_0_8px_#00e676]",
  }[accent];

  return (
    <div className={cn("mb-5", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-white/12 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("h-5 w-1.5 rounded-full shrink-0", barColor)} aria-hidden />
          <div className="min-w-0">
            {kicker && (
              <p className="eyebrow text-[10px] text-[#ff1e46] font-black mb-0.5 flex items-center gap-1.5 tracking-widest uppercase">
                {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
                {kicker}
              </p>
            )}
            <h2 className="font-black text-[16px] uppercase tracking-[0.06em] text-white sm:text-[17px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {title}
            </h2>
          </div>
        </div>
        {actionLabel && actionView && (
          <button
            onClick={() => navigate(actionView)}
            className="group flex shrink-0 items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-wider text-white transition-all hover:text-[#00e5ff]"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
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
    <div className={cn("mb-7 border-b border-white/12 pb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {back && (
            <button
              onClick={goBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/20 bg-white/10 text-white transition-all hover:border-white/40 hover:bg-white/20 active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-white" aria-hidden />
            </button>
          )}
          <div className="min-w-0">
            {kicker && (
              <p className="eyebrow text-[10.5px] text-[#ff1e46] font-black mb-1.5 flex items-center gap-1.5 tracking-widest uppercase">
                {icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
                {kicker}
              </p>
            )}
            <h1 className="font-black text-[28px] leading-tight text-white sm:text-[34px] lg:text-[40px] drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-[14px] font-medium text-[#cbd5e1]">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
