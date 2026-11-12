const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  // Check all matches with score > 20
  const fake = await db.match.findMany({
    where: {
      OR: [
        { homeScore: { gt: 20 } },
        { awayScore: { gt: 20 } }
      ]
    },
    select: {
      id: true,
      homeScore: true,
      awayScore: true,
      status: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      competition: { select: { name: true } }
    }
  });
  
  console.log(`Found ${fake.length} matches with score > 20:`);
  fake.forEach(m => console.log(`  ${m.homeTeam.name} ${m.homeScore}-${m.awayScore} ${m.awayTeam.name} [${m.status}] | ${m.competition.name}`));
  
  // Check total counts
  const total = await db.match.count();
  const live = await db.match.count({ where: { status: 'LIVE' } });
  console.log(`\nTotal: ${total}, Live: ${live}`);
  
  await db.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
