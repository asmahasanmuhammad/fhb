import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const news = await prisma.newsArticle.findMany({
    select: {
      id: true,
      title: true,
      coverUrl: true,
    },
  });

  console.log(`Checking ${news.length} URLs...`);
  for (const n of news) {
    if (!n.coverUrl) {
      console.log(`[EMPTY] ${n.title}`);
      continue;
    }
    try {
      const res = await fetch(n.coverUrl, { method: "HEAD" });
      const len = res.headers.get("content-length");
      const ct = res.headers.get("content-type");
      console.log(`[${res.status}] size: ${len || "unknown"}B type: ${ct} -> ${n.title.slice(0, 40)} -> ${n.coverUrl}`);
    } catch (e: any) {
      console.log(`[ERROR ${e.message}] -> ${n.title.slice(0, 40)} -> ${n.coverUrl}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
