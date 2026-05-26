import type { PrismaTransaction } from "@/lib/db/prisma-transaction";
import { createAuthorizationError, createConflictError, createNotFoundError, createValidationError } from "./errors";
import { prepareAuditEventInput } from "./audit";
import { runWorkflowCommand, type WorkflowCommandExecutionResult } from "./transaction";
import type { CommandContext, CommandResult } from "./types";

export type CreatePurchaseRequestCommandInput = {
  jobId: string;
  materialSku: string;
  purchaseRequestId?: string;
  quantity?: number;
};

type PurchaseRequestCommandResult = {
  jobId: string;
  jobStatus: "Purchase Requested";
  materialSku: string;
  purchaseRequestId: string;
  quantity: number;
};

type JobStatus = "APPROVED" | "WAITING_ON_MATERIAL" | "PURCHASE_REQUESTED" | "MATERIALS_RESERVED" | "IN_PRODUCTION" | "IN_QUALITY" | "REWORK" | "READY_TO_SHIP" | "SHIPPED" | "CLOSED" | "SCRAP_APPROVAL_REQUIRED";
type PurchaseRequestPriority = "LOW" | "MEDIUM" | "HIGH";

function isBuyer(role: string) {
  return role === "Buyer";
}

function isScheduler(role: string) {
  return role === "Scheduler";
}

function isOwnerGM(role: string) {
  return role === "Owner / GM";
}

function canCreatePurchaseRequest(role: string) {
  return isBuyer(role) || isScheduler(role) || isOwnerGM(role);
}

function isFinalJobStatus(status: JobStatus) {
  return status === "SHIPPED" || status === "CLOSED";
}

function buildMaterialCommandResult(
  jobId: string,
  materialSku: string,
  purchaseRequestId: string,
  quantity: number
): PurchaseRequestCommandResult {
  return {
    jobId,
    jobStatus: "Purchase Requested",
    materialSku,
    purchaseRequestId,
    quantity
  };
}

function resolveQuantity(inputQuantity: number | undefined, existingQuantity: number | null | undefined) {
  if (inputQuantity !== undefined) {
    return inputQuantity;
  }

  if (typeof existingQuantity === "number" && Number.isFinite(existingQuantity) && existingQuantity > 0) {
    return existingQuantity;
  }

  return 50;
}

function resolveUnitCost(existingUnitCost: number | null | undefined, fallbackUnitCost: number | null | undefined) {
  if (typeof existingUnitCost === "number" && Number.isFinite(existingUnitCost) && existingUnitCost > 0) {
    return existingUnitCost;
  }

  if (typeof fallbackUnitCost === "number" && Number.isFinite(fallbackUnitCost) && fallbackUnitCost > 0) {
    return fallbackUnitCost;
  }

  return 185;
}

