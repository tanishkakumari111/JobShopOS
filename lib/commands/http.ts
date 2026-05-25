import type { CommandErrorCode, CommandResult } from "./types";

export function getRequestIdempotencyKey(request: Request, fallbackKey: string) {
  const headerKey = request.headers.get("Idempotency-Key")?.trim();
  return headerKey && headerKey.length > 0 ? headerKey : fallbackKey;
}

export function commandResultToHttpStatus<T>(result: CommandResult<T>) {
  if (result.status === "succeeded") {
    return 200;
  }

  switch (result.error?.code as CommandErrorCode | undefined) {
    case "VALIDATION_ERROR":
      return 400;
    case "AUTHORIZATION_ERROR":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
    case "IDEMPOTENCY_REPLAY":
      return 409;
    default:
      return 500;
  }
}

export function createDemoModeCommandResponse() {
  return {
    status: "demo-mode" as const,
    message: "Demo mode uses the browser-local localStorage workflow actions."
  };
}
