import { getDataSourceMode } from "@/lib/data-source";
import { getQuoteSmokeKeys, getSmokeActorHeaders } from "./smoke-run-id";

type CommandResponse = {
  status?: string;
  commandId?: string;
  idempotencyKey?: string;
  replayed?: boolean;
  error?: {
    message?: string;
  };
  message?: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getBaseUrl() {
  return (process.env.APP_BASE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");
}

async function postCommand(path: string, idempotencyKey: string, actor: string, role: string) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      ...getSmokeActorHeaders(actor, role)
    }
  });

  const payload = (await response.json()) as CommandResponse;
  return { response, payload };
}

function assertSucceeded(responseLabel: string, response: Response, payload: CommandResponse) {
  assert(response.ok, `${responseLabel} failed with HTTP ${response.status}`);
  assert(payload.status === "succeeded", `${responseLabel} did not return a succeeded command result.`);
}

async function main() {
  const mode = getDataSourceMode();
  assert(mode === "database", "JOBSHOP_DATA_SOURCE=database is required for the quote command route smoke test.");
  assert(Boolean(process.env.DATABASE_URL?.trim()), "DATABASE_URL is required for the quote command route smoke test.");

  const { approval: approvalKey, conversion: convertKey } = getQuoteSmokeKeys();

  console.log(`Running quote command route smoke test against ${getBaseUrl()}...`);

  const approveFirst = await postCommand("/api/commands/quotes/q-1003/approve", approvalKey, "Owner / GM", "Owner / GM");
  assertSucceeded("approveQuoteCommand route", approveFirst.response, approveFirst.payload);

  const convertFirst = await postCommand("/api/commands/quotes/q-1003/convert", convertKey, "Scheduler", "Scheduler");
  assertSucceeded("convertQuoteToJobCommand route", convertFirst.response, convertFirst.payload);

  const approveReplay = await postCommand("/api/commands/quotes/q-1003/approve", approvalKey, "Owner / GM", "Owner / GM");
  assertSucceeded("approveQuoteCommand replay", approveReplay.response, approveReplay.payload);

  const convertReplay = await postCommand("/api/commands/quotes/q-1003/convert", convertKey, "Scheduler", "Scheduler");
  assertSucceeded("convertQuoteToJobCommand replay", convertReplay.response, convertReplay.payload);

  assert(
    approveReplay.payload.replayed === true || approveReplay.payload.commandId === approveFirst.payload.commandId,
    "Expected approval replay behavior to be observable through replayed=true or a stable commandId."
  );
  assert(
    convertReplay.payload.replayed === true || convertReplay.payload.commandId === convertFirst.payload.commandId,
    "Expected conversion replay behavior to be observable through replayed=true or a stable commandId."
  );

  console.log("Route smoke test passed:");
  console.log("- POST /api/commands/quotes/q-1003/approve succeeded");
  console.log("- POST /api/commands/quotes/q-1003/convert succeeded");
  console.log("- Replay/idempotency behaved as expected");
}

main().catch((error) => {
  console.error("Route smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
