"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";

/**
 * Google AdSense-ready ad slot.
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
        "relative overflow-hidden rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30",
        isBanner && "flex h-[90px] items-center justify-center",
        isSidebar && "h-[280px]",
        placement === "IN_FEED" && "h-[120px]",
        className
      )}
      role="complementary"
      aria-label="বিজ্ঞাপন"
    >
      <span className="absolute left-2 top-2 z-10 rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
        বিজ্ঞাপন • AdSense
      </span>
      <button
        onClick={trackClick}
        className="group relative flex h-full w-full items-center justify-center"
        aria-label={`${ad.name} — বিজ্ঞাপনে ক্লিক করুন`}
      >
        {ad.imageHint ? (
          <Image src={ad.imageHint} alt={ad.name} fill sizes="728px" className="object-cover opacity-90" unoptimized />
        ) : (
          <Megaphone className="h-6 w-6 text-muted-foreground/40" aria-hidden />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/55 p-2 text-center transition-colors group-hover:bg-background/40">
          <p className="font-display text-xs font-semibold tracking-wide text-foreground/80 sm:text-sm">
            আপনার ব্র্যান্ড এখানে শাইন করুক
          </p>
          <p className="text-[10px] text-muted-foreground">Google AdSense • {ad.placement}</p>
        </div>
      </button>
    </div>
  );
}
