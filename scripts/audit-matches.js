const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  const all = await db.match.findMany({
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      competition: { select: { name: true, shortName: true } }
    },
    orderBy: { kickoff: 'asc' }
  });
  console.log('Total matches in DB:', all.length);
  
  // Group by competition
  const byComp = {};
  all.forEach(m => {
    byComp[m.competition.name] = (byComp[m.competition.name] || 0) + 1;
  });
  console.log('By competition:');
  Object.entries(byComp).forEach(([k, v]) => console.log('  ', k, ':', v));

  // Check what matches are for Nov 12, 13, 14, 15
  console.log('\nMatches around Nov 12-15, 2026:');
  const todayMatches = all.filter(m => {
    const k = m.kickoff.toISOString();
    return k.startsWith('2026-11-12') || k.startsWith('2026-11-13') || k.startsWith('2026-11-14') || k.startsWith('2026-11-15');
  });
  console.log('Count:', todayMatches.length);
  todayMatches.forEach(m => {
    console.log(' ', m.kickoff.toISOString(), '|', m.status.padEnd(9), '|', m.homeTeam.name.padEnd(20), (m.homeScore ?? '-') + '-' + (m.awayScore ?? '-'), m.awayTeam.name.padEnd(20), '|', m.competition.name);
  });
  await db.$disconnect();
}
run();
