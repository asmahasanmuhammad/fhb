"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Info, X } from "lucide-react";

/**
 * FHB 4.0 — Google AdSense-ready ad slot with publisher-grade demo
 * creatives.
 * Native-ad treatment: flat surface, brand-tinted rule, AdSense-
 * compliant "Sponsored" labelling. Rotates creatives every 12s,
 * tracks impressions and clicks. Premium members see no ads.
 *
 * Placements:
 *   HEADER_BANNER — fluid leaderboard (728×90 class)
 *   SIDEBAR       — rail rectangle (300×250) / stacked skyscraper
 *   IN_FEED       — fluid native card between content blocks
 *   MOBILE_BANNER — 320×100 sticky (see <StickyMobileAd />)
 */

const ROTATE_MS = 12_000;
const FALLBACK_BRAND = "#2CD96B";

type Variant = "banner" | "sidebar" | "in-feed";

/** Brand monogram tile — square, brand colour, like a real logo chip. */
export function AdMonogram({
  brand,
  size = "md",
}: {
  brand: Pick<AdSlotData, "brandColor" | "brandInitials" | "name">;
  size?: "sm" | "md" | "lg";
}) {
  const color = brand.brandColor || FALLBACK_BRAND;
  const initials = (brand.brandInitials || brand.name.slice(0, 2)).trim();
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-[6px] font-display font-bold uppercase tracking-tight text-white",
        "ring-1 ring-inset ring-white/20",
        size === "sm" && "h-8 w-8 text-[12px]",
        size === "md" && "h-10 w-10 text-[14px]",
        size === "lg" && "h-13 w-13 h-[52px] w-[52px] text-[17px]"
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

/**
 * AdBrandLogo — the advertiser's real logo on a clean chip, the way real
 * ad-network creatives render brand marks. LIGHT theme = white chip (default,
 * for full-colour logos); DARK theme = brand-colour chip (for white logos).
 * Falls back to the monogram tile when no logo asset is configured.
 */
export function AdBrandLogo({
  brand,
  size = "md",
}: {
  brand: Pick<AdSlotData, "brandColor" | "brandInitials" | "name" | "logoUrl" | "logoTheme">;
  size?: "sm" | "md" | "lg";
}) {
  if (!brand.logoUrl) return <AdMonogram brand={brand} size={size} />;
  const dark = brand.logoTheme === "DARK";
  const chipBg = dark ? brand.brandColor || FALLBACK_BRAND : "#FFFFFF";
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[8px]",
        "shadow-[0_1px_4px_rgba(0,0,0,0.22)] ring-1 ring-inset",
        dark ? "ring-white/15" : "ring-black/[0.08]",
        size === "sm" && "h-8 w-8 p-[5px]",
        size === "md" && "h-10 w-10 p-[6px]",
        size === "lg" && "h-[52px] w-[52px] p-[8px]"
      )}
      style={{ backgroundColor: chipBg }}
    >
      <span className="relative h-full w-full">
        <Image
          src={brand.logoUrl}
          alt=""
          fill
          sizes="52px"
          className="object-contain"
          unoptimized
        />
      </span>
    </span>
  );
}

/** Sponsored disclosure — AdSense-compliant labelling. */
function SponsoredMeta({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70",
        className
      )}
    >
      Sponsored
      <Info className="h-2.5 w-2.5" aria-hidden />
    </span>
  );
}

/** CTA pill — brand-tinted solid with contrast-safe label colour. */
function AdCta({ color, label, big = false }: { color: string; label: string; big?: boolean }) {
  const textColor = isLightColor(color) ? "#0B0C10" : "#FFFFFF";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-[6px] font-bold transition-all group-hover:brightness-110",
        big ? "h-9 px-5 text-[12px]" : "h-7 px-3 text-[11px]"
      )}
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
      <ArrowUpRight className={big ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
    </span>
  );
}

/** Luminance test — picks readable label colour for any brand colour. */
function isLightColor(hex: string): boolean {
  const m = hex.replace("#", "");
  if (m.length !== 6) return false;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.62;
}

