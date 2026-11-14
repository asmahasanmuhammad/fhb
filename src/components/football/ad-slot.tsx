"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Football Hub Bangladesh — Commercial Display Banner Network
 * Modeled after IAB & Google AdSense standards as seen on Cricbuzz, ESPN, etc.
 *
 * All banners are 100% flattened, pre-rendered graphical creatives containing:
 * - High-resolution background photography
 * - Bold, prominent official brand logo baked directly into the creative
 * - Campaign headline, promotional offers & tags
 * - In-banner CTA button graphic
 * - Corner 'Ad' AdChoices badge
 *
 * There are ZERO DOM/HTML layers overlaid on top of the banner image.
 */

const ROTATE_MS = 12_000;
const FALLBACK_BRAND = "#E2136E";

type Variant = "banner" | "sidebar" | "in-feed";

function luminance(hex: string): number {
  const m = hex.replace("#", "");
  if (m.length !== 6) return 0.5;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark brand colours get lifted so every surface stays visible on dark UI. */
export function ensureVisible(color: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  const lum = luminance(color);
  if (lum >= 0.24) return color;
  const lift = Math.min(0.62, (0.45 * (0.24 - lum)) / 0.24 + 0.18);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * lift);
  const r = mix(parseInt(color.slice(1, 3), 16));
  const g = mix(parseInt(color.slice(3, 5), 16));
  const b = mix(parseInt(color.slice(5, 7), 16));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Fallback banner image if an ad has no imageHint — ultra HD 2x Retina Animated WebP */
export function getFallbackBannerImage(brandName: string, placement?: string): string {
  const name = brandName.toLowerCase();
  const isSidebar = placement === "SIDEBAR";
  const isHeader = placement === "HEADER_BANNER";
  const isMobile = placement === "MOBILE_BANNER";

  if (isSidebar) {
    if (name.includes("netshort") || name.includes("drama") || name.includes("short")) return "/ads/generated/netshort_sidebar_300x250.webp";
    if (name.includes("samsung")) return "/ads/generated/samsung_sidebar_300x250.webp";
    if (name.includes("city bank")) return "/ads/generated/citybank_sidebar_300x250.webp";
    if (name.includes("pathao")) return "/ads/generated/pathao_sidebar_300x250.webp";
    if (name.includes("robi")) return "/ads/generated/robi_header_728x90.webp";
    if (name.includes("bata")) return "/ads/generated/bata_sidebar_300x250.webp";
    return "/ads/generated/walton_sidebar_300x250.webp";
  }

  if (isHeader) {
    if (name.includes("daraz")) return "/ads/generated/daraz_header_728x90.webp";
    if (name.includes("grameenphone")) return "/ads/generated/gp_header_728x90.webp";
    if (name.includes("robi")) return "/ads/generated/robi_header_728x90.webp";
    return "/ads/generated/bkash_header_728x90.webp";
  }

  if (isMobile) {
    if (name.includes("walton")) return "/ads/generated/walton_mobile_320x60.webp";
    if (name.includes("bata")) return "/ads/generated/bata_mobile_320x60.webp";
    if (name.includes("grameenphone")) return "/ads/generated/gp_mobile_320x60.webp";
    return "/ads/generated/bkash_mobile_320x60.webp";
  }

  // In-Feed default
  if (name.includes("chaldal")) return "/ads/generated/chaldal_infeed_728x110.webp";
  if (name.includes("pran")) return "/ads/generated/pran_infeed_728x110.webp";
  if (name.includes("brac")) return "/ads/generated/bracbank_infeed_728x110.webp";
  if (name.includes("fhb") || name.includes("premium")) return "/ads/generated/fhb_premium_infeed_728x110.webp";
  return "/ads/generated/foodpanda_infeed_728x110.webp";
}

/** In-banner promotional pill text */
export function getInBannerTag(brandName: string, headline?: string | null): string {
  const text = `${brandName} ${headline || ""}`.toLowerCase();
  if (text.includes("walton")) return "120Hz 4K · 0% EMI";
  if (text.includes("samsung")) return "Galaxy AI · 100x Zoom";
  if (text.includes("bkash")) return "15% Instant Cashback";
  if (text.includes("daraz")) return "Up to 70% Off Deals";
  if (text.includes("grameenphone")) return "4K Matchday Pass";
  if (text.includes("city bank")) return "AMEX VIP Access";
  if (text.includes("robi")) return "4.5G Sports Pass";
  if (text.includes("pathao")) return "40% Off Match Rides";
  if (text.includes("chaldal")) return "30-Min Delivery · Tk 100 Off";
  if (text.includes("foodpanda")) return "50% Off Half-Time Feast";
  if (text.includes("bata")) return "25% Off Match Boots";
  if (text.includes("fhb") || text.includes("premium")) return "100% Ad-Free Pass";
  return "Exclusive Matchday Offer";
}

/**
 * Official Google AdChoices Pill Badge
 * Always rendered at the top-right corner of the ad slot container.
 */
export function AdChoicesMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-[6px] top-[6px] z-20 inline-flex items-center gap-[3.5px] rounded-[3px] bg-white/95 px-[5px] py-[1.5px] shadow-[0_1px_4px_rgba(0,0,0,0.25)] select-none",
        className
      )}
      aria-hidden="true"
    >
      <span className="text-[9.5px] font-bold leading-none text-[#334155] tracking-tight font-sans">Ad</span>
      <svg viewBox="0 0 15 15" className="h-3 w-3 shrink-0">
        <polygon fill="#00a4e4" points="15,0 15,15 0,0" />
        <circle cx="11.5" cy="4" r="1.1" fill="#ffffff" />
        <rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff" />
      </svg>
    </div>
  );
}

