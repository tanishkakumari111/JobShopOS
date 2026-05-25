import { getDataSourceMode } from "@/lib/data-source";

type CommandResponse = {
  status?: string;
  message?: string;
  error?: {
    message?: string;
  };
};

type RouteCase = {
  label: string;
  path: string;
};

const ROUTES: RouteCase[] = [
  { label: "quote approval", path: "/api/commands/quotes/q-1003/approve" },
  { label: "quote conversion", path: "/api/commands/quotes/q-1003/convert" },
  { label: "quality scrap approval", path: "/api/commands/quality/j-2042/approve-scrap" },
  { label: "materials purchase request", path: "/api/commands/materials/j-2099/create-purchase-request" },
  { label: "customer report generation", path: "/api/commands/reports/customer-status/j-2035/generate" }
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getBaseUrl() {
  return (process.env.APP_BASE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");
}

async function postWithoutActor(path: string) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });

  let payload: CommandResponse | null = null;
  try {
    payload = (await response.json()) as CommandResponse;
  } catch {
    payload = null;
  }

  return { response, payload };
}

async function main() {
  const mode = getDataSourceMode();
  assert(mode === "database", "JOBSHOP_DATA_SOURCE=database is required for the command auth fail-closed smoke test.");
  assert(Boolean(process.env.DATABASE_URL?.trim()), "DATABASE_URL is required for the command auth fail-closed smoke test.");

  console.log(`Running fail-closed command route smoke test against ${getBaseUrl()}...`);

  const failures: string[] = [];

  for (const route of ROUTES) {
    const { response, payload } = await postWithoutActor(route.path);
    const expectedClosed = response.status === 401 || response.status === 403;

    if (!expectedClosed || response.ok) {
      failures.push(
        `${route.label} unexpectedly returned HTTP ${response.status}${payload?.status ? ` (${payload.status})` : ""}`
      );
      continue;
    }

    console.log(`- ${route.label} failed closed with HTTP ${response.status}`);
  }

  if (failures.length > 0) {
    console.error("Fail-closed smoke test failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Fail-closed smoke test passed:");
  for (const route of ROUTES) {
    console.log(`- ${route.label} returned 401/403 without actor headers`);
  }
}

main().catch((error) => {
  console.error("Fail-closed smoke test failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
