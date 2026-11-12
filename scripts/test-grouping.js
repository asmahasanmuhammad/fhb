const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function compareDateGrouping() {
  const all = await db.match.findMany({
    include: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: { kickoff: 'asc' }
  });

  const getLocalDateKey = (iso) => {
    const d = new Date(iso);
    // Force UTC+6 (Bangladesh) for testing
    const bstTime = new Date(d.getTime() + 6 * 3600 * 1000);
    return bstTime.toISOString().slice(0, 10);
  };

  const getUtcDateKey = (iso) => {
    return new Date(iso).toISOString().slice(0, 10);
  };

  console.log('=== GROUPING BY LOCAL (BST UTC+6) ===');
  const bstGroups = {};
  all.forEach(m => {
    const k = getLocalDateKey(m.kickoff);
    bstGroups[k] = (bstGroups[k] || 0) + 1;
  });
  console.log(bstGroups);

  console.log('\n=== GROUPING BY UTC ===');
  const utcGroups = {};
  all.forEach(m => {
    const k = getUtcDateKey(m.kickoff);
    utcGroups[k] = (utcGroups[k] || 0) + 1;
  });
  console.log(utcGroups);

  process.exit(0);
}

compareDateGrouping();
