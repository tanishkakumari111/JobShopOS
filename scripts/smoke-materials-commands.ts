import { createPurchaseRequestCommand } from "@/lib/commands/material-commands";
import { getDataSourceMode } from "@/lib/data-source";
import { getPrismaClient } from "@/lib/db/prisma";
import type { CommandContext } from "@/lib/commands/types";
import { getMaterialsSmokeKeys } from "./smoke-run-id";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function makeContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Smoke Test Runner",
    role: "Buyer",
    idempotencyKey,
    now: new Date("2026-05-23T10:42:00.000Z"),
    dataSourceMode: "database"
  };
}

async function main() {
  const dataSourceMode = getDataSourceMode();
  assert(dataSourceMode === "database", "JOBSHOP_DATA_SOURCE=database is required for the materials smoke test.");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the materials smoke test.");
  }

  const prisma = getPrismaClient();

  console.log("Running materials command smoke test in database mode...");

  const { approval: approvalKey } = getMaterialsSmokeKeys();
  const context = makeContext(approvalKey);

  const firstResult = await createPurchaseRequestCommand(
    {
      jobId: "J-2099",
      materialSku: "AL-6061-PLT-0.375",
      purchaseRequestId: "PR-3091",
      quantity: 50
    },
    context
  );

  console.log("createPurchaseRequestCommand:", JSON.stringify(firstResult));

  assert(firstResult.status === "succeeded", "Expected the materials command to succeed.");

  const [job, purchaseRequest, auditEvents, workflowCommands] = await Promise.all([
    prisma.job.findUnique({ where: { id: "J-2099" } }),
    prisma.purchaseRequest.findUnique({ where: { id: "PR-3091" } }),
    prisma.auditEvent.findMany({
      where: {
        entityId: {
          in: ["J-2099", "PR-3091"]
        }
      },
      orderBy: { id: "asc" }
    }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: [approvalKey]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(job?.status === "PURCHASE_REQUESTED", "Expected J-2099 to move to Purchase Requested.");
  assert(purchaseRequest?.id === "PR-3091", "Expected PR-3091 to exist.");
  assert(purchaseRequest?.linkedJobId === "J-2099", "Expected PR-3091 to be linked to J-2099.");
  assert(purchaseRequest?.materialSku === "AL-6061-PLT-0.375", "Expected PR-3091 to link the AL-6061-PLT-0.375 shortage.");
  assert(auditEvents.length > 0, "Expected audit events for the materials workflow.");
  assert(workflowCommands.length === 1, "Expected one workflow command record after first run.");

  const rerunResult = await createPurchaseRequestCommand(
    {
      jobId: "J-2099",
      materialSku: "AL-6061-PLT-0.375",
      purchaseRequestId: "PR-3091",
      quantity: 50
    },
    context
  );

  console.log("rerun createPurchaseRequestCommand:", JSON.stringify(rerunResult));

  const [rerunJob, rerunPurchaseRequest, rerunAuditEvents, rerunWorkflowCommands] = await Promise.all([
    prisma.job.findUnique({ where: { id: "J-2099" } }),
    prisma.purchaseRequest.findUnique({ where: { id: "PR-3091" } }),
    prisma.auditEvent.findMany({
      where: {
        entityId: {
          in: ["J-2099", "PR-3091"]
        }
      },
      orderBy: { id: "asc" }
    }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: [approvalKey]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(rerunResult.status === "succeeded", "Expected rerun materials command to succeed.");
  assert(rerunJob?.status === "PURCHASE_REQUESTED", "Expected J-2099 to remain in Purchase Requested after rerun.");
  assert(rerunPurchaseRequest?.id === "PR-3091", "Expected PR-3091 to remain after rerun.");
  assert(
    rerunAuditEvents.length === auditEvents.length,
    "Expected audit event count to remain stable after rerun."
  );
  assert(
    rerunWorkflowCommands.length === workflowCommands.length,
    "Expected workflow command count to remain stable after rerun."
  );

  console.log("Smoke test passed:");
  console.log("- J-2099 is Purchase Requested");
  console.log("- PR-3091 exists");
  console.log("- Audit events exist");
  console.log("- Rerun is idempotent");
}

main().catch((error) => {
  console.error("Smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
