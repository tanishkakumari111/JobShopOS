import type { Prisma } from "@prisma/client";

import { getDataSourceMode, isDatabaseMode } from "@/lib/data-source";
import { getPrismaClient } from "@/lib/db/prisma";

import { createValidationError, toCommandErrorPayload } from "./errors";
import { prepareAuditEventInput, writeAuditEvents } from "./audit";
import {
  getWorkflowCommandReplay,
  recordWorkflowCommandFailure,
  recordWorkflowCommandStart,
  recordWorkflowCommandSuccess
} from "./idempotency";
import type { CommandContext, CommandResult } from "./types";

type PrismaTransaction = Prisma.TransactionClient;

export type WorkflowCommandExecutionResult<T> = {
  data: T;
  auditEvents?: Parameters<typeof prepareAuditEventInput>[0][];
};

export type RunWorkflowCommandOptions<T> = {
  commandType: string;
  entityType: string;
  entityId: string;
  context: CommandContext;
  execute: (tx: PrismaTransaction) => Promise<WorkflowCommandExecutionResult<T>>;
};

function buildCommandResult<T>(
  status: CommandResult<T>["status"],
  idempotencyKey: string,
  commandId: string,
  data?: T,
  error?: CommandResult<T>["error"],
  replayed = false
): CommandResult<T> {
  return {
    status,
    data,
    error,
    commandId,
    idempotencyKey,
    replayed: replayed || undefined
  };
}

export async function runWorkflowCommand<T>({
  commandType,
  entityType,
  entityId,
  context,
  execute
}: RunWorkflowCommandOptions<T>): Promise<CommandResult<T>> {
  if (!isDatabaseMode()) {
    throw createValidationError(
      "Workflow commands require JOBSHOP_DATA_SOURCE=database and DATABASE_URL to be configured.",
      { dataSourceMode: getDataSourceMode() }
    );
  }

  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    const replay = await getWorkflowCommandReplay<T>(tx, context.idempotencyKey);
    if (replay) {
      return replay;
    }

    const command = await recordWorkflowCommandStart(tx, context, commandType, entityType, entityId);

    try {
      const execution = await execute(tx);
      const auditInputs = (execution.auditEvents ?? []).map((event) =>
        prepareAuditEventInput({
          ...event,
          timestamp: event.timestamp ?? context.now.toISOString()
        })
      );

      if (auditInputs.length > 0) {
        await writeAuditEvents(tx, auditInputs);
      }

      const successResult = buildCommandResult<T>(
        "succeeded",
        context.idempotencyKey,
        command.id,
        execution.data
      );

      await recordWorkflowCommandSuccess(tx, command.id, successResult);
      return successResult;
    } catch (error) {
      const failureResult = buildCommandResult<T>(
        "failed",
        context.idempotencyKey,
        command.id,
        undefined,
        toCommandErrorPayload(error)
      );

      await recordWorkflowCommandFailure(tx, command.id, failureResult.error);
      return failureResult;
    }
  });
}
