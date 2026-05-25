import { getDataSourceMode } from "@/lib/data-source";
import { getPrismaClient } from "@/lib/db/prisma";
import { approveScrapAndCreateReworkCommand } from "@/lib/commands/quality-commands";
import type { CommandContext } from "@/lib/commands/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function makeContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Smoke Test Runner",
    role: "Shop Supervisor",
    idempotencyKey,
    now: new Date("2026-05-23T10:42:00.000Z"),
    dataSourceMode: "database"
  };
}

async function main() {
  const dataSourceMode = getDataSourceMode();
  assert(dataSourceMode === "database", "JOBSHOP_DATA_SOURCE=database is required for the quality smoke test.");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the quality smoke test.");
  }

  const prisma = getPrismaClient();

  console.log("Running quality command smoke test in database mode...");

  const context = makeContext("smoke-quality-J-2042-approve-scrap-v1");

  const firstResult = await approveScrapAndCreateReworkCommand(
    {
      jobId: "J-2042",
      reworkOrderId: "RW-2042-01"
    },
    context
  );

  console.log("approveScrapAndCreateReworkCommand:", JSON.stringify(firstResult));

  assert(firstResult.status === "succeeded", "Expected the quality command to succeed.");

  const [job, reworkOrder, qualityEvents, workflowCommands] = await Promise.all([
    prisma.job.findUnique({ where: { id: "J-2042" } }),
    prisma.reworkOrder.findUnique({ where: { id: "RW-2042-01" } }),
    prisma.auditEvent.findMany({
      where: {
        entityId: {
          in: ["J-2042", "RW-2042-01"]
        }
      },
      orderBy: { id: "asc" }
    }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: ["smoke-quality-J-2042-approve-scrap-v1"]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(job?.status === "REWORK", "Expected J-2042 to move to Rework.");
  assert(reworkOrder?.id === "RW-2042-01", "Expected RW-2042-01 to exist.");
  assert(qualityEvents.length > 0, "Expected audit events for the quality workflow.");
  assert(workflowCommands.length === 1, "Expected one workflow command record after first run.");

  const rerunResult = await approveScrapAndCreateReworkCommand(
    {
      jobId: "J-2042",
      reworkOrderId: "RW-2042-01"
    },
    context
  );

  console.log("rerun approveScrapAndCreateReworkCommand:", JSON.stringify(rerunResult));

  const [rerunJob, rerunReworkOrder, rerunQualityEvents, rerunWorkflowCommands] = await Promise.all([
    prisma.job.findUnique({ where: { id: "J-2042" } }),
    prisma.reworkOrder.findUnique({ where: { id: "RW-2042-01" } }),
    prisma.auditEvent.findMany({
      where: {
        entityId: {
          in: ["J-2042", "RW-2042-01"]
        }
      },
      orderBy: { id: "asc" }
    }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: ["smoke-quality-J-2042-approve-scrap-v1"]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(rerunResult.status === "succeeded", "Expected rerun quality command to succeed.");
  assert(rerunJob?.status === "REWORK", "Expected J-2042 to remain in Rework after rerun.");
  assert(rerunReworkOrder?.id === "RW-2042-01", "Expected RW-2042-01 to remain after rerun.");
  assert(
    rerunQualityEvents.length === qualityEvents.length,
    "Expected audit event count to remain stable after rerun."
  );
  assert(
    rerunWorkflowCommands.length === workflowCommands.length,
    "Expected workflow command count to remain stable after rerun."
  );

  console.log("Smoke test passed:");
  console.log("- J-2042 is Rework");
  console.log("- RW-2042-01 exists");
  console.log("- Audit events exist");
  console.log("- Rerun is idempotent");
}

main().catch((error) => {
  console.error("Smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
