const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function check() {
  const live = await db.match.findMany({
    where: { status: 'LIVE' },
    include: { homeTeam: true, awayTeam: true, competition: true }
  });
  console.log('LIVE matches right now:', live.length);
  live.forEach(m => console.log('  ', m.minute + "'", m.homeTeam.name, m.homeScore, '-', m.awayScore, m.awayTeam.name, '|', m.competition.shortName));

  const saff = await db.match.findMany({
    where: { competition: { shortName: 'SAFF' } },
    include: { homeTeam: true, awayTeam: true }
  });
  console.log('\nSAFF matches in DB:');
  saff.forEach(m => console.log('  ', m.kickoff.toISOString(), m.status, m.homeTeam.name, m.homeScore, '-', m.awayScore, m.awayTeam.name));

  const longNames = await db.team.findMany({
    where: { name: { contains: 'National Football Team' } }
  });
  console.log('\nTeams with "National Football Team":', longNames.length);
  longNames.forEach(t => console.log('  ', t.name, '| short:', t.shortName));

  process.exit(0);
}
check();
