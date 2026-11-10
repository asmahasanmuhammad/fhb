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
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c80743607c26.jpg",
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
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/985750c52694.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/eb1564b3d3b6.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b5d6b6551d9a.jpg",
  ],
  coach: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/04d047e7e1e7.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/33791d63308c.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e01e4ff2a39a.jpg",
  ],
  dribble: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/83c3219a4b39.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ddab4fb90a30.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c693b80c1d84.jpg",
  ],
  fans: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/38d104f20d12.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b13bac242184.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3dbea23a5446.jpg",
  ],
  goalkeeper: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c9c992f0b9dd.jpeg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b8531c920837.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3c2bdf743c17.jpg",
  ],
  training: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8c14149ceb3a.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/717e476fc3d9.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/68731a25f344.jpg",
  ],
  trophy: [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/946e49a08e5d.jpg",
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
      name: "FHB Admin",
      passwordHash: hashPassword("Admin@2025"),
      role: "ADMIN",
      bio: "The official admin account of Football Hub Bangladesh.",
      avatarUrl: null,
    },
  });
  const editor = await db.user.create({
    data: {
      email: "editor@fhb.com.bd",
      username: "rashed_editor",
      name: "Rashedul Islam",
      passwordHash: hashPassword("Editor@2025"),
      role: "ADMIN",
      bio: "Football journalist — covering the BPL and the national team.",
    },
  });
  const creator1 = await db.user.create({
    data: {
      email: "creator@fhb.com.bd",
      username: "shakil_khan",
      name: "Shakil Khan",
      passwordHash: hashPassword("Creator@2025"),
      role: "CREATOR",
      bio: "BPL highlights and football content creator. New shorts every day! ⚽🔥",
      followerCount: 12480,
    },
  });
  const creator2 = await db.user.create({
    data: {
      email: "guru@fhb.com.bd",
      username: "footballguru",
      name: "Football Guru",
      passwordHash: hashPassword("Creator@2025"),
      role: "CREATOR",
      bio: "Tactics breakdowns, player analysis and goalpost specials 🎯",
      followerCount: 8730,
    },
  });

  const fanNames: Array<[string, string, string, string]> = [
    ["tanvir@fhb.com.bd", "tanvir10", "Tanvir Ahmed", "Right wing of the red and green 🇧🇩 Abahani fan boys!"],
    ["mim@fhb.com.bd", "mim_akter", "Mim Akter", "Football is my life 💚❤️ Mohammedan supporter"],
    ["sakib@fhb.com.bd", "sakib_h", "Sakib Hossain", "Bashundhara Kings 🦁 super fan. Match day = stadium day!"],
    ["nusrat@fhb.com.bd", "nusrat_j", "Nusrat Jahan", "Free-kick specialist fan 😄 All football, all the time"],
    ["rakib@fhb.com.bd", "rakib_bd", "Rakib Hasan", "I want Bangladesh football to rise — SAFF champions, inshallah!"],
  ];
  const fans: Awaited<ReturnType<typeof db.user.create>>[] = [];
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
    { name: "Bashundhara Kings", shortName: "Bashundhara Kings", initials: "BK", city: "Dhaka", stadium: "Bashundhara Kings Arena", founded: 2013, color: "#E11D48", color2: "#4C0519", strength: 0.92 },
    { name: "Abahani Limited Dhaka", shortName: "Abahani Ltd Dhaka", initials: "AB", city: "Dhaka", stadium: "Abahani Ground, Dhanmondi", founded: 1972, color: "#0891B2", color2: "#083344", strength: 0.84 },
    { name: "Mohammedan Sporting Club", shortName: "Mohammedan SC", initials: "MSC", city: "Dhaka", stadium: "Bir Shrestha Shaheed Sepahi Kamal Stadium", founded: 1936, color: "#059669", color2: "#022C22", strength: 0.82 },
    { name: "Sheikh Russel Krira Chakra", shortName: "Sheikh Russel KC", initials: "SR", city: "Dhaka", stadium: "Rafiquddin Bhuiyan Stadium, Tongi", founded: 1995, color: "#7C3AED", color2: "#2E1065", strength: 0.71 },
    { name: "Saif Sporting Club", shortName: "Saif SC", initials: "SAIF", city: "Dhaka", stadium: "Saif Malibagh Court Ground", founded: 2016, color: "#B91C1C", color2: "#450A0A", strength: 0.68 },
    { name: "Fortis Football Club", shortName: "Fortis FC", initials: "FTS", city: "Dhaka", stadium: "Fortis Arena, Amulia", founded: 2020, color: "#CA8A04", color2: "#422006", strength: 0.61 },
    { name: "Bangladesh Police Football Club", shortName: "Police FC", initials: "POL", city: "Dhaka", stadium: "Police Ground, Rajarbagh", founded: 1972, color: "#475569", color2: "#0F172A", strength: 0.56 },
    { name: "Rahmatganj Muslim Friends Society", shortName: "Rahmatganj MFS", initials: "RJ", city: "Dhaka", stadium: "Rahmatganj Ground", founded: 1933, color: "#B45309", color2: "#451A03", strength: 0.51 },
    { name: "Muktijoddha Sangsad Krira Chakra", shortName: "Muktijoddha SKC", initials: "MSK", city: "Dhaka", stadium: "Muktijoddha Sangsad Ground", founded: 1972, color: "#DC2626", color2: "#450A0A", strength: 0.49 },
    { name: "Brothers Union", shortName: "Brothers Union", initials: "BU", city: "Dhaka", stadium: "Gopibag Brothers Union Ground", founded: 1949, color: "#EA580C", color2: "#431407", strength: 0.46 },
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
        description: `${t.shortName} of ${t.city} — a regular contender in the Bangladesh Premier League. Home venue: ${t.stadium}.`,
      },
    });
    teams[t.initials] = team.id;
  }

  // ================= PLAYERS =================
  type PDef = { name: string; team: string; pos: string; num: number; nat?: string; by?: number; nt?: boolean; goals?: number; assists?: number; apps?: number; rating?: number; cs?: number; bio?: string; };
  const playerDefs: PDef[] = [
    // Bashundhara Kings
    { name: "Mitul Marma", team: "BK", pos: "GK", num: 1, nt: true, cs: 5, apps: 7, rating: 7.3, bio: "The national team's first-choice goalkeeper with remarkable reflexes." },
    { name: "Topu Barman", team: "BK", pos: "DF", num: 5, nt: true, goals: 2, apps: 7, rating: 7.6, bio: "A captain-grade defender for the national team, dominant in aerial duels." },
    { name: "Rakib Hossain", team: "BK", pos: "MF", num: 7, nt: true, goals: 3, assists: 5, apps: 7, rating: 7.9, bio: "Set-piece specialist winger — a free-kick wizard." },
    { name: "Mohammad Ibrahim", team: "BK", pos: "FW", num: 11, nt: true, goals: 4, assists: 2, apps: 7, rating: 7.7, bio: "Explosive winger — defenders fear his dribbling." },
    { name: "Sheikh Morsalin", team: "BK", pos: "FW", num: 9, nt: true, goals: 5, apps: 7, rating: 7.8, bio: "From village football to BPL stardom — finishing is his brand." },
    { name: "Raniel", team: "BK", pos: "FW", num: 10, nat: "Brazil", goals: 6, assists: 3, apps: 7, rating: 8.1, bio: "Brazilian striker — one of the league's finest foreign forwards." },
    { name: "Dorielton", team: "BK", pos: "FW", num: 99, nat: "Brazil", goals: 4, assists: 4, apps: 6, rating: 7.7 },
    { name: "Mehedi Hasan", team: "BK", pos: "DF", num: 3, apps: 7, rating: 7.1, cs: 4 },
    // Abahani
    { name: "Nabib Newaz Jibon", team: "AB", pos: "FW", num: 9, nt: true, goals: 5, assists: 1, apps: 7, rating: 7.7, bio: "Veteran striker with dazzling movement inside the box." },
    { name: "Sohel Rana", team: "AB", pos: "MF", num: 6, nt: true, goals: 1, assists: 3, apps: 7, rating: 7.5, bio: "The engine of the midfield — equally sharp at tackling and passing." },
    { name: "Yasin Khan", team: "AB", pos: "DF", num: 4, nt: true, goals: 1, apps: 6, rating: 7.2, bio: "Experienced centre-back — a wall in his area." },
    { name: "Biplab Ahmed", team: "AB", pos: "FW", num: 17, nt: true, goals: 3, assists: 2, apps: 6, rating: 7.4 },
    { name: "Saiful Bari Titu", team: "AB", pos: "GK", num: 23, apps: 7, cs: 3, rating: 7.0 },
    { name: "Samuel Okonkwo", team: "AB", pos: "FW", num: 88, nat: "Nigeria", goals: 4, apps: 7, rating: 7.5 },
    { name: "Junior Silva", team: "AB", pos: "MF", num: 8, nat: "Brazil", goals: 2, assists: 4, apps: 7, rating: 7.4 },
    // Mohammedan
    { name: "Jamal Bhuyan", team: "MSC", pos: "MF", num: 8, nt: true, goals: 2, assists: 4, apps: 7, rating: 7.8, bio: "Captain of the Bangladesh national team and the heartbeat of the midfield. The first Bangladeshi to play abroad." },
    { name: "Faisal Ahmed Fahim", team: "MSC", pos: "FW", num: 7, nt: true, goals: 4, assists: 3, apps: 7, rating: 7.6, bio: "A young, rising striker whose weapon is pace." },
    { name: "Bishwanath Ghosh", team: "MSC", pos: "DF", num: 5, nt: true, goals: 1, apps: 7, rating: 7.3 },
    { name: "Ashiqur Rahman", team: "MSC", pos: "GK", num: 1, nt: true, cs: 4, apps: 7, rating: 7.2 },
    { name: "Marcos Ferreira", team: "MSC", pos: "DF", num: 44, nat: "Brazil", goals: 1, apps: 7, rating: 7.1 },
    { name: "Kofi Appiah", team: "MSC", pos: "FW", num: 77, nat: "Ghana", goals: 3, apps: 6, rating: 7.3 },
    // Sheikh Russel
    { name: "Touhidul Islam Sabuj", team: "SR", pos: "MF", num: 10, nt: true, goals: 2, assists: 2, apps: 7, rating: 7.2 },
    { name: "Rashedul Palowan", team: "SR", pos: "FW", num: 9, goals: 3, apps: 7, rating: 7.0 },
    { name: "Mahfuzur Rahman", team: "SR", pos: "GK", num: 30, apps: 7, cs: 2, rating: 6.8 },
    { name: "Daniel Mendes", team: "SR", pos: "MF", num: 20, nat: "Brazil", goals: 2, assists: 3, apps: 7, rating: 7.1 },
    // Saif SC
    { name: "Rahat Mia", team: "SAIF", pos: "DF", num: 2, apps: 7, rating: 6.9 },
    { name: "Junayed Ahmed", team: "SAIF", pos: "MF", num: 14, goals: 2, apps: 7, rating: 7.0 },
    { name: "Imran Khan", team: "SAIF", pos: "FW", num: 11, goals: 3, assists: 1, apps: 7, rating: 7.1 },
    { name: "Ernest Boateng", team: "SAIF", pos: "FW", num: 9, nat: "Ghana", goals: 4, apps: 7, rating: 7.2 },
    { name: "Shahidul Islam", team: "SAIF", pos: "GK", num: 1, apps: 6, cs: 2, rating: 6.7 },
    // Fortis
    { name: "Farhan Siddique", team: "FTS", pos: "MF", num: 8, goals: 2, assists: 2, apps: 7, rating: 6.9 },
    { name: "Tanjil Ahmed", team: "FTS", pos: "FW", num: 7, goals: 2, apps: 7, rating: 6.8 },
    { name: "Mozammel Hossain", team: "FTS", pos: "DF", num: 4, goals: 1, apps: 7, rating: 6.8 },
    { name: "Nayeem Uddin", team: "FTS", pos: "GK", num: 21, apps: 7, cs: 1, rating: 6.6 },
    // Police
    { name: "Kamrul Hasan", team: "POL", pos: "MF", num: 6, goals: 1, apps: 7, rating: 6.7 },
    { name: "Shahriar Kabir", team: "POL", pos: "FW", num: 9, goals: 2, apps: 7, rating: 6.8 },
    { name: "Anisur Rahman", team: "POL", pos: "GK", num: 1, apps: 7, cs: 1, rating: 6.6 },
    { name: "Riyad Hossain", team: "POL", pos: "DF", num: 3, apps: 6, rating: 6.5 },
    // Rahmatganj
    { name: "Tasikul Islam", team: "RJ", pos: "FW", num: 10, goals: 3, apps: 7, rating: 7.0 },
    { name: "Tutul Hossain Badsha", team: "RJ", pos: "FW", num: 9, nt: true, goals: 2, apps: 7, rating: 6.9 },
    { name: "Mostafizur Rahman", team: "RJ", pos: "GK", num: 1, apps: 7, cs: 1, rating: 6.5 },
    { name: "Suman Barua", team: "RJ", pos: "MF", num: 8, goals: 1, apps: 7, rating: 6.6 },
    // Muktijoddha
    { name: "Nazmul Hasan", team: "MSK", pos: "DF", num: 5, goals: 1, apps: 7, rating: 6.7 },
    { name: "Hasibur Rahman", team: "MSK", pos: "MF", num: 7, goals: 1, apps: 7, rating: 6.6 },
    { name: "Rustom Ali", team: "MSK", pos: "FW", num: 9, goals: 2, apps: 7, rating: 6.7 },
    { name: "Iqbal Hossain", team: "MSK", pos: "GK", num: 22, apps: 7, cs: 0, rating: 6.4 },
    // Brothers Union
    { name: "Sajid Hossain", team: "BU", pos: "MF", num: 10, goals: 1, apps: 7, rating: 6.5 },
    { name: "Ariful Islam", team: "BU", pos: "FW", num: 11, goals: 2, apps: 7, rating: 6.6 },
    { name: "Jubayer Ahmed", team: "BU", pos: "GK", num: 1, apps: 7, cs: 1, rating: 6.3 },
    { name: "Shakil Ahmed", team: "BU", pos: "DF", num: 6, apps: 7, rating: 6.4 },
    // National team stars not in BPL clubs (foreign based)
    { name: "Hamza Choudhury", team: "", pos: "MF", num: 17, nat: "England (Bangladeshi origin)", nt: true, by: 1997, goals: 1, apps: 3, rating: 8.4, bio: "Midfielder for Leicester City in the English Premier League. His 2025 switch to the Bangladesh national team is the most talked-about signing — the first Premier League player of Bangladeshi origin." },
    { name: "Rezaul Hasan Jibon", team: "", pos: "DF", num: 3, nt: true, by: 1999, goals: 0, apps: 3, rating: 7.0 },
  ];

  const playerIds: Record<string, string> = {};
  for (const p of playerDefs) {
    const player = await db.player.create({
      data: {
        name: p.name,
        teamId: p.team ? teams[p.team] : null,
        position: p.pos,
        nationality: p.nat ?? "Bangladesh",
        jerseyNumber: p.num,
        birthYear: p.by ?? rint(1993, 2004),
        heightCm: rint(165, 188),
        goals: p.goals ?? 0,
        assists: p.assists ?? 0,
        appearances: p.apps ?? 0,
        cleanSheets: p.cs ?? 0,
        rating: p.rating ?? 6.5,
        isNationalTeam: p.nt ?? false,
        bio: p.bio ?? `${p.pos === "GK" ? "Goalkeeper" : p.pos === "DF" ? "Defender" : p.pos === "MF" ? "Midfielder" : "Forward"} — a regular performer in the BPL.`,
      },
    });
    playerIds[p.name] = player.id;
  }

  // ================= COMPETITIONS =================
  const bpl = await db.competition.create({
    data: {
      name: "Bangladesh Premier League",
      shortName: "BPL",
      type: "LEAGUE",
      season: "2025-26",
      country: "Bangladesh",
      accentColor: "#1FE07A",
      description:
        "The nation's top football league — 10 clubs, 18 rounds in a home-and-away format. The champions earn a place in the AFC Champions League Two.",
    },
  });
  const fedCup = await db.competition.create({
    data: {
      name: "Federation Cup",
      shortName: "Federation Cup",
      type: "CUP",
      season: "2025-26",
      country: "Bangladesh",
      accentColor: "#F5C24B",
      description: "Bangladesh's oldest club cup tournament — the nation's best clubs battling it out in knockout format.",
    },
  });
  const saff = await db.competition.create({
    data: {
      name: "SAFF Championship",
      shortName: "SAFF Championship",
      type: "INTERNATIONAL",
      season: "2025",
      country: "SAFF Region",
      accentColor: "#FF5A48",
      description: "South Asia's premier international football tournament, featuring seven nations including Bangladesh, India and the Maldives.",
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
          data: { matchId: m.id, minute: rint(3, 90), type: "GOAL", teamId: teams[h], teamSide: "home", playerName: name, detail: "Goal" },
        });
      }
      for (let i = 0; i < as; i++) {
        const [name] = await scorersFor(a, 1);
        await db.matchEvent.create({
          data: { matchId: m.id, minute: rint(3, 90), type: "GOAL", teamId: teams[a], teamSide: "away", playerName: name, detail: "Goal" },
        });
      }
      await db.matchEvent.create({
        data: { matchId: m.id, minute: 45, type: "HT", detail: "Half-Time" },
      });
      await db.matchEvent.create({
        data: { matchId: m.id, minute: 90, type: "FT", detail: "Full-Time" },
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
      data: { matchId: m.id, minute: Math.max(2, minute - rint(18, 30)), type: "GOAL", teamId: teams[h], teamSide: "home", playerName: hname, detail: "Goal" },
    });
    await db.matchEvent.create({
      data: { matchId: m.id, minute: Math.max(4, minute - rint(5, 14)), type: "YELLOW", teamId: teams[a], teamSide: "away", playerName: aname, detail: "Yellow card" },
    });
    return m;
  }

  const liveMatch1 = await createLive(derbyPair, 37); // Bashundhara vs Mohammedan — derby is live!
  const liveMatch2 = await createLive(live2Pair, 68);
  // give live2 a goal
  {
    const [h, a] = live2Pair;
    const [name] = await scorersFor(h, 1);
    await db.matchEvent.create({ data: { matchId: liveMatch2.id, minute: 24, type: "GOAL", teamId: teams[h], teamSide: "home", playerName: name, detail: "Goal" } });
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
        venue: "Bangabandhu National Stadium, Dhaka",
        round: "Quarter-final",
      },
    });
    for (let i = 0; i < finalH; i++) {
      const [n] = await scorersFor(h, 1);
      await db.matchEvent.create({ data: { matchId: m.id, minute: rint(5, 88), type: "GOAL", teamSide: "home", teamId: teams[h], playerName: n, detail: "Goal" } });
    }
    for (let i = 0; i < finalA; i++) {
      const [n] = await scorersFor(a, 1);
      await db.matchEvent.create({ data: { matchId: m.id, minute: rint(5, 88), type: "GOAL", teamSide: "away", teamId: teams[a], playerName: n, detail: "Goal" } });
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
      venue: "Bangabandhu National Stadium, Dhaka",
      round: "Semi-final",
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
      venue: "Bashundhara Kings Arena, Dhaka",
      round: "Semi-final",
    },
  });

  // ================= SAFF (national team) =================
  // Bangladesh "team" — use a pseudo team? We need Team rows for matches. Create national team entries.
  const bd = await db.team.create({
    data: {
      name: "Bangladesh National Football Team",
      shortName: "Bangladesh",
      initials: "BAN",
      city: "Dhaka",
      stadium: "Bangabandhu National Stadium",
      founded: 1972,
      color: "#006A4E",
      color2: "#F42A41",
      description: "The red and green representatives — one of the most popular teams in the SAFF region, on an upward FIFA ranking curve.",
    },
  });
  const india = await db.team.create({
    data: { name: "India National Football Team", shortName: "India", initials: "IND", city: "New Delhi", stadium: "Jawaharlal Nehru Stadium", founded: 1938, color: "#2563EB", color2: "#1E3A8A", description: "A top team in the SAFF region." },
  });
  const maldives = await db.team.create({
    data: { name: "Maldives National Football Team", shortName: "Maldives", initials: "MDV", city: "Male", stadium: "Galolhu National Stadium", founded: 1952, color: "#DC2626", color2: "#7F1D1D", description: "A strong team in the SAFF region." },
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
      venue: "Bangabandhu National Stadium, Dhaka",
      round: "Group Stage",
      featured: true,
    },
  });
  await db.matchEvent.create({ data: { matchId: saff1.id, minute: 34, type: "GOAL", teamId: bd.id, teamSide: "home", playerName: "Faisal Ahmed Fahim", detail: "Goal" } });
  await db.matchEvent.create({ data: { matchId: saff1.id, minute: 61, type: "GOAL", teamId: india.id, teamSide: "away", playerName: "Sunil Chhetri", detail: "Goal (penalty)" } });
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
      venue: "Bangabandhu National Stadium, Dhaka",
      round: "Group Stage",
    },
  });
  await db.match.create({
    data: {
      competitionId: saff.id,
      homeTeamId: bd.id,
      awayTeamId: india.id,
      status: "SCHEDULED",
      kickoff: new Date(now.getTime() + 3 * DAY),
      venue: "Bangabandhu National Stadium, Dhaka",
      round: "Semi-final",
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
      title: "Hamza Choudhury in Red and Green: A New Chapter in Bangladesh Football History",
      category: "NATIONAL",
      featured: true,
      cover: IMG.celebrate[0],
      views: 48210,
      likes: 1240,
      excerpt: "Premier League midfielder Hamza Choudhury is set to pull on the Bangladesh national team jersey — the first Premier League player of Bangladeshi origin to do so.",
      content: `A boy from a Bangladeshi family in Sylhet, raised on English soil, now wearing the red and green — Hamza Choudhury's story reads like a dream. The midfielder who won the Premier League and FA Cup with Leicester City is now set to take the field for the Bangladesh national team.

## Why This Is Historic

No player of this calibre has ever joined the Bangladesh national team before. When a midfielder with over 100 Premier League appearances takes the field in the SAFF region, it is big news not just for Bangladesh but for the entire South Asian football map.

## What Changes in Midfield

- A significantly higher ball-winning rate
- Direct passes to the front line during quick transitions
- Extra strength at set pieces
- Role models for young players

## What Fans Expect

The hashtag **#HamzaToBangladesh** is already trending on social media. Fans have been queuing since noon for tickets to his first match in Dhaka.

Analysts believe Hamza's arrival opens new horizons beyond the pitch — for Bangladesh football's brand value and sponsorships. BFF sources say he could make his debut in the SAFF semi-final.`,
    },
    {
      title: "Bashundhara Dominate the BPL: Kings Stay Top of the Table",
      category: "BPL",
      featured: false,
      cover: IMG.action[0],
      views: 32104,
      likes: 890,
      excerpt: "Defending champions Bashundhara Kings keep their grip on top spot with an emphatic home win.",
      content: `The defending champions served up an entertaining display in yesterday's match at Bashundhara Kings Arena. Two first-half goals put them in control of the game.

## Match Report

The Kings went ahead on 22 minutes when Morsalin finished a Raniel pass. In injury time Rakib Hossain's curled free kick made it 2-0. The opponents pushed back after the break but had to settle for the deficit.

## Position in the Table

The Kings have strengthened their grip on top spot with back-to-back wins. Their goal difference is far ahead of the second-placed team.

> "Squad depth is our strength. The season is long — we believe in consistency, not one-off matches." — Kings coaching staff

Next up they face rivals Mohammedan — what everyone is calling the real test of the season.`,
    },
    {
      title: "Transfer Market Heats Up: Brazilian Striker Wants Mohammedan Move",
      category: "TRANSFER",
      featured: false,
      cover: IMG.dribble[0],
      views: 27650,
      likes: 540,
      excerpt: "An experienced forward returns from a Middle East league — the Mohammedan camp is abuzz with transfer rumours.",
      content: `Sources say Mohammedan SC management are interested in a Brazilian striker. The player's agent has reportedly already held initial talks with the club.

## Contract Terms

- 1-year contract + 1-year extension option
- Monthly wage set in the BPL's top bracket
- Match-winning bonus clause included

Mohammedan officials have made no formal comment yet. But club sources say they are evaluating several profiles to fill their foreign quota up front.

Excitement is visible on social media — many believe an experienced Brazilian would make Mohammedan's attack even more fearsome. Club insiders say a final decision could come before the transfer window closes.`,
    },
    {
      title: "Jibon on his way back to Abahani? Good news after talks with club officials",
      category: "TRANSFER",
      featured: false,
      cover: IMG.action[1],
      views: 21380,
      likes: 460,
      excerpt: "National team striker Nabi Newaz Jibon is reportedly in positive talks over a return to his former club.",
      content: `Sources say Jibon has already completed talks with Abahani officials. The player himself has spoken about his love for the Dhanmondi faithful.

## What Stands in the Way

Some talks remain over contract length and the wage structure. Abahani want every term finalized before an official announcement.

All eyes in the transfer market are on these two clubs. Which colour jersey Jibon will wear should become clear within days.`,
    },
    {
      title: "SAFF Semi-Final Prep Begins: All Stars Join the Camp",
      category: "NATIONAL",
      featured: false,
      cover: IMG.training[0],
      views: 19420,
      likes: 512,
      excerpt: "The national team's preparation camp has begun ahead of the semi-final against India — all regulars including Hamza Choudhury are present.",
      content: `All regular players have joined the national team's preparation camp. The coaching staff say this camp puts special emphasis on fitness and set pieces.

## The Coach's Plan

- Week one: physical work and recovery
- Week two: tactical drills and set pieces
- Final phase: practice matches

## Injury News

Two defenders are carrying minor injuries, but the medical team expects them back before the match.

The captain thanked the fans: "Bangabandhu Stadium is our chance to show our best — the crowd's support is our 12th man."`,
    },
    {
      title: "Mohammedan vs Abahani in Federation Cup Semi-Final: A New Chapter in an Old Rivalry",
      category: "NATIONAL",
      featured: false,
      cover: IMG.stadium[0],
      views: 17650,
      likes: 380,
      excerpt: "Dhaka football's two biggest rivals meet in the semi-final — ticket demand is through the roof.",
      content: `The Federation Cup semi-final pits two of Dhaka's most storied clubs against each other — Mohammedan SC and Abahani Limited. Both advanced to the last four with emphatic quarter-final wins.

## Quarter-Final Results

Mohammedan beat Fortis 2-0, while Abahani advanced with a 3-1 win over Rahmatganj.

## Stadium & Tickets

The match will be played at Bangabandhu National Stadium. Gallery tickets are nearly sold out — authorities want extra monitoring to stop online black-marketing.

Both sets of fans are locked in heated social media debate — who wins this clash? Drop your prediction in the comments!`,
    },
    {
      title: "Battle of the Goalkeepers: Who Will Own the BPL Clean-Sheet Record?",
      category: "BPL",
      featured: false,
      cover: IMG.goalkeeper[0],
      views: 15230,
      likes: 320,
      excerpt: "Mitul Marma vs Ashiqur Rahman — two of the league's top goalkeepers in a fierce clean-sheet race.",
      content: `The most fascinating battle in this season's BPL stats might just be between the goalkeepers. Bashundhara's Mitul Marma tops the clean-sheet chart, with Mohammedan's Ashiqur Rahman not far behind.

## The Story Behind the Best Saves

Mitul's point-blank save last round went viral on social media. Fans have even produced half-joking analyses of his reaction time.

## What the Numbers Say

Analysts say defensive organisation is the real key to goalkeeping success. Teams that concede fewer shots inside the box naturally boost their keepers' clean-sheet counts.`,
    },
    {
      title: "From Village Fields to the BPL: The Sheikh Morsalin Story",
      category: "OPINION",
      featured: false,
      cover: IMG.training[1],
      views: 28910,
      likes: 1500,
      excerpt: "A barefoot boy roaming village fields, now scoring for the national team — Morsalin's story sketches the future of Bangladesh football.",
      content: `From a dusty village ground in Noakhali to Bashundhara Kings' starting eleven — Sheikh Morsalin's journey was never easy. He had no boots, but he had a dream.

## From Scouting to Stardom

A scout first spotted him at a local tournament. Then came the academy, then the BPL. Consistent goals have now made him a regular in the national team.

## Why This Story Matters

Bangladesh football has no shortage of talent — what it lacks is proper scouting and infrastructure. Players like Morsalin prove that given a chance, even a village field can produce a star.

> "I didn't know if I could make it. I only knew one thing — I would never give up." — Sheikh Morsalin

Thousands of youngsters are inspired by his goals this season. Perhaps one of them will wear the jersey and represent the country one day.`,
    },
    {
      title: "Transfer: Saif SC Captain Could Leave, Talks Underway",
      category: "TRANSFER",
      featured: false,
      cover: IMG.coach[1],
      views: 12340,
      likes: 210,
      excerpt: "Exit rumours swirl around the Saif SC camp mid-season — club sources have not confirmed them.",
      content: `Rumours continue to swirl around the Saif Sporting Club captain. Sources say the player's agent has informed the club of interest from a foreign club.

Club officials say the legal side of the deal is being reviewed. If all conditions line up, he could be released by mutual consent.

January isn't far away in the transfer market — a lot can change by then. Keep an eye on FHB for updates.`,
    },
    {
      title: "AFC Cup Qualifiers: A Tough Challenge Ahead for Bangladesh's Clubs",
      category: "INTERNATIONAL",
      featured: false,
      cover: IMG.trophy[0],
      views: 9870,
      likes: 180,
      excerpt: "A premier test awaits Bangladesh's representatives in Asian club football.",
      content: `Bangladesh's top clubs are set to enter the AFC Cup qualifiers. How our teams will fight against stronger opponents is now the biggest question.

## What Is Needed

- Long-term club infrastructure
- Experience in foreign leagues
- A more competitive domestic league

## The Role of the Fans

Packed stadiums are the lifeblood of club football. Crowd presence at international matches directly affects team performance.`,
    },
    {
      title: "BPL Youth Development Program: A Path from Academy to the First Eleven",
      category: "BPL",
      featured: false,
      cover: IMG.training[2],
      views: 11230,
      likes: 260,
      excerpt: "League authorities are launching youth academies across clubs — the goal: developing homegrown stars.",
      content: `BPL clubs are moving to cut their dependence on foreign players and build stars of their own. A clear pathway from academy level to the senior squad is taking shape.

## Key Points of the Plan

- A regular under-18 league
- A mandatory youth quota at every club
- Success metric: the number of domestic youngsters in the first eleven

Fans believe this is the real long-term investment for Bangladesh football.`,
    },
    {
      title: "New Stadium Security Guidelines: Modernization Steps Up for Fans",
      category: "NATIONAL",
      featured: false,
      cover: IMG.fans[0],
      views: 8420,
      likes: 150,
      excerpt: "Gallery security, ticketing and services — authorities roll out new guidelines to transform the stadium experience.",
      content: `Authorities have issued new guidelines to ensure a safe and comfortable experience for spectators. Mandatory e-ticketing, CCTV cameras in the galleries and matchday transport services are the key decisions.

## What Is Changing

- Online ticketing is mandatory
- Faster security checks at entrances
- Expanded family galleries

Better matchday experience naturally means bigger crowds. Supporters' groups have welcomed the decisions.`,
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
    { title: "Rakib Hossain's curled free kick 🔥 straight into the top corner!", url: "/videos/bkb1.mp4", thumb: IMG.action[0], views: 248000, likes: 18400, tags: "freekick,bpl,highlights", creator: creator1 },
    { title: "Morsalin's solo goal — all alone from the halfway line 😱", url: "/videos/sintel1.mp4", thumb: IMG.dribble[1], views: 189000, likes: 15200, tags: "goals,bpl", creator: creator1 },
    { title: "Derby day vibes 🏟️ don't miss these gallery scenes", url: "/videos/jelly1.mp4", thumb: IMG.fans[1], views: 132000, likes: 11800, tags: "derby,fans,gallery", creator: creator2 },
    { title: "Goalkeeper Mitul's 3 saves you won't believe 🧤", url: "/videos/bkb2.mp4", thumb: IMG.goalkeeper[1], views: 98000, likes: 8700, tags: "saves,goalkeeper", creator: creator2 },
    { title: "Jamal Bhuyan's pass map breakdown 🧠 tactics talk", url: "/videos/flower.mp4", thumb: IMG.coach[0], views: 76000, likes: 6900, tags: "tactics,jamal", creator: creator2 },
    { title: "Training day: how the champions prepare 💪", url: "/videos/sintel2.mp4", thumb: IMG.training[0], views: 64000, likes: 5400, tags: "training,bpl", creator: creator1 },
    { title: "Hamza Choudhury in red and green 💚❤️ first-day moments", url: "/videos/jelly2.mp4", thumb: IMG.celebrate[1], views: 412000, likes: 36500, tags: "hamza,nationalteam", creator: creator1 },
    { title: "10 best goal celebrations 🎉 which one is your favourite?", url: "/videos/friday.mp4", thumb: IMG.celebrate[2], views: 58000, likes: 4900, tags: "goals,celebrations", creator: creator2 },
  ];
  const videoIds: string[] = [];
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const vid = await db.video.create({
      data: {
        creatorId: v.creator.id,
        title: v.title,
        description: `${v.title} — watch the best moments of Bangladesh football on Football Hub Bangladesh Shorts.`,
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
    { author: fans[0], content: "How was everyone's experience at today's derby? The gallery atmosphere was unreal! 🏟️🔥 #BPL", likes: 142, tag: "Abahani" },
    { author: fans[1], content: "Mohammedan's form this season gives real hope! The Federation Cup semi-final against Abahani will be a war ⚔️", likes: 98, tag: "Mohammedan" },
    { author: fans[2], content: "Has no one been to the electric atmosphere at Bashundhara Kings Arena yet? Follow live scores on FHB and run to the stadium too 😄", likes: 210, tag: "Bashundhara" },
    { author: fans[3], content: "If Hamza Choudhury plays in the SAFF semi-final, the Bangabandhu Stadium galleries will explode! 🇧🇩 Who's going?", likes: 375, tag: "National Team" },
    { author: fans[4], content: "I've watched Rakib Hossain's free-kick video 5 times today. Can anyone explain the physics of that curl? 🤔⚽", likes: 89, tag: null },
    { author: fans[1], content: "The FHB shorts feed is my daily dose now 😂 Can't sleep without watching 10 highlights first!", likes: 156, tag: null },
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
    [newsList[0]?.id, "NEWS", fans[0], "So proud to have Hamza bhai in the national team! We are winning SAFF inshallah 🇧🇩"],
    [newsList[0]?.id, "NEWS", fans[3], "A Premier League player in our team — I never even dreamed of this! 💚❤️"],
    [newsList[0]?.id, "NEWS", fans[4], "A Hamza + Jamal midfield combo would keep SAFF teams awake at night 😎"],
    [newsList[1]?.id, "NEWS", fans[2], "Looking at the Kings' form, this league looks like a one-horse race again 🦁"],
    [newsList[1]?.id, "NEWS", fans[1], "Speaking as a Mohammedan fan — every derby record will be broken, just wait 😤"],
    [videoIds[0], "VIDEO", fans[3], "I keep rewatching this free kick! Unbelievable curl 🔥"],
    [videoIds[0], "VIDEO", fans[0], "Rakib bhai is on another level at set pieces ⚡"],
    [videoIds[6], "VIDEO", fans[4], "Hamza bhai's first-day footage! Gave me goosebumps 🥹"],
    [videoIds[6], "VIDEO", fans[1], "Dreaming of playing for the red and green — an inspiration for everyone 💚"],
    [videoIds[2], "VIDEO", fans[2], "Where else would you get this gallery vibe! A derby is just different 🏟️"],
    [postIds[0], "POST", fans[2], "Bro I was in the gallery too! The atmosphere was out of this world 🔥"],
    [postIds[0], "POST", fans[3], "We're going to the next home match too — everyone make a group 🙌"],
    [postIds[3], "POST", fans[0], "I'm definitely going! Need to sort tickets early 🎫"],
    [postIds[5], "POST", fans[4], "Same here bro 😂 FHB shorts have cut into my sleep time"],
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
      code: "FREE", name: "Free Fan", price: 0, period: "forever", popular: false, sortOrder: 1,
      features: JSON.stringify(["Live scores & match updates", "Read all news", "Watch shorts videos", "Comment & like", "Join the community"]),
    },
  });
  await db.membershipPlan.create({
    data: {
      code: "PRO", name: "Pro Supporter", price: 149, period: "month", popular: true, sortOrder: 2,
      features: JSON.stringify(["Ad-free experience", "HD match highlights", "Exclusive transfer news (48 hours early)", "Premium fan badge", "Priority match alerts"]),
    },
  });
  await db.membershipPlan.create({
    data: {
      code: "LEGEND", name: "Legend Member", price: 399, period: "month", popular: false, sortOrder: 3,
      features: JSON.stringify(["All Pro benefits", "Live match commentary access", "Tip creators", "10% off jerseys & merchandise", "Early access to draws & meet-and-greets"]),
    },
  });

  // ================= EARNINGS =================
  const earnDefs = [
    [videoIds[0], 4200, "AD_REVENUE", "Viral free-kick video — ad revenue"],
    [videoIds[6], 5100, "AD_REVENUE", "Hamza first day — ad revenue"],
    [videoIds[1], 2600, "AD_REVENUE", "Morsalin solo goal — ad revenue"],
    [videoIds[5], 1400, "AD_REVENUE", "Training day video — ad revenue"],
    [null, 1800, "TIPS", "Fan tips (32 fans)"],
    [null, 2500, "BONUS", "Creator of the month bonus"],
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
      data: { creatorId: creator2.id, amount: rint(800, 2200), source: "AD_REVENUE", note: "Shorts ad revenue", createdAt: new Date(now.getTime() - (i * 5 + 2) * DAY) },
    });
  }

  // ================= AD SLOTS (demo brand creatives across all placements) =================
  const demoAds: Array<{
    name: string; placement: string; headline: string; bodyText?: string; ctaLabel: string;
    brandColor: string; brandInitials: string; logoUrl: string; logoTheme?: "LIGHT" | "DARK";
    linkUrl?: string; imageHint?: string; impressions: number; clicks: number;
  }> = [
    // HEADER_BANNER (728×90 leaderboard)
    { name: "bKash — Header Leaderboard (Demo)", placement: "HEADER_BANNER", headline: "Cashback Festival! 100% cashback on every payment", bodyText: "Pay your bills in the bKash app and win exciting prizes", ctaLabel: "Open App", brandColor: "#E2136E", brandInitials: "bK", logoUrl: "/brands/bkash.png", linkUrl: "https://www.bkash.com", impressions: 18420, clicks: 412 },
    { name: "Grameenphone — Header Leaderboard (Demo)", placement: "HEADER_BANNER", headline: "Score updates now free! GP Score Alert service", bodyText: "Get live scores of every match by SMS — no internet needed", ctaLabel: "Activate", brandColor: "#009FE3", brandInitials: "GP", logoUrl: "/brands/grameenphone.svg", linkUrl: "https://www.grameenphone.com", impressions: 16750, clicks: 356 },
    { name: "Daraz — Header Leaderboard (Demo)", placement: "HEADER_BANNER", headline: "11.11 Mega Sale! Up to 70% off football jerseys & gear", bodyText: "Limited-time offer — order today", ctaLabel: "Shop Now", brandColor: "#F57224", brandInitials: "DZ", logoUrl: "/brands/daraz.png", linkUrl: "https://www.daraz.com.bd", impressions: 21980, clicks: 610 },
    // SIDEBAR (300×600 skyscraper)
    { name: "Walton — Sidebar Skyscraper (Demo)", placement: "SIDEBAR", headline: "Watch every live match on a Walton 4K Android TV", bodyText: "The stadium feeling, now in your living room — 0% interest EMI", ctaLabel: "Order Now", brandColor: "#0B4EA2", brandInitials: "W", logoUrl: "/brands/walton.png", linkUrl: "https://waltonhil.com", impressions: 9840, clicks: 187 },
    { name: "Pathao — Sidebar Skyscraper (Demo)", placement: "SIDEBAR", headline: "Getting to the stadium just got cheaper — 40% off Pathao rides", bodyText: "Use code FHB40 on match day", ctaLabel: "Get Code", brandColor: "#FF4B63", brandInitials: "P", logoUrl: "/brands/pathao.png", linkUrl: "https://pathao.com", impressions: 8320, clicks: 205 },
    { name: "Samsung — Sidebar Skyscraper (Demo)", placement: "SIDEBAR", headline: "Galaxy Buds — hear every word of the commentary in crystal-clear sound", bodyText: "Football season special price — limited stock", ctaLabel: "Learn More", brandColor: "#1428A0", brandInitials: "S", logoUrl: "/brands/samsung.png", linkUrl: "https://www.samsung.com/bd", impressions: 7690, clicks: 143 },
    // IN_FEED (native in-feed)
    { name: "Pran-RFL — In-Feed Banner (Demo)", placement: "IN_FEED", headline: "Pran Chanachur — the perfect match-watching companion", bodyText: "Now 20% more in every family pack", ctaLabel: "Find a Store", brandColor: "#E30613", brandInitials: "PR", logoUrl: "/brands/pran.png", linkUrl: "https://www.pranfoods.net", impressions: 27310, clicks: 544 },
    { name: "Chaldal — In-Feed Banner (Demo)", placement: "IN_FEED", headline: "Groceries delivered in 30 minutes", bodyText: "Tk 100 off your first order — code: FHB100", ctaLabel: "Order Now", brandColor: "#00A651", brandInitials: "C", logoUrl: "/brands/chaldal.png", linkUrl: "https://chaldal.com", impressions: 19870, clicks: 498 },
    { name: "City Bank — In-Feed Banner (Demo)", placement: "IN_FEED", headline: "City Touch Digital Banking — every transaction, anywhere", bodyText: "Open an account in just 10 minutes", ctaLabel: "Open Now", brandColor: "#0057B8", brandInitials: "CB", logoUrl: "/brands/citybank.png", logoTheme: "DARK", linkUrl: "https://www.thecitybank.com", impressions: 14230, clicks: 267 },
    { name: "Foodpanda — In-Feed Banner (Demo)", placement: "IN_FEED", headline: "Match Night Special — free delivery code: FHB50", bodyText: "Order your favourites right at half-time", ctaLabel: "Order Now", brandColor: "#D70F64", brandInitials: "fp", logoUrl: "/brands/foodpanda.svg", linkUrl: "https://www.foodpanda.com.bd", impressions: 23650, clicks: 712 },
    { name: "FHB House Ad — In-Feed (Demo)", placement: "IN_FEED", headline: "FHB Premium — an ad-free football experience", bodyText: "From just Tk 99/month — exclusive transfer news and HD highlights", ctaLabel: "Upgrade", brandColor: "#D4A017", brandInitials: "FHB", logoUrl: "/logo.svg", linkUrl: "#premium", imageHint: IMG.action[2], impressions: 12680, clicks: 389 },
    // MOBILE_BANNER (320×50/100 sticky)
    { name: "bKash — Mobile Sticky Banner (Demo)", placement: "MOBILE_BANNER", headline: "Instant cashback on bill payments in the bKash app", ctaLabel: "View", brandColor: "#E2136E", brandInitials: "bK", logoUrl: "/brands/bkash.png", linkUrl: "https://www.bkash.com", impressions: 41200, clicks: 690 },
    { name: "Bata — Mobile Sticky Banner (Demo)", placement: "MOBILE_BANNER", headline: "Sports Sneakers Collection — 25% Off", ctaLabel: "Shop Now", brandColor: "#D31145", brandInitials: "B", logoUrl: "/brands/bata.png", linkUrl: "https://www.batabd.com", impressions: 35400, clicks: 528 },
    { name: "City Group (Teer) — Mobile Sticky Banner (Demo)", placement: "MOBILE_BANNER", headline: "Teer Football Festival — find the code and win a signed jersey!", bodyText: "A City Group brand", ctaLabel: "Play Now", brandColor: "#1D3A6A", brandInitials: "CG", logoUrl: "/brands/citygroup.png", linkUrl: "https://www.citygroup.com.bd", impressions: 29850, clicks: 476 },
    // VIDEO_PREROLL (shorts pre-roll)
    { name: "Grameenphone — Video Pre-Roll (Demo)", placement: "VIDEO_PREROLL", headline: "GP Internet — live scores and highlights, free of charge", bodyText: "Activate the free video pack in the MyGP app now", ctaLabel: "Subscribe", brandColor: "#009FE3", brandInitials: "GP", logoUrl: "/brands/grameenphone.svg", linkUrl: "https://www.grameenphone.com", impressions: 15760, clicks: 402 },
    { name: "Daraz — Video Pre-Roll (Demo)", placement: "VIDEO_PREROLL", headline: "Daraz 11.11 Mega Sale — football merch up to 70% off", bodyText: "Premium jerseys, boots and fan gear — limited stock", ctaLabel: "Shop Now", brandColor: "#F57224", brandInitials: "DZ", logoUrl: "/brands/daraz.png", linkUrl: "https://www.daraz.com.bd", impressions: 14230, clicks: 377 },
    // EXTENDED ROSTER (added with official brand logos)
    { name: "Milk Vita — Header (Demo)", placement: "HEADER_BANNER", headline: "Fuel your matchday — Milk Vita fresh dairy drinks", bodyText: "Fresh from the cooperative farms of Bangladesh", ctaLabel: "Learn More", brandColor: "#0057A8", brandInitials: "MV", logoUrl: "/brands/milkvita.svg", linkUrl: "https://www.milkvita.com.bd", impressions: 12140, clicks: 288 },
    { name: "Uber Bangladesh — Header (Demo)", placement: "HEADER_BANNER", headline: "Stadium nights, zero parking stress — 20% off Uber rides", bodyText: "Code FHBUBER on your next matchday trip", ctaLabel: "Ride Now", brandColor: "#111111", brandInitials: "UB", logoUrl: "/brands/uber.svg", linkUrl: "https://www.uber.com/bd", impressions: 15320, clicks: 341 },
    { name: "Robi 4.5G — Sidebar (Demo)", placement: "SIDEBAR", headline: "Stream every goal in HD with Robi 4.5G match packs", bodyText: "Instant activation in the My Robi app", ctaLabel: "Activate", brandColor: "#E63312", brandInitials: "R4", logoUrl: "/brands/robi.svg", linkUrl: "https://www.robi.com.bd", impressions: 8760, clicks: 212 },
    { name: "Bata Bangladesh — Sidebar (Demo)", placement: "SIDEBAR", headline: "Kop your matchday boots — Bata Sport autumn drop", bodyText: "Lightweight studs and turf shoes for every surface", ctaLabel: "Shop Now", brandColor: "#D22730", brandInitials: "BT", logoUrl: "/brands/bata.png", linkUrl: "https://www.batabd.com", impressions: 7210, clicks: 168 },
    { name: "City Group (Teer Fuel) — In-Feed (Demo)", placement: "IN_FEED", headline: "Teer Fuel — official energy partner of matchdays", bodyText: "A City Group brand", ctaLabel: "Learn More", brandColor: "#1D3A6A", brandInitials: "CG", logoUrl: "/brands/citygroup.png", linkUrl: "https://www.citygroup.com.bd", impressions: 11480, clicks: 244 },
    { name: "Brac Bank — In-Feed (Demo)", placement: "IN_FEED", headline: "Astha — buy your season tickets in easy instalments", bodyText: "0% interest for the first 3 months", ctaLabel: "Apply Now", brandColor: "#0A66C2", brandInitials: "BB", logoUrl: "/brands/bracbank.svg", linkUrl: "https://www.bracbank.com", impressions: 9340, clicks: 197 },
    { name: "Sultan's Dine — Mobile (Demo)", placement: "MOBILE_BANNER", headline: "Full night of football? Full plate of kacchi first.", bodyText: "Order before kickoff — hot and fresh", ctaLabel: "Order", brandColor: "#B45309", brandInitials: "SD", logoUrl: "/brands/sultans.png", linkUrl: "https://www.sultansdine.com", impressions: 26730, clicks: 588 },
    { name: "Freelancer.com BD — Mobile (Demo)", placement: "MOBILE_BANNER", headline: "Design football graphics. Get paid in bKash.", bodyText: "Millions of projects posted every month", ctaLabel: "Join Free", brandColor: "#22C55E", brandInitials: "FL", logoUrl: "/brands/freelancer.svg", linkUrl: "https://www.freelancer.com", impressions: 18920, clicks: 402 },
    { name: "Sony BRAVIA — Preroll (Demo)", placement: "VIDEO_PREROLL", headline: "Highlights deserve a big screen — BRAVIA 55\" 4K OLED TV", bodyText: "See every goal the way it was meant to be seen", ctaLabel: "Learn More", brandColor: "#0F0F0F", brandInitials: "SO", logoUrl: "/brands/sony.svg", linkUrl: "https://www.sony.com.bd", impressions: 12870, clicks: 331 },
  ];
  for (const ad of demoAds) {
    await db.adSlot.create({
      data: {
        name: ad.name, placement: ad.placement, provider: "ADSENSE", adCode: "<!-- AdSense snippet placeholder -->",
        imageHint: ad.imageHint ?? null, linkUrl: ad.linkUrl ?? null,
        headline: ad.headline, bodyText: ad.bodyText ?? null, ctaLabel: ad.ctaLabel,
        brandColor: ad.brandColor, brandInitials: ad.brandInitials,
        logoUrl: ad.logoUrl, logoTheme: ad.logoTheme ?? "LIGHT",
        active: true, impressions: ad.impressions, clicks: ad.clicks,
      },
    });
  }

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
