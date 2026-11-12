const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function main() {
  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  posts.forEach(p => console.log('id:', p.id, '| imageUrl:', p.imageUrl, '| content:', p.content?.slice(0,50)));
  await db.$disconnect();
}
main().catch(console.error);
