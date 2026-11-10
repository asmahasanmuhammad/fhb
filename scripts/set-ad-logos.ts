/**
 * One-off migration: attach official brand logos to existing demo ads.
 * Maps by ad name prefix. Idempotent — safe to re-run.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const LOGOS: Array<[string, string, string | null]> = [
  // [name prefix, logoUrl, logoTheme]
  ["bKash —", "/brands/bkash.png", null],
  ["Grameenphone —", "/brands/grameenphone.svg", null],
  ["Daraz —", "/brands/daraz.png", null],
  ["Walton —", "/brands/walton.png", null],
  ["Pathao —", "/brands/pathao.png", null],
  ["Samsung —", "/brands/samsung.png", null],
  ["Pran-RFL —", "/brands/pran.png", null],
  ["Chaldal —", "/brands/chaldal.png", null],
  ["City Bank —", "/brands/citybank.png", "DARK"],
  ["Foodpanda —", "/brands/foodpanda.svg", null],
  ["FHB House Ad", "/logo.svg", null],
  ["Bata —", "/brands/bata.png", null],
];

async function main() {
  const ads = await db.adSlot.findMany();
  for (const ad of ads) {
    if (ad.name.startsWith("Teer —")) {
      // Rebrand the Teer ad as its parent company City Group (logo available)
      await db.adSlot.update({
        where: { id: ad.id },
        data: {
          name: ad.name.replace("Teer —", "City Group (Teer) —"),
          headline: ad.headline,
          bodyText: ad.bodyText ?? "A City Group brand",
          brandColor: "#1D3A6A",
          brandInitials: "CG",
          logoUrl: "/brands/citygroup.png",
          logoTheme: "LIGHT",
          linkUrl: "https://www.citygroup.com.bd",
        },
      });
      console.log("rebranded:", ad.name, "-> City Group (Teer)");
      continue;
    }
    const hit = LOGOS.find(([prefix]) => ad.name.startsWith(prefix));
    if (hit) {
      await db.adSlot.update({
        where: { id: ad.id },
        data: { logoUrl: hit[1], logoTheme: hit[2] ?? "LIGHT" },
      });
      console.log("logo set:", ad.name, "->", hit[1], hit[2] ?? "LIGHT");
    } else {
      console.log("no match:", ad.name);
    }
  }
  const total = await db.adSlot.count();
  const withLogo = await db.adSlot.count({ where: { logoUrl: { not: null } } });
  console.log(`\n${withLogo}/${total} ads now have brand logos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
