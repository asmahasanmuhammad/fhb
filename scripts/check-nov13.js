const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function checkNov13() {
  const matches = await db.match.findMany({
    where: {
      kickoff: {
        gte: new Date('2026-11-13T00:00:00Z'),
        lte: new Date('2026-11-13T23:59:59Z')
      }
    },
    include: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: { kickoff: 'asc' }
  });

  console.log(`FHB matches for 2026-11-13 UTC (Total: ${matches.length}):`);
  matches.forEach(m => {
    console.log(`  ${m.kickoff.toISOString().slice(11, 16)} | ${m.competition.shortName.padEnd(15)} | ${m.homeTeam.name.padEnd(20)} vs ${m.awayTeam.name}`);
  });

  process.exit(0);
}
checkNov13();
