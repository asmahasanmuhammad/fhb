/**
 * Demo-data polish for client demos:
 * 1. Spread Post/Comment/Video timestamps over the past 72h so the
 *    community feed shows realistic variety instead of uniform "1d ago".
 * 2. Add extra demo ad creatives across every placement for richer rotation.
 * 3. Give creator users plausible follower counts.
 * Run: bun scripts/demo-polish.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const HOUR = 3600 * 1000;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function spreadTimestamps() {
  const posts = await db.post.findMany({ select: { id: true } });
  for (let i = 0; i < posts.length; i++) {
    const hoursAgo = 1 + i * rand(2, 6); // staggered, most recent first
    await db.post.update({
      where: { id: posts[i].id },
      data: { createdAt: new Date(Date.now() - hoursAgo * HOUR) },
    });
  }
  console.log(`posts: spread ${posts.length} timestamps`);

  const comments = await db.comment.findMany({ select: { id: true, createdAt: true } });
  for (const c of comments) {
    const drift = rand(-2, 6); // keep order roughly, slight natural drift
    await db.comment.update({
      where: { id: c.id },
      data: { createdAt: new Date(Math.max(Date.now() - 70 * HOUR, +c.createdAt + drift * HOUR / 2)) },
    });
  }
  console.log(`comments: adjusted ${comments.length}`);

  const videos = await db.video.findMany({ select: { id: true } });
  for (let i = 0; i < videos.length; i++) {
    const hoursAgo = 3 + i * rand(10, 30);
    await db.video.update({
      where: { id: videos[i].id },
      data: { createdAt: new Date(Date.now() - hoursAgo * HOUR) },
    });
  }
  console.log(`videos: spread ${videos.length} timestamps`);

  const articles = await db.newsArticle.findMany({ select: { id: true, featured: true } });
  for (let i = 0; i < articles.length; i++) {
    const hoursAgo = articles[i].featured ? rand(2, 10) : 6 + i * rand(8, 20);
    await db.newsArticle.update({
      where: { id: articles[i].id },
      data: { createdAt: new Date(Date.now() - hoursAgo * HOUR) },
    });
  }
  console.log(`articles: spread ${articles.length} timestamps`);

  const users = await db.user.findMany({ where: { followerCount: 0 }, select: { id: true, role: true } });
  for (const u of users) {
    await db.user.update({
      where: { id: u.id },
      data: { followerCount: u.role === "ADMIN" ? rand(1200, 4800) : rand(40, 2600) },
    });
  }
  console.log(`users: bumped ${users.length} zero-follower counts`);
}

const EXTRA_ADS = [
  { name: "Aarong Dairy — Header (Demo)", placement: "HEADER_BANNER", headline: "Fuel your matchday — Aarong Dairy fresh energy drinks", bodyText: "Natural refreshment for every kick-off. Now in mango and lychee.", ctaLabel: "Shop Now", brandColor: "#0E7C3A", brandInitials: "AD", impressions: 8210, clicks: 194 },
  { name: "Uber Bangladesh — Header (Demo)", placement: "HEADER_BANNER", headline: "Stadium nights, zero parking stress — 20% off Uber rides", bodyText: "Ride to the ground with Uber. Code MATCHDAY20.", ctaLabel: "Get the App", brandColor: "#111111", brandInitials: "UB", impressions: 12980, clicks: 287 },
  { name: "Robi 4.5G — Sidebar (Demo)", placement: "SIDEBAR", headline: "Stream every goal in HD with Robi 4.5G match packs", bodyText: "Weekly sports data packs from Tk 49 — no buffering, no limits.", ctaLabel: "Activate", brandColor: "#E63312", brandInitials: "R4", impressions: 9340, clicks: 241 },
  { name: "Bata Bangladesh — Sidebar (Demo)", placement: "SIDEBAR", headline: "Kop your matchday boots — Bata Sport autumn drop", bodyText: "New firm-ground and turf silhouettes. Free delivery over Tk 2,000.", ctaLabel: "Shop Boots", brandColor: "#D22730", brandInitials: "BT", impressions: 7115, clicks: 168 },
  { name: "Teer Fuel — In-Feed (Demo)", placement: "IN_FEED", headline: "Teer Fuel — official energy partner of matchdays", bodyText: "Win match tickets with every crate. Every. Single. Week.", ctaLabel: "Join the Draw", brandColor: "#F59E0B", brandInitials: "TF", impressions: 6540, clicks: 209 },
  { name: "Chaldal — In-Feed (Demo)", placement: "IN_FEED", headline: "Matchday snacks delivered in 15 minutes", bodyText: "Chips, drinks and biryani kits — grocery shopping for the big game.", ctaLabel: "Order Now", brandColor: "#22C55E", brandInitials: "CD", impressions: 11220, clicks: 318 },
  { name: "Brac Bank — In-Feed (Demo)", placement: "IN_FEED", headline: "Astha — buy your season tickets in easy instalments", bodyText: "0% EMI on sports tickets with Brac Bank credit cards.", ctaLabel: "Learn More", brandColor: "#0A66C2", brandInitials: "BB", impressions: 5230, clicks: 122 },
  { name: "Sultan's Dine — Mobile (Demo)", placement: "MOBILE_BANNER", headline: "Full night of football? Full plate of kacchi first.", bodyText: "Sultan's Dine — open till 2 AM on matchdays.", ctaLabel: "Find a Table", brandColor: "#B45309", brandInitials: "SD", impressions: 4980, clicks: 143 },
  { name: "Freelancer.com BD — Mobile (Demo)", placement: "MOBILE_BANNER", headline: "Design football graphics. Get paid in bKash.", bodyText: "Top BD freelancers earn in USD — first 10 proposals free.", ctaLabel: "Start Free", brandColor: "#22C55E", brandInitials: "FL", impressions: 3890, clicks: 97 },
  { name: "Hayat Lounge — Preroll (Demo)", placement: "VIDEO_PREROLL", headline: "Highlights deserve a big screen — Hayat 55\" 4K TV", bodyText: "Cinema-grade motion clarity for every counter-attack.", ctaLabel: "View Offer", brandColor: "#7C3AED", brandInitials: "HL", impressions: 3040, clicks: 88 },
];

async function addExtraAds() {
  let added = 0;
  for (const ad of EXTRA_ADS) {
    const exists = await db.adSlot.findFirst({ where: { name: ad.name } });
    if (exists) continue;
    await db.adSlot.create({
      data: {
        name: ad.name,
        placement: ad.placement,
        provider: "ADSENSE",
        adCode: `<!-- FHB demo ${ad.placement} -->`,
        linkUrl: "#premium",
        ...ad,
        active: true,
      },
    });
    added++;
  }
  console.log(`ads: added ${added} extra creatives`);
  const byPlacement = await db.adSlot.groupBy({ by: ["placement"], _count: true });
  console.log("rotation:", byPlacement.map((g) => `${g.placement}=${g._count}`).join(" "));
}

async function main() {
  await spreadTimestamps();
  await addExtraAds();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
