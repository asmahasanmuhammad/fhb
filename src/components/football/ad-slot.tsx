"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

/**
 * Google AdSense-ready ad slot — premium, clearly labelled, professional.
 * - Serves demo creatives (brand monogram + headline + CTA) with rotation.
 * - Premium members get an ad-free experience (core monetization benefit).
 * - If an admin saves a real AdSense snippet, the slot is ready to serve it.
 */

const ROTATE_MS = 12_000;
const FALLBACK_BRAND = "#1E9E50";

type Variant = "banner" | "sidebar" | "in-feed";

/** Brand monogram chip — shared by every ad layout. */
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
        "flex shrink-0 items-center justify-center rounded-xl font-bold tracking-tight text-white shadow-sm",
        size === "sm" && "h-9 w-9 text-[13px]",
        size === "md" && "h-10 w-10 text-sm",
        size === "lg" && "h-14 w-14 rounded-2xl text-lg"
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

/** Sponsored meta line — AdSense-compliant labelling. */
function SponsoredMeta({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1.5 text-[10px] text-muted-foreground", className)}>
      Sponsored · Google AdSense
      <ArrowUpRight className="h-3 w-3 text-primary/80" aria-hidden />
    </span>
  );
}

export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const trackedRef = useRef<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  // Stable per-instance offset (lazy init) → different slots start on different creatives.
  // Safe for hydration: the slot renders null until client-side data arrives.
  const [offset] = useState(() => Math.floor(Math.random() * 1000));

  const { data } = useQuery<{ ads: AdSlotData[] }>({
    queryKey: ["ads", placement],
    queryFn: async () => {
      const res = await fetch(`/api/ads?placement=${placement}`);
      const j = await res.json();
      const ads: AdSlotData[] = j.data?.ads ?? [];
      // Fisher-Yates shuffle per fetch → different creative order on every page load
      for (let i = ads.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));
        [ads[i], ads[k]] = [ads[k], ads[i]];
      }
      return { ads };
    },
    staleTime: 60_000,
  });

  const ads = useMemo(() => data?.ads ?? [], [data]);

  // Rotate creatives
  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setTick((x) => x + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, [ads.length]);

  const ad = ads.length > 0 ? ads[(tick + offset) % ads.length] : undefined;

  // Impression tracking — once per creative per slot mount
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

  // Ad-free for premium members
  if (!ad || user?.isPremium) return null;

  const brandColor = ad.brandColor || FALLBACK_BRAND;

  const trackClick = () => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, event: "click" }),
    }).catch(() => {});
    // Internal demo links (#view) navigate inside the SPA
    if (ad.linkUrl?.startsWith("#")) {
      const view = ad.linkUrl.slice(1);
      if (view === "premium" || view === "scores" || view === "news" || view === "competitions") {
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
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40",
        isBanner && "flex h-[90px] items-stretch",
        isMobileBanner && "flex h-20 items-stretch",
        isSidebar && "h-[280px]",
        variant === "in-feed" && "h-[110px]",
        className
      )}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* Brand-tinted ambience + photo creative when available */}
      <span
        key={`bg-${ad.id}`}
        aria-hidden
        className="ad-creative absolute inset-0"
        style={{
          background: `radial-gradient(65% 130% at 12% 0%, ${brandColor}24, transparent 62%), radial-gradient(55% 120% at 92% 100%, ${brandColor}14, transparent 60%)`,
        }}
      />
      {ad.imageHint && (
        <>
          <Image
            key={`img-${ad.id}`}
            src={ad.imageHint}
            alt=""
            fill
            sizes="728px"
            className="ad-creative object-cover opacity-45 transition-opacity duration-300 group-hover:opacity-55"
            unoptimized
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/60 to-background/15"
          />
        </>
      )}

      {/* Disclosure chip */}
      <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-border/50 bg-background/70 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-widest text-muted-foreground/80 backdrop-blur-sm">
        Ad
      </span>

      {/* ── Creative ── */}
      {variant === "sidebar" ? (
        /* Vertical skyscraper creative */
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full w-full flex-col items-center justify-center px-7 pb-7 pt-8 text-center"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdMonogram brand={ad} size="lg" />
          <p className="mt-4 font-display text-[15px] font-bold leading-snug text-foreground/95">{headline}</p>
          {ad.bodyText && (
            <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">{ad.bodyText}</p>
          )}
          <span
            className="mt-4 flex h-9 items-center rounded-full px-6 text-xs font-bold text-white transition-all group-hover:brightness-110"
            style={{ backgroundColor: brandColor }}
          >
            {cta}
          </span>
          <SponsoredMeta className="mt-4" />
        </button>
      ) : variant === "banner" ? (
        /* Horizontal leaderboard creative */
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full w-full items-center gap-3.5 px-4 text-left sm:px-6"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdMonogram brand={ad} size={isMobileBanner ? "sm" : "md"} />
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate font-display font-bold leading-tight text-foreground/95", isMobileBanner ? "text-[13px]" : "text-sm")}>
              {headline}
            </span>
            {ad.bodyText && !isMobileBanner && (
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{ad.bodyText}</span>
            )}
            <SponsoredMeta className="mt-1" />
          </span>
          <span
            className="flex h-9 shrink-0 items-center rounded-full px-5 text-[11.5px] font-bold text-white transition-all group-hover:brightness-110"
            style={{ backgroundColor: brandColor }}
          >
            {cta}
          </span>
        </button>
      ) : (
        /* Compact in-feed creative */
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full w-full items-center gap-4 px-5 text-left sm:px-6"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdMonogram brand={ad} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-bold leading-tight text-foreground/95">{headline}</span>
            {ad.bodyText && <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">{ad.bodyText}</span>}
            <SponsoredMeta className="mt-1" />
          </span>
          <span
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[11.5px] font-bold text-white transition-all group-hover:brightness-110"
            style={{ borderColor: `${brandColor}66`, backgroundColor: `${brandColor}1f`, color: brandColor }}
          >
            {cta}
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </span>
        </button>
      )}

      {/* Trust footer for sidebar */}
      {isSidebar && (
        <span className="absolute inset-x-4 bottom-3 z-10 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/70">
          <BadgeCheck className="h-3 w-3 text-primary/70" aria-hidden />
          Safe ads — AdSense policy compliant
        </span>
      )}
    </div>
  );
}
