const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function fixSaff() {
  console.log('Fixing SAFF team names and Semi-Final 1 result...');

  // 1. Rename teams
  const renames = [
    { from: 'Bangladesh National Football Team', to: 'Bangladesh', short: 'Bangladesh', initials: 'BAN' },
    { from: 'India National Football Team', to: 'India', short: 'India', initials: 'IND' },
    { from: 'Nepal National Football Team', to: 'Nepal', short: 'Nepal', initials: 'NEP' },
    { from: 'Maldives National Football Team', to: 'Maldives', short: 'Maldives', initials: 'MDV' },
    { from: 'Bhutan National Football Team', to: 'Bhutan', short: 'Bhutan', initials: 'BHU' },
    { from: 'Pakistan National Football Team', to: 'Pakistan', short: 'Pakistan', initials: 'PAK' },
    { from: 'Sri Lanka National Football Team', to: 'Sri Lanka', short: 'Sri Lanka', initials: 'SRI' },
  ];

  for (const r of renames) {
    const team = await db.team.findFirst({ where: { name: r.from } });
    if (team) {
      await db.team.update({
        where: { id: team.id },
        data: { name: r.to, shortName: r.short, initials: r.initials }
      });
      console.log(`Renamed team: ${r.from} -> ${r.to}`);
    }
  }

  // 2. Find Nepal vs Maldives semi-final on Nov 12
  const semi1 = await db.match.findFirst({
    where: {
      competition: { shortName: 'SAFF' },
      kickoff: {
        gte: new Date('2026-11-12T00:00:00Z'),
        lte: new Date('2026-11-12T23:59:59Z')
      }
    },
    include: { homeTeam: true, awayTeam: true }
  });

  if (semi1) {
    await db.match.update({
      where: { id: semi1.id },
      data: {
        status: 'FINISHED',
        homeScore: 2,
        awayScore: 1,
        minute: 90,
        period: 'FT'
      }
    });

    // Add goals
    await db.matchEvent.deleteMany({ where: { matchId: semi1.id } });
    await db.matchEvent.createMany({
      data: [
        { matchId: semi1.id, minute: 34, type: 'GOAL', teamSide: 'HOME', playerName: 'Anjan Bista', detail: 'Right-foot shot' },
        { matchId: semi1.id, minute: 61, type: 'GOAL', teamSide: 'AWAY', playerName: 'Ali Fasir', detail: 'Penalty' },
        { matchId: semi1.id, minute: 78, type: 'GOAL', teamSide: 'HOME', playerName: 'Rohit Chand', detail: 'Header from corner' }
      ]
    });
    console.log(`Updated SAFF Semi-Final 1 to FINISHED (Nepal 2 - 1 Maldives)`);
  }

  process.exit(0);
}

fixSaff();
