import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // 1) Tighten HEADER_BANNER copy so nothing truncates in the 90px banner
  const banners = await db.adSlot.findMany({ where: { placement: "HEADER_BANNER", active: true } });
  const copyFix: Record<string, { headline: string; bodyText: string }> = {
    "Pran Chanachur — Header (Demo)": {
      headline: "Fuel every matchday with Pran Chanachur",
      bodyText: "The crunch Bangladesh loves — grab a pack today.",
    },
    "Walton 4K TV — Header (Demo)": {
      headline: "Watch football in stunning Walton 4K",
      bodyText: "Cinematic clarity for every BFL and UCL night.",
    },
    "Samsung — Header (Demo)": {
      headline: "Samsung OLED — every goal, pixel-perfect",
      bodyText: "See the game the way it was meant to be seen.",
    },
  };
  for (const b of banners) {
    const fix = copyFix[b.name];
    if (fix) await db.adSlot.update({ where: { id: b.id }, data: fix });
  }
  console.log("banner copy tightened:", banners.length);

  // 2) Tone down implausible scorelines (cap total goals at 6, realistic splits)
  const finished = await db.match.findMany({ where: { status: "FINISHED" } });
  let adjusted = 0;
  const SPLITS: Array<[number, number]> = [
    [1, 0], [2, 0], [2, 1], [1, 1], [0, 0], [3, 1], [0, 1], [1, 2], [2, 2], [3, 0], [0, 2], [1, 3],
  ];
  for (const m of finished) {
    const h = m.homeScore ?? 0, a = m.awayScore ?? 0;
    if (h + a > 6 || h > 4 || a > 4) {
      const [nh, na] = SPLITS[Math.floor(Math.random() * SPLITS.length)];
      await db.match.update({ where: { id: m.id }, data: { homeScore: nh, awayScore: na } });
      adjusted++;
    }
  }
  console.log("implausible scorelines adjusted:", adjusted, "of", finished.length);

  // Also cap LIVE matches
  const live = await db.match.findMany({ where: { status: "LIVE" } });
  for (const m of live) {
    const h = m.homeScore ?? 0, a = m.awayScore ?? 0;
    if (h + a > 6 || h > 4 || a > 4) {
      await db.match.update({ where: { id: m.id }, data: { homeScore: Math.min(h, 3), awayScore: Math.min(a, 3) } });
    }
  }
  console.log("live scores capped");
}
main().finally(() => db.$disconnect());
