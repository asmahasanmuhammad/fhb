import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

/** Point each demo short at its football Ken Burns video + poster. */
const MAP: Array<{ idSuffix: string; video: string; thumb: string }> = [
  { idSuffix: "cmw96wu5z00igq5yb8dkitzve", video: "/shorts/fk1.mp4", thumb: "/shorts/fk1-thumb.jpg" },
  { idSuffix: "cmw96wu6200iiq5ybtvdr8ggx", video: "/shorts/sg1.mp4", thumb: "/shorts/sg1-thumb.jpg" },
  { idSuffix: "cmw96wu6200ikq5yb29cyuw67", video: "/shorts/fans1.mp4", thumb: "/shorts/fans1-thumb.jpg" },
  { idSuffix: "cmw96wu6300imq5yb23k3xpxm", video: "/shorts/gk1.mp4", thumb: "/shorts/gk1-thumb.jpg" },
  { idSuffix: "cmw96wu6400ioq5yby7z59utg", video: "/shorts/tr1.mp4", thumb: "/shorts/tr1-thumb.jpg" },
  { idSuffix: "cmw96wu6400iqq5ybrrgqzwm9", video: "/shorts/nt1.mp4", thumb: "/shorts/nt1-thumb.jpg" },
  { idSuffix: "cmw96wu6500isq5yb7wx395fo", video: "/shorts/ce1.mp4", thumb: "/shorts/ce1-thumb.jpg" },
  { idSuffix: "cmw96wu6600iuq5ybqoeahzig", video: "/shorts/tq1.mp4", thumb: "/shorts/tq1-thumb.jpg" },
];

async function main() {
  for (const m of MAP) {
    const r = await db.video.update({
      where: { id: m.idSuffix },
      data: { videoUrl: m.video, thumbnailUrl: m.thumb },
    });
    console.log("updated:", r.title.slice(0, 40), "→", r.videoUrl);
  }
}
main().finally(() => db.$disconnect());
