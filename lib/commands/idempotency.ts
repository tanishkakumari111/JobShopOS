import type { Prisma, WorkflowCommandStatus as PrismaWorkflowCommandStatus } from "@prisma/client";

import { createConflictError } from "./errors";
import type { CommandContext, CommandResult, CommandStatus } from "./types";

type PrismaTransaction = Prisma.TransactionClient;

type WorkflowCommandRecord = Awaited<ReturnType<PrismaTransaction["workflowCommand"]["findUnique"]>>;

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mapWorkflowCommandStatus(status: PrismaWorkflowCommandStatus): CommandStatus {
  switch (status) {
    case "PENDING":
      return "pending";
    case "SUCCEEDED":
      return "succeeded";
    case "FAILED":
      return "failed";
  }
}

function buildCommandResult<T>(
  record: NonNullable<WorkflowCommandRecord>,
  replayed = false
): CommandResult<T> | null {
  const payload = record.result;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const result = payload as Partial<CommandResult<T>>;

  return {
    status: result.status ?? mapWorkflowCommandStatus(record.status),
    data: result.data,
    error: result.error,
    commandId: record.id,
    idempotencyKey: record.idempotencyKey,
    replayed
  };
}

export async function findWorkflowCommandByIdempotencyKey(tx: PrismaTransaction, idempotencyKey: string) {
  return tx.workflowCommand.findUnique({
    where: { idempotencyKey }
  });
}

export async function getWorkflowCommandReplay<T>(tx: PrismaTransaction, idempotencyKey: string): Promise<CommandResult<T> | null> {
  const existing = await findWorkflowCommandByIdempotencyKey(tx, idempotencyKey);

  if (!existing) {
    return null;
  }

  if (existing.status === "PENDING") {
    throw createConflictError("This command is already in progress.", {
      idempotencyKey
    });
  }

  return buildCommandResult<T>(existing, true);
}

export async function recordWorkflowCommandStart(
  tx: PrismaTransaction,
  context: CommandContext,
  commandType: string,
  entityType: string,
  entityId: string
) {
  return tx.workflowCommand.create({
    data: {
      commandType,
      idempotencyKey: context.idempotencyKey,
      actor: context.actor,
      role: context.role,
      entityType,
      entityId,
      status: "PENDING"
    }
  });
}

export async function recordWorkflowCommandSuccess<T>(
  tx: PrismaTransaction,
  commandId: string,
  result: CommandResult<T>
) {
  return tx.workflowCommand.update({
    where: { id: commandId },
    data: {
      status: "SUCCEEDED",
      result: toJsonValue(result)
    }
  });
}

export async function recordWorkflowCommandFailure(
  tx: PrismaTransaction,
  commandId: string,
  error: CommandResult<unknown>["error"]
) {
  return tx.workflowCommand.update({
    where: { id: commandId },
    data: {
      status: "FAILED",
      result: toJsonValue({
        status: "failed",
        error
      })
    }
  });
}