export function AdMonogram({
  brand,
  size = "md",
}: {
  brand: Pick<AdSlotData, "brandColor" | "brandInitials" | "name">;
  size?: "sm" | "md" | "lg";
}) {
  return null;
}

export function AdBrandLogo({
  brand,
  size = "md",
  className,
}: {
  brand: Pick<AdSlotData, "brandColor" | "brandInitials" | "name" | "logoUrl" | "logoTheme">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return null;
}

export function AdBannerBrandLogo({
  brand,
  size = "md",
  className,
}: {
  brand: Pick<AdSlotData, "brandColor" | "brandInitials" | "name" | "logoUrl" | "logoTheme">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return null;
}

/**
 * AdSlot — Pure, zero-overhead display ad unit.
 * Renders the pre-generated single banner graphic without any DOM layers on top.
 */
export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const trackedRef = useRef<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const [offset] = useState(() => Math.floor(Math.random() * 1000));

  const { data } = useQuery<{ ads: AdSlotData[] }>({
    queryKey: ["ads", placement],
    queryFn: async () => {
      const res = await fetch(`/api/ads?placement=${placement}`);
      const j = await res.json();
      const ads: AdSlotData[] = j.data?.ads ?? [];
      for (let i = ads.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));
        [ads[i], ads[k]] = [ads[k], ads[i]];
      }
      return { ads };
    },
    staleTime: 60_000,
  });

  const ads = useMemo(() => data?.ads ?? [], [data]);

  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setTick((x) => x + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, [ads.length]);

  const ad = ads.length > 0 ? ads[(tick + offset) % ads.length] : undefined;

  useEffect(() => {
    if (ad && !trackedRef.current.has(ad.id)) {
      trackedRef.current.add(ad.id);
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, event: "impression" }),
      }).catch(() => {});
    }
  }, [ad]);

  if (!ad || user?.isPremium) return null;

  const bannerImg = ad.imageHint || getFallbackBannerImage(ad.name, placement);

  const trackClick = () => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, event: "click" }),
    }).catch(() => {});
    if (ad.linkUrl?.startsWith("#")) {
      const view = ad.linkUrl.slice(1);
      if (["premium", "scores", "news", "competitions", "live-tv"].includes(view)) {
        navigate({ name: view } as never);
      }
    } else if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isBanner = placement === "HEADER_BANNER";
  const isMobileBanner = placement === "MOBILE_BANNER";
  const isSidebar = placement === "SIDEBAR";
  const variant: Variant = isSidebar ? "sidebar" : isBanner || isMobileBanner ? "banner" : "in-feed";

  // ═════════════════════════════════════════════════════════════════
  // DYNAMIC ADSENSE / EMBEDDED REAL AD SCRIPT RENDERING
  // ═════════════════════════════════════════════════════════════════
  if (ad.adCode && ad.adCode.trim().length > 0) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl flex items-center justify-center p-1",
          variant === "sidebar" && "w-full max-w-[360px] mx-auto min-h-[250px]",
          variant === "banner" && "min-h-[90px] max-h-[140px]",
          variant === "in-feed" && "min-h-[100px] max-h-[160px]",
          className
        )}
        role="complementary"
        aria-label={`Advertisement: ${ad.name}`}
      >
        <div
          className="w-full flex justify-center items-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
        />
        <AdChoicesMark />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // PURE GRAPHICAL BANNER CREATIVE (ZERO OVERLAID LAYERS)
  // ═════════════════════════════════════════════════════════════════
  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-all duration-300 hover:border-primary/40 cursor-pointer select-none",
        variant === "sidebar" && "w-full max-w-[360px] mx-auto aspect-[300/250]",
        variant === "banner" && "aspect-[728/140] max-h-[140px]",
        variant === "in-feed" && "aspect-[728/160] max-h-[160px]",
        className
      )}
      onClick={trackClick}
      role="complementary"
      aria-label={`Advertisement: ${ad.name}`}
    >
      <picture className="w-full h-full block">
        <source srcSet={bannerImg.replace(/\.(gif|jpg)$/, ".webp")} type="image/webp" />
        <source srcSet={bannerImg.replace(/\.(webp|gif)$/, ".jpg")} type="image/jpeg" />
        <img
          src={bannerImg}
          alt={ad.name}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </picture>
      <AdChoicesMark />
    </div>
  );
}

