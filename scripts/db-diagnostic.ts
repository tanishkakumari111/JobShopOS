import "server-only";

import { getPrismaClient } from "@/lib/db/prisma";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the database diagnostic script.");
  }

  const prisma = getPrismaClient();

  try {
    await prisma.$queryRawUnsafe<{ ok: number }[]>("SELECT 1 as ok");
    console.log("Database diagnostic passed: Prisma Client connectivity is working.");
  } catch (error) {
    console.error("Database diagnostic failed: Prisma Client could not execute a simple query.");
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Database diagnostic failed during setup:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
