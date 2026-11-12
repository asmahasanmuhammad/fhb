const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function showSchedule() {
  const dates = ['2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'];
  
  for (const d of dates) {
    const matches = await db.match.findMany({
      where: {
        kickoff: {
          gte: new Date(`${d}T00:00:00Z`),
          lte: new Date(`${d}T23:59:59Z`)
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      },
      orderBy: { kickoff: 'asc' }
    });

    console.log(`\n=================== DATE: ${d} (Total: ${matches.length}) ===================`);
    matches.forEach(m => {
      console.log(`[${m.kickoff.toISOString().slice(11, 16)} UTC] [${m.status.padEnd(9)}] ${m.homeTeam.name.padEnd(20)} ${(m.homeScore ?? '-') + '-' + (m.awayScore ?? '-')} ${m.awayTeam.name.padEnd(20)} | ${m.competition.shortName}`);
    });
  }

  process.exit(0);
}

showSchedule();