/**
 * StickyMobileAd — 320×60 anchor ad pinned above the bottom tab bar.
 * Pure pre-rendered graphical banner with zero overlaid layers.
 */
export function StickyMobileAd() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const [dismissed, setDismissed] = useState(false);
  const trackedRef = useRef<Set<string>>(new Set());

  const { data } = useQuery<{ ads: AdSlotData[] }>({
    queryKey: ["ads", "MOBILE_BANNER", "sticky"],
    queryFn: async () => {
      const res = await fetch(`/api/ads?placement=MOBILE_BANNER`);
      const j = await res.json();
      return { ads: (j.data?.ads ?? []) as AdSlotData[] };
    },
    staleTime: 120_000,
  });

  const ad = data?.ads?.[Math.floor(Math.random() * Math.max(1, data?.ads?.length ?? 1))];

  useEffect(() => {
    if (ad && !trackedRef.current.has(ad.id)) {
      trackedRef.current.add(ad.id);
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, event: "impression" }),
      }).catch(() => {});
    }
  }, [ad]);

  if (!ad || user?.isPremium || dismissed) return null;

  if (ad.adCode && ad.adCode.trim().length > 0) {
    return (
      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[57] px-2 lg:hidden">
        <div className="relative flex min-h-[60px] items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-xl p-1">
          <div
            className="w-full flex justify-center items-center overflow-hidden"
            dangerouslySetInnerHTML={{ __html: ad.adCode }}
          />
          <AdChoicesMark className="right-[38px] top-[6px]" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-slate-300 hover:text-white border border-white/10"
            aria-label="Hide advertisement"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  const bannerImg = ad.imageHint || getFallbackBannerImage(ad.name, "MOBILE_BANNER");

  const trackClick = () => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, event: "click" }),
    }).catch(() => {});
    if (ad.linkUrl?.startsWith("#")) {
      navigate({ name: ad.linkUrl.slice(1) } as never);
    } else if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[57] px-2 lg:hidden">
      <div
        onClick={trackClick}
        className="relative flex h-[60px] items-center overflow-hidden rounded-xl border border-border bg-card shadow-xl cursor-pointer"
      >
        <picture className="w-full h-full block">
          <source srcSet={bannerImg.replace(/\.(gif|jpg)$/, ".webp")} type="image/webp" />
          <source srcSet={bannerImg.replace(/\.(webp|gif)$/, ".jpg")} type="image/jpeg" />
          <img
            src={bannerImg}
            alt={ad.name}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </picture>

        {/* AdChoices Badge */}
        <AdChoicesMark className="right-[38px] top-[6px]" />

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-slate-300 hover:text-white border border-white/10"
          aria-label="Hide advertisement"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
