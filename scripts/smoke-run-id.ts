export function getSmokeRunId() {
  return process.env.SMOKE_RUN_ID?.trim() || process.env.GITHUB_RUN_ID?.trim() || Date.now().toString();
}

export function getQuoteSmokeKeys(runId = getSmokeRunId()) {
  return {
    approval: `smoke-${runId}-quote-approval-v1`,
    conversion: `smoke-${runId}-quote-conversion-v1`
  };
}

export function getQualitySmokeKeys(runId = getSmokeRunId()) {
  return {
    approval: `smoke-${runId}-quality-J-2042-approve-scrap-v1`
  };
}

export function getMaterialsSmokeKeys(runId = getSmokeRunId()) {
  return {
    command: `smoke-${runId}-materials-J-2099-create-purchase-request-v1`,
    route: `smoke-${runId}-route-materials-J-2099-create-purchase-request-v1`
  };
}

export function getReportSmokeKeys(runId = getSmokeRunId()) {
  return {
    command: `smoke-${runId}-report-J-2035-generate-customer-status-v1`,
    route: `smoke-${runId}-route-report-J-2035-generate-customer-status-v1`
  };
}