async function createPurchaseRequestInTransaction(
  tx: PrismaTransaction,
  input: CreatePurchaseRequestCommandInput,
  context: CommandContext
): Promise<WorkflowCommandExecutionResult<PurchaseRequestCommandResult>> {
  if (!canCreatePurchaseRequest(context.role)) {
    if (context.role === "Operator") {
      throw createAuthorizationError("Operators cannot create purchase requests.");
    }

    if (context.role === "Estimator") {
      throw createAuthorizationError("Estimators cannot create purchase requests.");
    }

    throw createAuthorizationError("Buyer, Scheduler, or Owner / GM approval is required to create purchase requests.");
  }

  if (input.quantity !== undefined && input.quantity <= 0) {
    throw createValidationError("Purchase request quantity must be greater than zero.");
  }

  const job = await tx.job.findUnique({
    where: { id: input.jobId },
    include: {
      materialRequirements: {
        where: {
          sku: input.materialSku
        },
        take: 1
      }
    }
  });

  if (!job) {
    throw createNotFoundError(`Job ${input.jobId} was not found.`);
  }

  if (isFinalJobStatus(job.status)) {
    throw createConflictError(`Job ${input.jobId} is already finalized and cannot create a purchase request.`);
  }

  const material = await tx.material.findUnique({
    where: {
      sku: input.materialSku
    }
  });

  if (!material) {
    throw createNotFoundError(`Material ${input.materialSku} was not found.`);
  }

  const jobRequirement = job.materialRequirements[0];
  const hasRequiredMaterialLink =
    job.requiredMaterial === material.sku || material.requiredForJobId === job.id || Boolean(jobRequirement);

  if (!hasRequiredMaterialLink) {
    throw createConflictError(`Job ${job.id} does not have a shortage or requirement for material ${material.sku}.`);
  }

  const existingLinkedRequest = await tx.purchaseRequest.findFirst({
    where: {
      linkedJobId: job.id,
      materialSku: material.sku
    },
    orderBy: {
      id: "asc"
    }
  });

  if (job.purchaseRequestId && existingLinkedRequest && job.purchaseRequestId !== existingLinkedRequest.id) {
    throw createConflictError(
      `Job ${job.id} already has purchase request ${job.purchaseRequestId} linked and cannot be reassigned to ${existingLinkedRequest.id}.`
    );
  }

  const targetPurchaseRequestId =
    input.purchaseRequestId ?? job.purchaseRequestId ?? existingLinkedRequest?.id ?? "PR-3091";

  if (existingLinkedRequest && existingLinkedRequest.id !== targetPurchaseRequestId) {
    throw createConflictError(
      `Job ${job.id} and material ${material.sku} are already linked to purchase request ${existingLinkedRequest.id}.`
    );
  }

  const existingPurchaseRequest = await tx.purchaseRequest.findUnique({
    where: {
      id: targetPurchaseRequestId
    }
  });

  if (
    existingPurchaseRequest &&
    (existingPurchaseRequest.linkedJobId !== job.id || existingPurchaseRequest.materialSku !== material.sku)
  ) {
    throw createConflictError(
      `Purchase request ${targetPurchaseRequestId} is already linked to job ${existingPurchaseRequest.linkedJobId} and material ${existingPurchaseRequest.materialSku}.`
    );
  }

  if (job.status === "PURCHASE_REQUESTED" && job.purchaseRequestId === targetPurchaseRequestId) {
    return {
      data: buildMaterialCommandResult(
        job.id,
        material.sku,
        targetPurchaseRequestId,
        existingPurchaseRequest?.quantity ?? resolveQuantity(input.quantity, existingLinkedRequest?.quantity)
      )
    };
  }

  const purchaseRequestQuantity = resolveQuantity(input.quantity, existingPurchaseRequest?.quantity ?? existingLinkedRequest?.quantity);
  const unitCost = resolveUnitCost(existingPurchaseRequest?.unitCost ?? existingLinkedRequest?.unitCost, material.lastPurchasePrice);
  const estimatedTotal = purchaseRequestQuantity * unitCost;
  const purchaseRequestPriority: PurchaseRequestPriority =
    existingPurchaseRequest?.priority ?? existingLinkedRequest?.priority ?? "HIGH";
  const buyer = existingPurchaseRequest?.buyer ?? existingLinkedRequest?.buyer ?? "Priya Mehta";

  const updatedJob = await tx.job.updateMany({
    where: {
      id: job.id,
      status: {
        notIn: ["SHIPPED", "CLOSED"]
      }
    },
    data: {
      status: "PURCHASE_REQUESTED",
      purchaseRequestId: targetPurchaseRequestId,
      currentStep: job.currentStep ?? "Waiting on Material",
      blockedStep: job.blockedStep ?? "CNC Mill",
      requiredMaterial: material.sku,
      shortageSheets: job.shortageSheets ?? material.shortage ?? undefined,
      risk: "HIGH"
    }
  });

  if (updatedJob.count === 0) {
    const currentJob = await tx.job.findUnique({
      where: {
        id: job.id
      }
    });

    if (!currentJob) {
      throw createNotFoundError(`Job ${input.jobId} was not found.`);
    }

    if (isFinalJobStatus(currentJob.status)) {
      throw createConflictError(`Job ${input.jobId} is already finalized and cannot create a purchase request.`);
    }

    if (currentJob.status === "PURCHASE_REQUESTED" && currentJob.purchaseRequestId === targetPurchaseRequestId) {
      return {
        data: buildMaterialCommandResult(
          currentJob.id,
          material.sku,
          targetPurchaseRequestId,
          purchaseRequestQuantity
        )
      };
    }

    throw createConflictError(`Job ${input.jobId} could not be updated because it changed during the transaction.`);
  }

  await tx.purchaseRequest.upsert({
    where: {
      id: targetPurchaseRequestId
    },
    create: {
      id: targetPurchaseRequestId,
      materialSku: material.sku,
      linkedJobId: job.id,
      supplier: material.supplier,
      quantity: purchaseRequestQuantity,
      unitCost,
      estimatedTotal,
      buyer,
      status: "SUBMITTED",
      priority: purchaseRequestPriority
    },
    update: {
      materialSku: material.sku,
      linkedJobId: job.id,
      supplier: material.supplier,
      quantity: purchaseRequestQuantity,
      unitCost,
      estimatedTotal,
      buyer,
      status: "SUBMITTED",
      priority: purchaseRequestPriority
    }
  });

  return {
    data: buildMaterialCommandResult(job.id, material.sku, targetPurchaseRequestId, purchaseRequestQuantity),
    auditEvents: [
      prepareAuditEventInput({
        actor: context.actor,
        role: context.role,
        action: "Created purchase request",
        entityType: "PURCHASE_REQUEST",
        entityId: targetPurchaseRequestId,
        result: `Purchase request linked to ${job.id}`,
        notes: `Created purchase request for ${material.sku} shortage`,
        severity: "APPROVAL",
        metadata: {
          jobId: job.id,
          materialSku: material.sku,
          purchaseRequestId: targetPurchaseRequestId,
          quantity: purchaseRequestQuantity,
          unitCost,
          estimatedTotal
        },
        timestamp: context.now.toISOString()
      }),
      prepareAuditEventInput({
        actor: "System",
        role: "Automation",
        action: "Updated job material status",
        entityType: "JOB",
        entityId: job.id,
        result: "Job marked Purchase Requested",
        notes: "Material shortage now has an active purchase request",
        severity: "AUTOMATION",
        metadata: {
          jobId: job.id,
          materialSku: material.sku,
          purchaseRequestId: targetPurchaseRequestId,
          status: "PURCHASE_REQUESTED"
        },
        timestamp: context.now.toISOString()
      })
    ]
  };
}

export async function createPurchaseRequestCommand(
  input: CreatePurchaseRequestCommandInput,
  context: CommandContext
): Promise<CommandResult<PurchaseRequestCommandResult>> {
  return runWorkflowCommand({
    commandType: "CREATE_PURCHASE_REQUEST",
    entityType: "PURCHASE_REQUEST",
    entityId: input.purchaseRequestId ?? "PR-3091",
    context,
    execute: (tx) => createPurchaseRequestInTransaction(tx, input, context)
  });
}
