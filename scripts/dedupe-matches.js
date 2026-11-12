const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function dedupeMatches() {
  const all = await db.match.findMany({
    include: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: { kickoff: 'asc' }
  });

  console.log(`Checking ${all.length} matches for duplicates...`);
  const seen = new Map();
  let deletedCount = 0;

  for (const m of all) {
    // Unique key: homeTeamId + awayTeamId + date (YYYY-MM-DD)
    const dateStr = m.kickoff.toISOString().slice(0, 10);
    const key = `${m.competitionId}-${m.homeTeamId}-${m.awayTeamId}-${dateStr}`;

    if (seen.has(key)) {
      console.log(`Duplicate found: ${m.homeTeam.name} vs ${m.awayTeam.name} on ${dateStr} (${m.competition.shortName}) [ID: ${m.id}]`);
      await db.matchEvent.deleteMany({ where: { matchId: m.id } });
      await db.match.delete({ where: { id: m.id } });
      deletedCount++;
    } else {
      seen.set(key, m.id);
    }
  }

  console.log(`Deleted ${deletedCount} duplicate matches.`);
  process.exit(0);
}

dedupeMatches();
