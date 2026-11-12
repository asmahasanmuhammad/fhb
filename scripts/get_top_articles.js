const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const articles = await prisma.newsArticle.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, coverUrl: true, featured: true }
  });
  console.log(JSON.stringify(articles, null, 2));
  await prisma.$disconnect();
}
main();
