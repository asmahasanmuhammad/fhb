"use client";

import { ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function SectionHeader({
  title,
  icon,
  actionLabel,
  actionView,
}: {
  title: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionView?: Parameters<ReturnType<typeof useAppStore.getState>["navigate"]>[0];
}) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-wide sm:text-xl">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h2>
      {actionLabel && actionView && (
        <button
          onClick={() => navigate(actionView)}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {actionLabel}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

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
      <h1 className="mb-5 font-display text-2xl font-bold tracking-wide sm:text-3xl">{title}</h1>
      {children}
    </div>
  );
}

function cnShell(wide: boolean) {
  return `mx-auto w-full px-4 py-6 sm:px-6 ${wide ? "max-w-7xl" : "max-w-4xl"} sm:py-8`;
}
