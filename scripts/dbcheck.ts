import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const [teams, players, matches, news, comps, vids, ads, users, standings] = await Promise.all([
    db.team.count(), db.player.count(), db.match.count(), db.newsArticle.count(),
    db.competition.count(), db.video.count(), db.adSlot.count(), db.user.count(), db.standing.count(),
  ]);
  console.log(JSON.stringify({ teams, players, matches, news, comps, vids, ads, users, standings }));
  const groups = await db.adSlot.groupBy({ by: ["placement"], _count: true });
  console.log("adPlacements:", groups.map(g => `${g.placement}=${g._count}`).join(" "));
  const compList = await db.competition.findMany({ select: { name: true, country: true, type: true } });
  console.log("competitions:", compList.map(c => `${c.name}[${c.country}]`).join(" | "));
  const mc = await db.match.groupBy({ by: ["status"], _count: true });
  console.log("matchStatus:", mc.map(m => `${m.status}=${m._count}`).join(" "));
  const cats = await db.newsArticle.groupBy({ by: ["category"], _count: true });
  console.log("newsCats:", cats.map(c => `${c.category}=${c._count}`).join(" "));
}
main().catch(e => console.error(e.message)).finally(() => db.$disconnect());
