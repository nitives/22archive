import "dotenv/config";
import { defineConfig } from "prisma/config";
import { serverEnv } from "@/conf/env/server";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: serverEnv.directUrl || serverEnv.databaseUrl,
  },
});
