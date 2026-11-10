/**
 * Round 2: attach logos to the remaining 9 demo ads (added in a previous
 * session directly to the DB). Rebrands two unsourceable brands:
 *   Aarong Dairy -> Milk Vita (iconic BD dairy, official logo sourced)
 *   Hayat Lounge  -> Sony BRAVIA (world-class TV brand, official logo sourced)
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const updates: Array<{
    match: string;
    data: {
      name?: string;
      headline?: string;
      bodyText?: string;
      brandColor?: string;
      brandInitials?: string;
      logoUrl: string;
      logoTheme: string;
      linkUrl?: string;
    };
  }> = [
    {
      match: "Aarong Dairy — Header (Demo)",
      data: {
        name: "Milk Vita — Header (Demo)",
        headline: "Fuel your matchday — Milk Vita fresh dairy drinks",
        brandColor: "#0057A8",
        brandInitials: "MV",
        logoUrl: "/brands/milkvita.svg",
        logoTheme: "LIGHT",
        linkUrl: "https://www.milkvita.com.bd",
      },
    },
    {
      match: "Uber Bangladesh — Header (Demo)",
      data: { logoUrl: "/brands/uber.svg", logoTheme: "LIGHT" },
    },
    {
      match: "Robi 4.5G — Sidebar (Demo)",
      data: { logoUrl: "/brands/robi.svg", logoTheme: "LIGHT" },
    },
    {
      match: "Bata Bangladesh — Sidebar (Demo)",
      data: { logoUrl: "/brands/bata.png", logoTheme: "LIGHT" },
    },
    {
      match: "Teer Fuel — In-Feed (Demo)",
      data: {
        name: "City Group (Teer Fuel) — In-Feed (Demo)",
        bodyText: "A City Group brand",
        brandColor: "#1D3A6A",
        brandInitials: "CG",
        logoUrl: "/brands/citygroup.png",
        logoTheme: "LIGHT",
        linkUrl: "https://www.citygroup.com.bd",
      },
    },
    {
      match: "Brac Bank — In-Feed (Demo)",
      data: { logoUrl: "/brands/bracbank.svg", logoTheme: "LIGHT" },
    },
    {
      match: "Sultan's Dine — Mobile (Demo)",
      data: { logoUrl: "/brands/sultans.png", logoTheme: "LIGHT" },
    },
    {
      match: "Freelancer.com BD — Mobile (Demo)",
      data: { logoUrl: "/brands/freelancer.svg", logoTheme: "LIGHT" },
    },
    {
      match: "Hayat Lounge — Preroll (Demo)",
      data: {
        name: "Sony BRAVIA — Preroll (Demo)",
        headline: "Highlights deserve a big screen — BRAVIA 55\" 4K OLED TV",
        bodyText: "See every goal the way it was meant to be seen",
        brandColor: "#0F0F0F",
        brandInitials: "SO",
        logoUrl: "/brands/sony.svg",
        logoTheme: "LIGHT",
        linkUrl: "https://www.sony.com.bd",
      },
    },
  ];

  for (const u of updates) {
    const ad = await db.adSlot.findFirst({ where: { name: u.match } });
    if (!ad) {
      console.log("not found:", u.match);
      continue;
    }
    await db.adSlot.update({ where: { id: ad.id }, data: u.data });
    console.log("updated:", u.data.name ?? u.match);
  }

  const total = await db.adSlot.count();
  const withLogo = await db.adSlot.count({ where: { logoUrl: { not: null } } });
  const missing = await db.adSlot.findMany({
    where: { logoUrl: null },
    select: { name: true },
  });
  console.log(`\n${withLogo}/${total} ads have brand logos`);
  if (missing.length) console.log("missing:", missing.map((m) => m.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
