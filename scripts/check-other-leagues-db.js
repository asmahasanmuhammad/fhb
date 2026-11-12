const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function checkOtherLeagues() {
  const leagues = ['EPL', 'Serie A', 'Bundesliga', 'Ligue 1', 'Europa League', 'Copa del Rey', 'English FA Cup'];
  for (const l of leagues) {
    const matches = await db.match.findMany({
      where: { competition: { shortName: l } },
      include: { homeTeam: true, awayTeam: true }
    });
    console.log(`\n=== ${l} (${matches.length} matches) ===`);
    matches.forEach(m => console.log(' ', m.kickoff.toISOString(), '|', m.round, '|', m.homeTeam.name, 'vs', m.awayTeam.name));
  }
  process.exit(0);
}
checkOtherLeagues();