/** Hex → relative luminance (0–1). */
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
  const lift = Math.min(0.62, 0.45 * (0.24 - lum) / 0.24 + 0.18);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * lift);
  const r = mix(parseInt(color.slice(1, 3), 16));
  const g = mix(parseInt(color.slice(3, 5), 16));
  const b = mix(parseInt(color.slice(5, 7), 16));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

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

  const rawBrand = ad.brandColor || FALLBACK_BRAND;
  // Dark brand palettes are lifted so every brand surface stays visible
  const brandColor = ensureVisible(rawBrand);

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
    }
  };

  const isBanner = placement === "HEADER_BANNER";
  const isMobileBanner = placement === "MOBILE_BANNER";
  const isSidebar = placement === "SIDEBAR";
  const variant: Variant = isSidebar ? "sidebar" : isBanner || isMobileBanner ? "banner" : "in-feed";

  const headline = ad.headline || ad.name;
  const cta = ad.ctaLabel || "Learn More";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card",
        isBanner && "flex h-[90px] items-stretch",
        isMobileBanner && "flex h-20 items-stretch",
        isSidebar && "min-h-[280px]",
        variant === "in-feed" && "h-[104px]",
        className
      )}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* brand-tinted left rule + quiet tint wash */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: brandColor }} />
      <span
        key={`bg-${ad.id}`}
        aria-hidden
        className="ad-creative absolute inset-0"
        style={{ backgroundColor: `${brandColor}0d` }}
      />
      {ad.imageHint && variant !== "sidebar" && (
        <>
          <Image
            key={`img-${ad.id}`}
            src={ad.imageHint}
            alt=""
            fill
            sizes="728px"
            className="ad-creative object-cover opacity-15 transition-opacity duration-300 group-hover:opacity-25"
            unoptimized
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/82 to-background/45"
          />
        </>
      )}

      {variant === "sidebar" && (
        <span className="absolute right-3 top-2.5 z-10">
          <SponsoredMeta />
        </span>
      )}

      {/* ── Creative ── */}
      {variant === "sidebar" ? (
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-1 px-7 pb-7 pt-10 text-center"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdBrandLogo brand={ad} size="lg" />
          <p className="mt-4 text-[16px] font-bold leading-snug text-foreground">{headline}</p>
          {ad.bodyText && (
            <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-foreground/65">{ad.bodyText}</p>
          )}
          <span className="mt-4">
            <AdCta color={brandColor} label={cta} big />
          </span>
        </button>
      ) : variant === "banner" ? (
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full w-full items-center gap-3.5 pl-5 pr-4 text-left sm:pl-6"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdBrandLogo brand={ad} size={isMobileBanner ? "sm" : "md"} />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate font-bold leading-tight text-foreground/95",
                isMobileBanner ? "text-[12.5px]" : "text-[13.5px]"
              )}
            >
              {headline}
            </span>
            {ad.bodyText && !isMobileBanner && (
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{ad.bodyText}</span>
            )}
            <SponsoredMeta className="mt-1 justify-start" />
          </span>
          <AdCta color={brandColor} label={cta} />
        </button>
      ) : (
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full min-h-[104px] w-full items-center gap-4 py-2 pl-6 pr-5 text-left"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdBrandLogo brand={ad} />
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-[13px] font-bold leading-tight text-foreground/95">{headline}</span>
            {ad.bodyText && <span className="mt-0.5 line-clamp-1 truncate text-[11.5px] text-muted-foreground">{ad.bodyText}</span>}
            <SponsoredMeta className="mt-1 justify-start" />
          </span>
          <AdCta color={brandColor} label={cta} />
        </button>
      )}
    </div>
  );
}

/**
 * StickyMobileAd — 320×100 anchor ad pinned above the bottom tab bar
 * (mobile only, dismissible). Standard mobile-web monetisation unit.
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

  const ad = data?.ads?.[Math.floor(Math.random() * Math.max(1, data.ads.length))];

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
  const brandColor = ensureVisible(ad.brandColor || FALLBACK_BRAND);

  return (
    <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[57] px-2 lg:hidden">
      <div className="relative flex h-[56px] items-center gap-3 overflow-hidden rounded-lg border border-border bg-card pl-3 pr-9 shadow-[0_-8px_28px_-8px_rgba(0,0,0,0.6)]">
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: brandColor }} />
        <span aria-hidden className="absolute inset-0" style={{ backgroundColor: `${brandColor}0d` }} />
        <button
          onClick={() => {
            fetch("/api/ads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adId: ad.id, event: "click" }),
            }).catch(() => {});
            if (ad.linkUrl?.startsWith("#")) navigate({ name: ad.linkUrl.slice(1) } as never);
          }}
          className="relative z-[5] flex h-full min-w-0 flex-1 items-center gap-3 text-left"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdBrandLogo brand={ad} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-bold text-foreground/95">{ad.headline || ad.name}</span>
            <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{ad.bodyText}</span>
          </span>
          <span
            className="flex h-7 shrink-0 items-center rounded-[6px] px-3 text-[10.5px] font-bold text-white"
            style={{ backgroundColor: brandColor }}
          >
            {ad.ctaLabel || "Open"}
          </span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Hide advertisement"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
        <SponsoredMeta className="absolute bottom-1 right-2.5 z-10" />
      </div>
    </div>
  );
}
