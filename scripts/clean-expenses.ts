import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const deleted = await prisma.propertyExpense.deleteMany({});
    console.log(`Cleaned up ${deleted.count} dummy expense records from database.`);
  } catch (err) {
    console.error("Error cleaning up dummy expenses:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
