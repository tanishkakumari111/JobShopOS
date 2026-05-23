import { getPrismaClient } from "@/lib/db/prisma";

type PrismaMigrationRow = {
  migration_name: string;
  started_at: Date | string | null;
  finished_at: Date | string | null;
  rolled_back_at: Date | string | null;
  logs: string | null;
};

function isMissing(value: Date | string | null) {
  return value === null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the migration inspector script.");
  }

  const prisma = getPrismaClient();

  try {
    const rows = await prisma.$queryRaw<PrismaMigrationRow[]>`
      SELECT migration_name, started_at, finished_at, rolled_back_at, logs
      FROM "_prisma_migrations"
      ORDER BY started_at ASC
    `;

    if (rows.length === 0) {
      console.log("No rows found in _prisma_migrations.");
      return;
    }

    console.log("Prisma migration history:");
    for (const row of rows) {
      console.log(
        JSON.stringify(
          {
            migration_name: row.migration_name,
            started_at: row.started_at,
            finished_at: row.finished_at,
            rolled_back_at: row.rolled_back_at,
            logs: row.logs
          },
          null,
          2
        )
      );
    }

    const failedRows = rows.filter((row) => !isMissing(row.rolled_back_at) || isMissing(row.finished_at));

    if (failedRows.length > 0) {
      console.error("Failed migrations detected:");
      for (const row of failedRows) {
        console.error(`- ${row.migration_name}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("No failed migrations found.");
  } catch (error) {
    console.error("Migration inspector failed:");
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Migration inspector failed during setup:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
