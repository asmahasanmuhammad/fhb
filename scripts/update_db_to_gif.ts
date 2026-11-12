import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const ads = await prisma.adSlot.findMany();
  for (const ad of ads) {
    if (ad.imageHint && ad.imageHint.endsWith(".jpg")) {
      const gifHint = ad.imageHint.replace(/\.jpg$/, ".gif");
      await prisma.adSlot.update({
        where: { id: ad.id },
        data: { imageHint: gifHint }
      });
      console.log(`Updated ${ad.name} -> ${gifHint}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
