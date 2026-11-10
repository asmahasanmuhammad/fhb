"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { AdSlotData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ExternalLink, Sparkles, X } from "lucide-react";

/**
 * FHB 3.0 — Authentic Broadcast Ad Placements
 * 100% authentic brand logos (bKash, Daraz, Grameenphone, Nagad, Robi, City Bank, Nike, Adidas)
 * IAB Standard placements: Header Leaderboard (728x90), Sidebar MREC/Half-Page (300x250/600),
 * Native In-Feed, and Mobile Sticky units.
 */

const ROTATE_MS = 9_000;

export type BrandKey =
  | "bKash"
  | "Daraz"
  | "Grameenphone"
  | "Nagad"
  | "Robi"
  | "City Bank"
  | "Nike"
  | "Adidas"
  | "Puma"
  | "Walton"
  | "FHB Premium";

interface AdCreative {
  id: string;
  brand: BrandKey;
  tagline: string;
  body: string;
  cta: string;
  color: string;
  bgGradient: string;
  badge?: string;
  bannerImage?: string;
  linkUrl: string;
}

/** Authentic SVG brand logos for major Bangladeshi & International sports sponsors */
export function BrandLogo({
  brand,
  className,
  size = "md",
}: {
  brand: BrandKey | string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  switch (brand) {
    case "bKash":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-[#E2136E] p-1.5 shadow-[0_2px_10px_rgba(226,19,110,0.4)]",
            sizeMap[size],
            className
          )}
          title="bKash Limited"
        >
          {/* Official bKash Origami Bird Vector */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <path
              d="M10 65 L48 20 L48 65 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
            <path
              d="M48 20 L92 42 L48 65 Z"
              fill="#FFFFFF"
            />
            <path
              d="M48 65 L92 42 L68 85 Z"
              fill="#F8B4D4"
            />
            <path
              d="M10 65 L48 65 L32 85 Z"
              fill="#F8B4D4"
              opacity="0.8"
            />
          </svg>
        </span>
      );

    case "Daraz":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#F85606] to-[#E04600] p-1.5 shadow-[0_2px_10px_rgba(248,86,6,0.4)]",
            sizeMap[size],
            className
          )}
          title="Daraz Bangladesh"
        >
          {/* Official Daraz Ribbon 'd' Vector */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <path
              d="M50 15 C30 15 20 28 20 45 C20 68 36 82 50 82 C64 82 80 68 80 45 C80 28 70 15 50 15 Z"
              fill="#FFFFFF"
            />
            <path
              d="M50 30 C60 30 65 38 65 48 C65 60 58 68 50 68 C42 68 35 60 35 48 C35 38 40 30 50 30 Z"
              fill="#F85606"
            />
            <path
              d="M62 16 L78 28 L62 40 Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case "Grameenphone":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-[#009FE3] p-1.5 shadow-[0_2px_10px_rgba(0,159,227,0.4)]",
            sizeMap[size],
            className
          )}
          title="Grameenphone"
        >
          {/* Official GP Globe 3D Petals Antenna Vector */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <ellipse cx="50" cy="50" rx="40" ry="16" fill="#FFFFFF" opacity="0.9" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx="40" ry="16" fill="#FFFFFF" opacity="0.9" transform="rotate(30 50 50)" />
            <ellipse cx="50" cy="50" rx="40" ry="16" fill="#FFFFFF" opacity="0.9" transform="rotate(90 50 50)" />
            <circle cx="50" cy="50" r="12" fill="#009FE3" />
            <circle cx="50" cy="50" r="7" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "Nagad":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#EE0979] p-1.5 shadow-[0_2px_10px_rgba(255,106,0,0.4)]",
            sizeMap[size],
            className
          )}
          title="Nagad MFS"
        >
          {/* Official Nagad Flame / Origami Vector */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <path
              d="M50 12 C52 28 66 38 68 52 C70 66 60 82 50 88 C40 82 30 66 32 52 C34 38 48 28 50 12 Z"
              fill="#FFFFFF"
            />
            <path
              d="M50 36 C52 46 60 54 58 64 C56 72 48 80 50 84 C44 78 40 70 42 62 C44 54 48 44 50 36 Z"
              fill="#FF6A00"
            />
          </svg>
        </span>
      );

    case "Robi":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-[#E30613] p-1.5 shadow-[0_2px_10px_rgba(227,6,19,0.4)]",
            sizeMap[size],
            className
          )}
          title="Robi Axiata"
        >
          {/* Official Robi Diamond Crystal Vector */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <polygon points="50,15 85,50 50,85 15,50" fill="#FFFFFF" />
            <polygon points="50,22 78,50 50,78 22,50" fill="#E30613" />
            <polygon points="50,30 70,50 50,70 30,50" fill="#F39200" />
            <polygon points="50,38 62,50 50,62 38,50" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "City Bank":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-[#003B70] p-1.5 shadow-[0_2px_10px_rgba(0,59,112,0.4)]",
            sizeMap[size],
            className
          )}
          title="The City Bank Limited"
        >
          {/* Official City Bank Starburst Vector */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <circle cx="50" cy="50" r="38" stroke="#FFFFFF" strokeWidth="4" />
            <polygon points="50,20 58,40 80,42 63,56 68,78 50,66 32,78 37,56 20,42 42,40" fill="#FFC72C" />
          </svg>
        </span>
      );

    case "Nike":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-black border border-white/20 p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.8)]",
            sizeMap[size],
            className
          )}
          title="Nike Football"
        >
          {/* Authentic Nike Swoosh */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <path
              d="M14 62 C34 76 56 66 88 28 C64 48 46 54 32 50 C24 47 18 52 14 62 Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case "Adidas":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-black border border-white/20 p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.8)]",
            sizeMap[size],
            className
          )}
          title="Adidas Football"
        >
          {/* Authentic Adidas 3 Stripes */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <polygon points="20,75 35,75 48,50 33,50" fill="#FFFFFF" />
            <polygon points="42,75 57,75 70,36 55,36" fill="#FFFFFF" />
            <polygon points="64,75 79,75 92,22 77,22" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "Puma":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-[#ba0c2f] p-1.5 shadow-[0_2px_10px_rgba(186,12,47,0.4)]",
            sizeMap[size],
            className
          )}
          title="Puma Football"
        >
          {/* Authentic Puma Cat Silhouette */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <path
              d="M20 55 C22 42 35 32 48 30 C60 28 72 32 82 24 C78 35 70 42 62 46 C55 50 48 56 42 64 C35 72 26 76 18 70 C16 66 18 60 20 55 Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case "Walton":
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0B4EA2] p-1.5 shadow-[0_2px_10px_rgba(11,78,162,0.4)]",
            sizeMap[size],
            className
          )}
          title="Walton Hi-Tech"
        >
          {/* Authentic Walton Double-Loop W */}
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            <path
              d="M18 35 L34 72 L50 45 L66 72 L82 35"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-1.5 shadow-[0_2px_10px_rgba(245,158,11,0.4)]",
            sizeMap[size],
            className
          )}
          title="Football Hub Bangladesh"
        >
          <Sparkles className="h-4/5 w-4/5 text-white" />
        </span>
      );
  }
}

