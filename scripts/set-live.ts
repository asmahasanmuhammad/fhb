import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const bpl = await db.competition.findFirst({ where: { shortName: "BPL" } });
  const teams = await db.team.findMany({ where: { shortName: { in: ["Bashundhara Kings", "Mohammedan SC", "Abahani Ltd Dhaka", "Fortis FC", "Saif SC", "Brothers Union"] } } });
  const byShort = (s: string) => teams.find((t) => t.shortName === s)!;
  const bsk = byShort("Bashundhara Kings");
  const msc = byShort("Mohammedan SC");
  const ab = byShort("Abahani Ltd Dhaka");
  const fts = byShort("Fortis FC");
  // Reset/refresh: find recent finished derby & set new live matches
  await db.match.updateMany({ where: { status: "LIVE" }, data: { status: "FINISHED", period: "FT" } });
  const players = await db.player.findMany({ where: { teamId: { in: [bsk.id, msc.id, ab.id, fts.id] }, position: { not: "GK" } } });
  const pick = (id: string) => players.filter((p) => p.teamId === id);
  const m1 = await db.match.create({ data: { competitionId: bpl!.id, homeTeamId: bsk.id, awayTeamId: msc.id, homeScore: 1, awayScore: 1, status: "LIVE", minute: 23, period: "1H", kickoff: new Date(Date.now() - 27*60000), venue: "বসুন্ধরা কিংস এরিনা", matchday: 10, featured: true } });
  const m2 = await db.match.create({ data: { competitionId: bpl!.id, homeTeamId: ab.id, awayTeamId: fts.id, homeScore: 0, awayScore: 0, status: "LIVE", minute: 41, period: "1H", kickoff: new Date(Date.now() - 45*60000), venue: "আবাহনী গ্রাউন্ড, ধানমন্ডি", matchday: 10 } });
  await db.matchEvent.create({ data: { matchId: m1.id, minute: 12, type: "GOAL", teamId: bsk.id, teamSide: "home", playerName: pick(bsk.id)[0]?.name, detail: "গোল" } });
  await db.matchEvent.create({ data: { matchId: m1.id, minute: 19, type: "GOAL", teamId: msc.id, teamSide: "away", playerName: pick(msc.id)[0]?.name, detail: "গোল" } });
  console.log("Live matches created:", m1.id, m2.id);
}
main().finally(() => db.$disconnect());
