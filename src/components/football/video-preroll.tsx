"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { AdMonogram } from "@/components/football/ad-slot";
import { Megaphone, SkipForward } from "lucide-react";

/**
 * Video preroll ad — plays once per session before the first short.
 * 5-second countdown, then skippable (Google Ads / YouTube-style).
 * Premium members never see it (ad-free benefit).
 */

const PREROLL_SECONDS = 5;
const SESSION_KEY = "fhb_preroll_shown";

export function VideoPreroll() {
  const user = useAppStore((s) => s.user);
  const trackedRef = useRef<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(PREROLL_SECONDS);
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery<{ ads: AdSlotData[] }>({
    queryKey: ["ads", "VIDEO_PREROLL"],
    queryFn: async () => {
      const res = await fetch("/api/ads?placement=VIDEO_PREROLL");
      return res.json().then((j) => j.data);
    },
    staleTime: 60_000,
  });

  const ads = data?.ads ?? [];
  // Pick one creative per data arrival — stable across countdown re-renders
  const ad = useMemo(
    () => (ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : undefined),
    [ads]
  );

  // One preroll per session; premium = ad-free
  const alreadyShown = useRef(false);
  useEffect(() => {
    try {
      alreadyShown.current = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      alreadyShown.current = false;
    }
  }, []);

  const active = !!ad && !user?.isPremium && !alreadyShown.current && !dismissed && remaining >= 0;

  // Countdown
  useEffect(() => {
    if (!active || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining]);

  // Mark session on finish
  useEffect(() => {
    if (remaining <= 0) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* noop */
      }
    }
  }, [remaining]);

  // Impression once per ad
  useEffect(() => {
    if (active && ad && !trackedRef.current.has(ad.id)) {
      trackedRef.current.add(ad.id);
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, event: "impression" }),
      }).catch(() => {});
    }
  }, [active, ad]);

  if (!active || !ad) return null;

  const brandColor = ad.brandColor || "#1E9E50";
  const headline = ad.headline || ad.name;
  const body = ad.bodyText;
  const cta = ad.ctaLabel || "Learn More";
  const progress = ((PREROLL_SECONDS - remaining) / PREROLL_SECONDS) * 100;
  const skippable = remaining <= 0;

  const skip = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* noop */
    }
    setDismissed(true);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-black" role="complementary" aria-label="Advertisement">
      {/* Countdown progress bar */}
      <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-white/15" aria-hidden>
        <div
          className="h-full bg-fhb-gold transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Label chip */}
      <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/75 backdrop-blur">
        <Megaphone className="h-3 w-3" aria-hidden />
        Ad · AdSense
      </div>

      {/* Brand-tinted ambience */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(75% 60% at 50% 22%, ${brandColor}2e, transparent 70%), radial-gradient(60% 55% at 85% 95%, ${brandColor}1a, transparent 65%)`,
        }}
      />

      {/* Creative */}
      <div className="relative z-[5] flex flex-1 flex-col items-center justify-center gap-4 px-9 text-center">
        <div className="ad-creative flex flex-col items-center">
          <AdMonogram brand={ad} size="lg" />
          <p className="mt-5 font-display text-xl font-bold leading-snug text-white">{headline}</p>
          {body && <p className="mt-2.5 max-w-[300px] text-[13px] leading-relaxed text-white/70">{body}</p>}
          <button
            onClick={() => {
              fetch("/api/ads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId: ad.id, event: "click" }),
              }).catch(() => {});
            }}
            className="mt-6 flex h-12 items-center rounded-full px-8 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: brandColor }}
          >
            {cta}
          </button>
        </div>
      </div>

      {/* Skip control */}
      <div className="relative z-[5] flex items-center justify-between px-4 pb-5">
        <span className="text-[10px] tabular text-white/50">
          {skippable ? "Video starting..." : `Skippable in ${remaining}s`}
        </span>
        <button
          onClick={skip}
          disabled={!skippable}
          className="flex h-10 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-bold text-white backdrop-blur transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipForward className="h-3.5 w-3.5" aria-hidden />
          {skippable ? "Skip" : `${remaining}`}
        </button>
      </div>
    </div>
  );
}
