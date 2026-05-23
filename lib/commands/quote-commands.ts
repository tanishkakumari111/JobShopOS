import "server-only";

import type { Prisma, QuoteStatus } from "@prisma/client";

import { createAuthorizationError, createConflictError, createNotFoundError } from "./errors";
import { prepareAuditEventInput } from "./audit";
import { runWorkflowCommand, type WorkflowCommandExecutionResult } from "./transaction";
import type { CommandContext, CommandResult } from "./types";

export type ApproveQuoteCommandInput = {
  quoteId: string;
};

export type ConvertQuoteToJobCommandInput = {
  quoteId: string;
};

type QuoteCommandResult = {
  quoteId: string;
  quoteStatus: "Approved";
};

type PrismaTransaction = Prisma.TransactionClient;

type ApprovableQuoteStatus = Extract<QuoteStatus, "DRAFT" | "SUBMITTED" | "NEEDS_OWNER_APPROVAL">;

function isApprovableQuoteStatus(status: QuoteStatus): status is ApprovableQuoteStatus {
  return status === "DRAFT" || status === "SUBMITTED" || status === "NEEDS_OWNER_APPROVAL";
}

function isOwnerGM(role: string) {
  return role === "Owner / GM";
}

function isOperator(role: string) {
  return role === "Operator";
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
  throw new Error(`convertQuoteToJobCommand is not implemented yet for ${input.quoteId} (${context.idempotencyKey}).`);
}
