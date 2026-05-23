import type { DataSourceMode } from "@/lib/data-source";

export type CommandStatus = "pending" | "succeeded" | "failed";

export type IdempotencyKey = string;

export type CommandErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "IDEMPOTENCY_REPLAY"
  | "UNEXPECTED_ERROR";

export type CommandErrorPayload = {
  code: CommandErrorCode;
  message: string;
  details?: unknown;
};

export type CommandResult<T> = {
  status: CommandStatus;
  data?: T;
  error?: CommandErrorPayload;
  commandId?: string;
  idempotencyKey: IdempotencyKey;
  replayed?: boolean;
};

export type CommandContext = {
  actor: string;
  role: string;
  idempotencyKey: IdempotencyKey;
  now: Date;
  dataSourceMode?: DataSourceMode;
};

