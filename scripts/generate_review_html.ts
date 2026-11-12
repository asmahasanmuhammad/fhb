import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.newsArticle.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Create an HTML gallery page with all news items and their images
  const htmlRows = news.map((n, i) => {
    return `
    <div style="border: 1px solid #333; margin: 10px; padding: 10px; border-radius: 8px; background: #1a1a1a; color: #fff; width: 380px; display: inline-block; vertical-align: top;">
      <div style="font-size: 11px; color: #888;">#${i + 1} | [${n.category}] ${n.featured ? '⭐ FEATURED' : ''}</div>
      <div style="font-weight: bold; font-size: 13px; margin: 4px 0; height: 38px; overflow: hidden;">${n.title}</div>
      <div style="width: 100%; height: 210px; background: #000; overflow: hidden; border-radius: 4px; position: relative;">
        <img src="${n.coverUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src=''; this.alt='BROKEN / 404 / BLOCKED';" />
      </div>
      <div style="font-size: 10px; color: #aaa; margin-top: 6px; word-break: break-all;">${n.coverUrl}</div>
    </div>
    `;
  });

  const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>News Posters Review</title>
    <style>
      body { background: #0d1117; font-family: sans-serif; padding: 20px; }
      h1 { color: #fff; }
    </style>
  </head>
  <body>
    <h1>FHB News Posters Review (${news.length} items)</h1>
    <div style="display: flex; flex-wrap: wrap;">
      ${htmlRows.join("\n")}
    </div>
  </body>
  </html>
  `;

  fs.writeFileSync("public/news_posters_review.html", fullHtml);
  console.log("Written to public/news_posters_review.html");
}

main().finally(() => prisma.$disconnect());
