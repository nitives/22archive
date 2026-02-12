import "dotenv/config";
import { defineConfig } from "prisma/config";
import { requireServerEnv, serverEnv } from "@/conf/env/server";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      requireServerEnv(serverEnv.directUrl, "DIRECT_URL") ||
      requireServerEnv(serverEnv.databaseUrl, "DATABASE_URL"),
  },
});
