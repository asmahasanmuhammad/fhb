const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function cleanupDb() {
  console.log('--- Cleaning up database ---');

  // 1. Delete all matches where round or team name indicates youth or women's
  const badMatches = await db.match.findMany({
    where: {
      OR: [
        { round: { contains: "Women" } },
        { round: { contains: "U-21" } },
        { round: { contains: "U21" } },
        { round: { contains: "U-19" } },
        { round: { contains: "College" } },
        { round: { contains: "NCAA" } },
        { homeTeam: { name: { contains: "U21" } } },
        { awayTeam: { name: { contains: "U21" } } },
        { homeTeam: { name: { contains: "U-21" } } },
        { awayTeam: { name: { contains: "U-21" } } },
        { homeTeam: { name: { contains: "Women" } } },
        { awayTeam: { name: { contains: "Women" } } },
      ]
    }
  });
  console.log(`Deleting ${badMatches.length} bad matches (youth/women)...`);
  for (const m of badMatches) {
    await db.matchEvent.deleteMany({ where: { matchId: m.id } });
    await db.match.delete({ where: { id: m.id } });
  }

  // 2. Also delete matches in UEFA Champions League that are around Nov 10-15 (since UCL has no matches this week, only women's UCL was playing)
  const fakeUcl = await db.match.findMany({
    where: {
      competition: { shortName: "UCL" },
      kickoff: {
        gte: new Date("2026-11-09T00:00:00Z"),
        lte: new Date("2026-11-20T00:00:00Z")
      }
    }
  });
  console.log(`Deleting ${fakeUcl.length} mistargeted UCL matches in mid-November...`);
  for (const m of fakeUcl) {
    await db.matchEvent.deleteMany({ where: { matchId: m.id } });
    await db.match.delete({ where: { id: m.id } });
  }

  // 3. Delete bad teams (U21, youth, college)
  const badTeams = await db.team.findMany({
    where: {
      OR: [
        { name: { contains: "U21" } },
        { name: { contains: "U-21" } },
        { name: { contains: "U19" } },
        { name: { contains: "U-19" } },
        { name: { contains: "Women" } },
        { shortName: { contains: "U21" } },
      ]
    }
  });
  console.log(`Deleting ${badTeams.length} bad teams...`);
  for (const t of badTeams) {
    // Delete any matches referring to this team
    await db.matchEvent.deleteMany({ where: { match: { OR: [{ homeTeamId: t.id }, { awayTeamId: t.id }] } } });
    await db.match.deleteMany({ where: { OR: [{ homeTeamId: t.id }, { awayTeamId: t.id }] } });
    await db.standing.deleteMany({ where: { teamId: t.id } });
    await db.player.deleteMany({ where: { teamId: t.id } });
    await db.team.delete({ where: { id: t.id } }).catch(() => {});
  }

  // 4. Fix team names: ensure senior teams exist properly
  const seniorNationalTeams = [
    { name: "Netherlands", shortName: "Netherlands", initials: "NED" },
    { name: "Greece", shortName: "Greece", initials: "GRE" },
    { name: "Iceland", shortName: "Iceland", initials: "ISL" },
    { name: "Bulgaria", shortName: "Bulgaria", initials: "BUL" },
    { name: "Scotland", shortName: "Scotland", initials: "SCO" },
    { name: "North Macedonia", shortName: "North Macedonia", initials: "MKD" },
    { name: "Germany", shortName: "Germany", initials: "GER" },
    { name: "Serbia", shortName: "Serbia", initials: "SRB" },
    { name: "Portugal", shortName: "Portugal", initials: "POR" },
    { name: "Denmark", shortName: "Denmark", initials: "DEN" },
    { name: "Norway", shortName: "Norway", initials: "NOR" },
    { name: "Wales", shortName: "Wales", initials: "WAL" },
    { name: "Austria", shortName: "Austria", initials: "AUT" },
    { name: "Republic of Ireland", shortName: "Ireland", initials: "IRL" },
    { name: "Northern Ireland", shortName: "N. Ireland", initials: "NIR" },
    { name: "Ukraine", shortName: "Ukraine", initials: "UKR" },
    { name: "Poland", shortName: "Poland", initials: "POL" },
    { name: "Romania", shortName: "Romania", initials: "ROU" },
    { name: "Sweden", shortName: "Sweden", initials: "SWE" },
    { name: "Bosnia-Herzegovina", shortName: "Bosnia", initials: "BIH" },
    { name: "England", shortName: "England", initials: "ENG" },
    { name: "Spain", shortName: "Spain", initials: "ESP" },
    { name: "France", shortName: "France", initials: "FRA" },
    { name: "Italy", shortName: "Italy", initials: "ITA" },
    { name: "Belgium", shortName: "Belgium", initials: "BEL" },
    { name: "Croatia", shortName: "Croatia", initials: "CRO" },
    { name: "Czechia", shortName: "Czechia", initials: "CZE" },
    { name: "Türkiye", shortName: "Turkey", initials: "TUR" },
    { name: "Argentina", shortName: "Argentina", initials: "ARG" },
    { name: "Brazil", shortName: "Brazil", initials: "BRA" },
    { name: "Uruguay", shortName: "Uruguay", initials: "URU" },
    { name: "Colombia", shortName: "Colombia", initials: "COL" },
    { name: "Chile", shortName: "Chile", initials: "CHI" },
    { name: "United States", shortName: "USA", initials: "USA" },
    { name: "Mexico", shortName: "Mexico", initials: "MEX" },
    { name: "Canada", shortName: "Canada", initials: "CAN" },
    { name: "Japan", shortName: "Japan", initials: "JPN" },
    { name: "South Korea", shortName: "Korea", initials: "KOR" },
    { name: "Australia", shortName: "Australia", initials: "AUS" },
    { name: "Saudi Arabia", shortName: "Saudi Arabia", initials: "KSA" },
  ];

  for (const s of seniorNationalTeams) {
    const existing = await db.team.findFirst({
      where: {
        OR: [
          { name: s.name },
          { name: `${s.name} National Football Team` },
          { shortName: s.shortName },
        ]
      }
    });
    if (existing) {
      await db.team.update({
        where: { id: existing.id },
        data: { name: s.name, shortName: s.shortName, initials: s.initials }
      });
    }
  }

  const remainingMatches = await db.match.count();
  console.log(`Cleanup done. Remaining matches in DB: ${remainingMatches}`);
  process.exit(0);
}

cleanupDb();
