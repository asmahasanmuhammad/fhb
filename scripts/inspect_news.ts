import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const news = await prisma.newsArticle.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      coverUrl: true,
      featured: true,
      slug: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`TOTAL ARTICLES: ${news.length}`);
  const noCover: typeof news = [];
  const withCover: typeof news = [];

  news.forEach((n) => {
    if (!n.coverUrl || n.coverUrl.trim() === "") {
      noCover.push(n);
    } else {
      withCover.push(n);
    }
  });

  console.log(`WITHOUT COVER: ${noCover.length}`);
  noCover.forEach((n, i) => {
    console.log(`[NO COVER ${i + 1}] ${n.id} | ${n.category} | ${n.title}`);
  });

  console.log(`\nWITH COVER: ${withCover.length}`);
  withCover.forEach((n, i) => {
    console.log(`[COVER ${i + 1}] ${n.id} | ${n.category} | ${n.title} -> ${n.coverUrl}`);
  });
}

main().finally(() => prisma.$disconnect());