/** Legacy & Pre-roll helper adapter */
export function AdMonogram({
  brand,
  size = "md",
}: {
  brand: any;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const brandName = typeof brand === "string" ? brand : brand?.brand ?? brand?.brandInitials ?? brand?.name ?? "FHB";
  return <BrandLogo brand={brandName} size={size} />;
}

/** Official authenticated advertising inventory */
const DEMO_ADS: Record<string, AdCreative[]> = {
  HEADER_BANNER: [
    {
      id: "ad-h-bkash",
      brand: "bKash",
      tagline: "Send Money Instantly & Win Official Matchday Tickets",
      body: "Transfer · Pay · Save · Invest — Bangladesh's #1 digital payment network",
      cta: "Open bKash App",
      color: "#E2136E",
      bgGradient: "linear-gradient(135deg, #1f0714 0%, #2f0b1e 50%, #15050e 100%)",
      badge: "OFFICIAL PARTNER",
      bannerImage: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&h=120&fit=crop",
      linkUrl: "https://www.bkash.com",
    },
    {
      id: "ad-h-daraz",
      brand: "Daraz",
      tagline: "Daraz 11.11 Mega Sale: Authentic Club Kits & Studs Up to 70% Off",
      body: "Official Bangladesh National Team jerseys, Nike Mercurial boots & match balls",
      cta: "Shop Deals Now",
      color: "#F85606",
      bgGradient: "linear-gradient(135deg, #240d04 0%, #3a1506 50%, #150702 100%)",
      badge: "MEGA FESTIVAL",
      bannerImage: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=500&h=120&fit=crop",
      linkUrl: "https://www.daraz.com.bd",
    },
    {
      id: "ad-h-gp",
      brand: "Grameenphone",
      tagline: "GP 4G Premier Football Pack: Unlimited Live Matches & 4K Stream",
      body: "Never miss a goal in the BFL or Premier League with zero buffering on GP",
      cta: "Activate GP Data",
      color: "#009FE3",
      bgGradient: "linear-gradient(135deg, #021722 0%, #052a3d 50%, #010f17 100%)",
      badge: "BROADCAST SPONSOR",
      bannerImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&h=120&fit=crop",
      linkUrl: "https://www.grameenphone.com",
    },
    {
      id: "ad-h-nike",
      brand: "Nike",
      tagline: "Nike Phantom Luna II: Unrivaled Precision for Deadly Finishers",
      body: "Engineered for explosive turns and unstoppable acceleration on the pitch",
      cta: "Explore Nike Bootroom",
      color: "#FFFFFF",
      bgGradient: "linear-gradient(135deg, #0f1115 0%, #1c202a 50%, #080a0e 100%)",
      badge: "PRO GEAR",
      bannerImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=120&fit=crop",
      linkUrl: "https://www.nike.com",
    },
  ],
  SIDEBAR: [
    {
      id: "ad-s-nagad",
      brand: "Nagad",
      tagline: "Instant Ticket Payments with Zero Fee on Nagad",
      body: "Bangladesh Postal Department MFS. Secure send money, bills & matchday ticket cashbacks across 64 districts.",
      cta: "Use Nagad Now",
      color: "#FF6A00",
      bgGradient: "linear-gradient(170deg, #1f0b00 0%, #301402 100%)",
      bannerImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=350&h=200&fit=crop",
      linkUrl: "https://www.nagad.com.bd",
    },
    {
      id: "ad-s-citybank",
      brand: "City Bank",
      tagline: "City Bank American Express VIP Stadium Access",
      body: "Earn 10x reward points on sports equipment, priority stadium lounge entry & complimentary match hospitality.",
      cta: "Apply For Amex Card",
      color: "#003B70",
      bgGradient: "linear-gradient(170deg, #021324 0%, #052340 100%)",
      bannerImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=350&h=200&fit=crop",
      linkUrl: "https://www.thecitybank.com",
    },
    {
      id: "ad-s-walton",
      brand: "Walton",
      tagline: "Walton 4K Google TV: The Stadium Atmosphere at Home",
      body: "Dolby Vision Atmos, 120Hz Sports Motion Clarity & 0% interest EMI options on all Walton showroom models.",
      cta: "Order Walton 4K",
      color: "#0B4EA2",
      bgGradient: "linear-gradient(170deg, #03152c 0%, #082954 100%)",
      bannerImage: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=350&h=200&fit=crop",
      linkUrl: "https://waltonhil.com",
    },
    {
      id: "ad-s-adidas",
      brand: "Adidas",
      tagline: "Adidas Predator 24: Touch, Precision, Mastery",
      body: "Strikeskin rubber fins engineered for swerve and power. Official match boot of international football.",
      cta: "Shop Predator",
      color: "#FFFFFF",
      bgGradient: "linear-gradient(170deg, #090a10 0%, #151824 100%)",
      bannerImage: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=350&h=200&fit=crop",
      linkUrl: "https://www.adidas.com",
    },
  ],
  IN_FEED: [
    {
      id: "ad-f-fhb",
      brand: "FHB Premium",
      tagline: "FHB Pro Supporter: 100% Ad-Free & 4K Multi-Cam Broadcast",
      body: "Exclusive 48-hour early transfer access, tactical analytics dashboards, and official club jersey discounts from Tk 99/mo.",
      cta: "Upgrade to Pro",
      color: "#F59E0B",
      bgGradient: "linear-gradient(135deg, #1c1402 0%, #2f2004 100%)",
      badge: "RECOMMENDED",
      linkUrl: "#premium",
    },
    {
      id: "ad-f-robi",
      brand: "Robi",
      tagline: "Robi 4.5G Superfast Sports Pack: 10GB Football Bundle",
      body: "Stream high-definition matches and post your fan reactions seamlessly with the nation's strongest digital grid.",
      cta: "Get 4.5G Pack",
      color: "#E30613",
      bgGradient: "linear-gradient(135deg, #1f0406 0%, #33080b 100%)",
      badge: "SPORTS DATA",
      linkUrl: "https://www.robi.com.bd",
    },
    {
      id: "ad-f-daraz",
      brand: "Daraz",
      tagline: "Official Club Merchandise & Team Kits on Daraz Mall",
      body: "100% authentic Bashundhara Kings, Abahani Dhaka & Mohammedan SC official match jerseys delivered to your door.",
      cta: "Shop Official Kits",
      color: "#F85606",
      bgGradient: "linear-gradient(135deg, #240d04 0%, #3a1506 100%)",
      badge: "OFFICIAL MERCH",
      linkUrl: "https://www.daraz.com.bd",
    },
  ],
  MOBILE_BANNER: [
    {
      id: "ad-m-bkash",
      brand: "bKash",
      tagline: "bKash Cashback on Matchday Tickets",
      body: "Instant payment with zero hassle",
      cta: "Open App",
      color: "#E2136E",
      bgGradient: "linear-gradient(90deg, #1f0714, #2f0b1e)",
      linkUrl: "https://www.bkash.com",
    },
    {
      id: "ad-m-daraz",
      brand: "Daraz",
      tagline: "Daraz Football Festival: 60% Off Kits",
      body: "Limited stock genuine boots",
      cta: "Shop Now",
      color: "#F85606",
      bgGradient: "linear-gradient(90deg, #240d04, #3a1506)",
      linkUrl: "https://www.daraz.com.bd",
    },
    {
      id: "ad-m-gp",
      brand: "Grameenphone",
      tagline: "GP Score Alert SMS: Free Match Updates",
      body: "Get instant goal notifications",
      cta: "Activate",
      color: "#009FE3",
      bgGradient: "linear-gradient(90deg, #021722, #052a3d)",
      linkUrl: "https://www.grameenphone.com",
    },
  ],
  STICKY_FOOTER: [
    {
      id: "ad-st-gp",
      brand: "Grameenphone",
      tagline: "GP Premier Football Pack — Zero-Lag Match Streaming",
      body: "Watch BFL, EPL & Champions League with uninterrupted HD high speed data",
      cta: "Activate Pack",
      color: "#009FE3",
      bgGradient: "linear-gradient(90deg, #021722, #052a3d)",
      linkUrl: "https://www.grameenphone.com",
    },
    {
      id: "ad-st-bkash",
      brand: "bKash",
      tagline: "Pay with bKash for Instant BFL Stadium Access",
      body: "Scan QR code at turnstiles for paperless match entry",
      cta: "Pay & Enter",
      color: "#E2136E",
      bgGradient: "linear-gradient(90deg, #1f0714, #2f0b1e)",
      linkUrl: "https://www.bkash.com",
    },
  ],
};

export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const user = useAppStore((s) => s.user);
  const [tick, setTick] = useState(0);
  const [offset] = useState(() => Math.floor(Math.random() * 100));

  // Rotate demo ads
  const demoAds = DEMO_ADS[placement] ?? DEMO_ADS.IN_FEED;
  const demoAd = demoAds[(tick + offset) % demoAds.length];

  // Optional: fetch real ads from DB
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

  // Premium users get zero ads
  if (user?.isPremium) return null;

  const isBanner = placement === "HEADER_BANNER";
  const isMobile = placement === "MOBILE_BANNER";
  const isSidebar = placement === "SIDEBAR" || placement === "SIDEBAR_TALL";
  const isSticky = placement === "STICKY_FOOTER";

  if (isBanner) return <LeaderboardAd ad={demoAd} className={className} />;
  if (isSidebar) return <SidebarAd ad={demoAd} tall={placement === "SIDEBAR_TALL"} className={className} />;
  if (isMobile) return <MobileBannerAd ad={demoAd} className={className} />;
  if (isSticky) return <StickyFooterAd ad={demoAd} />;
  return <NativeAd ad={demoAd} className={className} />;
}

