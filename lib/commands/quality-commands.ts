import type { PrismaTransaction } from "@/lib/db/prisma-transaction";
import { createAuthorizationError, createConflictError, createNotFoundError } from "./errors";
import { prepareAuditEventInput } from "./audit";
import { runWorkflowCommand, type WorkflowCommandExecutionResult } from "./transaction";
import type { CommandContext, CommandResult } from "./types";

export type ApproveScrapAndCreateReworkCommandInput = {
  jobId: string;
  qualityEventId?: string;
  reworkOrderId?: string;
};

type QualityCommandResult = {
  jobId: string;
  jobStatus: "Rework";
  qualityEventId: string;
  reworkOrderId: string;
};

type JobStatus = "APPROVED" | "WAITING_ON_MATERIAL" | "PURCHASE_REQUESTED" | "MATERIALS_RESERVED" | "IN_PRODUCTION" | "IN_QUALITY" | "REWORK" | "READY_TO_SHIP" | "SHIPPED" | "CLOSED" | "SCRAP_APPROVAL_REQUIRED";
type ReworkOrderPriority = "LOW" | "MEDIUM" | "HIGH";
type ReworkOrderStatus = "OPEN" | "IN_PROGRESS" | "COMPLETE" | "CLOSED";

function isSupervisor(role: string) {
  return role === "Shop Supervisor" || role === "Owner / GM";
}

function isOperator(role: string) {
  return role === "Operator";
}

function isEstimator(role: string) {
  return role === "Estimator";
}

function isFinalJobStatus(status: JobStatus) {
  return status === "SHIPPED" || status === "CLOSED";
}

async function findQualityEventForJob(tx: PrismaTransaction, jobId: string, qualityEventId?: string) {
  if (qualityEventId) {
    const event = await tx.qualityEvent.findUnique({
      where: { id: qualityEventId }
    });

    if (!event) {
      throw createNotFoundError(`Quality event ${qualityEventId} was not found.`);
    }

    if (event.jobId !== jobId) {
      throw createConflictError(`Quality event ${qualityEventId} does not belong to job ${jobId}.`);
    }

    return event;
  }

  const event = await tx.qualityEvent.findFirst({
    where: {
      jobId,
      eventType: {
        in: ["INSPECTION_FAILED", "SCRAP_LOGGED", "SCRAP_APPROVED"]
      }
    },
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" }
    ]
  });

  if (!event) {
    throw createNotFoundError(`A scrap quality event for job ${jobId} was not found.`);
  }

  return event;
}

function toPriority(value: ReworkOrderPriority | undefined): ReworkOrderPriority {
  return value ?? "HIGH";
}

function toStatus(value: ReworkOrderStatus | undefined): ReworkOrderStatus {
  return value ?? "OPEN";
}

function buildQualityApprovedResult(
  jobId: string,
  reworkOrderId: string,
  qualityEventId: string
): QualityCommandResult {
  return {
    jobId,
    jobStatus: "Rework",
    qualityEventId,
    reworkOrderId
  };
}

