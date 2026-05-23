import "server-only";

import type { Prisma, QuoteStatus } from "@prisma/client";

import { quoteMaterialEstimateRows, quoteRoutingEstimateRows } from "@/lib/demo-data";

import { createAuthorizationError, createConflictError, createNotFoundError } from "./errors";
import { prepareAuditEventInput } from "./audit";
import { runWorkflowCommand, type WorkflowCommandExecutionResult } from "./transaction";
import type { CommandContext, CommandResult } from "./types";

export type ApproveQuoteCommandInput = {
  quoteId: string;
};

export type ConvertQuoteToJobCommandInput = {
  quoteId: string;
  jobId?: string;
  workOrderId?: string;
};

type QuoteCommandResult = {
  quoteId: string;
  quoteStatus: "Approved" | "Converted to Job";
  jobId?: string;
  workOrderId?: string;
};

type PrismaTransaction = Prisma.TransactionClient;

type ApprovableQuoteStatus = Extract<QuoteStatus, "DRAFT" | "SUBMITTED" | "NEEDS_OWNER_APPROVAL">;

function isApprovableQuoteStatus(status: QuoteStatus): status is ApprovableQuoteStatus {
  return status === "DRAFT" || status === "SUBMITTED" || status === "NEEDS_OWNER_APPROVAL";
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

function canConvertApprovedQuote(role: string) {
  return isOwnerGM(role) || isScheduler(role);
}

function parseQuantity(quantity: string) {
  const parsed = Number.parseInt(quantity, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDefaultJobData(
  jobId: string,
  quote: {
  id: string;
  customerSlug: string;
  customerName: string;
  part: string;
  quantity: number;
  },
  workOrderId: string
) {
  return {
    slug: jobId.toLowerCase(),
    customerSlug: quote.customerSlug,
    customerName: quote.customerName,
    customerPo: undefined as string | undefined,
    part: quote.part,
    quantity: quote.quantity,
    completedQuantity: undefined as number | undefined,
    scrapQuantity: undefined as number | undefined,
    scrapRate: undefined as number | undefined,
    allowedTolerance: undefined as number | undefined,
    status: "APPROVED" as const,
    currentStep: "Routing generated from quote",
    blockedStep: undefined as string | undefined,
    workCenter: "Scheduling",
    risk: "LOW" as const,
    dueDate: "Ready for release",
    workOrder: workOrderId,
    reworkOrder: undefined as string | undefined,
    purchaseRequestId: undefined as string | undefined,
    reportGenerated: false,
    requiredMaterial: undefined as string | undefined,
    shortageSheets: undefined as number | undefined,
    sourceQuoteId: quote.id,
    progress: 100
  };
}

async function approveQuoteInTransaction(
  tx: PrismaTransaction,
  input: ApproveQuoteCommandInput,
  context: CommandContext
): Promise<WorkflowCommandExecutionResult<QuoteCommandResult>> {
  const quote = await tx.quote.findUnique({
    where: { id: input.quoteId }
  });

  if (!quote) {
    throw createNotFoundError(`Quote ${input.quoteId} was not found.`);
  }

  if (quote.status === "CONVERTED_TO_JOB") {
    throw createConflictError(`Quote ${input.quoteId} has already been converted to a job.`);
  }

  if (quote.status === "APPROVED") {
    return {
      data: {
        quoteId: quote.id,
        quoteStatus: "Approved"
      }
    };
  }

  if (!isApprovableQuoteStatus(quote.status)) {
    throw createConflictError(`Quote ${input.quoteId} is not in an approvable state.`);
  }

  if (isOperator(context.role)) {
    throw createAuthorizationError("Operators cannot approve quotes.");
  }

  const approvalThreshold = quote.approvalThreshold ?? 50000;
  const requiresOwnerApproval = quote.amount > approvalThreshold;

  if (requiresOwnerApproval && !isOwnerGM(context.role)) {
    throw createAuthorizationError("Owner / GM approval is required for high-value quotes.");
  }

  const updated = await tx.quote.updateMany({
    where: {
      id: quote.id,
      status: {
        in: ["DRAFT", "SUBMITTED", "NEEDS_OWNER_APPROVAL"]
      }
    },
    data: {
      status: "APPROVED"
    }
  });

  if (updated.count === 0) {
    const current = await tx.quote.findUnique({
      where: { id: quote.id }
    });

    if (!current) {
      throw createNotFoundError(`Quote ${input.quoteId} was not found.`);
    }

    if (current.status === "APPROVED") {
      return {
        data: {
          quoteId: current.id,
          quoteStatus: "Approved"
        }
      };
    }

    if (current.status === "CONVERTED_TO_JOB") {
      throw createConflictError(`Quote ${input.quoteId} has already been converted to a job.`);
    }

    throw createConflictError(`Quote ${input.quoteId} could not be approved because it changed during the transaction.`);
  }

  await tx.quoteApprovalHistory.create({
    data: {
      id: `${quote.id}-approval-${context.idempotencyKey}`,
      quoteId: quote.id,
      timestamp: context.now.toISOString(),
      title: "Quote approved",
      detail: `${context.role} approved ${quote.id} for conversion to a production job.`
    }
  });

  return {
    data: {
      quoteId: quote.id,
      quoteStatus: "Approved"
    },
    auditEvents: [
      prepareAuditEventInput({
        actor: context.actor,
        role: context.role,
        action: "Approved high-value quote",
        entityType: "QUOTE",
        entityId: quote.id,
        result: "Quote approved for job conversion",
        notes: "Approved quote above approval threshold",
        severity: "APPROVAL",
        metadata: {
          quoteAmount: quote.amount,
          approvalThreshold,
          requiredRole: quote.approvalRequiredRole
        },
        timestamp: context.now.toISOString()
      })
    ]
  };
}

function buildRoutingSource(
  quoteId: string,
  routingSteps: Array<{
    stepNumber: number;
    operation: string;
    workCenter: string;
    estimatedHours: number;
    machine: string;
    notes: string;
  }>
) {
  if (routingSteps.length > 0) {
    return routingSteps.map((step) => ({
      stepNumber: step.stepNumber,
      operation: step.operation,
      workCenter: step.workCenter,
      plannedHours: step.estimatedHours,
      machine: step.machine,
      notes: step.notes
    }));
  }

  if (quoteId === "Q-1003") {
    return quoteRoutingEstimateRows.map((step, index) => ({
      stepNumber: (index + 1) * 10,
      operation: step.operation,
      workCenter: step.workCenter,
      plannedHours: step.estimatedHours,
      machine: step.machine,
      notes: step.notes
    }));
  }

  return [];
}

function buildMaterialSource(
  quoteId: string,
  materialLines: Array<{
    sku: string;
    materialName: string;
    quantity: string;
    availabilityStatus: string;
  }>
) {
  if (materialLines.length > 0) {
    return materialLines.map((line) => ({
      sku: line.sku,
      materialName: line.materialName,
      requiredQuantity: parseQuantity(line.quantity),
      status: line.availabilityStatus,
      notes: `Converted from quote ${quoteId}`
    }));
  }

  if (quoteId === "Q-1003") {
    return quoteMaterialEstimateRows.map((line) => ({
      sku: line.sku,
      materialName: line.materialName,
      requiredQuantity: parseQuantity(line.quantity),
      status: line.availabilityStatus,
      notes: `Converted from quote ${quoteId}`
    }));
  }

  return [];
}

async function convertQuoteInTransaction(
  tx: PrismaTransaction,
  input: ConvertQuoteToJobCommandInput,
  context: CommandContext
): Promise<WorkflowCommandExecutionResult<QuoteCommandResult>> {
  const quote = await tx.quote.findUnique({
    where: { id: input.quoteId },
    include: {
      routingSteps: { orderBy: { stepNumber: "asc" } },
      materialLines: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!quote) {
    throw createNotFoundError(`Quote ${input.quoteId} was not found.`);
  }

  if (quote.status === "NEEDS_OWNER_APPROVAL") {
    throw createConflictError(`Quote ${input.quoteId} cannot be converted before owner approval is recorded.`);
  }

  if (quote.status !== "APPROVED" && quote.status !== "CONVERTED_TO_JOB") {
    throw createConflictError(`Quote ${input.quoteId} must be approved before conversion.`);
  }

  if (isOperator(context.role)) {
    throw createAuthorizationError("Operators cannot convert quotes.");
  }

  if (isEstimator(context.role)) {
    throw createAuthorizationError("Estimators cannot convert high-value quotes to production jobs.");
  }

  if (!canConvertApprovedQuote(context.role)) {
    throw createAuthorizationError("Only Owner / GM or Scheduler can convert approved quotes.");
  }

  const targetJobId = input.jobId ?? "J-2104";
  const targetWorkOrderId = input.workOrderId ?? "WO-2104";
  const existingJob = await tx.job.findUnique({
    where: { id: targetJobId }
  });

  if (quote.status === "CONVERTED_TO_JOB") {
    const existingJobMatches =
      Boolean(existingJob) &&
      existingJob?.sourceQuoteId === quote.id &&
      existingJob?.workOrder === targetWorkOrderId;

    if (existingJobMatches) {
      return {
        data: {
          quoteId: quote.id,
          quoteStatus: "Converted to Job",
          jobId: targetJobId,
          workOrderId: targetWorkOrderId
        }
      };
    }

    throw createConflictError(`Quote ${input.quoteId} has already been converted to a different job or work order.`);
  }

  if (existingJob && existingJob.sourceQuoteId && existingJob.sourceQuoteId !== quote.id) {
    throw createConflictError(`Job ${targetJobId} is already linked to another quote.`);
  }

  const jobData = buildDefaultJobData(targetJobId, quote, targetWorkOrderId);

  const upsertedJob = await tx.job.upsert({
    where: { id: targetJobId },
    create: {
      id: targetJobId,
      ...jobData
    },
    update: jobData
  });

  const routingSource = buildRoutingSource(quote.id, quote.routingSteps);
  const materialSource = buildMaterialSource(quote.id, quote.materialLines);

  if (routingSource.length > 0) {
    await tx.jobRoutingStep.createMany({
      data: routingSource.map((step) => ({
        id: `${targetJobId}-routing-${step.stepNumber}`,
        jobId: targetJobId,
        stepNumber: step.stepNumber,
        operation: step.operation,
        workCenter: step.workCenter,
        plannedHours: step.plannedHours,
        actualHours: null,
        assignedOperator: "Unassigned",
        machine: step.machine,
        status: "Pending",
        timestamp: null
      })),
      skipDuplicates: true
    });
  }

  if (materialSource.length > 0) {
    await tx.jobMaterialRequirement.createMany({
      data: materialSource.map((material) => ({
        id: `${targetJobId}-material-${material.sku}`,
        jobId: targetJobId,
        sku: material.sku,
        materialName: material.materialName,
        requiredQuantity: material.requiredQuantity,
        status: material.status,
        notes: material.notes
      })),
      skipDuplicates: true
    });
  }

  const updatedQuote = await tx.quote.updateMany({
    where: {
      id: quote.id,
      status: "APPROVED"
    },
    data: {
      status: "CONVERTED_TO_JOB"
    }
  });

  if (updatedQuote.count === 0) {
    const current = await tx.quote.findUnique({
      where: { id: quote.id }
    });

    if (!current) {
      throw createNotFoundError(`Quote ${input.quoteId} was not found.`);
    }

    if (current.status === "CONVERTED_TO_JOB") {
      const currentJob = await tx.job.findUnique({
        where: { id: targetJobId }
      });

      if (
        currentJob &&
        currentJob.sourceQuoteId === quote.id &&
        currentJob.workOrder === targetWorkOrderId
      ) {
        return {
          data: {
            quoteId: quote.id,
            quoteStatus: "Converted to Job",
            jobId: targetJobId,
            workOrderId: targetWorkOrderId
          }
        };
      }
    }

    throw createConflictError(`Quote ${input.quoteId} could not be converted because it changed during the transaction.`);
  }

  return {
    data: {
      quoteId: quote.id,
      quoteStatus: "Converted to Job",
      jobId: upsertedJob.id,
      workOrderId: upsertedJob.workOrder ?? targetWorkOrderId
    },
    auditEvents: [
      prepareAuditEventInput({
        actor: context.actor,
        role: context.role,
        action: "Converted quote to job",
        entityType: "QUOTE",
        entityId: quote.id,
        result: `Job ${targetJobId} created`,
        notes: "Converted approved quote into production job",
        severity: "APPROVAL",
        metadata: {
          quoteAmount: quote.amount,
          jobId: targetJobId,
          workOrderId: targetWorkOrderId
        },
        timestamp: context.now.toISOString()
      }),
      prepareAuditEventInput({
        actor: "System",
        role: "Automation",
        action: "Created work order",
        entityType: "WORK_ORDER",
        entityId: targetWorkOrderId,
        result: `Linked to Job ${targetJobId}`,
        notes: `Created from Quote ${quote.id}`,
        severity: "AUTOMATION",
        metadata: {
          quoteId: quote.id,
          jobId: targetJobId
        },
        timestamp: context.now.toISOString()
      }),
      prepareAuditEventInput({
        actor: "System",
        role: "Automation",
        action: "Generated routing",
        entityType: "JOB",
        entityId: targetJobId,
        result: "Routing created from quote estimate",
        notes: "Cut, Bend, Weld, Finish, Inspect, Pack steps generated",
        severity: "AUTOMATION",
        metadata: {
          quoteId: quote.id,
          jobId: targetJobId,
          routingSteps: routingSource.map((step) => step.operation)
        },
        timestamp: context.now.toISOString()
      })
    ]
  };
}

export async function approveQuoteCommand(
  input: ApproveQuoteCommandInput,
  context: CommandContext
): Promise<CommandResult<QuoteCommandResult>> {
  return runWorkflowCommand({
    commandType: "APPROVE_QUOTE",
    entityType: "QUOTE",
    entityId: input.quoteId,
    context,
    execute: (tx) => approveQuoteInTransaction(tx, input, context)
  });
}

export async function convertQuoteToJobCommand(
  input: ConvertQuoteToJobCommandInput,
  context: CommandContext
): Promise<CommandResult<QuoteCommandResult>> {
  return runWorkflowCommand({
    commandType: "CONVERT_QUOTE_TO_JOB",
    entityType: "QUOTE",
    entityId: input.quoteId,
    context,
    execute: (tx) => convertQuoteInTransaction(tx, input, context)
  });
}
