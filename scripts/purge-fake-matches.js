const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Competition IDs to purge (European/International - NOT BFL, Fed Cup, SAFF)
const PURGE_COMP_IDS = [
  'cmwancjph0003ljfwgkn8njrm', // UEFA Champions League
  'cmwancjt00004ljfwj5gnih37', // FIFA World Cup 2026
  'cmwancjyb0005ljfw9p4azqvj', // Premier League
  'cmwanck1c0006ljfww1lc0n4m', // LaLiga EA Sports
  'cmwanck5m0007ljfwo12q48c2', // Serie A
  'cmwancka30008ljfwzxi4woy3', // Bundesliga
  'cmwanckd00009ljfwq5r035mf', // Ligue 1
  'cmwdhqryb008wljysz19rs7f6', // UEFA Europa League
  'cmwdhqw6l00myljystunqr7m1', // International Friendlies
];

async function purgeAndReset() {
  console.log('Getting matches to purge...');
  const matches = await db.match.findMany({
    where: { competitionId: { in: PURGE_COMP_IDS } },
    select: { id: true, homeScore: true, awayScore: true }
  });
  console.log(`Found ${matches.length} matches to purge`);

  // Delete all match events for these matches
  const matchIds = matches.map(m => m.id);
  
  const deletedEvents = await db.matchEvent.deleteMany({
    where: { matchId: { in: matchIds } }
  });
  console.log(`Deleted ${deletedEvents.count} match events`);

  // Delete all matches for these competitions
  const deletedMatches = await db.match.deleteMany({
    where: { competitionId: { in: PURGE_COMP_IDS } }
  });
  console.log(`Deleted ${deletedMatches.count} matches`);

  // Reset team stats that might be linked to these competitions
  // (standings, etc. — just delete competition standings)
  for (const compId of PURGE_COMP_IDS) {
    try {
      await db.standing.deleteMany({ where: { competitionId: compId } });
    } catch(e) {}
  }
  console.log('Deleted standings for purged competitions');

  // Verify remaining
  const remaining = await db.match.count();
  const bfl = await db.match.count({ where: { competitionId: 'cmwancji90000ljfw2iz3ajpf' } });
  const saff = await db.match.count({ where: { competitionId: 'cmwancjn60002ljfw1p0sk4mg' } });
  console.log(`\nRemaining total: ${remaining} | BFL: ${bfl} | SAFF: ${saff}`);

  await db.$disconnect();
  console.log('\nDone! Now run: node scripts/real-match-sync.js');
}

purgeAndReset().catch(e => { console.error(e); process.exit(1); });
