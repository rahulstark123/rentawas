import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const all = await prisma.workspace.findMany({
    select: { wid: true, plan: true, createdAt: true, trialStartedAt: true },
  });
  console.log("COUNT", all.length);
  for (const w of all) {
    await prisma.workspace.update({
      where: { wid: w.wid },
      data: { trialStartedAt: w.createdAt },
    });
    const days = Math.max(
      0,
      14 - Math.floor((Date.now() - new Date(w.createdAt).getTime()) / 86400000)
    );
    console.log(
      JSON.stringify({
        wid: w.wid,
        plan: w.plan,
        createdAt: w.createdAt,
        daysLeftIfTrial: days,
      })
    );
  }
  await prisma.$disconnect();
  await pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
