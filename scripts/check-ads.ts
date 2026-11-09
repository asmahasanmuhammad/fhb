import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const ads = await db.adSlot.findMany();
  console.log("Total ad slots:", ads.length);
  for (const a of ads)
    console.log(
      `- [${a.placement}] ${a.name} | active=${a.active} | img=${a.imageHint?.slice(0, 60) ?? "none"} | link=${a.linkUrl ?? "none"}`
    );
}
main().finally(() => db.$disconnect());
