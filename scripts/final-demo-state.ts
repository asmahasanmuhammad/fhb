/**
 * Final demo state setup: fresh live matches + admin premium reset.
 * Run: bun scripts/final-demo-state.ts
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // reset admin premium (keep fan 'mim' as premium showcase)
  await db.user.update({ where: { email: "admin@fhb.com.bd" }, data: { isPremium: false, premiumUntil: null } });
  await db.subscription.updateMany({ where: { user: { email: "admin@fhb.com.bd" }, status: "ACTIVE" }, data: { status: "CANCELLED" } });

  // finish any stale live matches
  await db.match.updateMany({ where: { status: "LIVE" }, data: { status: "FINISHED", period: "FT" } });

  const bpl = await db.competition.findFirst({ where: { shortName: "BPL" } });
  const fedCup = await db.competition.findFirst({ where: { shortName: "Federation Cup" } });
  const teams = await db.team.findMany();
  const byShort = (s: string) => teams.find((t) => t.shortName === s)!;

  const bsk = byShort("Bashundhara Kings");
  const msc = byShort("Mohammedan SC");
  const ab = byShort("Abahani Ltd Dhaka");
  const saif = byShort("Saif SC");
  const sr = byShort("Sheikh Russel KC");

  const players = await db.player.findMany({ where: { teamId: { in: [bsk.id, msc.id, ab.id, saif.id] }, position: { not: "GK" } } });
  const pick = (id: string) => players.filter((p) => p.teamId === id).map((p) => p.name);

  // Live derby (featured) — starts fresh at ~34'
  const m1 = await db.match.create({
    data: {
      competitionId: bpl!.id, homeTeamId: bsk.id, awayTeamId: msc.id,
      homeScore: 1, awayScore: 0, status: "LIVE", minute: 34, period: "1H",
      kickoff: new Date(Date.now() - 38 * 60000), venue: "বসুন্ধরা কিংস এরিনা", matchday: 11, featured: true,
    },
  });
  const bskPlayers = pick(bsk.id);
  const mscPlayers = pick(msc.id);
  await db.matchEvent.create({ data: { matchId: m1.id, minute: 21, type: "GOAL", teamId: bsk.id, teamSide: "home", playerName: bskPlayers[bskPlayers.length - 1], detail: "গোল" } });
  await db.matchEvent.create({ data: { matchId: m1.id, minute: 30, type: "YELLOW", teamId: msc.id, teamSide: "away", playerName: mscPlayers[mscPlayers.length - 1], detail: "হলুদ কার্ড" } });

  // Second live match
  const m2 = await db.match.create({
    data: {
      competitionId: bpl!.id, homeTeamId: ab.id, awayTeamId: saif.id,
      homeScore: 2, awayScore: 1, status: "LIVE", minute: 58, period: "2H",
      kickoff: new Date(Date.now() - 64 * 60000), venue: "আবাহনী গ্রাউন্ড, ধানমন্ডি", matchday: 11,
    },
  });
  const abPlayers = pick(ab.id);
  const saifPlayers = pick(saif.id);
  await db.matchEvent.create({ data: { matchId: m2.id, minute: 14, type: "GOAL", teamId: ab.id, teamSide: "home", playerName: abPlayers[0], detail: "গোল" } });
  await db.matchEvent.create({ data: { matchId: m2.id, minute: 39, type: "GOAL", teamId: saif.id, teamSide: "away", playerName: saifPlayers[saifPlayers.length - 1], detail: "গোল" } });
  await db.matchEvent.create({ data: { matchId: m2.id, minute: 52, type: "GOAL", teamId: ab.id, teamSide: "home", playerName: abPlayers[1] ?? abPlayers[0], detail: "গোল" } });

  // upcoming tonight (featured)
  await db.match.create({
    data: {
      competitionId: fedCup!.id, homeTeamId: msc.id, awayTeamId: ab.id,
      status: "SCHEDULED", kickoff: new Date(Date.now() + 5 * 3600 * 1000),
      venue: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা", round: "সেমিফাইনাল", featured: true,
    },
  });
  // another upcoming
  await db.match.create({
    data: {
      competitionId: fedCup!.id, homeTeamId: bsk.id, awayTeamId: sr.id,
      status: "SCHEDULED", kickoff: new Date(Date.now() + 26 * 3600 * 1000),
      venue: "বসুন্ধরা কিংস এরিনা", round: "সেমিফাইনাল",
    },
  });

  const liveCount = await db.match.count({ where: { status: "LIVE" } });
  console.log(`✅ Demo state ready: ${liveCount} live matches (derby 1-0 at 34', Abahani 2-1 at 58'), featured cup semifinal tonight.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
