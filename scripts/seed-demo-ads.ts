/**
 * Seed demo ads across every placement — realistic Bangladeshi brand creatives
 * (clearly labelled as demo in the admin panel) so the client can preview
 * exactly how Google AdSense inventory will look on the live site.
 *
 * Run: npx tsx scripts/seed-demo-ads.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const ADSENSE_SNIPPET = (slot: string, size: string) =>
  `<!-- FHB ${slot} ${size} -->\n<ins class="adsbygoogle" style="display:inline-block;${size === "fluid" ? "" : `width:${size.split("x")[0]}px;height:${size.split("x")[1]}px`}(${size === "fluid" ? "data-ad-format=\"fluid\"" : ""})" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="${Math.floor(1000000000 + Math.random() * 8999999999)}"></ins>`;

type DemoAd = {
  name: string;
  placement: string;
  headline: string;
  bodyText?: string;
  ctaLabel: string;
  brandColor: string;
  brandInitials: string;
  linkUrl?: string;
  imageHint?: string;
  impressions: number;
  clicks: number;
};

const demoAds: DemoAd[] = [
  // ── HEADER_BANNER (728×90 leaderboard) ──
  {
    name: "bKash — হেডার লিডারবোর্ড (ডেমো)",
    placement: "HEADER_BANNER",
    headline: "ক্যাশব্যাক উৎসব! প্রতিটি পেমেন্টে পান ১০০% ক্যাশব্যাক",
    bodyText: "বিকাশ অ্যাপে বিল পেমেন্ট করে জিতে নিন আকর্ষণীয় পুরস্কার",
    ctaLabel: "অ্যাপে দেখুন",
    brandColor: "#E2136E",
    brandInitials: "bK",
    linkUrl: "https://www.bkash.com",
    impressions: 18420,
    clicks: 412,
  },
  {
    name: "Grameenphone — হেডার লিডারবোর্ড (ডেমো)",
    placement: "HEADER_BANNER",
    headline: "স্কোর আপডেট এখন ফ্রি! GP স্কোর অ্যালার্ট সার্ভিস",
    bodyText: "প্রতিটি ম্যাচের লাইভ স্কোর পান SMS-এ, কোনো ইন্টারনেট লাগবে না",
    ctaLabel: "চালু করুন",
    brandColor: "#009FE3",
    brandInitials: "GP",
    linkUrl: "https://www.grameenphone.com",
    impressions: 16750,
    clicks: 356,
  },
  {
    name: "Daraz — হেডার লিডারবোর্ড (ডেমো)",
    placement: "HEADER_BANNER",
    headline: "১১.১১ মেগা সেল! ফুটবল জার্সি ও গিয়ারে ৭০% পর্যন্ত ছাড়",
    bodyText: "সীমিত সময়ের অফার — আজই অর্ডার করুন",
    ctaLabel: "শপিং করুন",
    brandColor: "#F57224",
    brandInitials: "DZ",
    linkUrl: "https://www.daraz.com.bd",
    impressions: 21980,
    clicks: 610,
  },

  // ── SIDEBAR (300×600 skyscraper) ──
  {
    name: "Walton — সাইডবার স্কাইস্ক্র্যাপার (ডেমো)",
    placement: "SIDEBAR",
    headline: "ওয়ালটন ৪K অ্যান্ড্রয়েড টিভিতে দেখুন প্রতিটি লাইভ ম্যাচ",
    bodyText: "স্টেডিয়ামের অনুভূতি এবার আপনার ড্রয়িংরুমে — EMI-তে ০% সুদে",
    ctaLabel: "অর্ডার করুন",
    brandColor: "#0B4EA2",
    brandInitials: "W",
    linkUrl: "https://waltonhil.com",
    impressions: 9840,
    clicks: 187,
  },
  {
    name: "Pathao — সাইডবার স্কাইস্ক্র্যাপার (ডেমো)",
    placement: "SIDEBAR",
    headline: "স্টেডিয়াম যাওয়া এখন সাশ্রয়ী — পাঠাও রাইডে ৪০% ছাড়",
    bodyText: "ম্যাচ ডে-তে কুপন ব্যবহার করুন: FHB40",
    ctaLabel: "কুপন নিন",
    brandColor: "#FF4B63",
    brandInitials: "P",
    linkUrl: "https://pathao.com",
    impressions: 8320,
    clicks: 205,
  },
  {
    name: "Samsung — সাইডবার স্কাইস্ক্র্যাপার (ডেমো)",
    placement: "SIDEBAR",
    headline: "Galaxy Buds — ম্যাচের কমেন্ট্রি শুনুন ক্রিস্টাল ক্লিয়ার সাউন্ডে",
    bodyText: "ফুটবল সিজন স্পেশাল প্রাইস — স্টক সীমিত",
    ctaLabel: "আরও জানুন",
    brandColor: "#1428A0",
    brandInitials: "S",
    linkUrl: "https://www.samsung.com/bd",
    impressions: 7690,
    clicks: 143,
  },

  // ── IN_FEED (native in-feed) ──
  {
    name: "Pran-RFL — ইন-ফিড ব্যানার (ডেমো)",
    placement: "IN_FEED",
    headline: "প্রাণ চানাচুর — ম্যাচ দেখার সেরা সঙ্গী",
    bodyText: "ফ্যামিলি প্যাকে এখন ২০% বেশি",
    ctaLabel: "দোকান খুঁজুন",
    brandColor: "#E30613",
    brandInitials: "PR",
    linkUrl: "https://www.pranfoods.net",
    impressions: 27310,
    clicks: 544,
  },
  {
    name: "Chaldal — ইন-ফিড ব্যানার (ডেমো)",
    placement: "IN_FEED",
    headline: "গ্রোসারি অর্ডার করুন ৩০ মিনিটে ডেলিভারিতে",
    bodyText: "প্রথম অর্ডারে ১০০ টাকা ছাড় — কুপন: FHB100",
    ctaLabel: "অর্ডার করুন",
    brandColor: "#00A651",
    brandInitials: "C",
    linkUrl: "https://chaldal.com",
    impressions: 19870,
    clicks: 498,
  },
  {
    name: "City Bank — ইন-ফিড ব্যানার (ডেমো)",
    placement: "IN_FEED",
    headline: "City Touch ডিজিটাল ব্যাংকিং — যেকোনো জায়গা থেকে সব লেনদেন",
    bodyText: "মাত্র ১০ মিনিটে অ্যাকাউন্ট খুলুন",
    ctaLabel: "খুলুন",
    brandColor: "#0057B8",
    brandInitials: "CB",
    linkUrl: "https://www.thecitybank.com",
    impressions: 14230,
    clicks: 267,
  },
  {
    name: "Foodpanda — ইন-ফিড ব্যানার (ডেমো)",
    placement: "IN_FEED",
    headline: "ম্যাচ নাইট স্পেশাল — ফ্রি ডেলিভারি কোড: FHB50",
    bodyText: "পছন্দের খাবার অর্ডার করুন ম্যাচের হাফ-টাইমেই",
    ctaLabel: "অর্ডার করুন",
    brandColor: "#D70F64",
    brandInitials: "fp",
    linkUrl: "https://www.foodpanda.com.bd",
    impressions: 23650,
    clicks: 712,
  },
  {
    name: "FHB হাউজ অ্যাড — ইন-ফিড (ডেমো)",
    placement: "IN_FEED",
    headline: "FHB Premium — বিজ্ঞাপনমুক্ত ফুটবল অভিজ্ঞতা",
    bodyText: "মাসে মাত্র ৳৯৯ — এক্সক্লুসিভ ট্রান্সফার নিউজ ও HD হাইলাইটস",
    ctaLabel: "আপগ্রেড করুন",
    brandColor: "#D4A017",
    brandInitials: "FHB",
    linkUrl: "#premium",
    imageHint: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/47ce3d922168.jpg",
    impressions: 12680,
    clicks: 389,
  },

  // ── MOBILE_BANNER (320×50/100 sticky) ──
  {
    name: "bKash — মোবাইল স্টিকি ব্যানার (ডেমো)",
    placement: "MOBILE_BANNER",
    headline: "বিকাশ অ্যাপে বিল পেমেন্টে ইনস্ট্যান্ট ক্যাশব্যাক",
    ctaLabel: "দেখুন",
    brandColor: "#E2136E",
    brandInitials: "bK",
    linkUrl: "https://www.bkash.com",
    impressions: 41200,
    clicks: 690,
  },
  {
    name: "Bata — মোবাইল স্টিকি ব্যানার (ডেমো)",
    placement: "MOBILE_BANNER",
    headline: "স্পোর্টস স্নিকার্স কলেকশন — ২৫% ছাড়",
    ctaLabel: "কিনুন",
    brandColor: "#D31145",
    brandInitials: "B",
    linkUrl: "https://www.batabd.com",
    impressions: 35400,
    clicks: 528,
  },
  {
    name: "Teer — মোবাইল স্টিকি ব্যানার (ডেমো)",
    placement: "MOBILE_BANNER",
    headline: "Teer ফুটবল ফেস্টিভাল — কোড খুঁজে জিতুন সাইনড জার্সি!",
    ctaLabel: "খেলুন",
    brandColor: "#F5A800",
    brandInitials: "T",
    linkUrl: "https://www.teer.com.bd",
    impressions: 29850,
    clicks: 476,
  },

  // ── VIDEO_PREROLL (shorts pre-roll) ──
  {
    name: "Grameenphone — ভিডিও প্রি-রোল (ডেমো)",
    placement: "VIDEO_PREROLL",
    headline: "GP ইন্টারনেট — বিনা চার্জে লাইভ স্কোর ও হাইলাইটস",
    bodyText: "MyGP অ্যাপ থেকে এখনই চালু করুন ফ্রি ভিডিও প্যাক",
    ctaLabel: "সাবস্ক্রাইব করুন",
    brandColor: "#009FE3",
    brandInitials: "GP",
    linkUrl: "https://www.grameenphone.com",
    impressions: 15760,
    clicks: 402,
  },
  {
    name: "Daraz — ভিডিও প্রি-রোল (ডেমো)",
    placement: "VIDEO_PREROLL",
    headline: "Daraz ১১.১১ মেগা সেল — ফুটবল মার্চেন্ডাইজ ৭০% ছাড়ে",
    bodyText: "প্রিমিয়াম জার্সি, বুট ও ফ্যান গিয়ার — স্টক সীমিত",
    ctaLabel: "এখনই দেখুন",
    brandColor: "#F57224",
    brandInitials: "DZ",
    linkUrl: "https://www.daraz.com.bd",
    impressions: 14230,
    clicks: 377,
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
        active: true,
        impressions: ad.impressions,
        clicks: ad.clicks,
      },
    });
  }
  const byPlacement = await db.adSlot.groupBy({ by: ["placement"], _count: true });
  console.log("✅ Demo ads seeded:", byPlacement.map((p) => `${p.placement}=${p._count}`).join(", "));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
