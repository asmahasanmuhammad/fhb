import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.newsArticle.findMany({
    select: { id: true, title: true, coverUrl: true },
  });

  console.log(`Updating ${news.length} articles in database...`);

  let updated = 0;
  for (const item of news) {
    const filename = `news_${item.id}.jpg`;
    const localPath = path.join(process.cwd(), "public", "news", filename);

    if (fs.existsSync(localPath)) {
      const newCoverUrl = `/news/${filename}`;
      await prisma.newsArticle.update({
        where: { id: item.id },
        data: { coverUrl: newCoverUrl },
      });
      console.log(`[UPDATED] ${item.id} -> ${newCoverUrl} (${item.title.slice(0, 40)})`);
      updated++;
    } else {
      console.warn(`[NOT FOUND ON DISK] ${localPath}`);
    }
  }

  console.log(`Done! ${updated} of ${news.length} articles updated in DB.`);
}

main().finally(() => prisma.$disconnect());
