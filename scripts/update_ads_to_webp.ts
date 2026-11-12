import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const ads = await prisma.adSlot.findMany();
  console.log(`Found ${ads.length} ads to inspect/update.`);

  let updated = 0;
  for (const ad of ads) {
    if (ad.imageHint && ad.imageHint.includes('.gif')) {
      const newUrl = ad.imageHint.replace('.gif', '.webp');
      await prisma.adSlot.update({
        where: { id: ad.id },
        data: { imageHint: newUrl }
      });
      console.log(`Updated ad ${ad.id} (${ad.name}): ${ad.imageHint} -> ${newUrl}`);
      updated++;
    }
  }

  console.log(`Updated ${updated} ads to .webp.`);

  // Mirror db to other custom.db locations if they exist
  const rootDb = path.resolve('db/custom.db');
  const prismaDb = path.resolve('prisma/custom.db');
  const dataDb = path.resolve('data/custom.db');

  if (fs.existsSync(rootDb)) {
    if (fs.existsSync(path.dirname(prismaDb))) {
      fs.copyFileSync(rootDb, prismaDb);
      console.log('Mirrored to prisma/custom.db');
    }
    if (fs.existsSync(path.dirname(dataDb))) {
      fs.copyFileSync(rootDb, dataDb);
      console.log('Mirrored to data/custom.db');
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
