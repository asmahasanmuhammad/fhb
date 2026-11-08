/**
 * Football Hub Bangladesh — Database Seeder
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

// ---------- deterministic RNG (so seed is stable-ish) ----------
let seedState = 20251108;
function rnd(): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}
function rint(min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

// ---------- image assets (OSS-hosted, reachable) ----------
const IMG = {
  stadium: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b1f722726072.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c310648b1512.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/41e83b0ccac0.jpg",
  ],
  action: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ce3c35abf03c.jpeg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/91cb72ce8290.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/47ce3d922168.jpg",
  ],
  ball: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/09b0b2786b61.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a1332fafe42c.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/33a032ecdab7.jpg",
  ],
  celebrate: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/640db6ee0583.jpeg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c2982ffcc12.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b5d6b6551d9a.jpg",
  ],
  coach: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4d385721ff8e.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/33791d63308c.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e01e4ff2a39a.jpg",
  ],
  dribble: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/83c3219a4b39.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ddab4fb90a30.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c693b80c1d84.jpg",
  ],
  fans: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bf8288a20516.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c1bddff4b074.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3dbea23a5446.jpg",
  ],
  goalkeeper: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/477ff7362772.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e43e193fc340.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3c2bdf743c17.jpg",
  ],
  training: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dd7609d0ae27.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9214036085bb.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ebd8c3ae6793.jpg",
  ],
  trophy: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2cea8dbe5b20.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1c0f2649feab.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6d7074e06eea.jpg",
  ],
};

async function main() {
  console.log("🌱 Seeding Football Hub Bangladesh...");

  // wipe in FK-safe order
  await db.like.deleteMany();
  await db.comment.deleteMany();
  await db.follow.deleteMany();
  await db.post.deleteMany();
  await db.earning.deleteMany();
  await db.payoutRequest.deleteMany();
  await db.subscription.deleteMany();
  await db.video.deleteMany();
  await db.newsArticle.deleteMany();
  await db.matchEvent.deleteMany();
  await db.match.deleteMany();
  await db.standing.deleteMany();
  await db.competition.deleteMany();
  await db.player.deleteMany();
  await db.team.deleteMany();
  await db.session.deleteMany();
  await db.membershipPlan.deleteMany();
  await db.adSlot.deleteMany();
  await db.user.deleteMany();

  // ================= USERS =================
  const admin = await db.user.create({
    data: {
      email: "admin@fhb.com.bd",
      username: "fhbadmin",
      name: "FHB অ্যাডমিন",
      passwordHash: hashPassword("Admin@2025"),
      role: "ADMIN",
      bio: "Football Hub Bangladesh-এর অফিসিয়াল অ্যাডমিন অ্যাকাউন্ট।",
      avatarUrl: null,
    },
  });
  const editor = await db.user.create({
    data: {
      email: "editor@fhb.com.bd",
      username: "rashed_editor",
      name: "রাশেদুল ইসলাম",
      passwordHash: hashPassword("Editor@2025"),
      role: "ADMIN",
      bio: "ফুটবল সাংবাদিক — বিপিএল ও জাতীয় দল বিট।",
    },
  });
  const creator1 = await db.user.create({
    data: {
      email: "creator@fhb.com.bd",
      username: "shakil_khan",
      name: "শাকিল খান",
      passwordHash: hashPassword("Creator@2025"),
      role: "CREATOR",
      bio: "বিপিএল হাইলাইটস ও ফুটবল কনটেন্ট ক্রিয়েটর। প্রতিদিন নতুন শর্টস! ⚽🔥",
      followerCount: 12480,
    },
  });
  const creator2 = await db.user.create({
    data: {
      email: "guru@fhb.com.bd",
      username: "footballguru",
      name: "ফুটবল গুরু",
      passwordHash: hashPassword("Creator@2025"),
      role: "CREATOR",
      bio: "ট্যাকটিক্স ব্রেকডাউন, প্লেয়ার অ্যানালাইসিস আর গোলপোস্ট স্পেশাল 🎯",
      followerCount: 8730,
    },
  });

  const fanNames: Array<[string, string, string, string]> = [
    ["tanvir@fhb.com.bd", "tanvir10", "তানভীর আহমেদ", "লাল-সবুজের ডান পাখা 🇧🇩 আবাহনী ফ্যান বয়েজ!"],
    ["mim@fhb.com.bd", "mim_akter", "মিম আক্তার", "ফুটবল আমার প্রাণ 💚❤️ মোহামেডান সাপোর্টার"],
    ["sakib@fhb.com.bd", "sakib_h", "সাকিব হোসেন", "বসুন্ধরা কিংস 🦁 সুপার ফ্যান। ম্যাচ মানেই স্টেডিয়াম!"],
    ["nusrat@fhb.com.bd", "nusrat_j", "নুসরাত জাহান", "ফ্রি-কিক স্পেশালিস্ট ফ্যান 😄 ফুটবল নিয়েই সব"],
    ["rakib@fhb.com.bd", "rakib_bd", "রাকিব হাসান", "বাংলাদেশের ফুটবল উন্নতি চাই, সাফ চ্যাম্পিয়ন হবেই ইনশাআল্লাহ!"],
  ];
  const fans = [];
  for (const [email, username, name, bio] of fanNames) {
    fans.push(
      await db.user.create({
        data: {
          email,
          username,
          name,
          passwordHash: hashPassword("Fan@2025"),
          role: "USER",
          bio,
        },
      })
    );
  }
  // premium fan
  await db.user.update({ where: { id: fans[1].id }, data: { isPremium: true, premiumUntil: new Date(Date.now() + 25 * 864e5) } });
  await db.subscription.create({
    data: {
      userId: fans[1].id,
      planCode: "PRO",
      amount: 149,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 25 * 864e5),
    },
  });

  // ================= TEAMS (BPL 2025-26) =================
  const teamDefs = [
    { name: "বসুন্ধরা কিংস", shortName: "Bashundhara Kings", initials: "BK", city: "ঢাকা", stadium: "বসুন্ধরা কিংস এরিনা", founded: 2013, color: "#E11D48", color2: "#4C0519", strength: 0.92 },
    { name: "আবাহনী লিমিটেড ঢাকা", shortName: "Abahani Ltd Dhaka", initials: "AB", city: "ঢাকা", stadium: "আবাহনী গ্রাউন্ড, ধানমন্ডি", founded: 1972, color: "#0891B2", color2: "#083344", strength: 0.84 },
    { name: "মোহামেডান স্পোর্টিং ক্লাব", shortName: "Mohammedan SC", initials: "MSC", city: "ঢাকা", stadium: "বীরশ্রেষ্ঠ শহীদ সিপাহী কামাল স্টেডিয়াম", founded: 1936, color: "#059669", color2: "#022C22", strength: 0.82 },
    { name: "শেখ রাসেল ক্রীড়া চক্র", shortName: "Sheikh Russel KC", initials: "SR", city: "ঢাকা", stadium: "রফিকউদ্দিন ভূঁইয়া স্টেডিয়াম, টঙ্গী", founded: 1995, color: "#7C3AED", color2: "#2E1065", strength: 0.71 },
    { name: "সাইফ স্পোর্টিং ক্লাব", shortName: "Saif SC", initials: "SAIF", city: "ঢাকা", stadium: "সাইফ মালিবাগ চত্বর মাঠ", founded: 2016, color: "#B91C1C", color2: "#450A0A", strength: 0.68 },
    { name: "ফোর্টিস ফুটবল ক্লাব", shortName: "Fortis FC", initials: "FTS", city: "ঢাকা", stadium: "ফোর্টিস এরিনা, আমুলিয়া", founded: 2020, color: "#CA8A04", color2: "#422006", strength: 0.61 },
    { name: "বাংলাদেশ পুলিশ ফুটবল ক্লাব", shortName: "Police FC", initials: "POL", city: "ঢাকা", stadium: "পুলিশ গ্রাউন্ড, রাজারবাগ", founded: 1972, color: "#475569", color2: "#0F172A", strength: 0.56 },
    { name: "রহমতগঞ্জ মুসলিম ফ্রেন্ডস সোসাইটি", shortName: "Rahmatganj MFS", initials: "RJ", city: "ঢাকা", stadium: "রহমতগঞ্জ মাঠ", founded: 1933, color: "#B45309", color2: "#451A03", strength: 0.51 },
    { name: "মুক্তিযোদ্ধা সংস্কৃতি কেন্দ্র", shortName: "Muktijoddha SKC", initials: "MSK", city: "ঢাকা", stadium: "মুক্তিযোদ্ধা সংস্কৃতি কেন্দ্র মাঠ", founded: 1972, color: "#DC2626", color2: "#450A0A", strength: 0.49 },
    { name: "ব্রাদার্স ইউনিয়ন", shortName: "Brothers Union", initials: "BU", city: "ঢাকা", stadium: "গোপীবাগ ব্রাদার্স ইউনিয়ন মাঠ", founded: 1949, color: "#EA580C", color2: "#431407", strength: 0.46 },
  ];
  const teams: Record<string, string> = {};
  for (const t of teamDefs) {
    const team = await db.team.create({
      data: {
        name: t.name,
        shortName: t.shortName,
        initials: t.initials,
        city: t.city,
        stadium: t.stadium,
        founded: t.founded,
        color: t.color,
        color2: t.color2,
        description: `${t.city}ভিত্তিক ${t.shortName} — বাংলাদেশ প্রিমিয়ার লিগের নিয়মিত প্রতিযোগী। হোম ভেন্যু: ${t.stadium}।`,
      },
    });
    teams[t.initials] = team.id;
  }

  // ================= PLAYERS =================
  type PDef = { name: string; team: string; pos: string; num: number; nat?: string; by?: number; nt?: boolean; goals?: number; assists?: number; apps?: number; rating?: number; cs?: number; bio?: string; };
  const playerDefs: PDef[] = [
    // Bashundhara Kings
    { name: "মিতুল মারমা", team: "BK", pos: "GK", num: 1, nt: true, cs: 5, apps: 7, rating: 7.3, bio: "জাতীয় দলের পছন্দের গোলরক্ষক, রিফ্লেক্সে অসাধারণ।" },
    { name: "তপু বড়ুয়ান", team: "BK", pos: "DF", num: 5, nt: true, goals: 2, apps: 7, rating: 7.6, bio: "জাতীয় দলের অধিনায়কসুলভ ডিফেন্ডার, এয়ারিয়াল ডুয়েলে শক্তিশালী।" },
    { name: "রাকিব হোসেন", team: "BK", pos: "MF", num: 7, nt: true, goals: 3, assists: 5, apps: 7, rating: 7.9, bio: "সেট-পিস স্পেশালিস্ট উইঙ্গার, ফ্রি-কিকে জাদুকর।" },
    { name: "মোহাম্মদ ইব্রাহিম", team: "BK", pos: "FW", num: 11, nt: true, goals: 4, assists: 2, apps: 7, rating: 7.7, bio: "গতিশীল উইঙ্গার, ড্রিবলিংয়ে প্রতিপক্ষের ভয়ের নাম।" },
    { name: "শেখ মোরশালিন", team: "BK", pos: "FW", num: 9, nt: true, goals: 5, apps: 7, rating: 7.8, bio: "গ্রাম ফুটবল থেকে বিপিএল স্টার — ফিনিশিং তার ব্র্যান্ড।" },
    { name: "রানিয়েল", team: "BK", pos: "FW", num: 10, nat: "ব্রাজিল", goals: 6, assists: 3, apps: 7, rating: 8.1, bio: "ব্রাজিলিয়ান স্ট্রাইকার, লিগের সেরা ফরেন স্ট্রাইকারদের একজন।" },
    { name: "দোরিয়েলতন", team: "BK", pos: "FW", num: 99, nat: "ব্রাজিল", goals: 4, assists: 4, apps: 6, rating: 7.7 },
    { name: "মেহেদী হাসান", team: "BK", pos: "DF", num: 3, apps: 7, rating: 7.1, cs: 4 },
    // Abahani
    { name: "নবীব নেওয়াজ জিবন", team: "AB", pos: "FW", num: 9, nt: true, goals: 5, assists: 1, apps: 7, rating: 7.7, bio: "ভেটেরান স্ট্রাইকার, বক্সের ভেতরে চোখ ধাঁধানো মুভ।" },
    { name: "সোহেল রানা", team: "AB", pos: "MF", num: 6, nt: true, goals: 1, assists: 3, apps: 7, rating: 7.5, bio: "মিডফিল্ডের ইঞ্জিন, ট্যাকল আর পাসে সমান দক্ষ।" },
    { name: "ইয়াসিন খান", team: "AB", pos: "DF", num: 4, nt: true, goals: 1, apps: 6, rating: 7.2, bio: "অভিজ্ঞ সেন্টার-ব্যাক, নিজের এরিয়ায় দেয়াল।" },
    { name: "বিপ্লব আহমেদ", team: "AB", pos: "FW", num: 17, nt: true, goals: 3, assists: 2, apps: 6, rating: 7.4 },
    { name: "সাইফুল বারী টিটু", team: "AB", pos: "GK", num: 23, apps: 7, cs: 3, rating: 7.0 },
    { name: "স্যামুয়েল ওকোনকো", team: "AB", pos: "FW", num: 88, nat: "নাইজেরিয়া", goals: 4, apps: 7, rating: 7.5 },
    { name: "জুনিয়র সিলভা", team: "AB", pos: "MF", num: 8, nat: "ব্রাজিল", goals: 2, assists: 4, apps: 7, rating: 7.4 },
    // Mohammedan
    { name: "জামাল ভূঞা", team: "MSC", pos: "MF", num: 8, nt: true, goals: 2, assists: 4, apps: 7, rating: 7.8, bio: "বাংলাদেশ জাতীয় দলের অধিনায়ক, মিডফিল্ডের প্রাণপুরুষ। বিদেশে খেলা প্রথম বাংলাদেশি।" },
    { name: "ফয়সাল আহমেদ ফাহিম", team: "MSC", pos: "FW", num: 7, nt: true, goals: 4, assists: 3, apps: 7, rating: 7.6, bio: "তরুণ ও উদীয়মান স্ট্রাইকার, গতি তার অস্ত্র।" },
    { name: "বিশ্বনাথ ঘোষ", team: "MSC", pos: "DF", num: 5, nt: true, goals: 1, apps: 7, rating: 7.3 },
    { name: "আশিকুর রহমান", team: "MSC", pos: "GK", num: 1, nt: true, cs: 4, apps: 7, rating: 7.2 },
    { name: "মার্কোস ফেরেইরা", team: "MSC", pos: "DF", num: 44, nat: "ব্রাজিল", goals: 1, apps: 7, rating: 7.1 },
    { name: "কোফি আপিয়া", team: "MSC", pos: "FW", num: 77, nat: "ঘানা", goals: 3, apps: 6, rating: 7.3 },
    // Sheikh Russel
    { name: "তৌহিদুল ইসলাম সবুজ", team: "SR", pos: "MF", num: 10, nt: true, goals: 2, assists: 2, apps: 7, rating: 7.2 },
    { name: "রাশেদুল পালোয়ান", team: "SR", pos: "FW", num: 9, goals: 3, apps: 7, rating: 7.0 },
    { name: "মাহফুজুর রহমান", team: "SR", pos: "GK", num: 30, apps: 7, cs: 2, rating: 6.8 },
    { name: "ড্যানিয়েল মেন্ডেস", team: "SR", pos: "MF", num: 20, nat: "ব্রাজিল", goals: 2, assists: 3, apps: 7, rating: 7.1 },
    // Saif SC
    { name: "রাহাত মিয়া", team: "SAIF", pos: "DF", num: 2, apps: 7, rating: 6.9 },
    { name: "জুনায়েদ আহমেদ", team: "SAIF", pos: "MF", num: 14, goals: 2, apps: 7, rating: 7.0 },
    { name: "ইমরান খান", team: "SAIF", pos: "FW", num: 11, goals: 3, assists: 1, apps: 7, rating: 7.1 },
    { name: "আর্নেস্ট বোয়াটেং", team: "SAIF", pos: "FW", num: 9, nat: "ঘানা", goals: 4, apps: 7, rating: 7.2 },
    { name: "শহীদুল ইসলাম", team: "SAIF", pos: "GK", num: 1, apps: 6, cs: 2, rating: 6.7 },
    // Fortis
    { name: "ফারহান সিদ্দিক", team: "FTS", pos: "MF", num: 8, goals: 2, assists: 2, apps: 7, rating: 6.9 },
    { name: "তানজিল আহমেদ", team: "FTS", pos: "FW", num: 7, goals: 2, apps: 7, rating: 6.8 },
    { name: "মোজাম্মেল হোসেন", team: "FTS", pos: "DF", num: 4, goals: 1, apps: 7, rating: 6.8 },
    { name: "নাঈম উদ্দিন", team: "FTS", pos: "GK", num: 21, apps: 7, cs: 1, rating: 6.6 },
    // Police
    { name: "কামরুল হাসান", team: "POL", pos: "MF", num: 6, goals: 1, apps: 7, rating: 6.7 },
    { name: "শাহরিয়ার কবির", team: "POL", pos: "FW", num: 9, goals: 2, apps: 7, rating: 6.8 },
    { name: "আনিসুর রহমান", team: "POL", pos: "GK", num: 1, apps: 7, cs: 1, rating: 6.6 },
    { name: "রিয়াদ হোসেন", team: "POL", pos: "DF", num: 3, apps: 6, rating: 6.5 },
    // Rahmatganj
    { name: "তাসিকুল ইসলাম", team: "RJ", pos: "FW", num: 10, goals: 3, apps: 7, rating: 7.0 },
    { name: "তুতুল হোসেন বাদশা", team: "RJ", pos: "FW", num: 9, nt: true, goals: 2, apps: 7, rating: 6.9 },
    { name: "মোস্তাফিজুর রহমান", team: "RJ", pos: "GK", num: 1, apps: 7, cs: 1, rating: 6.5 },
    { name: "সুমন বড়ুয়া", team: "RJ", pos: "MF", num: 8, goals: 1, apps: 7, rating: 6.6 },
    // Muktijoddha
    { name: "নাজমুল হাসান", team: "MSK", pos: "DF", num: 5, goals: 1, apps: 7, rating: 6.7 },
    { name: "হাসিবুর রহমান", team: "MSK", pos: "MF", num: 7, goals: 1, apps: 7, rating: 6.6 },
    { name: "রুস্তম আলী", team: "MSK", pos: "FW", num: 9, goals: 2, apps: 7, rating: 6.7 },
    { name: "ইকবাল হোসেন", team: "MSK", pos: "GK", num: 22, apps: 7, cs: 0, rating: 6.4 },
    // Brothers Union
    { name: "সাজিদ হোসেন", team: "BU", pos: "MF", num: 10, goals: 1, apps: 7, rating: 6.5 },
    { name: "আরিফুল ইসলাম", team: "BU", pos: "FW", num: 11, goals: 2, apps: 7, rating: 6.6 },
    { name: "জুবায়ের আহমেদ", team: "BU", pos: "GK", num: 1, apps: 7, cs: 1, rating: 6.3 },
    { name: "শাকিল আহমেদ", team: "BU", pos: "DF", num: 6, apps: 7, rating: 6.4 },
    // National team stars not in BPL clubs (foreign based)
    { name: "হামজা চৌধুরী", team: "", pos: "MF", num: 17, nat: "ইংল্যান্ড (বাংলাদেশি বংশোদ্ভূত)", nt: true, by: 1997, goals: 1, apps: 3, rating: 8.4, bio: "ইংলিশ প্রিমিয়ার লিগের ক্লাব লিসেস্টার সিটির মিডফিল্ডার। ২০২৫ সালে বাংলাদেশ জাতীয় দলে যোগ দেওয়া সবচেয়ে আলোচিত সাইনিং — বাংলাদেশি বংশোদ্ভূত প্রথম প্রিমিয়ার লিগ খেলোয়াড়।" },
    { name: "রেজাউল হাসান জীবন", team: "", pos: "DF", num: 3, nt: true, by: 1999, goals: 0, apps: 3, rating: 7.0 },
  ];

  const playerIds: Record<string, string> = {};
  for (const p of playerDefs) {
    const player = await db.player.create({
      data: {
        name: p.name,
        teamId: p.team ? teams[p.team] : null,
        position: p.pos,
        nationality: p.nat ?? "বাংলাদেশ",
        jerseyNumber: p.num,
        birthYear: p.by ?? rint(1993, 2004),
        heightCm: rint(165, 188),
        goals: p.goals ?? 0,
        assists: p.assists ?? 0,
        appearances: p.apps ?? 0,
        cleanSheets: p.cs ?? 0,
        rating: p.rating ?? 6.5,
        isNationalTeam: p.nt ?? false,
        bio: p.bio ?? `${p.pos === "GK" ? "গোলরক্ষক" : p.pos === "DF" ? "ডিফেন্ডার" : p.pos === "MF" ? "মিডফিল্ডার" : "ফরোয়ার্ড"} — বিপিএলে নিয়মিত পারফর্ম করছেন।`,
      },
    });
    playerIds[p.name] = player.id;
  }

  // ================= COMPETITIONS =================
  const bpl = await db.competition.create({
    data: {
      name: "বাংলাদেশ প্রিমিয়ার লিগ",
      shortName: "BPL",
      type: "LEAGUE",
      season: "2025-26",
      country: "বাংলাদেশ",
      accentColor: "#1FE07A",
      description:
        "দেশের শীর্ষ ফুটবল লিগ — ১০টি ক্লাব, হোম-অ্যান্ড-অ্যাওয়ে ফরম্যাটে মোট ১৮ রাউন্ড। চ্যাম্পিয়ন দল এএফসি চ্যাম্পিয়ন্স লিগ টু-তে খেলার সুযোগ পায়।",
    },
  });
  const fedCup = await db.competition.create({
    data: {
      name: "ফেডারেশন কাপ",
      shortName: "Federation Cup",
      type: "CUP",
      season: "2025-26",
      country: "বাংলাদেশ",
      accentColor: "#F5C24B",
      description: "বাংলাদেশের সবচেয়ে পুরোনো ক্লাব কাপ টুর্নামেন্ট — নকআউট ফরম্যাটে দেশের সেরা ক্লাবগুলোর লড়াই।",
    },
  });
  const saff = await db.competition.create({
    data: {
      name: "সাফ চ্যাম্পিয়নশিপ",
      shortName: "SAFF Championship",
      type: "INTERNATIONAL",
      season: "2025",
      country: "সাফ অঞ্চল",
      accentColor: "#FF5A48",
      description: "দক্ষিণ এশিয়ার শীর্ষ আন্তর্জাতিক ফুটবল টুর্নামেন্ট। বাংলাদেশ, ভারত, মালদ্বীপসহ ৭ দেশের অংশগ্রহণ।",
    },
  });

  // ================= BPL ROUND-ROBIN FIXTURES =================
  // circle method: 10 teams, 9 rounds. Rounds 1-7 finished, round 8 partially live/upcoming, round 9 scheduled.
  const order = ["BK", "AB", "MSC", "SR", "SAIF", "FTS", "POL", "RJ", "MSK", "BU"];
  const rounds: Array<Array<[string, string]>> = [];
  const arr = [...order];
  for (let r = 0; r < 9; r++) {
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < 5; i++) {
      const a = arr[i];
      const b = arr[9 - i];
      pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    // rotate: keep first fixed
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  const strength: Record<string, number> = {};
  teamDefs.forEach((t) => (strength[t.initials] = t.strength));

  function genScore(h: string, a: string): [number, number] {
    const diff = strength[h] - strength[a];
    const hx = Math.max(0, Math.round(1.4 + diff * 6 + (rnd() - 0.5) * 2.2));
    const ax = Math.max(0, Math.round(1.1 - diff * 6 + (rnd() - 0.5) * 2.2));
    return [Math.min(hx, 5), Math.min(ax, 4)];
  }

  async function scorersFor(teamKey: string, n: number): Promise<string[]> {
    const squad = playerDefs.filter((p) => p.team === teamKey && p.pos !== "GK");
    const weighted = squad.flatMap((p) => [...Array((p.goals ?? 0) + 1)].map(() => p.name));
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(pick(weighted.length ? weighted : squad.map((s) => s.name)));
    return out;
  }

  const now = new Date();
  const DAY = 864e5;

  // rounds 1..7 finished
  for (let r = 0; r < 7; r++) {
    const matchday = r + 1;
    const daysAgo = 22 - r * 3; // round 7 = 4 days ago, round 1 = 22 days ago
    for (const [h, a] of rounds[r]) {
      const [hs, as] = genScore(h, a);
      const kickoff = new Date(now.getTime() - daysAgo * DAY - rint(0, 1) * DAY);
      kickoff.setHours(rint(15, 20), pick([0, 15, 30, 45]), 0, 0);
      const m = await db.match.create({
        data: {
          competitionId: bpl.id,
          homeTeamId: teams[h],
          awayTeamId: teams[a],
          homeScore: hs,
          awayScore: as,
          status: "FINISHED",
          period: "FT",
          kickoff,
          venue: teamDefs.find((t) => t.initials === h)!.stadium,
          matchday,
        },
      });
      // goal events
      for (let i = 0; i < hs; i++) {
        const [name] = await scorersFor(h, 1);
        await db.matchEvent.create({
          data: { matchId: m.id, minute: rint(3, 90), type: "GOAL", teamId: teams[h], teamSide: "home", playerName: name, detail: "গোল" },
        });
      }
      for (let i = 0; i < as; i++) {
        const [name] = await scorersFor(a, 1);
        await db.matchEvent.create({
          data: { matchId: m.id, minute: rint(3, 90), type: "GOAL", teamId: teams[a], teamSide: "away", playerName: name, detail: "গোল" },
        });
      }
      await db.matchEvent.create({
        data: { matchId: m.id, minute: 45, type: "HT", detail: "হাফ-টাইম" },
      });
      await db.matchEvent.create({
        data: { matchId: m.id, minute: 90, type: "FT", detail: "ফুল-টাইম" },
      });
    }
  }

  // ---- Round 8: 2 LIVE + 1 upcoming today + 2 upcoming ----
  const r8pairs = rounds[7]; // 5 pairs
  const live1 = r8pairs[0]; // BK vs ? — make it the derby: reorder so BK plays MSC
  // find pair containing BK and MSC if possible, else construct derby manually
  let derbyIdx = r8pairs.findIndex(([h, a]) => (h === "BK" && a === "MSC") || (h === "MSC" && a === "BK"));
  let live2Pair: [string, string];
  let upcomingPairs: Array<[string, string]>;
  let derbyPair: [string, string];
  if (derbyIdx >= 0) {
    derbyPair = r8pairs[derbyIdx];
    const rest = r8pairs.filter((_, i) => i !== derbyIdx);
    live2Pair = rest[0];
    upcomingPairs = rest.slice(1);
  } else {
    // force: swap to create derby
    derbyPair = ["BK", "MSC"];
    const restTeams = ["AB", "SR", "SAIF", "FTS", "POL", "RJ", "MSK", "BU"];
    live2Pair = [restTeams[0], restTeams[1]];
    upcomingPairs = [[restTeams[2], restTeams[3]], [restTeams[4], restTeams[5]]];
  }

  async function createLive(pair: [string, string], minute: number) {
    const [h, a] = pair;
    const kickoff = new Date(now.getTime() - (minute + rint(2, 6)) * 60 * 1000);
    const m = await db.match.create({
      data: {
        competitionId: bpl.id,
        homeTeamId: teams[h],
        awayTeamId: teams[a],
        homeScore: 0,
        awayScore: 0,
        status: "LIVE",
        minute,
        period: minute <= 45 ? "1H" : "2H",
        kickoff,
        venue: teamDefs.find((t) => t.initials === h)!.stadium,
        matchday: 8,
        featured: h === "BK" || a === "BK",
      },
    });
    // initial events: one early goal each
    const [hname] = await scorersFor(h, 1);
    const [aname] = await scorersFor(a, 1);
    await db.matchEvent.create({
      data: { matchId: m.id, minute: Math.max(2, minute - rint(18, 30)), type: "GOAL", teamId: teams[h], teamSide: "home", playerName: hname, detail: "গোল" },
    });
    await db.matchEvent.create({
      data: { matchId: m.id, minute: Math.max(4, minute - rint(5, 14)), type: "YELLOW", teamId: teams[a], teamSide: "away", playerName: aname, detail: "হলুদ কার্ড" },
    });
    return m;
  }

  const liveMatch1 = await createLive(derbyPair, 37); // বসুন্ধরা বনাম মোহামেডান — ডার্বি লাইভ!
  const liveMatch2 = await createLive(live2Pair, 68);
  // give live2 a goal
  {
    const [h, a] = live2Pair;
    const [name] = await scorersFor(h, 1);
    await db.matchEvent.create({ data: { matchId: liveMatch2.id, minute: 24, type: "GOAL", teamId: teams[h], teamSide: "home", playerName: name, detail: "গোল" } });
    await db.match.update({ where: { id: liveMatch2.id }, data: { homeScore: 1, awayScore: 0 } });
  }

  // upcoming today (this evening) + next days
  for (let i = 0; i < upcomingPairs.length; i++) {
    const [h, a] = upcomingPairs[i];
    const kickoff = new Date(now.getTime() + (4 + i * 3) * 3600 * 1000);
    await db.match.create({
      data: {
        competitionId: bpl.id,
        homeTeamId: teams[h],
        awayTeamId: teams[a],
        status: "SCHEDULED",
        kickoff,
        venue: teamDefs.find((t) => t.initials === h)!.stadium,
        matchday: 8,
      },
    });
  }
  // round 9 next week
  for (const [h, a] of rounds[8]) {
    const kickoff = new Date(now.getTime() + (7 + rint(0, 2)) * DAY);
    kickoff.setHours(pick([15, 17, 19]), pick([0, 30]), 0, 0);
    await db.match.create({
      data: {
        competitionId: bpl.id,
        homeTeamId: teams[h],
        awayTeamId: teams[a],
        status: "SCHEDULED",
        kickoff,
        venue: teamDefs.find((t) => t.initials === h)!.stadium,
        matchday: 9,
      },
    });
  }

  // ================= FEDERATION CUP =================
  const fcPairs: Array<[[string, string], number, number]> = [
    [["MSC", "FTS"], 2, 0],
    [["AB", "RJ"], 3, 1],
    [["BK", "MSK"], 4, 1],
    [["SR", "POL"], 1, 1],
  ];
  for (const [[h, a], hs, as] of fcPairs) {
    let winner = h;
    let finalH = hs;
    let finalA = as;
    if (hs === as) winner = rnd() > 0.5 ? h : a;
    const kickoff = new Date(now.getTime() - rint(10, 16) * DAY);
    kickoff.setHours(19, 30, 0, 0);
    const m = await db.match.create({
      data: {
        competitionId: fedCup.id,
        homeTeamId: teams[h],
        awayTeamId: teams[a],
        homeScore: finalH,
        awayScore: finalA,
        status: "FINISHED",
        period: "FT",
        kickoff,
        venue: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা",
        round: "কোয়ার্টার ফাইনাল",
      },
    });
    for (let i = 0; i < finalH; i++) {
      const [n] = await scorersFor(h, 1);
      await db.matchEvent.create({ data: { matchId: m.id, minute: rint(5, 88), type: "GOAL", teamSide: "home", teamId: teams[h], playerName: n, detail: "গোল" } });
    }
    for (let i = 0; i < finalA; i++) {
      const [n] = await scorersFor(a, 1);
      await db.matchEvent.create({ data: { matchId: m.id, minute: rint(5, 88), type: "GOAL", teamSide: "away", teamId: teams[a], playerName: n, detail: "গোল" } });
    }
  }
  // semifinal upcoming
  await db.match.create({
    data: {
      competitionId: fedCup.id,
      homeTeamId: teams["MSC"],
      awayTeamId: teams["AB"],
      status: "SCHEDULED",
      kickoff: new Date(now.getTime() + 5 * DAY),
      venue: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা",
      round: "সেমিফাইনাল",
      featured: true,
    },
  });
  await db.match.create({
    data: {
      competitionId: fedCup.id,
      homeTeamId: teams["BK"],
      awayTeamId: teams["SR"],
      status: "SCHEDULED",
      kickoff: new Date(now.getTime() + 6 * DAY),
      venue: "বসুন্ধরা কিংস এরিনা, ঢাকা",
      round: "সেমিফাইনাল",
    },
  });

  // ================= SAFF (national team) =================
  // Bangladesh "team" — use a pseudo team? We need Team rows for matches. Create national team entries.
  const bd = await db.team.create({
    data: {
      name: "বাংলাদেশ জাতীয় ফুটবল দল",
      shortName: "Bangladesh",
      initials: "BAN",
      city: "ঢাকা",
      stadium: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম",
      founded: 1972,
      color: "#006A4E",
      color2: "#F42A41",
      description: "লাল-সবুজের প্রতিনিধি — সাফ অঞ্চলের অন্যতম জনপ্রিয় দল। ফিফা র‍্যাঙ্কিং উন্নতির ধারায়।",
    },
  });
  const india = await db.team.create({
    data: { name: "ভারত জাতীয় ফুটবল দল", shortName: "India", initials: "IND", city: "নয়াদিল্লি", stadium: "জওহরলাল নেহেরু স্টেডিয়াম", founded: 1938, color: "#2563EB", color2: "#1E3A8A", description: "সাফ অঞ্চলের শীর্ষ দল।" },
  });
  const maldives = await db.team.create({
    data: { name: "মালদ্বীপ জাতীয় ফুটবল দল", shortName: "Maldives", initials: "MDV", city: "মালে", stadium: "গালোলহু জাতীয় স্টেডিয়াম", founded: 1952, color: "#DC2626", color2: "#7F1D1D", description: "সাফ অঞ্চলের শক্তিশালী দল।" },
  });

  const saff1 = await db.match.create({
    data: {
      competitionId: saff.id,
      homeTeamId: bd.id,
      awayTeamId: india.id,
      homeScore: 1,
      awayScore: 1,
      status: "FINISHED",
      period: "FT",
      kickoff: new Date(now.getTime() - 12 * DAY),
      venue: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা",
      round: "গ্রুপ পর্ব",
      featured: true,
    },
  });
  await db.matchEvent.create({ data: { matchId: saff1.id, minute: 34, type: "GOAL", teamId: bd.id, teamSide: "home", playerName: "ফয়সাল আহমেদ ফাহিম", detail: "গোল" } });
  await db.matchEvent.create({ data: { matchId: saff1.id, minute: 61, type: "GOAL", teamId: india.id, teamSide: "away", playerName: "সুনিল ছেত্রী", detail: "গোল (পেনাল্টি)" } });
  await db.match.create({
    data: {
      competitionId: saff.id,
      homeTeamId: bd.id,
      awayTeamId: maldives.id,
      homeScore: 2,
      awayScore: 0,
      status: "FINISHED",
      period: "FT",
      kickoff: new Date(now.getTime() - 8 * DAY),
      venue: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা",
      round: "গ্রুপ পর্ব",
    },
  });
  await db.match.create({
    data: {
      competitionId: saff.id,
      homeTeamId: bd.id,
      awayTeamId: india.id,
      status: "SCHEDULED",
      kickoff: new Date(now.getTime() + 3 * DAY),
      venue: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা",
      round: "সেমিফাইনাল",
      featured: true,
    },
  });

  // ================= STANDINGS (computed from finished BPL matches) =================
  type Row = { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number; form: string[] };
  const table: Record<string, Row> = {};
  order.forEach((k) => (table[k] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, form: [] }));
  const finishedBpl = await db.match.findMany({
    where: { competitionId: bpl.id, status: "FINISHED" },
    include: { homeTeam: true, awayTeam: true },
  });
  for (const m of finishedBpl) {
    const hk = m.homeTeam.initials;
    const ak = m.awayTeam.initials;
    if (!table[hk] || !table[ak]) continue;
    const hs = m.homeScore ?? 0;
    const as = m.awayScore ?? 0;
    table[hk].played++; table[ak].played++;
    table[hk].gf += hs; table[hk].ga += as;
    table[ak].gf += as; table[ak].ga += hs;
    if (hs > as) { table[hk].won++; table[hk].points += 3; table[ak].lost++; table[hk].form.push("W"); table[ak].form.push("L"); }
    else if (hs < as) { table[ak].won++; table[ak].points += 3; table[hk].lost++; table[ak].form.push("W"); table[hk].form.push("L"); }
    else { table[hk].drawn++; table[ak].drawn++; table[hk].points++; table[ak].points++; table[hk].form.push("D"); table[ak].form.push("D"); }
  }
  const sorted = Object.entries(table).sort((a, b) => b[1].points - a[1].points || b[1].gf - b[1].ga - (a[1].gf - a[1].ga) || b[1].gf - a[1].gf);
  let pos = 1;
  for (const [k, row] of sorted) {
    await db.standing.create({
      data: {
        competitionId: bpl.id,
        teamId: teams[k],
        position: pos++,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.gf,
        goalsAgainst: row.ga,
        points: row.points,
        form: row.form.slice(-5).join(""),
      },
    });
  }

  // ================= NEWS =================
  const day = (n: number) => new Date(now.getTime() - n * DAY);
  const articles = [
    {
      title: "হামজা চৌধুরী লাল-সবুজে: বাংলাদেশ ফুটবলের ইতিহাসে নতুন অধ্যায়",
      category: "NATIONAL",
      featured: true,
      cover: IMG.celebrate[0],
      views: 48210,
      likes: 1240,
      excerpt: "ইংলিশ প্রিমিয়ার লিগের তারকা মিডফিল্ডার হামজা চৌধুরী বাংলাদেশ জাতীয় দলের জার্সি গায়ে মাঠে নামছেন — বাংলাদেশি বংশোদ্ভূত এই প্রথম প্রিমিয়ার লিগ খেলোয়াড়।",
      content: `সিলেটের এক বাংলাদেশি পরিবারের ছেলে, ইংল্যান্ডের মাটিতে বেড়ে ওঠা, আর আজ লাল-সবুজের জার্সি — হামজা চৌধুরীর গল্পটা স্বপ্নের মতোই। লিসেস্টার সিটির হয়ে প্রিমিয়ার লিগ আর এফএ কাপ জিতেছেন যিনি, সেই খেলোয়াড় এবার বাংলাদেশ জাতীয় দলের হয়ে মাঠে নামতে যাচ্ছেন।

## কেন এটা ঐতিহাসিক

বাংলাদেশ ফুটবলের ইতিহাসে এর আগে কখনো এই পর্যায়ের কোনো খেলোয়াড় জাতীয় দলে যোগ দেননি। প্রিমিয়ার লিগে ১০০ ম্যাচের বেশি খেলা মিডফিল্ডার যখন সাফ অঞ্চলের মাঠে নামবেন, তখন শুধু বাংলাদেশ নয় — পুরো দক্ষিণ এশিয়ার ফুটবল মানচিত্রেই এটা বড় সংবাদ।

## মিডফিল্ডে কী বদলাবে

- বল জয়ের হার উল্লেখযোগ্যভাবে বাড়বে
- দ্রুত ট্রানজিশনে সামনের সারিতে সরাসরি পাস
- সেট-পিসে বাড়তি শক্তি
- তরুণ খেলোয়াড়দের জন্য রোল মডেল

## সমর্থকদের প্রত্যাশা

সোশ্যাল মিডিয়ায় ইতোমধ্যে হ্যাশট্যাগ **#হামজা_বাংলাদেশে** ট্রেন্ডিং। ঢাকার মাঠে তাঁর প্রথম ম্যাচের টিকিট নিয়ে উৎসাহী সমর্থকদের ভিড় লেগেছে বারো থেকেই।

ফুটবল বিশ্লেষকরা বলছেন, হামজার আগমন শুধু মাঠের ভেতরেই নয় — বাংলাদেশ ফুটবলের ব্র্যান্ড ভ্যালু আর স্পনসরশিপেও নতুন দিগন্ত খুলে দেবে। সাফ সেমিফাইনালে তাঁর অভিষেক হতে পারে বলে জানিয়েছে বিএফএফ সূত্র।`,
    },
    {
      title: "বিপিএলে দাপুটে বসুন্ধরা: কিংস করপোরেশন এগিয়ে থাকল পয়েন্ট টেবিলে",
      category: "BPL",
      featured: false,
      cover: IMG.action[0],
      views: 32104,
      likes: 890,
      excerpt: "ঘরের মাঠে দাপুটে জয়ে লিগ টেবিলের শীর্ষে নিজের আধিপত্য ধরে রেখেছে ডিফেন্ডিং চ্যাম্পিয়ন বসুন্ধরা কিংস।",
      content: `বসুন্ধরা কিংস এরিনায় গতকালের ম্যাচে দর্শকদের উপভোগ্য ফুটবল উপহার দিয়েছে ডিফেন্ডিং চ্যাম্পিয়নরা। প্রথমার্ধেই দুই গোলের লিড নিয়ে তারা ম্যাচের নিয়ন্ত্রণ হাতে নেয়।

## ম্যাচ রিপোর্ট

প্রথমার্ধের ২২ মিনিটে রানিয়েলের পাস থেকে মোরশালিনের গোলে এগিয়ে যায় কিংস। ইনজুরি টাইমে রাকিব হোসেনের কার্লড ফ্রি-কিক জালে গিয়ে স্কোরলাইন ২-০ করে। দ্বিতীয়ার্ধে পাল্টা আক্রমণ করলেও ঘাটতি মানতে হয় প্রতিপক্ষকে।

## পয়েন্ট টেবিলে অবস্থান

টানা জয়ে কিংস তাদের শীর্ষস্থান আরও মজবুত করেছে। গোল ব্যবধানে তারা দ্বিতীয় স্থানের দলের চেয়ে অনেক এগিয়ে।

> "স্কোয়াডের গভীরতাই আমাদের শক্তি। মৌসুম লম্বা, এক ম্যাচে নয় — ধারাবাহিকতায় বিশ্বাস রাখি।" — কিংস কোচিং স্টাফ

পরের রাউন্ডে তাদের মুখোমুখি হতে চলেছে প্রতিদ্বন্দ্বী মোহামেডান — যেটাকে সবাই বলছে মৌসুমের আসল পরীক্ষা।`,
    },
    {
      title: "ট্রান্সফার বাজার গরম: মোহামেডানের হয়ে খেলতে চান ব্রাজিলিয়ান স্ট্রাইকার",
      category: "TRANSFER",
      featured: false,
      cover: IMG.dribble[0],
      views: 27650,
      likes: 540,
      excerpt: "মধ্যপ্রাচ্যের লিগ থেকে ফিরছেন অভিজ্ঞ ফরোয়ার্ড — মোটবাইকের গুজব নিয়ে আলোচনায় মোহামেডান ক্যাম্প।",
      content: `জানা গেছে, মোহামেডান এসসি ম্যানেজমেন্ট ব্রাজিলিয়ান স্ট্রাইকার নিয়ে আগ্রহী। সূত্র বলছে, খেলোয়াড়ের এজেন্টের সঙ্গে ইতিমধ্যে প্রাথমিক বৈঠক হয়েছে।

## চুক্তির শর্ত

- ১ বছরের চুক্তি + ১ বছরের এক্সটেনশন অপশন
- মাসিক বেতন ধরা হয়েছে বিপিএলের শীর্ষ ব্র্যাকেটে
- ম্যাচ-উইনিং বোনাস ধারা যুক্ত

মোহামেডান কর্তৃপক্ষ এ বিষয়ে আনুষ্ঠানিক স্বীকারোক্তি এখনো দেয়নি। তবে ক্লাব সূত্র বলছে, আক্রমণে বিদেশি কোটা পূরণে তারা যাচাই-বাছাই করছে একাধিক প্রোফাইল।

সমর্থকদের উচ্ছ্বাস দেখা যাচ্ছে সোশ্যাল মিডিয়ায় — অনেকেই মনে করছেন অভিজ্ঞ ব্রাজিলিয়ান যোগ দিলে সামনের সারিতে মোহামেডান হবে আরও ভয়ংকর। ট্রান্সফার উইন্ডো বন্ধ হওয়ার আগেই চূড়ান্ত সিদ্ধান্ত আসতে পারে বলে জানিয়েছে ক্লাব সংশ্লিষ্টরা।`,
    },
    {
      title: "আবাহনীতে ফেরার পথে জিবন? ক্লাব কর্তৃপক্ষের সঙ্গে বৈঠক শেষে ভালো বার্তা",
      category: "TRANSFER",
      featured: false,
      cover: IMG.action[1],
      views: 21380,
      likes: 460,
      excerpt: "জাতীয় দলের স্ট্রাইকার নবীব নেওয়াজ জিবনের পুরোনো ক্লাবে ফেরার বিষয়ে ইতিবাচক আলাপ চলছে বলে জানা গেছে।",
      content: `সূত্র জানাচ্ছে, আবাহনী কর্তৃপক্ষের সঙ্গে জিবনের সাক্ষাৎকার ইতিমধ্যে শেষ হয়েছে। খেলোয়াড় নিজেও ধানমন্ডির দর্শকদের ভালোবাসার কথা মনে করিয়ে দিয়েছেন।

## কী বাধা এখন

চুক্তির মেয়াদ আর বেতন কাঠামো নিয়ে এখনো কিছু আলোচনা বাকি। আবাহনী আনুষ্ঠানিক ঘোষণার আগে সব শর্ত চূড়ান্ত করতে চাইছে।

ফুটবলার বদলি বাজারে দর্শকদের নজর এখন এই দুই ক্লাবের দিকেই। কোন রঙের জার্সিতে জিবনকে দেখা যাবে — কয়েকদিনের মধ্যেই স্পষ্ট হবে বলে মনে করছে সংশ্লিষ্টরা।`,
    },
    {
      title: "সাফ সেমিফাইনালের প্রস্তুতি শুরু: ক্যাম্পে যোগ দিলেন সব তারকা",
      category: "NATIONAL",
      featured: false,
      cover: IMG.training[0],
      views: 19420,
      likes: 512,
      excerpt: "ভারতের বিপক্ষে সেমিফাইনালের আগে জাতীয় দলের প্রস্তুতি ক্যাম্প শুরু হয়েছে — হামজা চৌধুরীসহ সব নিয়মিত খেলোয়াড় উপস্থিত।",
      content: `জাতীয় দলের প্রস্তুতি ক্যাম্পে যোগ দিয়েছেন সব নিয়মিত খেলোয়াড়। কোচিং স্টাফ জানিয়েছে, এবারের ক্যাম্পে ফিটনেস ও সেট-পিসে বিশেষ জোর দেওয়া হচ্ছে।

## কোচের পরিকল্পনা

- প্রথম সপ্তাহ: ফিজিক্যাল ও রিকভারি
- দ্বিতীয় সপ্তাহ: ট্যাকটিক্যাল ড্রিল, সেট-পিস
- শেষ পর্ব: প্র্যাকটিস ম্যাচ

## আঘাতপ্রাপ্তদের খবর

ডিফেন্সে দুই জন খেলোয়াড় ছোটখাটো ইনজুরিতে আছেন, তবে ম্যাচের আগেই ফিরে আসার আশা করছে মেডিকেল টিম।

সমর্থকদের আবেগ জানিয়ে অধিনায়ক বলেছেন, "বঙ্গবন্ধু স্টেডিয়ামে আমাদের সেরা পারফরম্যান্স দেখানোর সুযোগ — দর্শকের সাপোর্টই আমাদের ১২তম খেলোয়াড়।"`,
    },
    {
      title: "ফেডারেশন কাপ সেমিফাইনালে মোহামেডান-আবাহনী ক্লাশ: পুরোনো প্রতিদ্বন্দ্বিতার নতুন অধ্যায়",
      category: "NATIONAL",
      featured: false,
      cover: IMG.stadium[0],
      views: 17650,
      likes: 380,
      excerpt: "ঢাকার ফুটবলের সবচেয়ে বড় দুই প্রতিদ্বন্দ্বী সেমিফাইনালে মুখোমুখি — টিকিটের চাহিদা তুঙ্গে।",
      content: `ফেডারেশন কাপের সেমিফাইনালে মুখোমুখি হচ্ছে ঢাকার ফুটবলের দুই ঐতিহ্যবাহী ক্লাব — মোহামেডান এসসি ও আবাহনী লিমিটেড। কোয়ার্টার ফাইনালে দাপুটে জয়ে দুই দলই শেষ চারে উঠেছে।

## কোয়ার্টার ফাইনালের ফলাফল

মোহামেডান ফোর্টিসকে ২-০ গোলের ব্যবধানে হারিয়েছে, আর আবাহনী এগিয়েছে রহমতগঞ্জকে ৩-১ গোলে হারিয়ে।

## স্টেডিয়াম ও টিকিট

ম্যাচ হবে বঙ্গবন্ধু জাতীয় স্টেডিয়ামে। গ্যালারির টিকিট ইতিমধ্যে প্রায় শেষ — অনলাইনে ব্ল্যাক মার্কেটিং ঠেকাতে বাড়তি নজরদারি চাইছে কর্তৃপক্ষ।

দুই ক্লাবের সমর্থকরা সোশ্যাল মিডিয়ায় তুমুল আলোচনায় — কে জিতবে এই ক্লাশ? আপনার ভবিষ্যদ্বাণী কমেন্টে জানান!`,
    },
    {
      title: "গোলরক্ষকদের যুদ্ধ: বিপিএলে এবার ক্লিন-শিটের রেকর্ড কার হবে?",
      category: "BPL",
      featured: false,
      cover: IMG.goalkeeper[0],
      views: 15230,
      likes: 320,
      excerpt: "মিতুল মারমা বনাম আশিকুর রহমান — ক্লিন-শিট তালিকায় তীব্র লড়াইয়ে দুই শীর্ষ গোলরক্ষক।",
      content: `এই মৌসুমের বিপিএল পরিসংখ্যানে সবচেয়ে মজার লড়াইটা হয়তো গোলরক্ষকদের মধ্যেই। ক্লিন-শিট তালিকায় শীর্ষে আছেন বসুন্ধরার মিতুল মারমা, একদম পিছনে মোহামেডানের আশিকুর রহমান।

## সেরা সেভের গল্প

শেষ রাউন্ডে মিতুলের পয়েন্ট-ব্ল্যাঙ্ক সেভ সোশ্যাল মিডিয়ায় ভাইরাল। বল ফিরিয়ে দেওয়ার রেকশন টাইম নিয়ে সমর্থকদের কৌতুক-মিশ্রিত বিশ্লেষণও কম নয়।

## পরিসংখ্যান কী বলছে

ডিফেন্সের সংগঠনই গোলরক্ষকদের সাফল্যের আসল চাবি — বলছেন বিশ্লেষকরা। যে দল কম শট ছাড়ে বক্সের ভেতরে, সেদের গোলরক্ষকের ক্লিন-শিট সংখ্যাও স্বাভাবিকভাবেই বাড়ে।`,
    },
    {
      title: "গ্রামের মাঠ থেকে বিপিএল: শেখ মোরশালিনের সংগ্রামের গল্প",
      category: "OPINION",
      featured: false,
      cover: IMG.training[1],
      views: 28910,
      likes: 1500,
      excerpt: "খালি পায়ে মাঠ ঘুরে বেড়ানো এক কিশোর, আজ জাতীয় দলের হয়ে গোল করছেন — মোরশালিনের গল্প বাংলাদেশ ফুটবলের ভবিষ্যতের রূপরেখা।",
      content: `নোয়াখালীর এক গ্রামের ধূলোমাখা মাঠ থেকে বসুন্ধরা কিংসের স্টার্টিং ইলেভেন — শেখ মোরশালিনের যাত্রা সহজ ছিল না। জুতা ছিল না, কিন্তু স্বপ্ন ছিল।

## স্কাউটিং থেকে স্টারডম

স্থানীয় টুর্নামেন্টে চোখ পড়েছিল এক স্কাউটের। তারপর একাডেমি, তারপর বিপিএল। ধারাবাহিক গোলে আজ তিনি জাতীয় দলের নিয়মিত সদস্য।

## এই গল্প কেন গুরুত্বপূর্ণ

বাংলাদেশের ফুটবলে ট্যালেন্টের অভাব নেই — অভাব সঠিক স্কাউটিং আর পরিকাঠামোর। মোরশালিনের মতো খেলোয়াড় প্রমাণ করে, সুযোগ পেলে গ্রামের মাঠও তারকা বানাতে পারে।

> "আমি জানতাম না পারব কি না। জানতাম শুধু — ছাড়ব না।" — শেখ মোরশালিন

এই মৌসুমে তাঁর গোল দেখে অনুপ্রাণিত হচ্ছে হাজারো কিশোর। হয়তো তাদেরই কেউ একদিন জার্সি গায়ে দেশের প্রতিনিধিত্ব করবে।`,
    },
    {
      title: "ট্রান্সফার: সাইফ এসসি ছাড়তে পারেন অধিনায়ক, চলছে আলাপ",
      category: "TRANSFER",
      featured: false,
      cover: IMG.coach[1],
      views: 12340,
      likes: 210,
      excerpt: "মৌসুম মাঝপথে ক্লাব ছাড়ার গুজব নিয়ে হইচই সাইফ এসসি ক্যাম্পে — ক্লাব সূত্র তা নিশ্চিত করেনি।",
      content: `সাইফ স্পোর্টিং ক্লাবের অধিনায়ক নিয়ে চলছে নানা গুজব। সূত্র বলছে, বিদেশি ক্লাব থেকে আগ্রহের কথা জানিয়ে সংশ্লিষ্ট খেলোয়াড়ের এজেন্ট ক্লাবকে জানিয়েছেন।

ক্লাব কর্তৃপক্ষ বলছে, চুক্তির আইনি দিক দেখা হচ্ছে। যদি সব শর্ত মেলে, তাহলে সুমুচুল সিদ্ধান্তে ছাড়া হতে পারে।

ফুটবল বদলি বাজারে জানুয়ারি অনেক দূরের বিষয় নয় — ততদিনে অনেক কিছুই বদলে যেতে পারে। আপডেট পেতে চোখ রাখুন FHB-তে।`,
    },
    {
      title: "এএফসি কাপ বাছাই: বাংলাদেশের ক্লাবগুলোর সামনে কঠিন চ্যালেঞ্জ",
      category: "INTERNATIONAL",
      featured: false,
      cover: IMG.trophy[0],
      views: 9870,
      likes: 180,
      excerpt: "এশিয়ার ক্লাব ফুটবলে বাংলাদেশের প্রতিনিধিদের কাছে আসছে প্রিমিয়ার টেস্ট।",
      content: `এএফসি কাপের বাছাইপর্বে অংশ নিতে যাচ্ছে বাংলাদেশের শীর্ষ ক্লাবগুলো। শক্তিশালী প্রতিপক্ষের বিপক্ষে কীভাবে লড়বে আমাদের দল — সেটাই এখন সবচেয়ে বড় প্রশ্ন।

## কী দরকার

- দীর্ঘমেয়াদি ক্লাব পরিকাঠামো
- বিদেশি লিগে অভিজ্ঞতা
- ঘরের লিগের প্রতিযোগিতামূলক মান

## সমর্থকদের ভূমিকা

গ্যালারি ভরা স্টেডিয়াম ক্লাব ফুটবলের প্রাণ। আন্তর্জাতিক ম্যাচে দর্শকের উপস্থিতি দলের পারফরম্যান্সে সরাসরি প্রভাব ফেলে।`,
    },
    {
      title: "বিপিএল যুব উন্নয়ন কর্মসূচি: একাডেমি থেকে প্রথম একাদশে পথ খুলছে",
      category: "BPL",
      featured: false,
      cover: IMG.training[2],
      views: 11230,
      likes: 260,
      excerpt: "ক্লাবগুলোতে যুব একাডেমি চালুর উদ্যোগ নিয়েছে লিগ কর্তৃপক্ষ — লক্ষ্য নিজস্ব তারকা তৈরি।",
      content: `বিদেশি খেলোয়াড়ের ওপর নির্ভরতা কমিয়ে নিজস্ব তারকা তৈরির লক্ষ্যে এগোচ্ছে বিপিএল ক্লাবগুলো। একাডেমি স্তর থেকে সিনিয়র দলে উত্তরণের সুস্পষ্ট পথ তৈরি হচ্ছে।

## পরিকল্পনার মূল বিষয়

- অনূর্ধ্ব-১৮ দলের নিয়মিত লিগ
- প্রতি ক্লাবে বাধ্যতামূলক যুব কোটা
- সাফল্যের মাপকাঠি: প্রথম একাদশে ঘরোয়া তরুণদের সংখ্যা

সমর্থকরা মনে করছেন, দীর্ঘমেয়াদে এটাই বাংলাদেশ ফুটবলের আসল বিনিয়োগ।`,
    },
    {
      title: "স্টেডিয়াম নিরাপত্তায় নতুন নির্দেশনা: দর্শকসেবায় বাড়ছে আধুনিকায়ন",
      category: "NATIONAL",
      featured: false,
      cover: IMG.fans[0],
      views: 8420,
      likes: 150,
      excerpt: "গ্যালারির নিরাপত্তা, টিকিটিং ও সেবা — স্টেডিয়াম অভিজ্ঞতা বদলাতে নতুন নির্দেশনা দিয়েছে কর্তৃপক্ষ।",
      content: `দর্শকদের নিরাপদ ও আরামদায়ক অভিজ্ঞতা নিশ্চিত করতে নতুন নির্দেশনা জারি করেছে কর্তৃপক্ষ। ই-টিকিটিং বাধ্যতামূলক করা, গ্যালারিতে সিসি ক্যামেরা বসানো আর ম্যাচডে পরিবহন সেবা — এগুলোই মূল সিদ্ধান্ত।

## কী বদলাচ্ছে

- অনলাইনে টিকিট কেনা বাধ্যতামূলক
- প্রবেশপথে দ্রুত নিরাপত্তা চেক
- পরিবার গ্যালারি সম্প্রসারণ

ম্যাচডে অভিজ্ঞতা ভালো হলে দর্শক সংখ্যাও বাড়বে — এটাই স্বাভাবিক। সমর্থক সংগঠনগুলো সিদ্ধান্তগুলো স্বাগত জানিয়েছে।`,
    },
  ];

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const slug = `news-${i + 1}-${Date.now().toString(36)}`;
    await db.newsArticle.create({
      data: {
        title: a.title,
        slug,
        excerpt: a.excerpt,
        content: a.content,
        category: a.category,
        coverUrl: a.cover,
        authorId: i % 3 === 0 ? admin.id : editor.id,
        status: "PUBLISHED",
        featured: a.featured,
        views: a.views,
        likeCount: a.likes,
        createdAt: day(i + 1),
      },
    });
  }

  // ================= VIDEOS (Shorts) =================
  const videos = [
    { title: "রাকিব হোসেনের কার্লড ফ্রি-কিক 🔥 সরাসরি জালে!", url: "/videos/bkb1.mp4", thumb: IMG.action[0], views: 248000, likes: 18400, tags: "ফ্রিকিক,বিপিএল,হাইলাইটস", creator: creator1 },
    { title: "মোরশালিনের সলো গোল — মিডলাইন থেকে একাই 😱", url: "/videos/sintel1.mp4", thumb: IMG.dribble[1], views: 189000, likes: 15200, tags: "গোল,বিপিএল", creator: creator1 },
    { title: "ডার্বি ডে ভাইবস 🏟️ গ্যালারির এই দৃশ্য মিস করবেন না", url: "/videos/jelly1.mp4", thumb: IMG.fans[1], views: 132000, likes: 11800, tags: "ডার্বি,ফ্যানস,গ্যালারি", creator: creator2 },
    { title: "গোলরক্ষক মিতুলের ৩ সেভ যা বিশ্বাস করা যায় না 🧤", url: "/videos/bkb2.mp4", thumb: IMG.goalkeeper[1], views: 98000, likes: 8700, tags: "সেভ,গোলরক্ষক", creator: creator2 },
    { title: "জামাল ভূঞার পাস ম্যাপ ব্রেকডাউন 🧠 ট্যাকটিক্স টক", url: "/videos/flower.mp4", thumb: IMG.coach[0], views: 76000, likes: 6900, tags: "ট্যাকটিক্স,জামাল", creator: creator2 },
    { title: "ট্রেনিং ডে: কিভাবে প্রস্তুত নেয় চ্যাম্পিয়নরা 💪", url: "/videos/sintel2.mp4", thumb: IMG.training[0], views: 64000, likes: 5400, tags: "ট্রেনিং,বিপিএল", creator: creator1 },
    { title: "হামজা চৌধুরী লাল-সবুজে 💚❤️ প্রথম দিনের মুহূর্ত", url: "/videos/jelly2.mp4", thumb: IMG.celebrate[1], views: 412000, likes: 36500, tags: "হামজা,জাতীয়দল", creator: creator1 },
    { title: "গোল উদযাপনের ১০ বেস্ট মোমেন্ট 🎉 কোনটা আপনার ফেভারিট?", url: "/videos/friday.mp4", thumb: IMG.celebrate[2], views: 58000, likes: 4900, tags: "গোল,সেলিব্রেশন", creator: creator2 },
  ];
  const videoIds: string[] = [];
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const vid = await db.video.create({
      data: {
        creatorId: v.creator.id,
        title: v.title,
        description: `${v.title} — Football Hub Bangladesh শর্টসে দেখুন বাংলাদেশ ফুটবলের সেরা মুহূর্তগুলো।`,
        videoUrl: v.url,
        thumbnailUrl: v.thumb,
        tags: v.tags,
        views: v.views,
        likeCount: v.likes,
        monetized: i % 2 === 0,
        createdAt: new Date(now.getTime() - (i + 1) * 2 * DAY - rint(0, 20) * 3600 * 1000),
      },
    });
    videoIds.push(vid.id);
  }

  // ================= COMMUNITY POSTS =================
  const posts = [
    { author: fans[0], content: "আজকের ডার্বি ম্যাচ দেখার অভিজ্ঞতা কেমন ছিল সবার? আমি তো গ্যালারির এনভায়রনমেন্টে একেবারে ভাটা! 🏟️🔥 #বিপিএল", likes: 142, tag: "আবাহনী" },
    { author: fans[1], content: "মোহামেডানের এই মৌসুমের ফর্ম দেখে আশাবাদী হওয়া যায়! ফেডারেশন কাপ সেমিফাইনাল আবাহনীর বিপক্ষে হবে যুদ্ধ ⚔️", likes: 98, tag: "মোহামেডান" },
    { author: fans[2], content: "বসুন্ধরা কিংস এরিনার ইলেকট্রিক অ্যাটমোসফিয়ারে কেউ যায়নি এখনো? লাইভ স্কোর FHB-তে ফলো করার সাথে সাথে স্টেডিয়ামেও দৌড়ানো লাগবে 😄", likes: 210, tag: "বসুন্ধরা" },
    { author: fans[3], content: "হামজা চৌধুরী সাফ সেমিফাইনালে খেললে বঙ্গবন্ধু স্টেডিয়ামের গ্যালারি ভেঙে পড়বে ভাই! 🇧🇩 কে কে যাচ্ছেন?", likes: 375, tag: "জাতীয় দল" },
    { author: fans[4], content: "রাকিব হোসেনের ফ্রি-কিক ভিডিওটা দিনে ৫ বার দেখছি। কার্লিং বলের ফিজিক্স নিয়ে কেউ ব্যাখ্যা করবেন? 🤔⚽", likes: 89, tag: null },
    { author: fans[1], content: "FHB-র শর্টস ফিড এখন আমার ডেইলি ডোজ 😂 রাতে ঘুমানোর আগে ১০টা হাইলাইটস না দেখলেই না!", likes: 156, tag: null },
  ];
  const postIds: string[] = [];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const post = await db.post.create({
      data: {
        authorId: p.author.id,
        content: p.content,
        matchTag: p.tag,
        likeCount: p.likes,
        createdAt: new Date(now.getTime() - (i + 1) * 9 * 3600 * 1000),
      },
    });
    postIds.push(post.id);
  }

  // ================= COMMENTS =================
  const newsList = await db.newsArticle.findMany({ take: 4 });
  const commentDefs = [
    [newsList[0]?.id, "NEWS", fans[0], "হামজা ভাইকে জাতীয় দলে পেয়ে আমরা গর্বিত! ইনশাআল্লাহ সাফ জিতবে আমরা 🇧🇩"],
    [newsList[0]?.id, "NEWS", fans[3], "প্রিমিয়ার লিগের খেলোয়াড় আমাদের দলে — এটা কল্পনাও করিনি! 💚❤️"],
    [newsList[0]?.id, "NEWS", fans[4], "মিডফিল্ডে হামজা + জামাল কম্বো হলে সাফ টিমগুলোর ঘুম উড়বে 😎"],
    [newsList[1]?.id, "NEWS", fans[2], "কিংসের এই ফর্ম দেখে মনে হচ্ছে এবারও লিগ একতরফাই হবে 🦁"],
    [newsList[1]?.id, "NEWS", fans[1], "মোহামেডান ফ্যান হিসেবে বলছি — ডার্বিতে সব রেকর্ড ভাঙবে, অপেক্ষা করুন 😤"],
    [videoIds[0], "VIDEO", fans[3], "এই ফ্রি-কিকটা বারবার দেখছি! কার্লিং অবিশ্বাস্য 🔥"],
    [videoIds[0], "VIDEO", fans[0], "রাকিভাই সেট-পিসে আলাদা লেভেলের খেলোয়াড় ⚡"],
    [videoIds[6], "VIDEO", fans[4], "হামজা ভাইয়ের ফার্স্ট ডে ফুটেজ! গায়ে কাঁটা দিয়ে উঠলো 🥹"],
    [videoIds[6], "VIDEO", fans[1], "লাল-সবুজের হয়ে খেলার স্বপ্ন দেখা সবার জন্য অনুপ্রেরণা 💚"],
    [videoIds[2], "VIDEO", fans[2], "গ্যালারির এই ভাইব আর কোথায় পাবো! ডার্বি মানেই আলাদা 🏟️"],
    [postIds[0], "POST", fans[2], "ভাই আমিও ছিলাম গ্যালারিতে! এনভায়রনমেন্ট ছিল আউট অফ দ্য ওয়ার্ল্ড 🔥"],
    [postIds[0], "POST", fans[3], "পরের হোম ম্যাচে আমরাও যাবো, গ্রুপ বানাও সবাই 🙌"],
    [postIds[3], "POST", fans[0], "আমি যাচ্ছি অবশ্যই! টিকিটের ব্যবস্থা করতে হবে আগেই 🎫"],
    [postIds[5], "POST", fans[4], "একই অবস্থা ভাই 😂 FHB শর্টসের কারণে ঘুমের সময় কমে গেছে"],
  ] as const;
  for (const [targetId, targetType, author, content] of commentDefs) {
    if (!targetId) continue;
    await db.comment.create({
      data: {
        userId: author.id,
        targetType,
        targetId,
        content,
        createdAt: new Date(now.getTime() - rint(1, 72) * 3600 * 1000),
      },
    });
  }
  // set comment counts
  for (const a of newsList) {
    const c = await db.comment.count({ where: { targetType: "NEWS", targetId: a.id } });
    await db.newsArticle.update({ where: { id: a.id }, data: { commentCount: c } });
  }
  for (let i = 0; i < videoIds.length; i++) {
    const c = await db.comment.count({ where: { targetType: "VIDEO", targetId: videoIds[i] } });
    await db.video.update({ where: { id: videoIds[i] }, data: { commentCount: c + rint(8, 40) } });
  }
  for (const pid of postIds) {
    const c = await db.comment.count({ where: { targetType: "POST", targetId: pid } });
    await db.post.update({ where: { id: pid }, data: { commentCount: c } });
  }

  // ================= FOLLOWS =================
  const followPairs: Array<[string, string]> = [
    [fans[0].id, creator1.id], [fans[1].id, creator1.id], [fans[2].id, creator1.id], [fans[3].id, creator1.id], [fans[4].id, creator1.id],
    [fans[0].id, creator2.id], [fans[2].id, creator2.id], [fans[4].id, creator2.id],
    [fans[0].id, fans[1].id], [fans[1].id, fans[0].id], [fans[3].id, fans[0].id], [fans[2].id, fans[3].id],
    [creator1.id, creator2.id], [creator2.id, creator1.id],
  ];
  for (const [f, t] of followPairs) {
    await db.follow.create({ data: { followerId: f, followingId: t } });
  }
  // fix counts
  for (const u of [creator1, creator2, fans[0], fans[1], fans[2], fans[3], fans[4]]) {
    const fc = await db.follow.count({ where: { followingId: u.id } });
    const gc = await db.follow.count({ where: { followerId: u.id } });
    await db.user.update({ where: { id: u.id }, data: { followerCount: fc + (u.role === "CREATOR" ? 12000 : 0), followingCount: gc } });
  }

  // ================= LIKES (seed a few) =================
  const someLikes: Array<[string, string]> = [
    [fans[0].id, videoIds[0]], [fans[1].id, videoIds[0]], [fans[2].id, videoIds[6]], [fans[3].id, videoIds[6]],
    [fans[0].id, postIds[0]], [fans[1].id, postIds[3]], [fans[2].id, postIds[3]],
  ];
  for (const [uid, target] of someLikes) {
    await db.like.create({ data: { userId: uid, targetType: "VIDEO", targetId: target } }).catch(() => {});
  }
  for (const [uid, target] of someLikes.slice(4)) {
    await db.like.create({ data: { userId: uid, targetType: "POST", targetId: target } }).catch(() => {});
  }

  // ================= MEMBERSHIP PLANS =================
  await db.membershipPlan.create({
    data: {
      code: "FREE", name: "ফ্রি ফ্যান", price: 0, period: "সদা বহাল", popular: false, sortOrder: 1,
      features: JSON.stringify(["লাইভ স্কোর ও ম্যাচ আপডেট", "সব নিউজ পড়া", "শর্টস ভিডিও দেখা", "কমেন্ট ও লাইক করা", "কমিউনিটিতে যোগ দেওয়া"]),
    },
  });
  await db.membershipPlan.create({
    data: {
      code: "PRO", name: "প্রো সাপোর্টার", price: 149, period: "মাস", popular: true, sortOrder: 2,
      features: JSON.stringify(["বিজ্ঞাপনমুক্ত অভিজ্ঞতা", "এইচডি ম্যাচ হাইলাইটস", "এক্সক্লুসিভ ট্রান্সফার নিউজ (৪৮ ঘণ্টা আগে)", "প্রিমিয়াম ফ্যান ব্যাজ", "প্রায়োরিটি ম্যাচ অ্যালার্ট"]),
    },
  });
  await db.membershipPlan.create({
    data: {
      code: "LEGEND", name: "লিজেন্ড মেম্বার", price: 399, period: "মাস", popular: false, sortOrder: 3,
      features: JSON.stringify(["সব প্রো সুবিধা", "লাইভ ম্যাচ কমেন্ট্রি অ্যাক্সেস", "ক্রিয়েটরদের টিপস পাঠানো", "জার্সি ও মার্চেন্ডাইজে ১০% ছাড়", "ড্রয়িং ও মিট অ্যান্ড গ্রিটে আগে অ্যাক্সেস"]),
    },
  });

  // ================= EARNINGS =================
  const earnDefs = [
    [videoIds[0], 4200, "AD_REVENUE", "ভাইরাল ফ্রি-কিক ভিডিও — অ্যাড রেভিনিউ"],
    [videoIds[6], 5100, "AD_REVENUE", "হামজা ফার্স্ট ডে — অ্যাড রেভিনিউ"],
    [videoIds[1], 2600, "AD_REVENUE", "মোরশালিন সলো গোল — অ্যাড রেভিনিউ"],
    [videoIds[5], 1400, "AD_REVENUE", "ট্রেনিং ডে ভিডিও — অ্যাড রেভিনিউ"],
    [null, 1800, "TIPS", "ফ্যানদের টিপস (৩২ জন)"],
    [null, 2500, "BONUS", "মাসের সেরা ক্রিয়েটর বোনাস"],
  ] as const;
  let total = 0;
  for (let i = 0; i < earnDefs.length; i++) {
    const [vid, amount, source, note] = earnDefs[i];
    total += amount;
    await db.earning.create({
      data: {
        creatorId: creator1.id,
        videoId: vid ?? null,
        amount,
        source,
        note,
        createdAt: new Date(now.getTime() - (i * 4 + 1) * DAY),
      },
    });
  }
  await db.user.update({ where: { id: creator1.id }, data: { earningsTotal: total } });
  await db.payoutRequest.create({
    data: { creatorId: creator1.id, amount: 5000, method: "BKASH", account: "017•••••42", status: "PENDING" },
  });
  // creator2 smaller earnings
  for (let i = 0; i < 3; i++) {
    await db.earning.create({
      data: { creatorId: creator2.id, amount: rint(800, 2200), source: "AD_REVENUE", note: "শর্টস অ্যাড রেভিনিউ", createdAt: new Date(now.getTime() - (i * 5 + 2) * DAY) },
    });
  }

  // ================= AD SLOTS =================
  await db.adSlot.create({
    data: {
      name: "হেডার লিডারবোর্ড", placement: "HEADER_BANNER", provider: "ADSENSE",
      adCode: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>\n<!-- FHB Header Leaderboard -->\n<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="1234567890"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
      imageHint: IMG.ball[1], linkUrl: "#premium", active: true, impressions: 18420, clicks: 312,
    },
  });
  await db.adSlot.create({
    data: { name: "সাইডবার স্কাইস্ক্র্যাপার", placement: "SIDEBAR", provider: "ADSENSE", adCode: '<!-- FHB Sidebar 300x600 -->\n<ins class="adsbygoogle" style="display:inline-block;width:300px;height:600px" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="2345678901"></ins>', imageHint: IMG.trophy[1], linkUrl: "#competitions", active: true, impressions: 9840, clicks: 187 },
  });
  await db.adSlot.create({
    data: { name: "নিউজ ইন-ফিড ব্যানার", placement: "IN_FEED", provider: "ADSENSE", adCode: '<!-- FHB In-Feed -->\n<ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-fb+5w+4e-db+86" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="3456789012"></ins>', imageHint: IMG.action[2], linkUrl: "#news", active: true, impressions: 27310, clicks: 544 },
  });
  await db.adSlot.create({
    data: { name: "মোবাইল স্টিকি ব্যানার", placement: "MOBILE_BANNER", provider: "ADSENSE", adCode: '<!-- FHB Mobile 320x50 -->\n<ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="4567890123"></ins>', imageHint: IMG.ball[2], linkUrl: "#scores", active: true, impressions: 41200, clicks: 690 },
  });

  // summary
  const counts = {
    users: await db.user.count(),
    teams: await db.team.count(),
    players: await db.player.count(),
    competitions: await db.competition.count(),
    matches: await db.match.count(),
    liveMatches: await db.match.count({ where: { status: "LIVE" } }),
    events: await db.matchEvent.count(),
    standings: await db.standing.count(),
    news: await db.newsArticle.count(),
    videos: await db.video.count(),
    posts: await db.post.count(),
    comments: await db.comment.count(),
    adSlots: await db.adSlot.count(),
  };
  console.log("✅ Seed complete:", JSON.stringify(counts, null, 2));
  console.log("\n👉 Demo accounts:");
  console.log("   ADMIN   admin@fhb.com.bd / Admin@2025");
  console.log("   EDITOR  editor@fhb.com.bd / Editor@2025");
  console.log("   CREATOR creator@fhb.com.bd / Creator@2025");
  console.log("   FAN     tanvir@fhb.com.bd / Fan@2025 (or mim/sakib/nusrat/rakib)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
