"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const { navigate, view } = useAppStore();

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem("fhb_cookie_consent");
      if (!consent) {
        // slight delay so page loads cleanly first
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  if (!mounted || !visible || view.name === "cookies" || view.name === "shorts") {
    return null;
  }

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("fhb_cookie_consent", "all");
      localStorage.setItem(
        "fhb_cookie_preferences",
        JSON.stringify({ necessary: true, analytics: true, preferences: true, marketing: true })
      );
    } catch {}
    setVisible(false);
  };

  const handleDeclineOptional = () => {
    try {
      localStorage.setItem("fhb_cookie_consent", "minimal");
      localStorage.setItem(
        "fhb_cookie_preferences",
        JSON.stringify({ necessary: true, analytics: false, preferences: false, marketing: false })
      );
    } catch {}
    setVisible(false);
  };

  const handleCustomize = () => {
    setVisible(false);
    navigate({ name: "cookies" });
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" />
            </span>
            <div className="text-xs text-muted-foreground leading-relaxed pr-2">
              <p className="font-bold text-foreground text-[13px] mb-0.5">
                We value your privacy
              </p>
              FHB uses cookies to personalize your football experience, provide real-time scores and live TV, and analyze platform traffic. You can customize your preferences or accept all cookies.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleCustomize}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleDeclineOptional}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 active:scale-95 transition-all shadow-sm"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
