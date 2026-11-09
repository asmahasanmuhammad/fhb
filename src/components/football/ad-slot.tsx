"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

/**
 * Google AdSense-ready ad slot — publisher-grade demo creatives.
 * Neutral surfaces + brand-tinted accents; CTA follows a consistent
 * pill style; clearly labelled "Sponsored" per AdSense policy.
 * Premium members get an ad-free experience.
 */

const ROTATE_MS = 12_000;
const FALLBACK_BRAND = "#1E9E50";

type Variant = "banner" | "sidebar" | "in-feed";

/** Brand monogram chip — square, brand colour, like a real logo tile. */
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
        "flex shrink-0 select-none items-center justify-center rounded-lg font-display font-bold tracking-tight text-white",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),0_3px_8px_-3px_rgba(0,0,0,0.5)]",
        size === "sm" && "h-9 w-9 text-[13px]",
        size === "md" && "h-11 w-11 text-[15px]",
        size === "lg" && "h-14 w-14 rounded-xl text-lg"
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
    <span className={cn("flex items-center gap-1 text-[9.5px] font-medium tracking-wide text-muted-foreground/80", className)}>
      Sponsored
      <ArrowUpRight className="h-2.5 w-2.5" aria-hidden />
    </span>
  );
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

  const brandColor = ad.brandColor || FALLBACK_BRAND;

  const trackClick = () => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, event: "click" }),
    }).catch(() => {});
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

  /** Consistent CTA pill — muted, brand-tinted outline. Ads stay visually quiet. */
  const Cta = () => (
    <span
      className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-border bg-elevated px-3.5 text-[11px] font-bold text-foreground/90 transition-colors group-hover:border-primary/40 group-hover:text-primary"
    >
      {cta}
      <ArrowUpRight className="h-3 w-3" aria-hidden />
    </span>
  );

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/70 bg-card/60",
        isBanner && "flex h-[90px] items-stretch",
        isMobileBanner && "flex h-20 items-stretch",
        isSidebar && "h-[280px]",
        variant === "in-feed" && "h-[104px]",
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
          background: `radial-gradient(70% 140% at 8% 0%, ${brandColor}1f, transparent 58%)`,
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
            className="ad-creative object-cover opacity-30 transition-opacity duration-300 group-hover:opacity-40"
            unoptimized
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-background/94 via-background/70 to-background/20"
          />
        </>
      )}

      {/* Disclosure chip */}
      <span className="absolute left-3 top-2.5 z-10 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        Ad · Sponsored
      </span>

      {/* ── Creative ── */}
      {variant === "sidebar" ? (
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full w-full flex-col items-center justify-center px-6 pb-6 pt-8 text-center"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdMonogram brand={ad} size="lg" />
          <p className="mt-4 font-display text-[15px] font-bold leading-snug text-foreground/95">{headline}</p>
          {ad.bodyText && (
            <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-muted-foreground">{ad.bodyText}</p>
          )}
          <span
            className="mt-4 flex h-9 items-center rounded-md px-6 text-xs font-bold text-white transition-all group-hover:brightness-110"
            style={{ backgroundColor: `${brandColor}e6` }}
          >
            {cta}
          </span>
          <SponsoredMeta className="mt-4" />
        </button>
      ) : variant === "banner" ? (
        <button
          key={ad.id}
          onClick={trackClick}
          className="ad-creative relative z-[5] flex h-full w-full items-center gap-3.5 px-4 text-left sm:px-6"
          aria-label={`${ad.name} — click to visit`}
        >
          <AdMonogram brand={ad} size={isMobileBanner ? "sm" : "md"} />
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate font-display font-bold leading-tight text-foreground/95", isMobileBanner ? "text-[12.5px]" : "text-sm")}>
              {headline}
            </span>
            {ad.bodyText && !isMobileBanner && (
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{ad.bodyText}</span>
            )}
            <SponsoredMeta className="mt-1" />
          </span>
          <Cta />
        </button>
      ) : (
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
          <Cta />
        </button>
      )}
    </div>
  );
}
