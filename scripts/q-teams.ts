import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const teams = await db.team.findMany({ where: { OR: [{ name: { contains: "National" } }, { name: { contains: "Bangladesh" } }] }, select: { name: true, shortName: true }, take: 15 });
  console.log(JSON.stringify(teams, null, 1));
  const heroTeams = await db.team.findMany({ select: { name: true, shortName: true }, take: 100 });
  const long = heroTeams.filter(t => t.name.length > 18 && !t.shortName);
  console.log("teams >18 chars with NO shortName:", long.length);
}
main().finally(() => db.$disconnect());
