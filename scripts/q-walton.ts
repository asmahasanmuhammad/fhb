import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const ads = await db.adSlot.findMany({ where: { placement: "SIDEBAR" }, select: { name: true, headline: true, bodyText: true, ctaLabel: true, brandColor: true, brandInitials: true, imageHint: true } });
  console.log(JSON.stringify(ads, null, 1));
}
main().finally(() => db.$disconnect());
