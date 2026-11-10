"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ExternalLink } from "lucide-react";

/**
 * FHB 3.0 — Premium Ad Slot System
 * Sky Sports / ESPN level ad placements with real IAB standard sizes.
 * Full demo creatives so client can visualize monetization potential.
 * Google AdSense integration-ready with proper aria labelling.
 */

const ROTATE_MS = 10_000;

type Placement =
  | "HEADER_BANNER"      // Leaderboard 728×90
  | "SIDEBAR"            // MREC 300×250
  | "SIDEBAR_TALL"       // Half-page 300×600
  | "IN_FEED"            // Native in-feed
  | "MOBILE_BANNER"      // Mobile 320×50
  | "INTERSTITIAL"       // Full interstitial
  | "VIDEO_PREROLL"      // Pre-roll video
  | "STICKY_FOOTER";     // Sticky footer banner

type Variant = "leaderboard" | "mrec" | "halfpage" | "native" | "mobile" | "sticky";

/** Hardcoded premium demo ads for client presentation */
const DEMO_ADS: Record<string, Array<{
  id: string; brand: string; tagline: string; body: string; cta: string;
  color: string; bg: string; badge?: string;
}>> = {
  HEADER_BANNER: [
    {
      id: "demo-h1", brand: "bKash", tagline: "Send Money Instantly Across Bangladesh",
      body: "Transfer · Pay · Save · Invest — Everything in bKash",
      cta: "Open bKash", color: "#E2136E", bg: "linear-gradient(135deg, #1a0810 0%, #2d0f1c 50%, #1a0810 100%)",
      badge: "OFFICIAL PARTNER",
    },
    {
      id: "demo-h2", brand: "Daraz", tagline: "Bangladesh's Biggest Online Shopping Platform",
      body: "Electronics · Fashion · Sports Gear & More — Free Delivery",
      cta: "Shop Now", color: "#F85C1F", bg: "linear-gradient(135deg, #1a0d08 0%, #2d1a0d 50%, #1a0d08 100%)",
      badge: "MEGA SALE",
    },
    {
      id: "demo-h3", brand: "Grameenphone", tagline: "GP Premier Football Data Pack",
      body: "Watch all BFL matches & live scores — Unlimited Football",
      cta: "Activate", color: "#00A551", bg: "linear-gradient(135deg, #060f09 0%, #0d1f12 50%, #060f09 100%)",
      badge: "NEW",
    },
  ],
  SIDEBAR: [
    {
      id: "demo-s1", brand: "Nagad", tagline: "Nagad — Digital Financial Service",
      body: "Send money, pay bills and recharge anywhere in Bangladesh with Nagad",
      cta: "Use Nagad", color: "#FF6600", bg: "linear-gradient(170deg, #160a00 0%, #2a1200 100%)",
    },
    {
      id: "demo-s2", brand: "Robi", tagline: "Robi — Stay Connected Always",
      body: "Best 4G network coverage across Bangladesh. Watch football without buffering.",
      cta: "Get Pack", color: "#E30613", bg: "linear-gradient(170deg, #160000 0%, #2a0808 100%)",
    },
    {
      id: "demo-s3", brand: "City Bank", tagline: "City Bank — Your Financial Partner",
      body: "Premium credit cards with stadium discounts & BFL match tickets. Apply today.",
      cta: "Apply Now", color: "#003F72", bg: "linear-gradient(170deg, #000810 0%, #001020 100%)",
    },
  ],
  IN_FEED: [
    {
      id: "demo-f1", brand: "FHB Premium", tagline: "Go Ad-Free with FHB Premium",
      body: "Remove all ads, unlock HD live streams and exclusive transfer news",
      cta: "Upgrade — Tk 99/mo", color: "#F59E0B", bg: "linear-gradient(135deg, #15100000 0%)",
      badge: "RECOMMENDED",
    },
    {
      id: "demo-f2", brand: "ACI Motors", tagline: "ACI Motors — Official BFL Car Partner",
      body: "Drive to the stadium in style. Test drive your next car today.",
      cta: "Book Test Drive", color: "#1E40AF", bg: "",
    },
    {
      id: "demo-f3", brand: "BSFI Sportz", tagline: "Official Football Equipment Supplier",
      body: "Adidas · Nike · Puma — Bangladesh's largest sports retail chain",
      cta: "Shop Gear", color: "#16A34A", bg: "",
    },
  ],
  MOBILE_BANNER: [
    {
      id: "demo-m1", brand: "bKash", tagline: "bKash — Send Money Instantly",
      body: "", cta: "Open App", color: "#E2136E", bg: "",
    },
    {
      id: "demo-m2", brand: "Daraz", tagline: "Daraz Sale — Up to 70% Off",
      body: "", cta: "Shop Now", color: "#F85C1F", bg: "",
    },
  ],
  STICKY_FOOTER: [
    {
      id: "demo-st1", brand: "Grameenphone", tagline: "GP Football Pack — Unlimited Streaming",
      body: "Watch BFL, EPL & UCL without data limits on GP network",
      cta: "Activate Now", color: "#00A551", bg: "",
    },
  ],
};

