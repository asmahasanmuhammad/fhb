"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle — Desktop header quick toggle button (Sun / Moon).
 * Seamlessly transitions between dark and light themes.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-border bg-card/60 text-muted-foreground",
          className
        )}
        aria-hidden="true"
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-border bg-card text-foreground/80 transition-all duration-200 hover:border-primary/40 hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-2 focus-visible:outline-primary",
        className
      )}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center text-amber-400"
          >
            <Sun className="h-4 w-4" aria-hidden />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center text-indigo-500 dark:text-indigo-400"
          >
            <Moon className="h-4 w-4" aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/**
 * ThemeSegmentControl — 3-segment switcher (Light / Dark / System)
 * Ideal for mobile drawer, settings panel, and footer.
 */
export function ThemeSegmentControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-9 w-full rounded-lg bg-muted/50 border border-border", className)} />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "Auto", icon: Laptop },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={cn(
        "flex items-center rounded-lg border border-border bg-muted/60 p-1 text-xs",
        className
      )}
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-bold transition-all",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", active && opt.value === "light" && "text-amber-500", active && opt.value === "dark" && "text-indigo-400")} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
