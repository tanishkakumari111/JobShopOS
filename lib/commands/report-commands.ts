import type { Prisma, ReportAudience } from "@prisma/client";

import { customerStatusReport as seedCustomerStatusReport } from "@/lib/demo-data";

import { createAuthorizationError, createConflictError, createNotFoundError } from "./errors";
import { prepareAuditEventInput } from "./audit";
import { runWorkflowCommand, type WorkflowCommandExecutionResult } from "./transaction";
import type { CommandContext, CommandResult } from "./types";

export type GenerateCustomerStatusReportCommandInput = {
  jobId: string;
  customerSlug?: string;
  reportId?: string;
};

type CustomerReportCommandResult = {
  jobId: string;
  customerSlug: string;
  reportId: string;
  reportStatus: "Generated";
};

type PrismaTransaction = Prisma.TransactionClient;

function isCustomerService(role: string) {
  return role === "Customer Service";
}

function isOwnerGM(role: string) {
  return role === "Owner / GM";
}

function isScheduler(role: string) {
  return role === "Scheduler";
}

function isOperator(role: string) {
  return role === "Operator";
}

function isEstimator(role: string) {
  return role === "Estimator";
}

function canGenerateCustomerReport(role: string) {
  return isCustomerService(role) || isOwnerGM(role) || isScheduler(role);
}

function buildReportRecord(
  reportId: string,
  job: {
    id: string;
    customerSlug: string;
    customerPo: string | null;
    part: string;
    quantity: number;
    dueDate: string;
  },
  customer: {
    slug: string;
    name: string;
    primaryContact: string;
  },
  context: CommandContext
) {
  const preparedTimestamp = context.now.toISOString();

  return {
    id: reportId,
    jobId: job.id,
    customerSlug: customer.slug,
    title: "Customer Job Status Report",
    audience: "CUSTOMER" as ReportAudience,
    summary: "Customer-safe status report for J-2035.",
    generatedAt: preparedTimestamp,
    savedAs: "Customer PDF",
    customerName: customer.name,
    contact: customer.primaryContact || seedCustomerStatusReport.contact,
    customerPo: job.customerPo ?? seedCustomerStatusReport.customerPo,
    part: job.part,
    quantity: job.quantity,
    dueDate: job.dueDate,
    currentStatus: seedCustomerStatusReport.currentStatus,
    customerFacingStatus: seedCustomerStatusReport.customerFacingStatus,
    progress: seedCustomerStatusReport.progress,
    nextMilestone: seedCustomerStatusReport.nextMilestone,
    shipmentReadiness: seedCustomerStatusReport.shipmentReadiness,
    preparedBy: context.actor,
    preparedTimestamp,
    message: seedCustomerStatusReport.message,
    reportSavedTo: seedCustomerStatusReport.reportSavedTo
  };
}

function buildReportCommandResult(reportId: string, jobId: string, customerSlug: string): CustomerReportCommandResult {
  return {
    jobId,
    customerSlug,
    reportId,
    reportStatus: "Generated"
  };
}

async function generateCustomerStatusReportInTransaction(
  tx: PrismaTransaction,
  input: GenerateCustomerStatusReportCommandInput,
  context: CommandContext
): Promise<WorkflowCommandExecutionResult<CustomerReportCommandResult>> {
  if (!canGenerateCustomerReport(context.role)) {
    if (isOperator(context.role)) {
      throw createAuthorizationError("Operators cannot generate customer-facing reports.");
    }

    if (isEstimator(context.role)) {
      throw createAuthorizationError("Estimators cannot generate customer-facing reports.");
    }

    throw createAuthorizationError("Customer Service, Scheduler, or Owner / GM approval is required to generate customer-facing reports.");
  }

  const job = await tx.job.findUnique({
    where: { id: input.jobId }
  });

  if (!job) {
    throw createNotFoundError(`Job ${input.jobId} was not found.`);
  }

  const customerSlug = input.customerSlug ?? job.customerSlug;
  const customer = await tx.customer.findUnique({
    where: { slug: customerSlug }
  });

  if (!customer) {
    throw createNotFoundError(`Customer ${customerSlug} was not found.`);
  }

  if (job.customerSlug !== customer.slug) {
    throw createConflictError(`Job ${job.id} does not belong to customer ${customer.slug}.`);
  }

  const reportId = input.reportId ?? "REPORT-J-2035-STATUS";
  const existingReport = await tx.customerReport.findUnique({
    where: { id: reportId }
  });

  if (existingReport && (existingReport.jobId !== job.id || existingReport.customerSlug !== customer.slug)) {
    throw createConflictError(
      `Customer report ${reportId} is already linked to job ${existingReport.jobId} and customer ${existingReport.customerSlug ?? "unknown"}.`
    );
  }

  if (existingReport && existingReport.jobId === job.id && existingReport.customerSlug === customer.slug) {
    await tx.job.updateMany({
      where: { id: job.id },
      data: {
        reportGenerated: true
      }
    });

    return {
      data: buildReportCommandResult(reportId, job.id, customer.slug)
    };
  }

  const reportRecord = buildReportRecord(reportId, job, customer, context);

  const updatedJob = await tx.job.updateMany({
    where: { id: job.id },
    data: {
      reportGenerated: true
    }
  });

  if (updatedJob.count === 0) {
    const currentJob = await tx.job.findUnique({
      where: { id: job.id }
    });

    if (!currentJob) {
      throw createNotFoundError(`Job ${input.jobId} was not found.`);
    }

    if (currentJob.customerSlug !== customer.slug) {
      throw createConflictError(`Job ${job.id} does not belong to customer ${customer.slug}.`);
    }
  }

  await tx.customerReport.upsert({
    where: { id: reportId },
    create: reportRecord,
    update: reportRecord
  });

  return {
    data: buildReportCommandResult(reportId, job.id, customer.slug),
    auditEvents: [
      prepareAuditEventInput({
        actor: context.actor,
        role: context.role,
        action: "Generated customer status report",
        entityType: "REPORT",
        entityId: reportId,
        result: "Customer-safe report generated",
        notes: "Generated customer-safe production update for J-2035",
        severity: "AUTOMATION",
        metadata: {
          jobId: job.id,
          customerSlug: customer.slug,
          reportId
        },
        timestamp: context.now.toISOString()
      }),
      prepareAuditEventInput({
        actor: "System",
        role: "Automation",
        action: "Saved report to customer record",
        entityType: "CUSTOMER",
        entityId: customer.slug,
        result: "Report linked to customer account",
        notes: "Customer status report saved for MetroFab Industries",
        severity: "AUTOMATION",
        metadata: {
          jobId: job.id,
          customerSlug: customer.slug,
          reportId
        },
        timestamp: context.now.toISOString()
      })
    ]
  };
}

export async function generateCustomerStatusReportCommand(
  input: GenerateCustomerStatusReportCommandInput,
  context: CommandContext
): Promise<CommandResult<CustomerReportCommandResult>> {
  return runWorkflowCommand({
    commandType: "GENERATE_CUSTOMER_STATUS_REPORT",
    entityType: "REPORT",
    entityId: input.reportId ?? "REPORT-J-2035-STATUS",
    context,
    execute: (tx) => generateCustomerStatusReportInTransaction(tx, input, context)
  });
}
