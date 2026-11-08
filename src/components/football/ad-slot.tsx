"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Megaphone, ArrowUpRight } from "lucide-react";

/**
 * Google AdSense-ready ad slot — native, clearly labelled, professional.
 * - Premium members get an ad-free experience (core monetization benefit).
 * - Demo mode renders a house creative from `imageHint`.
 * - If an admin saves a real AdSense snippet in the dashboard, it renders here.
 */
export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const user = useAppStore((s) => s.user);
  const tracked = useRef(false);

  const { data } = useQuery<{ ads: AdSlotData[] }>({
    queryKey: ["ads", placement],
    queryFn: async () => {
      const res = await fetch(`/api/ads?placement=${placement}`);
      return res.json().then((j) => j.data);
    },
    staleTime: 60_000,
  });

  const ad = data?.ads?.[0];

  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true;
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, event: "impression" }),
      }).catch(() => {});
    }
  }, [ad]);

  // Ad-free for premium members
  if (!ad || user?.isPremium) return null;

  const trackClick = () => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, event: "click" }),
    }).catch(() => {});
  };

  const isBanner = placement === "HEADER_BANNER" || placement === "MOBILE_BANNER";
  const isSidebar = placement === "SIDEBAR";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-muted/30",
        isBanner && "flex h-[90px] items-stretch",
        isSidebar && "h-[280px]",
        placement === "IN_FEED" && "h-[120px]",
        className
      )}
      role="complementary"
      aria-label="বিজ্ঞাপন"
    >
      <span className="absolute left-2 top-2 z-10 rounded-sm bg-background/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        বিজ্ঞাপন · Ad
      </span>
      <button
        onClick={trackClick}
        className="group relative flex h-full w-full items-center"
        aria-label={`${ad.name} — বিজ্ঞাপনে ক্লিক করুন`}
      >
        {ad.imageHint ? (
          <Image src={ad.imageHint} alt={ad.name} fill sizes="728px" className="object-cover opacity-90" unoptimized />
        ) : (
          <span className="flex h-full w-full items-center justify-center" aria-hidden>
            <Megaphone className="h-6 w-6 text-muted-foreground/40" />
          </span>
        )}
        <span
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-background/60 p-2 text-center transition-colors group-hover:bg-background/40",
            isSidebar && "bg-background/70"
          )}
        >
          <span className="flex items-center gap-1.5 font-display text-xs font-bold tracking-wide text-foreground/90 sm:text-sm">
            {ad.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            Google AdSense · {ad.placement}
            <ArrowUpRight className="h-3 w-3 text-primary" aria-hidden />
          </span>
        </span>
      </button>
    </div>
  );
}
