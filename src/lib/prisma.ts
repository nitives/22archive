import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireServerEnv, serverEnv } from "@/conf/env/server";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: requireServerEnv(serverEnv.databaseUrl, "DATABASE_URL"),
    }),
  });

if (serverEnv.nodeEnv !== "production") globalForPrisma.prisma = prisma;
