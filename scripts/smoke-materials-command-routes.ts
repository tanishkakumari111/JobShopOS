import { getDataSourceMode } from "@/lib/data-source";
import { getMaterialsSmokeKeys, getSmokeActorHeaders } from "./smoke-run-id";

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
  assert(mode === "database", "JOBSHOP_DATA_SOURCE=database is required for the materials command route smoke test.");
  assert(Boolean(process.env.DATABASE_URL?.trim()), "DATABASE_URL is required for the materials command route smoke test.");

  const { route: idempotencyKey } = getMaterialsSmokeKeys();

  console.log(`Running materials command route smoke test against ${getBaseUrl()}...`);

  const first = await postCommand("/api/commands/materials/j-2099/create-purchase-request", idempotencyKey, "Priya Mehta", "Buyer");
  assertSucceeded("createPurchaseRequestCommand route", first.response, first.payload);

  const replay = await postCommand("/api/commands/materials/j-2099/create-purchase-request", idempotencyKey, "Priya Mehta", "Buyer");
  assertSucceeded("createPurchaseRequestCommand replay", replay.response, replay.payload);

  assert(
    replay.payload.replayed === true || replay.payload.commandId === first.payload.commandId,
    "Expected materials route replay behavior to be observable through replayed=true or a stable commandId."
  );

  console.log("Route smoke test passed:");
  console.log("- POST /api/commands/materials/j-2099/create-purchase-request succeeded");
  console.log("- Replay/idempotency behaved as expected");
}

main().catch((error) => {
  console.error("Route smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
