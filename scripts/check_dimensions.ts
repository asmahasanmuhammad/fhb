import { PrismaClient } from "@prisma/client";
import sizeOf from "image-size"; // check if available or we can check with sharp/buffer
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.newsArticle.findMany({
    select: {
      id: true,
      title: true,
      coverUrl: true,
      category: true,
    },
  });

  const imgDir = path.join(process.cwd(), "temp_news_img");
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  console.log(`Checking ${news.length} articles...`);

  for (let i = 0; i < news.length; i++) {
    const item = news[i];
    if (!item.coverUrl) {
      console.log(`[NO COVER] ${item.title}`);
      continue;
    }

    try {
      const res = await fetch(item.coverUrl);
      if (!res.ok) {
        console.log(`[HTTP ${res.status}] ${item.title} -> ${item.coverUrl}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = path.extname(new URL(item.coverUrl).pathname) || ".jpg";
      const filePath = path.join(imgDir, `art_${i}${ext}`);
      fs.writeFileSync(filePath, buf);

      // Read dimensions from JPEG/PNG buffer
      let dim = "unknown";
      // Let's check with basic parser or probe
      // In JPEG: SOF0 marker 0xFFC0 or SOF2 0xFFC2 gives height and width
      try {
        let offset = 2;
        while (offset < buf.length) {
          if (buf[offset] === 0xff && (buf[offset + 1] >= 0xc0 && buf[offset + 1] <= 0xc3)) {
            const h = buf.readUInt16BE(offset + 5);
            const w = buf.readUInt16BE(offset + 7);
            dim = `${w}x${h}`;
            break;
          }
          if (buf[offset] === 0xff) {
            const len = buf.readUInt16BE(offset + 2);
            offset += 2 + len;
          } else {
            offset++;
          }
        }
      } catch (err) {}

      console.log(`[OK] (${dim}, ${Math.round(buf.length / 1024)}KB) ${item.title.slice(0, 45)} -> ${item.coverUrl.slice(0, 50)}`);
    } catch (e: any) {
      console.log(`[FAIL] ${item.title} -> ${e.message}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
