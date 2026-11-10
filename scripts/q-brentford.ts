import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const rows = await db.$queryRawUnsafe(`
    SELECT t.name, c.shortName, COUNT(*) as n
    FROM \`Match\` m
    JOIN Team t ON t.id IN (m.homeTeamId, m.awayTeamId)
    JOIN Competition c ON c.id = m.competitionId
    WHERE t.name LIKE '%Brentford%'
    GROUP BY t.name, c.shortName
  `) as Array<{ name: string; shortName: string; n: number }>;
  console.log(JSON.stringify(rows));
  // any team with matches in 2+ competitions?
  const multi = await db.$queryRawUnsafe(`
    SELECT t.name, GROUP_CONCAT(DISTINCT c.shortName) AS comps, COUNT(*) as n
    FROM \`Match\` m
    JOIN Team t ON t.id IN (m.homeTeamId, m.awayTeamId)
    JOIN Competition c ON c.id = m.competitionId
    GROUP BY t.id HAVING COUNT(DISTINCT c.id) > 1 LIMIT 10
  `) as Array<{ name: string; comps: string; n: number }>;
  console.log("teams in multiple competitions:", JSON.stringify(multi));
}
main().finally(() => db.$disconnect());
