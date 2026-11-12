import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.newsArticle.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      coverUrl: true,
      featured: true,
      slug: true,
      excerpt: true,
    },
  });

  fs.writeFileSync("scripts/news_inventory.json", JSON.stringify(news, null, 2));
  console.log(`Saved ${news.length} articles to scripts/news_inventory.json`);
}

main().finally(() => prisma.$disconnect());
