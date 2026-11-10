import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const ads = await db.adSlot.findMany({ where: { active: true }, select: { name: true, brandColor: true, placement: true } });
  console.log(JSON.stringify(ads, null, 1));
  const dup = await db.$queryRawUnsafe(`SELECT t.name, c.shortName, COUNT(*) c FROM Standing s JOIN Team t ON t.id=s.teamId JOIN Competition c ON c.id=s.competitionId GROUP BY t.name HAVING c > 1 LIMIT 10`);
  console.log("teams in multiple standings:", JSON.stringify(dup));
}
main().finally(() => db.$disconnect());
