import { generateCustomerStatusReportCommand } from "@/lib/commands/report-commands";
import { getDataSourceMode } from "@/lib/data-source";
import { getPrismaClient } from "@/lib/db/prisma";
import type { CommandContext } from "@/lib/commands/types";
import { getReportSmokeKeys } from "./smoke-run-id";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function makeContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Smoke Test Runner",
    role: "Customer Service",
    idempotencyKey,
    now: new Date("2026-05-23T10:42:00.000Z"),
    dataSourceMode: "database"
  };
}

async function main() {
  const dataSourceMode = getDataSourceMode();
  assert(dataSourceMode === "database", "JOBSHOP_DATA_SOURCE=database is required for the report smoke test.");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the report smoke test.");
  }

  const prisma = getPrismaClient();

  console.log("Running customer report command smoke test in database mode...");

  const { command: commandKey } = getReportSmokeKeys();
  const context = makeContext(commandKey);

  const firstResult = await generateCustomerStatusReportCommand(
    {
      jobId: "J-2035",
      customerSlug: "metrofab-industries",
      reportId: "REPORT-J-2035-STATUS"
    },
    context
  );

  console.log("generateCustomerStatusReportCommand:", JSON.stringify(firstResult));

  assert(firstResult.status === "succeeded", "Expected the report command to succeed.");

  const [job, report, auditEvents, workflowCommands] = await Promise.all([
    prisma.job.findUnique({ where: { id: "J-2035" } }),
    prisma.customerReport.findUnique({ where: { id: "REPORT-J-2035-STATUS" } }),
    prisma.auditEvent.findMany({
      where: {
        OR: [
          { entityType: "REPORT", entityId: "REPORT-J-2035-STATUS" },
          { entityType: "CUSTOMER", entityId: "metrofab-industries" }
        ]
      },
      orderBy: { id: "asc" }
    }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: [commandKey]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(report?.id === "REPORT-J-2035-STATUS", "Expected REPORT-J-2035-STATUS to exist.");
  assert(report?.jobId === "J-2035", "Expected the report to link to J-2035.");
  assert(report?.customerSlug === "metrofab-industries", "Expected the report to link to MetroFab Industries.");
  assert(job?.reportGenerated === true, "Expected J-2035 to indicate the customer report was generated.");
  assert(auditEvents.length >= 2, "Expected audit events for the report workflow.");
  assert(workflowCommands.length === 1, "Expected one workflow command record after first run.");

  const rerunResult = await generateCustomerStatusReportCommand(
    {
      jobId: "J-2035",
      customerSlug: "metrofab-industries",
      reportId: "REPORT-J-2035-STATUS"
    },
    context
  );

  console.log("rerun generateCustomerStatusReportCommand:", JSON.stringify(rerunResult));

  const [rerunJob, rerunReport, rerunAuditEvents, rerunWorkflowCommands] = await Promise.all([
    prisma.job.findUnique({ where: { id: "J-2035" } }),
    prisma.customerReport.findUnique({ where: { id: "REPORT-J-2035-STATUS" } }),
    prisma.auditEvent.findMany({
      where: {
        OR: [
          { entityType: "REPORT", entityId: "REPORT-J-2035-STATUS" },
          { entityType: "CUSTOMER", entityId: "metrofab-industries" }
        ]
      },
      orderBy: { id: "asc" }
    }),
    prisma.workflowCommand.findMany({
      where: {
        idempotencyKey: {
          in: [commandKey]
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  assert(rerunResult.status === "succeeded", "Expected rerun report command to succeed.");
  assert(rerunJob?.reportGenerated === true, "Expected J-2035 to remain generated after rerun.");
  assert(rerunReport?.id === "REPORT-J-2035-STATUS", "Expected REPORT-J-2035-STATUS to remain after rerun.");
  assert(rerunAuditEvents.length === auditEvents.length, "Expected audit event count to remain stable after rerun.");
  assert(
    rerunWorkflowCommands.length === workflowCommands.length,
    "Expected workflow command count to remain stable after rerun."
  );

  console.log("Smoke test passed:");
  console.log("- REPORT-J-2035-STATUS exists");
  console.log("- REPORT-J-2035-STATUS links to J-2035 and MetroFab Industries");
  console.log("- J-2035 indicates reportGenerated");
  console.log("- Audit events exist");
  console.log("- Rerun is idempotent");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  try {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  } catch {
    // Ignore cleanup failures during smoke test exit.
  }
  process.exitCode = 1;
});