async function approveScrapAndCreateReworkInTransaction(
  tx: PrismaTransaction,
  input: ApproveScrapAndCreateReworkCommandInput,
  context: CommandContext
): Promise<WorkflowCommandExecutionResult<QualityCommandResult>> {
  const job = await tx.job.findUnique({
    where: { id: input.jobId }
  });

  if (!job) {
    throw createNotFoundError(`Job ${input.jobId} was not found.`);
  }

  if (isFinalJobStatus(job.status)) {
    throw createConflictError(`Job ${input.jobId} is already finalized and cannot be moved to rework.`);
  }

  if (isOperator(context.role)) {
    throw createAuthorizationError("Operators cannot approve scrap.");
  }

  if (isEstimator(context.role)) {
    throw createAuthorizationError("Estimators cannot approve scrap.");
  }

  if (!isSupervisor(context.role)) {
    throw createAuthorizationError("Supervisor or Owner / GM approval is required for scrap above tolerance.");
  }

  const qualityEvent = await findQualityEventForJob(tx, input.jobId, input.qualityEventId);
  const targetReworkOrderId = input.reworkOrderId ?? qualityEvent.reworkOrderId ?? job.reworkOrder ?? "RW-2042-01";

  if (job.status === "REWORK" && job.reworkOrder === targetReworkOrderId) {
    return {
      data: buildQualityApprovedResult(job.id, targetReworkOrderId, qualityEvent.id)
    };
  }

  if (
    qualityEvent.eventType === "SCRAP_APPROVED" &&
    qualityEvent.reworkOrderId === targetReworkOrderId &&
    job.status === "REWORK" &&
    job.reworkOrder === targetReworkOrderId
  ) {
    return {
      data: buildQualityApprovedResult(job.id, targetReworkOrderId, qualityEvent.id)
    };
  }

  if (input.reworkOrderId && job.reworkOrder && job.reworkOrder !== input.reworkOrderId) {
    throw createConflictError(
      `Job ${input.jobId} already has rework order ${job.reworkOrder} linked and cannot be reassigned to ${input.reworkOrderId}.`
    );
  }

  const existingReworkOrder = await tx.reworkOrder.findUnique({
    where: { id: targetReworkOrderId }
  });

  if (existingReworkOrder && existingReworkOrder.linkedJobId !== job.id) {
    throw createConflictError(
      `Rework order ${targetReworkOrderId} is already linked to job ${existingReworkOrder.linkedJobId}.`
    );
  }

  const updatedJob = await tx.job.updateMany({
    where: {
      id: job.id,
      status: {
        notIn: ["SHIPPED", "CLOSED"]
      }
    },
    data: {
      status: "REWORK",
      reworkOrder: targetReworkOrderId,
      currentStep: "Rework approved",
      blockedStep: undefined,
      risk: "HIGH"
    }
  });

  if (updatedJob.count === 0) {
    const currentJob = await tx.job.findUnique({
      where: { id: job.id }
    });

    if (!currentJob) {
      throw createNotFoundError(`Job ${input.jobId} was not found.`);
    }

    if (isFinalJobStatus(currentJob.status)) {
      throw createConflictError(`Job ${input.jobId} is already finalized and cannot be moved to rework.`);
    }

    if (currentJob.status === "REWORK" && currentJob.reworkOrder === targetReworkOrderId) {
      return {
        data: buildQualityApprovedResult(currentJob.id, targetReworkOrderId, qualityEvent.id)
      };
    }

    throw createConflictError(`Job ${input.jobId} could not be updated because it changed during the transaction.`);
  }

  await tx.qualityEvent.update({
    where: { id: qualityEvent.id },
    data: {
      eventType: "SCRAP_APPROVED",
      severity: "APPROVAL",
      reworkOrderId: targetReworkOrderId,
      metadata: {
        approvedBy: context.actor,
        approvedRole: context.role,
        approvalTimestamp: context.now.toISOString(),
        linkedReworkOrderId: targetReworkOrderId
      }
    }
  });

  await tx.reworkOrder.upsert({
    where: { id: targetReworkOrderId },
    create: {
      id: targetReworkOrderId,
      linkedJobId: job.id,
      reason: "Weld Porosity",
      workCenter: "Welding",
      estimatedHours: 6,
      priority: "HIGH",
      status: "OPEN",
      supervisor: context.actor,
      nextStep: "Weld Rework"
    },
    update: {
      linkedJobId: job.id,
      reason: "Weld Porosity",
      workCenter: "Welding",
      estimatedHours: 6,
      priority: toPriority(existingReworkOrder?.priority),
      status: toStatus(existingReworkOrder?.status),
      supervisor: context.actor,
      nextStep: "Weld Rework"
    }
  });

  return {
    data: buildQualityApprovedResult(job.id, targetReworkOrderId, qualityEvent.id),
    auditEvents: [
      prepareAuditEventInput({
        actor: context.actor,
        role: context.role,
        action: "Approved scrap above tolerance",
        entityType: "QUALITY",
        entityId: qualityEvent.id ?? job.id,
        result: "Scrap approved for rework",
        notes: "Approved scrap rate above tolerance and released rework path",
        severity: "APPROVAL",
        metadata: {
          jobId: job.id,
          qualityEventId: qualityEvent.id,
          reworkOrderId: targetReworkOrderId,
          scrapRate: qualityEvent.scrapRate,
          allowedTolerance: qualityEvent.allowedTolerance
        },
        timestamp: context.now.toISOString()
      }),
      prepareAuditEventInput({
        actor: "System",
        role: "Automation",
        action: "Created rework order",
        entityType: "REWORK_ORDER",
        entityId: targetReworkOrderId,
        result: `Rework order linked to ${job.id}`,
        notes: "Rework created after supervisor scrap approval",
        severity: "AUTOMATION",
        metadata: {
          jobId: job.id,
          qualityEventId: qualityEvent.id,
          reworkOrderId: targetReworkOrderId
        },
        timestamp: context.now.toISOString()
      })
    ]
  };
}

export async function approveScrapAndCreateReworkCommand(
  input: ApproveScrapAndCreateReworkCommandInput,
  context: CommandContext
): Promise<CommandResult<QualityCommandResult>> {
  return runWorkflowCommand({
    commandType: "APPROVE_SCRAP_AND_CREATE_REWORK",
    entityType: "JOB",
    entityId: input.jobId,
    context,
    execute: (tx) => approveScrapAndCreateReworkInTransaction(tx, input, context)
  });
}
