import { PrismaClient } from "@/generated/prisma/index";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

function createPrismaClient() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  process.env.NODE_ENV === "production"
    ? (globalForPrisma.prisma ||= createPrismaClient())
    : createPrismaClient();