export function AdMonogram({
  brand, color, size = "md",
}: {
  brand: string; color: string; size?: "sm" | "md" | "lg" | "xl";
}) {
  const initials = brand.slice(0, 2).toUpperCase();
  const sizes = { sm: "h-9 w-9 text-[13px]", md: "h-11 w-11 text-[14px]", lg: "h-14 w-14 text-lg", xl: "h-18 w-18 text-2xl" };
  return (
    <span
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-black text-white",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_4px_12px_-4px_rgba(0,0,0,0.6)]",
        sizes[size]
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const [tick, setTick] = useState(0);
  const [offset] = useState(() => Math.floor(Math.random() * 100));

  // Rotate demo ads
  const demoAds = DEMO_ADS[placement] ?? DEMO_ADS.IN_FEED;
  const demoAd = demoAds[(tick + offset) % demoAds.length];

  // Also fetch real ads from API (merge with demo)
  const { data } = useQuery<{ ads: AdSlotData[] }>({
    queryKey: ["ads", placement],
    queryFn: async () => {
      const res = await fetch(`/api/ads?placement=${placement}`);
      const j = await res.json();
      return { ads: j.data?.ads ?? [] };
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (demoAds.length < 2) return;
    const t = setInterval(() => setTick((x) => x + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, [demoAds.length]);

  // Premium users get no ads
  if (user?.isPremium) return null;

  const isBanner = placement === "HEADER_BANNER";
  const isMobile = placement === "MOBILE_BANNER";
  const isSidebar = placement === "SIDEBAR" || placement === "SIDEBAR_TALL";
  const isSticky = placement === "STICKY_FOOTER";
  const isInFeed = placement === "IN_FEED";

  if (isBanner) return <LeaderboardAd ad={demoAd} className={className} />;
  if (isSidebar) return <SidebarAd ad={demoAd} tall={placement === "SIDEBAR_TALL"} className={className} />;
  if (isMobile) return <MobileBannerAd ad={demoAd} className={className} />;
  if (isSticky) return <StickyFooterAd ad={demoAd} />;
  return <NativeAd ad={demoAd} className={className} />;
}

/** IAB Leaderboard 728×90 */
function LeaderboardAd({ ad, className }: { ad: typeof DEMO_ADS.HEADER_BANNER[0]; className?: string }) {
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={cn("relative overflow-hidden border border-white/[0.07] ad-creative", className)}
      style={{ background: ad.bg || "linear-gradient(135deg, #0d0d10, #1a1a1e)" }}
    >
      {/* Ad label */}
      <span className="absolute left-2 top-1 z-20 text-[8px] font-bold uppercase tracking-widest text-white/25">
        Ad · Sponsored
      </span>
      {ad.badge && (
        <span className="absolute right-2 top-1.5 z-20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white rounded-sm"
          style={{ backgroundColor: ad.color }}>
          {ad.badge}
        </span>
      )}

      <div className="flex h-full items-center gap-4 px-5 py-2">
        <AdMonogram brand={ad.brand} color={ad.color} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black text-white truncate">{ad.tagline}</p>
          <p className="text-[11px] text-white/50 truncate mt-0.5">{ad.body}</p>
        </div>
        <button
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-[11px] font-black text-white transition-all hover:brightness-110 sheen"
          style={{ backgroundColor: ad.color }}
        >
          {ad.cta} <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** IAB MREC 300×250 or Half-Page 300×600 */
function SidebarAd({ ad, tall, className }: { ad: typeof DEMO_ADS.SIDEBAR[0]; tall?: boolean; className?: string }) {
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={cn("relative overflow-hidden border border-white/[0.07] ad-creative flex flex-col items-center justify-center text-center", tall ? "min-h-[400px]" : "min-h-[220px]", className)}
      style={{ background: ad.bg || "linear-gradient(170deg, #0d0d10, #1a1a1e)" }}
    >
      <span className="absolute left-2 top-1.5 z-20 text-[8px] font-bold uppercase tracking-widest text-white/25">Sponsored</span>

      {/* Brand glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(60% 50% at 50% 0%, ${ad.color}20, transparent 70%)`,
      }} />

      <div className="relative z-10 flex flex-col items-center px-6 py-6">
        <AdMonogram brand={ad.brand} color={ad.color} size="lg" />
        <p className="mt-4 text-[15px] font-black text-white leading-tight">{ad.tagline}</p>
        <p className="mt-2 text-[11.5px] text-white/50 leading-relaxed">{ad.body}</p>
        <button
          className="mt-5 flex items-center gap-1.5 px-6 py-2.5 text-[12px] font-black text-white transition-all hover:brightness-110 sheen"
          style={{ backgroundColor: ad.color }}
        >
          {ad.cta} <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
        <p className="mt-3 text-[9px] text-white/20 uppercase tracking-widest">Advertisement</p>
      </div>
    </div>
  );
}

/** Mobile Banner 320×50 */
function MobileBannerAd({ ad, className }: { ad: typeof DEMO_ADS.MOBILE_BANNER[0]; className?: string }) {
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={cn("relative overflow-hidden border border-white/[0.07] ad-creative flex items-center", className)}
      style={{ background: "linear-gradient(90deg, #0d0d10, #1a1a1e)" }}
    >
      <span className="absolute left-1 top-0.5 z-10 text-[7px] font-bold uppercase tracking-widest text-white/20">Ad</span>
      <div className="flex flex-1 items-center gap-3 px-4 py-2">
        <AdMonogram brand={ad.brand} color={ad.color} size="sm" />
        <p className="flex-1 text-[12px] font-bold text-white truncate">{ad.tagline}</p>
        <button
          className="shrink-0 px-3 py-1 text-[10px] font-black text-white"
          style={{ backgroundColor: ad.color }}
        >
          {ad.cta}
        </button>
      </div>
    </div>
  );
}

/** Native / In-Feed Ad */
function NativeAd({ ad, className }: { ad: typeof DEMO_ADS.IN_FEED[0]; className?: string }) {
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={cn("relative overflow-hidden border border-white/[0.07] ad-creative", className)}
      style={{ background: "linear-gradient(135deg, #0d0d10, #161619)" }}
    >
      {/* Left accent */}
      <div className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: ad.color }} />

      <span className="absolute right-2 top-2 text-[8.5px] font-bold uppercase tracking-widest text-white/25">
        Sponsored
      </span>
      {ad.badge && (
        <span className="absolute left-4 top-2 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white"
          style={{ backgroundColor: ad.color }}>
          {ad.badge}
        </span>
      )}

      <div className="flex items-center gap-4 px-5 py-3.5">
        <AdMonogram brand={ad.brand} color={ad.color} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-black text-white leading-tight">{ad.tagline}</p>
          {ad.body && <p className="mt-0.5 text-[11.5px] text-white/45 truncate">{ad.body}</p>}
        </div>
        <button
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-white"
          style={{ backgroundColor: ad.color }}
        >
          {ad.cta}
        </button>
      </div>
    </div>
  );
}

/** Sticky Footer Ad (mobile) */
function StickyFooterAd({ ad }: { ad: typeof DEMO_ADS.STICKY_FOOTER[0] }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className="fixed bottom-14 inset-x-0 z-40 border-t border-white/[0.1] bg-[#0d0d10]/96 backdrop-blur-xl lg:hidden ad-creative"
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <AdMonogram brand={ad.brand} color={ad.color} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black text-white truncate">{ad.tagline}</p>
          <p className="text-[10px] text-white/40 truncate">{ad.body}</p>
        </div>
        <button
          className="shrink-0 px-3 py-1.5 text-[11px] font-black text-white"
          style={{ backgroundColor: ad.color }}
        >
          {ad.cta}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 text-white/30 hover:text-white/70 text-xs font-bold"
          aria-label="Dismiss ad"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
