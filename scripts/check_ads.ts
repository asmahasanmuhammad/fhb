import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const ads = await prisma.adSlot.findMany({ select: { id: true, name: true, placement: true, imageHint: true } });
  console.log(ads);
}
main().finally(() => prisma.$disconnect());
