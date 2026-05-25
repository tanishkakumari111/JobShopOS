import { getDataSourceMode } from "@/lib/data-source";
import { getPrismaClient } from "@/lib/db/prisma";
import { approveQuoteCommand, convertQuoteToJobCommand } from "@/lib/commands/quote-commands";
import type { CommandContext } from "@/lib/commands/types";
import { getQuoteSmokeKeys } from "./smoke-run-id";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function makeContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Smoke Test Runner",
    role: "Owner / GM",
    idempotencyKey,
    now: new Date("2026-05-23T10:42:00.000Z"),
    dataSourceMode: "database"
  };
}

async function main() {
  const dataSourceMode = getDataSourceMode();
  assert(dataSourceMode === "database", "JOBSHOP_DATA_SOURCE=database is required for the quote smoke test.");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the quote smoke test.");
  }

  const prisma = getPrismaClient();

  console.log("Running quote command smoke test in database mode...");

  const { approval: approveKey, conversion: convertKey } = getQuoteSmokeKeys();
  const approveContext = makeContext(approveKey);
  const convertContext = makeContext(convertKey);

  const approveResult = await approveQuoteCommand({ quoteId: "Q-1003" }, approveContext);
  console.log("approveQuoteCommand:", JSON.stringify(approveResult));

  const convertResult = await convertQuoteToJobCommand(
    { quoteId: "Q-1003", jobId: "J-2104", workOrderId: "WO-2104" },
    convertContext
  );
  console.log("convertQuoteToJobCommand:", JSON.stringify(convertResult));

  const [quote, job, auditEvents, workflowCommands] = await Promise.all([
    prisma.quote.findUnique({ where: { id: "Q-1003" } }),
    prisma.job.findUnique({ where: { id: "J-2104" } }),
    prisma.auditEvent.findMany({ where: { entityId: { in: ["Q-1003", "J-2104", "WO-2104"] } }, orderBy: { id: "asc" } }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: [approveKey, convertKey]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(quote?.status === "CONVERTED_TO_JOB", "Expected Q-1003 to be converted to job.");
  assert(job?.id === "J-2104", "Expected J-2104 to exist.");
  assert(job?.workOrder === "WO-2104", "Expected WO-2104 to be linked on J-2104.");
  assert(auditEvents.length > 0, "Expected audit events for the quote workflow.");
  assert(workflowCommands.length === 2, "Expected two workflow command records after first run.");

  const rerunApprove = await approveQuoteCommand({ quoteId: "Q-1003" }, approveContext);
  const rerunConvert = await convertQuoteToJobCommand(
    { quoteId: "Q-1003", jobId: "J-2104", workOrderId: "WO-2104" },
    convertContext
  );

  console.log("rerun approveQuoteCommand:", JSON.stringify(rerunApprove));
  console.log("rerun convertQuoteToJobCommand:", JSON.stringify(rerunConvert));

  const [rerunQuote, rerunJob, rerunAuditEvents, rerunWorkflowCommands] = await Promise.all([
    prisma.quote.findUnique({ where: { id: "Q-1003" } }),
    prisma.job.findUnique({ where: { id: "J-2104" } }),
    prisma.auditEvent.findMany({ where: { entityId: { in: ["Q-1003", "J-2104", "WO-2104"] } }, orderBy: { id: "asc" } }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: [approveKey, convertKey]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(rerunQuote?.status === "CONVERTED_TO_JOB", "Expected Q-1003 to remain converted after rerun.");
  assert(rerunJob?.id === "J-2104", "Expected J-2104 to remain after rerun.");
  assert(rerunAuditEvents.length === auditEvents.length, "Expected audit event count to remain stable after rerun.");
  assert(rerunWorkflowCommands.length === workflowCommands.length, "Expected workflow command count to remain stable after rerun.");

  console.log("Smoke test passed:");
  console.log("- Q-1003 is Converted to Job");
  console.log("- J-2104 exists");
  console.log("- WO-2104 exists");
  console.log("- Audit events exist");
  console.log("- Rerun is idempotent");
}

main().catch((error) => {
  console.error("Smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
