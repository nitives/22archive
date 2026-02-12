import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env, requireEnv } from "@/conf/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: requireEnv(env.databaseUrl, "DATABASE_URL"),
    }),
  });

if (env.nodeEnv !== "production") globalForPrisma.prisma = prisma;
