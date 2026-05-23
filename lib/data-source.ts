export type DataSourceMode = "demo" | "database";

function normalizeMode(value: string | undefined): DataSourceMode {
  if (!value || value.trim().length === 0) {
    return "demo";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "demo" || normalized === "database") {
    return normalized;
  }

  throw new Error(
    `Invalid JOBSHOP_DATA_SOURCE value "${value}". Expected "demo" or "database".`
  );
}

export function getDataSourceMode(): DataSourceMode {
  const mode = normalizeMode(process.env.JOBSHOP_DATA_SOURCE);

  if (mode === "database" && !process.env.DATABASE_URL) {
    throw new Error(
      "JOBSHOP_DATA_SOURCE=database requires DATABASE_URL to be set."
    );
  }

  return mode;
}

export function isDatabaseMode() {
  return getDataSourceMode() === "database";
}

export function isDemoMode() {
  return getDataSourceMode() === "demo";
}
