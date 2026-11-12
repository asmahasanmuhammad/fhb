const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAll() {
  const articles = await prisma.newsArticle.findMany({
    select: { id: true, title: true, coverUrl: true }
  });

  console.log(`Total articles in DB: ${articles.length}`);
  let missing = 0;
  let small = 0;

  for (const a of articles) {
    if (!a.coverUrl) {
      console.log(`MISSING coverUrl: ${a.id} - ${a.title}`);
      missing++;
      continue;
    }
    const localRel = a.coverUrl.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), 'public', localRel.replace(/^public[\\\/]/, ''));
    if (!fs.existsSync(fullPath)) {
      console.log(`FILE NOT FOUND: ${fullPath} for ${a.id}`);
      missing++;
    } else {
      const stat = fs.statSync(fullPath);
      if (stat.size < 50000) {
        console.log(`FILE TOO SMALL (<50KB): ${fullPath} (${stat.size} bytes)`);
        small++;
      }
    }
  }

  console.log(`Audit Summary: Total=${articles.length}, Missing=${missing}, LowFileSize=${small}`);
  await prisma.$disconnect();
}
verifyAll();
