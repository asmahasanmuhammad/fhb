"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Megaphone, ArrowUpRight, BadgeCheck } from "lucide-react";

/**
 * Google AdSense-ready ad slot — native, clearly labelled, professional.
 * - Premium members get an ad-free experience (core monetization benefit).
 * - House creative renders elegantly (never a loud placeholder).
 * - If an admin saves a real AdSense snippet, it renders here.
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
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40",
        isBanner && "flex h-[90px] items-stretch",
        isSidebar && "h-[280px]",
        placement === "IN_FEED" && "h-[110px]",
        className
      )}
      role="complementary"
      aria-label="বিজ্ঞাপন"
    >
      {/* House creative — photo-led when available, elegant otherwise */}
      <button
        onClick={trackClick}
        className="relative flex h-full w-full items-center overflow-hidden text-left"
        aria-label={`${ad.name} — বিজ্ঞাপনে ক্লিক করুন`}
      >
        {ad.imageHint ? (
          <>
            <Image
              src={ad.imageHint}
              alt={ad.name}
              fill
              sizes="728px"
              className="object-cover opacity-80 transition-opacity group-hover:opacity-90"
              unoptimized
            />
            <span className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" aria-hidden />
          </>
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(70% 130% at 15% 0%, oklch(0.84 0.185 148 / 7%), transparent 60%), radial-gradient(60% 120% at 90% 100%, oklch(0.65 0.24 25 / 6%), transparent 60%)",
            }}
          />
        )}

        <span className={cn("relative z-10 flex h-full items-center", isSidebar ? "flex-col justify-center px-6 text-center" : "px-5 sm:px-7")}>
          <span className={cn("flex items-center gap-2", isSidebar && "flex-col gap-3")}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Megaphone className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold tracking-wide text-foreground/90">
                {ad.name}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                Sponsored · Google AdSense
                <ArrowUpRight className="h-3 w-3 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </span>
          </span>
        </span>
      </button>

      {/* Subtle disclosure chip */}
      <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-border/50 bg-background/70 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-widest text-muted-foreground/80 backdrop-blur-sm">
        Ad
      </span>

      {/* Trust footer for sidebar */}
      {isSidebar && (
        <span className="absolute inset-x-4 bottom-3 z-10 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/70">
          <BadgeCheck className="h-3 w-3 text-primary/70" aria-hidden />
          নিরাপদ বিজ্ঞাপন — AdSense পলিসি অনুসরণ করা হয়
        </span>
      )}
    </div>
  );
}