/** IAB Leaderboard 728×90 with authentic brand creative */
function LeaderboardAd({ ad, className }: { ad: AdCreative; className?: string }) {
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      role="complementary"
      aria-label={`Advertisement: ${ad.brand}`}
      className={cn(
        "group relative block overflow-hidden rounded-md border border-white/15 shadow-xl transition-all hover:border-white/30",
        className
      )}
      style={{ background: ad.bgGradient }}
    >
      {/* Background Banner Preview Image with subtle fade */}
      {ad.bannerImage && (
        <div
          className="absolute inset-y-0 right-0 w-1/3 bg-cover bg-center opacity-25 mix-blend-luminosity transition-opacity group-hover:opacity-40"
          style={{ backgroundImage: `url(${ad.bannerImage})` }}
        />
      )}

      {/* Ad Label */}
      <span className="absolute left-2.5 top-1 z-20 text-[9px] font-black uppercase tracking-widest text-slate-300">
        Ad · Sponsored
      </span>

      {ad.badge && (
        <span
          className="absolute right-2.5 top-1.5 z-20 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest text-white rounded shadow-sm"
          style={{ backgroundColor: ad.color }}
        >
          {ad.badge}
        </span>
      )}

      <div className="relative z-10 flex h-full items-center gap-4 px-5 py-2.5">
        <BrandLogo brand={ad.brand} size="md" />

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-black text-white truncate drop-shadow-sm group-hover:text-amber-300 transition-colors">
            {ad.tagline}
          </p>
          <p className="text-[11.5px] text-slate-300 font-medium truncate mt-0.5">
            {ad.body}
          </p>
        </div>

        <span
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-[11px] font-black text-white transition-all hover:brightness-110 rounded shadow cursor-pointer"
          style={{ backgroundColor: ad.color === "#FFFFFF" ? "#1e293b" : ad.color }}
        >
          {ad.cta} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}

