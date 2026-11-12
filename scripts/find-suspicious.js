const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function check() {
  const matches = await db.match.findMany({
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true
    },
    orderBy: { kickoff: 'asc' }
  });

  console.log(`Total matches in DB: ${matches.length}`);
  
  // Find weird matches
  console.log('\n--- Checking for suspicious matches ---');
  for (const m of matches) {
    const isWeird = 
      (m.round && (
        m.round.toLowerCase().includes('women') || 
        m.round.toLowerCase().includes('u-21') || 
        m.round.toLowerCase().includes('u21') ||
        m.round.toLowerCase().includes('college') ||
        m.round.toLowerCase().includes('reserve')
      )) ||
      (m.competition.shortName === 'UCL' && m.kickoff.toISOString().startsWith('2026-11-12')) ||
      (m.competition.shortName === 'LaLiga' && m.round && m.round.includes('Segunda')) ||
      (m.homeTeam.name.includes('U21') || m.awayTeam.name.includes('U21'));

    if (isWeird) {
      console.log(`[SUSPICIOUS] ${m.id} | ${m.kickoff.toISOString()} | ${m.competition.name} | ${m.homeTeam.name} vs ${m.awayTeam.name} | round: "${m.round}"`);
    }
  }

  process.exit(0);
}

check();
