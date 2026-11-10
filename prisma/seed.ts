/**
 * Football Hub Bangladesh — Official Database Seeder
 * Full English broadcast data with authentic players, news, and ads.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

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

// Authentic football media photography
const IMG = {
  stadium: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=700&fit=crop",
  ],
  action: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=700&fit=crop",
  ],
  fans: [
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=700&fit=crop",
  ],
  celebrate: [
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1570498839593-e565b3d7f672?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=700&fit=crop",
  ],
  training: [
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=700&fit=crop",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1200&h=700&fit=crop",
  ],
};

async function main() {
  console.log("Seeding Football Hub Bangladesh (100% English Broadcast Edition)...");

  // Wipe previous data
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
      name: "FHB Newsroom Chief",
      passwordHash: hashPassword("Admin@2025"),
      role: "ADMIN",
      bio: "Official editorial desk of Football Hub Bangladesh. Live broadcast coverage & investigative journalism.",
    },
  });
  const editor = await db.user.create({
    data: {
      email: "editor@fhb.com.bd",
      username: "tariq_editor",
      name: "Tariqul Islam",
      passwordHash: hashPassword("Editor@2025"),
      role: "ADMIN",
      bio: "Senior Football Correspondent — covering the Bangladesh Premier League and FIFA World Cup Qualifiers.",
    },
  });
  const creator1 = await db.user.create({
    data: {
      email: "creator@fhb.com.bd",
      username: "shakil_tactics",
      name: "Shakil Khan",
      passwordHash: hashPassword("Creator@2025"),
      role: "CREATOR",
      bio: "BFL matchday highlights, tactical breakdowns and stadium atmosphere shorts.",
      followerCount: 24800,
    },
  });
  const creator2 = await db.user.create({
    data: {
      email: "guru@fhb.com.bd",
      username: "bengal_football_guru",
      name: "Football Analyst",
      passwordHash: hashPassword("Creator@2025"),
      role: "CREATOR",
      bio: "Deep tactical pitch analysis, player scouting reports and transfer radar specials.",
      followerCount: 18400,
    },
  });

  const fanNames: Array<[string, string, string, string]> = [
    ["tanvir@fhb.com.bd", "tanvir10", "Tanvir Ahmed", "Lifelong Abahani Limited Dhaka supporter. Always backing the Bengal Tigers!"],
    ["mim@fhb.com.bd", "mim_akter", "Mim Akter", "Mohammedan SC ultra. Football is passion, history, and community!"],
    ["sakib@fhb.com.bd", "sakib_h", "Sakib Hossain", "Bashundhara Kings season ticket holder. Match day at Kings Arena is unmatched!"],
    ["nusrat@fhb.com.bd", "nusrat_j", "Nusrat Jahan", "Hamza Choudhury fan and women's football advocate. South Asian champions!"],
    ["rakib@fhb.com.bd", "rakib_bd", "Rakib Hasan", "Tactical scout follower. Believing in Bangladesh football's modern renaissance."],
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

  // Premium Supporter
  await db.user.update({
    where: { id: fans[1].id },
    data: { isPremium: true, premiumUntil: new Date(Date.now() + 30 * 864e5) },
  });
  await db.subscription.create({
    data: {
      userId: fans[1].id,
      planCode: "PRO",
      amount: 149,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 30 * 864e5),
    },
  });

  // ================= TEAMS (BFL 2025-26) =================
  const teamDefs = [
    { name: "Bashundhara Kings", shortName: "Bashundhara Kings", initials: "BK", city: "Dhaka", stadium: "Bashundhara Kings Arena", founded: 2013, color: "#E11D48", color2: "#4C0519", strength: 0.94 },
    { name: "Abahani Limited Dhaka", shortName: "Abahani Ltd Dhaka", initials: "AB", city: "Dhaka", stadium: "Abahani Ground, Dhanmondi", founded: 1972, color: "#0891B2", color2: "#083344", strength: 0.85 },
    { name: "Mohammedan Sporting Club", shortName: "Mohammedan SC", initials: "MSC", city: "Dhaka", stadium: "Bir Shrestha Shaheed Sepahi Kamal Stadium", founded: 1936, color: "#059669", color2: "#022C22", strength: 0.83 },
    { name: "Sheikh Russel Krira Chakra", shortName: "Sheikh Russel KC", initials: "SR", city: "Dhaka", stadium: "Rafiquddin Bhuiyan Stadium, Tongi", founded: 1995, color: "#7C3AED", color2: "#2E1065", strength: 0.72 },
    { name: "Saif Sporting Club", shortName: "Saif SC", initials: "SAIF", city: "Dhaka", stadium: "Saif Complex Ground", founded: 2016, color: "#B91C1C", color2: "#450A0A", strength: 0.69 },
    { name: "Fortis Football Club", shortName: "Fortis FC", initials: "FTS", city: "Dhaka", stadium: "Fortis Arena, Amulia", founded: 2020, color: "#CA8A04", color2: "#422006", strength: 0.62 },
    { name: "Bangladesh Police FC", shortName: "Police FC", initials: "POL", city: "Dhaka", stadium: "Rajarbagh Ground", founded: 1972, color: "#475569", color2: "#0F172A", strength: 0.57 },
    { name: "Rahmatganj MFS", shortName: "Rahmatganj MFS", initials: "RJ", city: "Dhaka", stadium: "Old Dhaka Ground", founded: 1933, color: "#B45309", color2: "#451A03", strength: 0.52 },
    { name: "Muktijoddha SKC", shortName: "Muktijoddha SKC", initials: "MSK", city: "Dhaka", stadium: "Gopalganj Stadium", founded: 1972, color: "#DC2626", color2: "#450A0A", strength: 0.50 },
    { name: "Brothers Union", shortName: "Brothers Union", initials: "BU", city: "Dhaka", stadium: "Gopibagh Ground", founded: 1949, color: "#EA580C", color2: "#431407", strength: 0.47 },
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
        description: `${t.shortName} based in ${t.city}. Regular title contender in the Bangladesh Premier League. Home ground: ${t.stadium}.`,
      },
    });
    teams[t.initials] = team.id;
  }

  // ================= PLAYERS (Authentic Photos & Profiles) =================
  type PDef = {
    name: string;
    team: string;
    pos: string;
    num: number;
    nat?: string;
    by?: number;
    nt?: boolean;
    goals?: number;
    assists?: number;
    apps?: number;
    rating?: number;
    cs?: number;
    photoUrl?: string;
    bio?: string;
  };

  const playerDefs: PDef[] = [
    // Bashundhara Kings
    {
      name: "Mitul Marma",
      team: "BK",
      pos: "GK",
      num: 1,
      nt: true,
      cs: 6,
      apps: 8,
      rating: 7.6,
      photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=350&h=350&fit=crop&crop=face",
      bio: "First-choice goalkeeper for the Bangladesh National Team. Celebrated for miraculous reflex saves inside the six-yard box.",
    },
    {
      name: "Topu Barman",
      team: "BK",
      pos: "DF",
      num: 5,
      nt: true,
      goals: 2,
      apps: 8,
      rating: 7.8,
      photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=350&h=350&fit=crop&crop=face",
      bio: "Veteran centre-back and National Team captain. Renowned for commanding aerial dominance and defensive leadership.",
    },
    {
      name: "Rakib Hossain",
      team: "BK",
      pos: "MF",
      num: 7,
      nt: true,
      goals: 4,
      assists: 6,
      apps: 8,
      rating: 8.1,
      photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=350&h=350&fit=crop&crop=face",
      bio: "Dynamic winger and free-kick specialist. Leads the BFL in key chances created and progressive dribbles.",
    },
    {
      name: "Mohammad Ibrahim",
      team: "BK",
      pos: "FW",
      num: 11,
      nt: true,
      goals: 5,
      assists: 3,
      apps: 8,
      rating: 7.9,
      photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=350&h=350&fit=crop&crop=face",
      bio: "Explosive attacker whose rapid counter-attacking runs terrorise opposition defences across the league.",
    },
    {
      name: "Sheikh Morsalin",
      team: "BK",
      pos: "FW",
      num: 9,
      nt: true,
      goals: 7,
      assists: 2,
      apps: 8,
      rating: 8.3,
      photoUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=350&h=350&fit=crop&crop=face",
      bio: "The rising jewel of Bangladesh football. Clinical long-range striking capability and linked with Belgian club Royal Antwerp.",
    },
    {
      name: "Raniel",
      team: "BK",
      pos: "FW",
      num: 10,
      nat: "Brazil",
      goals: 8,
      assists: 4,
      apps: 8,
      rating: 8.4,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&h=350&fit=crop&crop=face",
      bio: "Marquee Brazilian center-forward with supreme technical hold-up play and aerial finishing prowess.",
    },
    {
      name: "Dorielton Gomes",
      team: "BK",
      pos: "FW",
      num: 99,
      nat: "Brazil",
      goals: 6,
      assists: 5,
      apps: 7,
      rating: 8.0,
      photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=350&h=350&fit=crop&crop=face",
      bio: "Prolific Brazilian goalscorer with back-to-back golden boot honours in domestic competitions.",
    },
    {
      name: "Tariq Kazi",
      team: "BK",
      pos: "DF",
      num: 4,
      nat: "Finland (Bangladeshi origin)",
      nt: true,
      goals: 1,
      apps: 8,
      rating: 7.7,
      photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=350&h=350&fit=crop&crop=face",
      bio: "Finnish-trained modern fullback and central defender. Integral part of the National Team's defensive resilience.",
    },

    // Abahani Limited Dhaka
    {
      name: "Nabib Newaz Jibon",
      team: "AB",
      pos: "FW",
      num: 9,
      nt: true,
      goals: 6,
      assists: 2,
      apps: 8,
      rating: 7.8,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=350&h=350&fit=crop&crop=face",
      bio: "Veteran striker possessing remarkable penalty box anticipation and sharp movement off the ball.",
    },
    {
      name: "Sohel Rana",
      team: "AB",
      pos: "MF",
      num: 6,
      nt: true,
      goals: 2,
      assists: 4,
      apps: 8,
      rating: 7.5,
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=350&h=350&fit=crop&crop=face",
      bio: "The midfield engine of Abahani Dhaka. Combines tenacious ball recovery with precise forward distribution.",
    },
    {
      name: "Yasin Khan",
      team: "AB",
      pos: "DF",
      num: 4,
      nt: true,
      goals: 1,
      apps: 7,
      rating: 7.3,
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&h=350&fit=crop&crop=face",
      bio: "Reliable centre-back with years of top-flight experience and aerial prowess on offensive set pieces.",
    },
    {
      name: "Samuel Okonkwo",
      team: "AB",
      pos: "FW",
      num: 88,
      nat: "Nigeria",
      goals: 5,
      apps: 8,
      rating: 7.6,
      photoUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=350&h=350&fit=crop&crop=face",
      bio: "Powerful Nigerian forward with blisteringly quick pace and an eye for goal from tight angles.",
    },

    // Mohammedan Sporting Club
    {
      name: "Jamal Bhuyan",
      team: "MSC",
      pos: "MF",
      num: 8,
      nt: true,
      goals: 3,
      assists: 5,
      apps: 8,
      rating: 8.2,
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&h=350&fit=crop&crop=face",
      bio: "Captain of the Bangladesh National Team. Regarded as one of South Asia's premier deep-lying playmakers.",
    },
    {
      name: "Faisal Ahmed Fahim",
      team: "MSC",
      pos: "FW",
      num: 7,
      nt: true,
      goals: 5,
      assists: 4,
      apps: 8,
      rating: 7.8,
      photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=350&h=350&fit=crop&crop=face",
      bio: "Fast, technically gifted winger whose one-on-one taking-on ability continually unlocks tight defences.",
    },
    {
      name: "Bishwanath Ghosh",
      team: "MSC",
      pos: "DF",
      num: 5,
      nt: true,
      goals: 1,
      apps: 8,
      rating: 7.4,
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=350&h=350&fit=crop&crop=face",
      bio: "Tenacious right-back famed for long throw-ins and steadfast recovery speed.",
    },
    {
      name: "Ashiqur Rahman",
      team: "MSC",
      pos: "GK",
      num: 1,
      nt: true,
      cs: 5,
      apps: 8,
      rating: 7.3,
      photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=350&h=350&fit=crop&crop=face",
      bio: "Agile shot-stopper in tremendous form for Mohammedan this season.",
    },

    // Foreign-based National Hero
    {
      name: "Hamza Choudhury",
      team: "",
      pos: "MF",
      num: 17,
      nat: "England (Bangladeshi origin)",
      nt: true,
      by: 1997,
      goals: 2,
      assists: 3,
      apps: 5,
      rating: 8.8,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=350&h=350&fit=crop&crop=face",
      bio: "Premier League star for Leicester City and FA Cup winner. Officially cleared by FIFA to captain the Bengal Tigers in the AFC Asian Cup Qualifiers.",
    },
    {
      name: "Touhidul Islam Sabuj",
      team: "SR",
      pos: "MF",
      num: 10,
      nt: true,
      goals: 3,
      assists: 3,
      apps: 8,
      rating: 7.3,
      photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=350&h=350&fit=crop&crop=face",
      bio: "Creative attacking midfielder serving as the focal point of Sheikh Russel KC.",
    },
    {
      name: "Ernest Boateng",
      team: "SAIF",
      pos: "FW",
      num: 9,
      nat: "Ghana",
      goals: 5,
      apps: 8,
      rating: 7.5,
      photoUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=350&h=350&fit=crop&crop=face",
      bio: "Dynamic Ghanaian striker leading Saif Sporting Club's attack with physical presence and clinical finishing.",
    },
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
        heightCm: rint(168, 188),
        goals: p.goals ?? 0,
        assists: p.assists ?? 0,
        appearances: p.apps ?? 0,
        cleanSheets: p.cs ?? 0,
        rating: p.rating ?? 6.8,
        isNationalTeam: p.nt ?? false,
        photoUrl: p.photoUrl ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&h=350&fit=crop&crop=face",
        bio: p.bio ?? `${p.pos} in the Bangladesh Premier League.`,
      },
    });
    playerIds[p.name] = player.id;
  }

  // ================= COMPETITIONS =================
  const bpl = await db.competition.create({
    data: {
      name: "Bangladesh Premier League",
      shortName: "BFL",
      type: "LEAGUE",
      season: "2025-26",
      country: "Bangladesh",
      accentColor: "#1FE07A",
      description: "The nation's pinnacle football championship featuring 10 elite clubs competing across 18 home-and-away matchdays.",
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
      description: "Bangladesh's historic knockout tournament bringing together the top clubs in high-stakes elimination drama.",
    },
  });
  const saff = await db.competition.create({
    data: {
      name: "SAFF Championship",
      shortName: "SAFF",
      type: "INTERNATIONAL",
      season: "2025",
      country: "South Asia",
      accentColor: "#FF5A48",
      description: "South Asia's premier international football championship contested by the national teams of the sub-continent.",
    },
  });

  // ================= MATCH FIXTURES =================
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
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  const strength: Record<string, number> = {};
  teamDefs.forEach((t) => (strength[t.initials] = t.strength));

  function genScore(h: string, a: string): [number, number] {
    const diff = strength[h] - strength[a];
    const hx = Math.max(0, Math.round(1.5 + diff * 6 + (rnd() - 0.5) * 2.2));
    const ax = Math.max(0, Math.round(1.0 - diff * 6 + (rnd() - 0.5) * 2.2));
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

  // Rounds 1-7 finished
  for (let r = 0; r < 7; r++) {
    const matchday = r + 1;
    const daysAgo = 22 - r * 3;
    for (const [h, a] of rounds[r]) {
      const [hs, as] = genScore(h, a);
      const kickoff = new Date(now.getTime() - daysAgo * DAY);
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
    }
  }

  // Round 8: Live Derby + Matches
  const derbyPair: [string, string] = ["BK", "MSC"];
  const liveMatch1 = await db.match.create({
    data: {
      competitionId: bpl.id,
      homeTeamId: teams[derbyPair[0]],
      awayTeamId: teams[derbyPair[1]],
      homeScore: 2,
      awayScore: 1,
      status: "LIVE",
      minute: 74,
      period: "2H",
      kickoff: new Date(now.getTime() - 80 * 60 * 1000),
      venue: "Bashundhara Kings Arena, Dhaka",
      matchday: 8,
      featured: true,
    },
  });
  await db.matchEvent.create({
    data: { matchId: liveMatch1.id, minute: 18, type: "GOAL", teamId: teams["BK"], teamSide: "home", playerName: "Sheikh Morsalin", detail: "Curled strike from 22 yards" },
  });
  await db.matchEvent.create({
    data: { matchId: liveMatch1.id, minute: 36, type: "GOAL", teamId: teams["MSC"], teamSide: "away", playerName: "Faisal Ahmed Fahim", detail: "Fast counter-attack finish" },
  });
  await db.matchEvent.create({
    data: { matchId: liveMatch1.id, minute: 58, type: "GOAL", teamId: teams["BK"], teamSide: "home", playerName: "Raniel", detail: "Towering header into top corner" },
  });

  const liveMatch2 = await db.match.create({
    data: {
      competitionId: bpl.id,
      homeTeamId: teams["AB"],
      awayTeamId: teams["SR"],
      homeScore: 1,
      awayScore: 0,
      status: "LIVE",
      minute: 42,
      period: "1H",
      kickoff: new Date(now.getTime() - 45 * 60 * 1000),
      venue: "Abahani Ground, Dhanmondi",
      matchday: 8,
      featured: false,
    },
  });
  await db.matchEvent.create({
    data: { matchId: liveMatch2.id, minute: 29, type: "GOAL", teamId: teams["AB"], teamSide: "home", playerName: "Nabib Newaz Jibon", detail: "Tap-in after goalmouth scramble" },
  });

  // Scheduled Matches
  await db.match.create({
    data: {
      competitionId: bpl.id,
      homeTeamId: teams["SAIF"],
      awayTeamId: teams["FTS"],
      status: "SCHEDULED",
      kickoff: new Date(now.getTime() + 4 * 3600 * 1000),
      venue: "Saif Complex Ground, Dhaka",
      matchday: 8,
    },
  });
  await db.match.create({
    data: {
      competitionId: bpl.id,
      homeTeamId: teams["POL"],
      awayTeamId: teams["RJ"],
      status: "SCHEDULED",
      kickoff: new Date(now.getTime() + 26 * 3600 * 1000),
      venue: "Rajarbagh Ground, Dhaka",
      matchday: 8,
    },
  });

  // ================= NATIONAL TEAMS =================
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
      description: "The Bengal Tigers representing Bangladesh on the international stage with pride and rising FIFA rankings.",
    },
  });
  const india = await db.team.create({
    data: { name: "India National Football Team", shortName: "India", initials: "IND", city: "New Delhi", stadium: "Jawaharlal Nehru Stadium", founded: 1937, color: "#2563EB", color2: "#1E3A8A" },
  });
  const maldives = await db.team.create({
    data: { name: "Maldives National Football Team", shortName: "Maldives", initials: "MDV", city: "Male", stadium: "Galolhu Stadium", founded: 1982, color: "#DC2626", color2: "#7F1D1D" },
  });

  // SAFF Semi-final
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

  // ================= STANDINGS =================
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
    else if (hs < as) { table[ak].won++; table[ak].points += 3; table[hk].lost++; table[ak].form.push("W"); table[ak].form.push("L"); }
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

  // ================= ORIGINAL AUTHENTIC NEWS ARTICLES =================
  const day = (n: number) => new Date(now.getTime() - n * DAY);
  const articles = [
    {
      title: "FIFA Grants Full Clearance for Hamza Choudhury: Premier League Midfielder Set for Historic Bangladesh Debut",
      category: "NATIONAL",
      featured: true,
      cover: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=700&fit=crop",
      views: 74210,
      likes: 3420,
      excerpt: "Leicester City midfielder Hamza Choudhury receives official dual allegiance green-light from FIFA. The first active Premier League star to wear the red and green jersey.",
      content: `The Bangladesh Football Federation (BFF) has formally confirmed that FIFA's Players' Status Chamber has approved Hamza Choudhury's change of association. The Sylhet-rooted midfielder, who lifted both the FA Cup and FA Community Shield with Leicester City, is now 100% eligible to represent the Bangladesh National Team.

## Historic Milestone for South Asian Football

Never in the 52-year history of Bangladesh football has an active player from Europe's top five leagues joined the national squad. With over 120 Premier League appearances, Hamza's inclusion is projected to transform the tactical landscape of South Asian football.

## Tactical Breakdown: How Hamza Elevates the Midfield

- **High-Intensity Ball Recovery:** Ranks in the 91st percentile for ground duels and midfield turnovers in English football.
- **Progressive Line-Breaking Distribution:** Immediate vertical outlet passes to fast wingers Rakib Hossain and Mohammad Ibrahim.
- **Defensive Transition Shield:** Anchors the defensive midfield line, allowing Jamal Bhuyan the creative freedom to operate higher up the pitch.
- **Set-Piece Aerial Superiority:** Adds crucial physical commanding presence at both defensive and offensive corners.

## Head Coach Javier Cabrera's Reaction

> "Hamza's arrival elevates our professional standard immediately. His match awareness, tactical discipline, and Premier League pedigree give us tremendous self-belief ahead of our AFC Asian Cup qualifiers."

Tickets for Hamza's anticipated debut at Bangabandhu National Stadium sold out within 45 minutes of online release on the FHB platform.`,
    },
    {
      title: "Kings Arena Fortress: Bashundhara Kings Dominate Title Race with 74th-Minute Derby Mastery",
      category: "BPL",
      featured: true,
      cover: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=700&fit=crop",
      views: 52100,
      likes: 1890,
      excerpt: "Sheikh Morsalin and Raniel find the net as the reigning champions maintain an unbeaten run and extend their commanding lead at the summit of the BFL.",
      content: `In front of an electric sell-out crowd at Bashundhara Kings Arena, the defending champions delivered another masterclass in tactical discipline and clinical finishing.

## Match Highlights

The breakthrough arrived on 18 minutes when 19-year-old sensation Sheikh Morsalin curled a venomous right-footed strike into the top corner from 22 yards. Mohammedan responded courageously before half-time with Faisal Ahmed Fahim finishing a swift break, but the Kings' Brazilian talisman Raniel settled the encounter with a commanding header on 58 minutes.

## The Numbers Behind Kings' Dominance

- **Unbeaten Streak:** 14 consecutive league matches without defeat.
- **Home Record:** 100% win rate at Bashundhara Kings Arena this season.
- **Goal Difference:** +18 goal margin over closest title chasers Abahani Dhaka.

With 10 matchdays remaining, the Kings look firmly positioned to claim their unprecedented 6th consecutive Bangladesh Premier League championship.`,
    },
    {
      title: "Dhaka Derby Rekindled: 50 Years of Passion as Mohammedan and Abahani Prepare for Federation Cup Semifinal",
      category: "NATIONAL",
      featured: false,
      cover: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&h=700&fit=crop",
      views: 39800,
      likes: 1420,
      excerpt: "Dhaka's quintessential sporting rivalry writes its next chapter at Bangabandhu National Stadium with a final ticket on the line.",
      content: `Since the inaugural derby in 1973, nothing divides Dhaka quite like the clash between the black-and-whites of Mohammedan Sporting Club and the sky-blues of Abahani Limited.

## A Tale of Two Tactical Philosophies

Mohammedan under their tactician rely on heavy transitional pressing and the blistering pace of Fahim and Jamal Bhuyan's orchestrating passing. Abahani counter with a possession-based 4-2-3-1, spearheaded by veteran goalscorer Nabib Newaz Jibon and midfield anchor Sohel Rana.

## Matchday Logistics & Security

Over 25,000 supporters are expected at Bangabandhu National Stadium. BFF authorities have confirmed upgraded digital turnstiles, integrated CCTV surveillance, and special express entry gates for FHB Digital Pass holders.`,
    },
    {
      title: "European Transfer Radar: Belgian Giants Royal Antwerp Formalise €1.1M Bid for Prodigy Sheikh Morsalin",
      category: "TRANSFER",
      featured: false,
      cover: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=700&fit=crop",
      views: 45600,
      likes: 2100,
      excerpt: "Belgian Pro League side Royal Antwerp opens direct negotiations with Bashundhara Kings for 19-year-old forward Sheikh Morsalin in a groundbreaking European deal.",
      content: `European interest in South Asian football has reached a watershed moment. According to verified transfer correspondents, Belgian top-flight club Royal Antwerp has submitted a formal inquiry for Bashundhara Kings and Bangladesh starlet Sheikh Morsalin.

## The Deal Details

- **Estimated Valuation:** €1.10 Million (approximately BDT 14.5 Crore).
- **Structure:** 4-year contract with performance incentives and international caps bonus.
- **Work Permit Roadmap:** Fast-track eligibility pathway through Belgian Pro League development framework.

Kings management confirmed preliminary discussions are underway, stating they will prioritize the sporting progression of the young Bangladeshi star on the European stage.`,
    },
    {
      title: "Goalkeeping Excellence: Mitul Marma's Record-Breaking Clean-Sheet Campaign",
      category: "BPL",
      featured: false,
      cover: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=700&fit=crop",
      views: 28900,
      likes: 980,
      excerpt: "With 6 clean sheets in 8 matches, national team keeper Mitul Marma is putting together one of the most resilient seasons in modern league history.",
      content: `A goalkeeper's performance is often the clearest barometer of a team's championship credentials. This season, Mitul Marma's commanding presence between the posts has turned Bashundhara Kings' defence into an impenetrable fortress.

## Key Performance Metrics

- **Save Percentage:** 88.4% of shots on target saved.
- **Expected Goals Prevented (xGP):** +4.2 goals prevented against post-shot trajectory.
- **Cross Claim Success:** 94% aerial win rate inside the penalty area.`,
    },
    {
      title: "Tactical Deep Dive: How Javier Cabrera Engineered Bangladesh's High-Press Modernization",
      category: "OPINION",
      featured: false,
      cover: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&h=700&fit=crop",
      views: 31200,
      likes: 1150,
      excerpt: "From deep defensive containment to proactive pressing: an analysis of the tactical blueprint reshaping the Bengal Tigers' international performances.",
      content: `For decades, South Asian football teams relied on low-block defensive shells when facing superior international opposition. Spanish tactician Javier Cabrera has quietly revolutionized that paradigm for Bangladesh.

## The Three Pillars of the New System

1. **High Line of Engagement:** Forcing opposition centre-backs to play hurried long balls rather than building through midfield.
2. **Double Pivot Symmetry:** Balancing defensive aggression with spatial coverage across central areas.
3. **Exploiting Wide Overloads:** Utilizing athletic fullbacks Tariq Kazi and Bishwanath Ghosh as secondary wing-backs during attacking phases.`,
    },
    {
      title: "Women's Football Triumph: Bangladesh Celebrate Back-to-Back SAFF Championships",
      category: "NATIONAL",
      featured: false,
      cover: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1200&h=700&fit=crop",
      views: 61500,
      likes: 4100,
      excerpt: "The Bangladesh Women's National Team cements their regional dominance with a resounding 3-1 triumph over Nepal in the Kathmandu final.",
      content: `The golden generation of Bangladesh Women's Football delivered another proud triumph for the nation, successfully defending their SAFF Championship title at Dasharath Stadium.

Tohura Khatun and Monika Chakma dazzled throughout the tournament, displaying technical sophistication and physical fitness that outclassed every regional opponent. The victory sparked spontaneous celebrations across Dhaka and renewed calls for expanded professional domestic league investment.`,
    },
    {
      title: "AFC Challenge League Campaign: Bashundhara Kings Drawn in Group E Against Regional Heavyweights",
      category: "INTERNATIONAL",
      featured: false,
      cover: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=700&fit=crop",
      views: 24700,
      likes: 870,
      excerpt: "Continental football returns as Kings represent Bangladesh against East and West Asian champions in the newly formatted AFC Challenge League.",
      content: `The Asian Football Confederation has officially conducted the draw for the 2025-26 AFC Challenge League group stages. Bashundhara Kings will host matches at Kings Arena, welcoming top clubs from Lebanon, Maldives, and Bhutan.

Club president Imrul Hassan emphasized that advancing to the knockout stages is the clear organizational mandate for the season.`,
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
        authorId: i % 2 === 0 ? admin.id : editor.id,
        status: "PUBLISHED",
        featured: a.featured,
        views: a.views,
        likeCount: a.likes,
        createdAt: day(i + 1),
      },
    });
  }

  // ================= SHORTS VIDEOS =================
  const videos = [
    { title: "Rakib Hossain's unstoppable 30-yard free-kick into the top corner!", url: "/videos/bkb1.mp4", thumb: IMG.action[0], views: 310000, likes: 24500, tags: "freekick,bpl,golazo", creator: creator1 },
    { title: "Sheikh Morsalin solo sprint and finish from the halfway line!", url: "/videos/sintel1.mp4", thumb: IMG.action[1], views: 240000, likes: 19800, tags: "morsalin,solo,bpl", creator: creator1 },
    { title: "Dhaka Derby atmosphere: 25,000 fans singing under stadium lights", url: "/videos/jelly1.mp4", thumb: IMG.fans[0], views: 185000, likes: 16200, tags: "derby,fans,stadium", creator: creator2 },
    { title: "Mitul Marma's impossible triple save to deny Mohammedan!", url: "/videos/bkb2.mp4", thumb: IMG.celebrate[2], views: 145000, likes: 12400, tags: "goalkeeper,saves,bpl", creator: creator2 },
    { title: "Hamza Choudhury arrives at National Camp: first training moments", url: "/videos/jelly2.mp4", thumb: IMG.celebrate[0], views: 520000, likes: 48900, tags: "hamza,bengaltigers,nationalteam", creator: creator1 },
    { title: "Jamal Bhuyan tactical vision breakdown: 5 passes that unlocked the pitch", url: "/videos/flower.mp4", thumb: IMG.training[0], views: 98000, likes: 8900, tags: "tactics,jamal,playmaker", creator: creator2 },
  ];
  const videoIds: string[] = [];
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const vid = await db.video.create({
      data: {
        creatorId: v.creator.id,
        title: v.title,
        description: `${v.title} — Watch all matchday moments exclusively on Football Hub Bangladesh Shorts.`,
        videoUrl: v.url,
        thumbnailUrl: v.thumb,
        tags: v.tags,
        views: v.views,
        likeCount: v.likes,
        monetized: true,
        createdAt: new Date(now.getTime() - (i + 1) * 2 * DAY),
      },
    });
    videoIds.push(vid.id);
  }

  // ================= COMMUNITY POSTS =================
  const posts = [
    { author: fans[0], content: "Unbelievable atmosphere at the Derby today! Bangabandhu Stadium was buzzing from kickoff to the final whistle. Football in Bangladesh is truly back!", likes: 240, tag: "Abahani" },
    { author: fans[1], content: "Fahim's pace is genuinely frightening for any defender in this league. Mohammedan's transition game is improving with every single matchday.", likes: 180, tag: "Mohammedan" },
    { author: fans[2], content: "Kings Arena under floodlights is premier quality! If you haven't watched a match live in Bashundhara, you are missing out on modern stadium football.", likes: 310, tag: "Bashundhara" },
    { author: fans[3], content: "Hamza Choudhury starting in midfield for Bangladesh in the SAFF semifinal... goosebumps! Who else has booked their match tickets?", likes: 520, tag: "National Team" },
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
        createdAt: new Date(now.getTime() - (i + 1) * 6 * 3600 * 1000),
      },
    });
    postIds.push(post.id);
  }

  // ================= MEMBERSHIP PLANS =================
  await db.membershipPlan.create({
    data: {
      code: "FREE",
      name: "Fan Basic",
      price: 0,
      period: "forever",
      popular: false,
      sortOrder: 1,
      features: JSON.stringify(["Live scores & real-time match events", "Comprehensive news & transfer updates", "Watch all community shorts", "Comment & join fan discussions"]),
    },
  });
  await db.membershipPlan.create({
    data: {
      code: "PRO",
      name: "Pro Supporter",
      price: 149,
      period: "month",
      popular: true,
      sortOrder: 2,
      features: JSON.stringify(["100% Ad-Free broadcast experience", "4K Ultra-HD highlights stream", "Exclusive 48-hour early transfer alerts", "Verified Pro Fan badge", "Tactical analytics dashboards"]),
    },
  });
  await db.membershipPlan.create({
    data: {
      code: "LEGEND",
      name: "Legend VIP",
      price: 399,
      period: "month",
      popular: false,
      sortOrder: 3,
      features: JSON.stringify(["All Pro Supporter benefits", "Access to multi-cam stadium audio feeds", "15% discount on official club jerseys", "Creator tipping & VIP match meetups", "Priority stadium turnstile access"]),
    },
  });

  // ================= AUTHENTIC AD SLOTS =================
  const demoAds = [
    {
      name: "bKash — Matchday Ticket Leaderboard",
      placement: "HEADER_BANNER",
      headline: "Send Money Instantly & Win Official Matchday Tickets",
      bodyText: "Pay bills, transfer funds and enjoy cashbacks on ticket booking across Bangladesh",
      ctaLabel: "Open bKash App",
      brandColor: "#E2136E",
      brandInitials: "bK",
      linkUrl: "https://www.bkash.com",
      impressions: 48200,
      clicks: 1240,
    },
    {
      name: "Daraz — 11.11 Football Festival",
      placement: "HEADER_BANNER",
      headline: "Daraz 11.11 Mega Sale: Official Club Jerseys & Studs Up to 70% Off",
      bodyText: "Free delivery on all sports gear, football boots and team kits",
      ctaLabel: "Shop Deals Now",
      brandColor: "#F85606",
      brandInitials: "DZ",
      linkUrl: "https://www.daraz.com.bd",
      impressions: 54100,
      clicks: 1890,
    },
    {
      name: "Grameenphone — 4G Premier Football Pack",
      placement: "HEADER_BANNER",
      headline: "GP 4G Premier Football Pack: Zero-Buffering 4K Live Stream",
      bodyText: "Stream all BFL and international matches with unlimited high-speed sports data",
      ctaLabel: "Activate GP Data",
      brandColor: "#009FE3",
      brandInitials: "GP",
      linkUrl: "https://www.grameenphone.com",
      impressions: 39800,
      clicks: 980,
    },
    {
      name: "Nagad — Digital MFS Skyscraper",
      placement: "SIDEBAR",
      headline: "Instant Ticket Payments with Zero Fee on Nagad",
      bodyText: "Bangladesh Postal Department MFS. Secure send money, bills & matchday ticket cashbacks.",
      ctaLabel: "Use Nagad Now",
      brandColor: "#FF6A00",
      brandInitials: "NG",
      linkUrl: "https://www.nagad.com.bd",
      impressions: 29500,
      clicks: 650,
    },
    {
      name: "City Bank — Amex VIP Stadium Card",
      placement: "SIDEBAR",
      headline: "City Bank American Express VIP Stadium Access",
      bodyText: "Earn 10x reward points on sports equipment and get complimentary match hospitality passes.",
      ctaLabel: "Apply Amex Card",
      brandColor: "#003B70",
      brandInitials: "CB",
      linkUrl: "https://www.thecitybank.com",
      impressions: 21800,
      clicks: 430,
    },
    {
      name: "Walton — 4K Google TV Skyscraper",
      placement: "SIDEBAR",
      headline: "Walton 4K Google TV: The Stadium Atmosphere at Home",
      bodyText: "Dolby Vision Atmos, 120Hz Sports Motion Clarity & 0% interest EMI options.",
      ctaLabel: "Order Walton 4K",
      brandColor: "#0B4EA2",
      brandInitials: "W",
      linkUrl: "https://waltonhil.com",
      impressions: 19400,
      clicks: 390,
    },
    {
      name: "FHB Pro Supporter — Native In-Feed",
      placement: "IN_FEED",
      headline: "Go 100% Ad-Free with FHB Pro Supporter",
      bodyText: "Unlock multi-cam broadcast feeds, early transfer radar alerts and 4K highlights from Tk 99/mo.",
      ctaLabel: "Upgrade to Pro",
      brandColor: "#F59E0B",
      brandInitials: "FHB",
      linkUrl: "#premium",
      impressions: 68400,
      clicks: 2450,
    },
    {
      name: "Robi — 4.5G Superfast Sports Pack",
      placement: "IN_FEED",
      headline: "Robi 4.5G Superfast Sports Pack: 10GB Football Bundle",
      bodyText: "Stream matches and post fan reactions seamlessly with the nation's strongest digital grid.",
      ctaLabel: "Get 4.5G Pack",
      brandColor: "#E30613",
      brandInitials: "RB",
      linkUrl: "https://www.robi.com.bd",
      impressions: 34200,
      clicks: 870,
    },
    {
      name: "bKash — Mobile Sticky Banner",
      placement: "MOBILE_BANNER",
      headline: "Instant Ticket Cashback on bKash",
      ctaLabel: "Open App",
      brandColor: "#E2136E",
      brandInitials: "bK",
      linkUrl: "https://www.bkash.com",
      impressions: 81200,
      clicks: 1940,
    },
  ];

  for (const ad of demoAds) {
    await db.adSlot.create({
      data: {
        name: ad.name,
        placement: ad.placement,
        provider: "ADSENSE",
        adCode: "<!-- Verified Sponsor Script -->",
        linkUrl: ad.linkUrl,
        headline: ad.headline,
        bodyText: ad.bodyText,
        ctaLabel: ad.ctaLabel,
        brandColor: ad.brandColor,
        brandInitials: ad.brandInitials,
        active: true,
        impressions: ad.impressions,
        clicks: ad.clicks,
      },
    });
  }

  // Summary counts
  const summary = {
    users: await db.user.count(),
    teams: await db.team.count(),
    players: await db.player.count(),
    matches: await db.match.count(),
    liveMatches: await db.match.count({ where: { status: "LIVE" } }),
    articles: await db.newsArticle.count(),
    videos: await db.video.count(),
    adSlots: await db.adSlot.count(),
  };

  console.log("Seeding successfully completed:", summary);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
