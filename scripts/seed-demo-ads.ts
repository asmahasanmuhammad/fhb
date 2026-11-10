/**
 * Seed demo ads across every placement — 100% authentic brand creatives
 * and official brand logos (bKash, Daraz, Grameenphone, Robi, City Bank, Walton,
 * Pathao, Samsung, Pran, Foodpanda, Chaldal, BRAC Bank, Bata).
 *
 * 100% English copy. AdSense-ready placement contracts.
 * Run: npx tsx scripts/seed-demo-ads.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const ADSENSE_SNIPPET = (slot: string, size: string) =>
  `<!-- FHB ${slot} ${size} -->\n<ins class="adsbygoogle" style="display:inline-block;${size === "fluid" ? "" : `width:${size.split("x")[0]}px;height:${size.split("x")[1]}px`}${size === "fluid" ? 'data-ad-format="fluid"' : ""}" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="${Math.floor(1000000000 + Math.random() * 8999999999)}"></ins>`;

type DemoAd = {
  name: string;
  placement: string;
  headline: string;
  bodyText?: string;
  ctaLabel: string;
  brandColor: string;
  brandInitials: string;
  logoUrl?: string;
  logoTheme?: "LIGHT" | "DARK";
  linkUrl?: string;
  imageHint?: string;
  impressions: number;
  clicks: number;
};

const demoAds: DemoAd[] = [
  // ── HEADER_BANNER (728×90 leaderboard) ──
  {
    name: "bKash — Matchday Ticket Cashback Festival",
    placement: "HEADER_BANNER",
    headline: "bKash Matchday Cashback! Get 15% instant refund on stadium tickets",
    bodyText: "Book Bangladesh Premier League match tickets via bKash App & enjoy instant cash rewards.",
    ctaLabel: "Open App",
    brandColor: "#E2136E",
    brandInitials: "bK",
    logoUrl: "/brands/bkash.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.bkash.com",
    impressions: 28420,
    clicks: 712,
  },
  {
    name: "Daraz — 11.11 Football Super Mega Sale",
    placement: "HEADER_BANNER",
    headline: "Daraz 11.11 Football Mega Sale! Up to 70% off authentic club kits",
    bodyText: "Official jerseys, studded football boots and fan merchandise with guaranteed fast home delivery.",
    ctaLabel: "Shop Deals",
    brandColor: "#F57224",
    brandInitials: "DZ",
    logoUrl: "/brands/daraz.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.daraz.com.bd",
    impressions: 34180,
    clicks: 940,
  },
  {
    name: "Grameenphone — 4G Stadium Live Stream Pack",
    placement: "HEADER_BANNER",
    headline: "Stream Football in 4K with GP Superfast Matchday Data Pass",
    bodyText: "Zero buffering, HD match broadcasts and live audio commentary across all 64 districts.",
    ctaLabel: "Activate 4G",
    brandColor: "#009FE3",
    brandInitials: "GP",
    logoUrl: "/brands/grameenphone.svg",
    logoTheme: "LIGHT",
    linkUrl: "https://www.grameenphone.com",
    impressions: 26750,
    clicks: 656,
  },
  {
    name: "Robi — 4.5G Superfast Sports Pass",
    placement: "HEADER_BANNER",
    headline: "Robi 4.5G Sports Pass — Non-stop European & Domestic Football",
    bodyText: "High-definition matchday streaming with ultra-low latency on Bangladesh's widest 4.5G network.",
    ctaLabel: "Get Sports Pass",
    brandColor: "#E30613",
    brandInitials: "RB",
    logoUrl: "/brands/robi.svg",
    logoTheme: "LIGHT",
    linkUrl: "https://www.robi.com.bd",
    impressions: 22100,
    clicks: 530,
  },

  // ── SIDEBAR (300×250 / 300×600 skyscraper) ──
  {
    name: "City Bank — American Express VIP Matchday Lounge",
    placement: "SIDEBAR",
    headline: "Experience VIP Stadium Hospitality with City Bank Amex",
    bodyText: "Exclusive match lounge access, priority stadium gate entry and 0% FlexiBuy on seasonal tickets.",
    ctaLabel: "Apply Card",
    brandColor: "#003B70",
    brandInitials: "CB",
    logoUrl: "/brands/citybank.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.thecitybank.com",
    impressions: 14840,
    clicks: 387,
  },
  {
    name: "Walton — 4K Google TV Matchday Experience",
    placement: "SIDEBAR",
    headline: "Bring the Stadium Home with Walton 4K Google TV",
    bodyText: "120Hz refresh rate, Dolby Atmos surround audio and bezel-less stadium-grade cinematic display.",
    ctaLabel: "Order Walton 4K",
    brandColor: "#0B4EA2",
    brandInitials: "W",
    logoUrl: "/brands/walton.png",
    logoTheme: "LIGHT",
    linkUrl: "https://waltonhil.com",
    impressions: 16840,
    clicks: 412,
  },
  {
    name: "Pathao — 40% Off Matchday Stadium Rides",
    placement: "SIDEBAR",
    headline: "Beat Matchday Traffic — 40% Off Pathao Stadium Rides",
    bodyText: "Skip parking hassles at Kings Arena & Bangabandhu Stadium. Use promo code: MATCHDAY40.",
    ctaLabel: "Ride Pathao",
    brandColor: "#FF4B63",
    brandInitials: "P",
    logoUrl: "/brands/pathao.png",
    logoTheme: "LIGHT",
    linkUrl: "https://pathao.com",
    impressions: 13920,
    clicks: 345,
  },
  {
    name: "Samsung — Galaxy S26 Ultra 100x Stadium Zoom",
    placement: "SIDEBAR",
    headline: "Capture Every Goal from the Stands with 100x Space Zoom",
    bodyText: "Crystal-clear 8K match recordings and pro-grade nightography on the new Galaxy flagship.",
    ctaLabel: "Explore Galaxy",
    brandColor: "#1428A0",
    brandInitials: "S",
    logoUrl: "/brands/samsung.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.samsung.com/bd",
    impressions: 15300,
    clicks: 380,
  },

  // ── IN_FEED (native in-feed cards) ──
  {
    name: "Pran Foods — Matchday Crunch Family Pack",
    placement: "IN_FEED",
    headline: "Pran Chanachur — The Official Snack of Football Nights",
    bodyText: "Authentic spicy crunch for every matchday celebration. Get 20% extra in the special family pack.",
    ctaLabel: "Find Store",
    brandColor: "#E30613",
    brandInitials: "PR",
    logoUrl: "/brands/pran.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.pranfoods.net",
    impressions: 31310,
    clicks: 744,
  },
  {
    name: "Foodpanda — 30-Minute Stadium Food Delivery",
    placement: "IN_FEED",
    headline: "Half-Time Hunger? Foodpanda Delivers Hot in 30 Mins",
    bodyText: "Use promo code PANDAGOAL for 25% off burgers, pizzas, biryani and matchday refreshments.",
    ctaLabel: "Order Food",
    brandColor: "#D70F64",
    brandInitials: "fp",
    logoUrl: "/brands/foodpanda.svg",
    logoTheme: "LIGHT",
    linkUrl: "https://www.foodpanda.com.bd",
    impressions: 34650,
    clicks: 980,
  },
  {
    name: "Chaldal — 30-Minute Matchday Grocery Rush",
    placement: "IN_FEED",
    headline: "Stock Up for Game Night! 30-Minute Chaldal Delivery",
    bodyText: "Cold beverages, chips and game-night snacks delivered straight to your door with code: FHB100.",
    ctaLabel: "Shop Grocery",
    brandColor: "#00A651",
    brandInitials: "C",
    logoUrl: "/brands/chaldal.png",
    logoTheme: "LIGHT",
    linkUrl: "https://chaldal.com",
    impressions: 24870,
    clicks: 618,
  },
  {
    name: "BRAC Bank — Astha Digital Banking Sports Pass",
    placement: "IN_FEED",
    headline: "BRAC Bank Astha — Instant Digital Football Match Financing",
    bodyText: "Enjoy 0% EMI on annual stadium season tickets and exclusive cashback on sports merchandise.",
    ctaLabel: "Open Astha",
    brandColor: "#005BA6",
    brandInitials: "BB",
    logoUrl: "/brands/bracbank.svg",
    logoTheme: "LIGHT",
    linkUrl: "https://www.bracbank.com",
    impressions: 19430,
    clicks: 467,
  },
  {
    name: "FHB Pro Supporter — Ad-Free Broadcast Experience",
    placement: "IN_FEED",
    headline: "FHB Premium — 100% Ad-Free Football from Tk 99/month",
    bodyText: "Ultra HD streams, tactical analysis camera angles, transfer radar alerts and creator support.",
    ctaLabel: "Upgrade Now",
    brandColor: "#2CD96B",
    brandInitials: "FHB",
    linkUrl: "#premium",
    impressions: 21680,
    clicks: 689,
  },

  // ── MOBILE_BANNER & STICKY (320×100 sticky anchor) ──
  {
    name: "bKash — Mobile Matchday Ticket Booking",
    placement: "MOBILE_BANNER",
    headline: "bKash: Instant Matchday Tickets & Cashback",
    ctaLabel: "Open App",
    brandColor: "#E2136E",
    brandInitials: "bK",
    logoUrl: "/brands/bkash.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.bkash.com",
    impressions: 48200,
    clicks: 990,
  },
  {
    name: "Bata — Official Football Cleats & Sneaker Season",
    placement: "MOBILE_BANNER",
    headline: "Bata Sports Cleats Collection — 25% Off Today",
    ctaLabel: "Shop Bata",
    brandColor: "#D31145",
    brandInitials: "B",
    logoUrl: "/brands/bata.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.batabd.com",
    impressions: 39400,
    clicks: 728,
  },
  {
    name: "Grameenphone — Mobile Matchday SMS & 4G Alerts",
    placement: "MOBILE_BANNER",
    headline: "GP 4G: Instant Matchday Goal Alerts & Replays",
    ctaLabel: "Subscribe",
    brandColor: "#009FE3",
    brandInitials: "GP",
    logoUrl: "/brands/grameenphone.svg",
    logoTheme: "LIGHT",
    linkUrl: "https://www.grameenphone.com",
    impressions: 41850,
    clicks: 816,
  },
  {
    name: "Walton — Smart Stadium Matchday Displays",
    placement: "MOBILE_BANNER",
    headline: "Walton 4K Google TV — Live Football at 120Hz",
    ctaLabel: "View TVs",
    brandColor: "#0B4EA2",
    brandInitials: "W",
    logoUrl: "/brands/walton.png",
    logoTheme: "LIGHT",
    linkUrl: "https://waltonhil.com",
    impressions: 35100,
    clicks: 654,
  },

  // ── VIDEO_PREROLL (shorts pre-roll) ──
  {
    name: "Grameenphone — Video Pre-Roll Streaming",
    placement: "VIDEO_PREROLL",
    headline: "GP 4G — Stream High-Definition Football Highlights Instantly",
    bodyText: "Stream matches and shorts without data charges on selected MyGP football packs.",
    ctaLabel: "Watch Free",
    brandColor: "#009FE3",
    brandInitials: "GP",
    logoUrl: "/brands/grameenphone.svg",
    logoTheme: "LIGHT",
    linkUrl: "https://www.grameenphone.com",
    impressions: 21760,
    clicks: 582,
  },
  {
    name: "Daraz — Video Pre-Roll Kit Merchandise",
    placement: "VIDEO_PREROLL",
    headline: "Daraz Football Zone — Official Club Kits & Fan Merch",
    bodyText: "Official Premier League, La Liga & BFL jerseys with 100% authenticity guarantee.",
    ctaLabel: "Shop Official",
    brandColor: "#F57224",
    brandInitials: "DZ",
    logoUrl: "/brands/daraz.png",
    logoTheme: "LIGHT",
    linkUrl: "https://www.daraz.com.bd",
    impressions: 19830,
    clicks: 512,
  },
];

const AD_CODE_BY_PLACEMENT: Record<string, string> = {
  HEADER_BANNER: ADSENSE_SNIPPET("Header Leaderboard", "728x90"),
  SIDEBAR: ADSENSE_SNIPPET("Sidebar Skyscraper", "300x600"),
  IN_FEED: '<!-- FHB In-Feed -->\n<ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-fb+5w+4e-db+86" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="3456789012"></ins>',
  MOBILE_BANNER: ADSENSE_SNIPPET("Mobile Banner", "320x100"),
  VIDEO_PREROLL: '<!-- FHB Video Preroll (via Google Ad Manager video tag) -->\n<script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>',
};

async function main() {
  console.log("🧹 Resetting ad slots…");
  await db.adSlot.deleteMany();
  for (const ad of demoAds) {
    await db.adSlot.create({
      data: {
        name: ad.name,
        placement: ad.placement,
        provider: "ADSENSE",
        adCode: AD_CODE_BY_PLACEMENT[ad.placement] ?? "",
        imageHint: ad.imageHint ?? null,
        linkUrl: ad.linkUrl ?? null,
        headline: ad.headline,
        bodyText: ad.bodyText ?? null,
        ctaLabel: ad.ctaLabel,
        brandColor: ad.brandColor,
        brandInitials: ad.brandInitials,
        logoUrl: ad.logoUrl ?? null,
        logoTheme: ad.logoTheme ?? "LIGHT",
        active: true,
        impressions: ad.impressions,
        clicks: ad.clicks,
      },
    });
  }
  const byPlacement = await db.adSlot.groupBy({ by: ["placement"], _count: true });
  console.log("✅ Demo ads seeded with authentic brand logos:", byPlacement.map((p) => `${p.placement}=${p._count}`).join(", "));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
