import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const videos = await db.video.findMany({ select: { id: true, title: true, videoUrl: true, thumbnailUrl: true }, take: 12 });
  console.log(JSON.stringify(videos, null, 1));
}
main().finally(() => db.$disconnect());
