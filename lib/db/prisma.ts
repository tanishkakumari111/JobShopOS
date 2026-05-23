import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __jobshopPrismaClient: PrismaClient | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for database mode. Set JOBSHOP_DATA_SOURCE=database only when a PostgreSQL connection is configured."
    );
  }

  return databaseUrl;
}

export function getPrismaClient() {
  if (!globalThis.__jobshopPrismaClient) {
    getDatabaseUrl();
    globalThis.__jobshopPrismaClient = new PrismaClient();
  }

  return globalThis.__jobshopPrismaClient;
}

export function resetPrismaClientForTests() {
  delete globalThis.__jobshopPrismaClient;
}
