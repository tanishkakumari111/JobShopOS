import { CommandErrorCode, CommandErrorPayload } from "./types";

export class CommandError extends Error {
  readonly code: CommandErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(code: CommandErrorCode, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "CommandError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function createCommandError(code: CommandErrorCode, message: string, statusCode: number, details?: unknown) {
  return new CommandError(code, message, statusCode, details);
}

export function createValidationError(message: string, details?: unknown) {
  return createCommandError("VALIDATION_ERROR", message, 400, details);
}

export function createAuthorizationError(message = "You are not authorized to perform this action.", details?: unknown) {
  return createCommandError("AUTHORIZATION_ERROR", message, 403, details);
}

export function createNotFoundError(message = "The requested record was not found.", details?: unknown) {
  return createCommandError("NOT_FOUND", message, 404, details);
}

export function createConflictError(message = "The command could not be completed because the record changed.", details?: unknown) {
  return createCommandError("CONFLICT", message, 409, details);
}

export function createIdempotencyReplayError(message = "This command was already processed.", details?: unknown) {
  return createCommandError("IDEMPOTENCY_REPLAY", message, 409, details);
}

export function createUnexpectedError(message = "An unexpected command error occurred.", details?: unknown) {
  return createCommandError("UNEXPECTED_ERROR", message, 500, details);
}

export function isCommandError(error: unknown): error is CommandError {
  return error instanceof CommandError;
}

export function toCommandErrorPayload(error: unknown): CommandErrorPayload {
  if (isCommandError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNEXPECTED_ERROR",
      message: error.message,
      details: undefined
    };
  }

  return {
    code: "UNEXPECTED_ERROR",
    message: "An unexpected command error occurred.",
    details: error
  };
}