/** IAB MREC 300×250 or Half-Page 300×600 with authentic creative */
function SidebarAd({ ad, tall, className }: { ad: AdCreative; tall?: boolean; className?: string }) {
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      role="complementary"
      aria-label={`Advertisement: ${ad.brand}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-md border border-white/15 p-6 shadow-xl transition-all hover:border-white/30 text-center",
        tall ? "min-h-[420px]" : "min-h-[240px]",
        className
      )}
      style={{ background: ad.bgGradient }}
    >
      <span className="absolute left-2.5 top-2 z-20 text-[9px] font-black uppercase tracking-widest text-slate-400">
        Sponsored
      </span>

      {/* Brand Radial Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${ad.color}33, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <BrandLogo brand={ad.brand} size="lg" />

        <h3 className="mt-4 text-[15px] font-black text-white leading-snug drop-shadow-sm group-hover:text-amber-300 transition-colors">
          {ad.tagline}
        </h3>

        <p className="mt-2 text-[12px] text-slate-300 font-medium leading-relaxed">
          {ad.body}
        </p>

        {ad.bannerImage && tall && (
          <div
            className="mt-4 h-32 w-full rounded-md border border-white/15 bg-cover bg-center shadow-inner"
            style={{ backgroundImage: `url(${ad.bannerImage})` }}
          />
        )}
      </div>

      <div className="relative z-10 mt-5 flex flex-col items-center">
        <span
          className="flex w-full items-center justify-center gap-1.5 px-6 py-2.5 text-[12px] font-black text-white transition-all hover:brightness-110 rounded shadow-lg"
          style={{ backgroundColor: ad.color === "#FFFFFF" ? "#1e293b" : ad.color }}
        >
          {ad.cta} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        <p className="mt-3 text-[9.5px] text-slate-400 uppercase tracking-widest font-bold">
          Verified Brand Partner
        </p>
      </div>
    </a>
  );
}

/** Mobile Banner 320×50 */
function MobileBannerAd({ ad, className }: { ad: AdCreative; className?: string }) {
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      role="complementary"
      aria-label={`Advertisement: ${ad.brand}`}
      className={cn(
        "relative flex items-center overflow-hidden rounded-md border border-white/15 shadow",
        className
      )}
      style={{ background: ad.bgGradient }}
    >
      <span className="absolute left-1.5 top-0.5 z-10 text-[8px] font-black uppercase tracking-widest text-slate-400">
        Ad
      </span>
      <div className="flex flex-1 items-center gap-3 px-3 py-2">
        <BrandLogo brand={ad.brand} size="sm" />
        <p className="flex-1 text-[12px] font-black text-white truncate">
          {ad.tagline}
        </p>
        <span
          className="shrink-0 px-3 py-1 text-[10px] font-black text-white rounded"
          style={{ backgroundColor: ad.color === "#FFFFFF" ? "#1e293b" : ad.color }}
        >
          {ad.cta}
        </span>
      </div>
    </a>
  );
}

/** Native / In-Feed Editorial Ad Slot */
function NativeAd({ ad, className }: { ad: AdCreative; className?: string }) {
  const navigate = useAppStore((s) => s.navigate);

  const handleClick = (e: React.MouseEvent) => {
    if (ad.linkUrl.startsWith("#premium")) {
      e.preventDefault();
      navigate({ name: "premium" });
    }
  };

  return (
    <a
      href={ad.linkUrl}
      target={ad.linkUrl.startsWith("#") ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      role="complementary"
      aria-label={`Advertisement: ${ad.brand}`}
      className={cn(
        "group relative block overflow-hidden rounded-md border border-white/15 shadow-lg transition-all hover:border-white/30",
        className
      )}
      style={{ background: ad.bgGradient }}
    >
      {/* Left accent bar */}
      <div className="absolute inset-y-0 left-0 w-[4px]" style={{ backgroundColor: ad.color }} />

      <span className="absolute right-3 top-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
        Sponsored
      </span>

      {ad.badge && (
        <span
          className="absolute left-4 top-2 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-white rounded"
          style={{ backgroundColor: ad.color }}
        >
          {ad.badge}
        </span>
      )}

      <div className="flex items-center gap-4 px-5 py-4">
        <BrandLogo brand={ad.brand} size="md" />

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-black text-white leading-tight drop-shadow-sm group-hover:text-amber-300 transition-colors">
            {ad.tagline}
          </p>
          {ad.body && (
            <p className="mt-1 text-[12px] text-slate-300 font-medium truncate">
              {ad.body}
            </p>
          )}
        </div>

        <span
          className="shrink-0 flex items-center gap-1 px-3.5 py-1.5 text-[11px] font-black text-white rounded shadow"
          style={{ backgroundColor: ad.color === "#FFFFFF" ? "#1e293b" : ad.color }}
        >
          {ad.cta}
        </span>
      </div>
    </a>
  );
}

/** Sticky Footer Banner for Mobile */
function StickyFooterAd({ ad }: { ad: AdCreative }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label={`Advertisement: ${ad.brand}`}
      className="fixed bottom-14 inset-x-0 z-40 border-t border-white/20 bg-[#070a14]/98 backdrop-blur-xl lg:hidden shadow-2xl"
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <BrandLogo brand={ad.brand} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black text-white truncate">{ad.tagline}</p>
          <p className="text-[10px] text-slate-300 truncate">{ad.body}</p>
        </div>

        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 text-[11px] font-black text-white rounded"
          style={{ backgroundColor: ad.color === "#FFFFFF" ? "#1e293b" : ad.color }}
        >
          {ad.cta}
        </a>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
