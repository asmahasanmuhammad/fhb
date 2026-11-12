const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  // Check LIVE matches
  const live = await db.match.findMany({
    where: { status: 'LIVE' },
    include: { homeTeam: true, awayTeam: true, competition: true }
  });
  console.log('LIVE matches:', live.length);
  live.forEach(m => console.log(' -', m.competition.name, '|', m.homeTeam.name, m.homeScore, '-', m.awayScore, m.awayTeam.name));

  // List all competitions
  const comps = await db.competition.findMany({ select: { id: true, name: true, type: true } });
  console.log('\nAll competitions:');
  comps.forEach(c => console.log(c.id, '|', c.name, '|', c.type));

  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
