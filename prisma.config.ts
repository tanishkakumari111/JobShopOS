import "dotenv/config";

import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public";

const databaseUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: databaseUrl
  }
});
