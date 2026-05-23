import type { AuditEvent, CustomerStatusReport, Job, PurchaseRequest, Quote, ReworkOrder } from "@/lib/demo-data";
import type { DemoWorkflowState } from "./types";

const CUSTOMER_REPORT_KEY = "J-2035-CUSTOMER-STATUS";

export function getEffectiveQuote(seedQuote: Quote, state: DemoWorkflowState): Quote {
  const override = state.quoteStatuses[seedQuote.id as "Q-1003"];
  if (!override) {
    return seedQuote;
  }

  return {
    ...seedQuote,
    status: override
  };
}

export function getEffectiveJob(seedJob: Job, state: DemoWorkflowState): Job {
  const jobOverride = state.jobs[seedJob.id as keyof DemoWorkflowState["jobs"]];
  if (!jobOverride) {
    return seedJob;
  }

  const nextJob: Job = {
    ...seedJob
  };

  if (seedJob.id === "J-2042" && "status" in jobOverride && jobOverride.status) {
    nextJob.status = jobOverride.status;
  }

  if (seedJob.id === "J-2042" && "reworkOrderId" in jobOverride && jobOverride.reworkOrderId) {
    nextJob.reworkOrder = jobOverride.reworkOrderId;
  }

  if (seedJob.id === "J-2099" && "status" in jobOverride && jobOverride.status) {
    nextJob.status = jobOverride.status;
  }

  if (seedJob.id === "J-2099" && "purchaseRequestId" in jobOverride && jobOverride.purchaseRequestId) {
    nextJob.purchaseRequestId = jobOverride.purchaseRequestId;
  }

  if (seedJob.id === "J-2104" && "sourceQuoteId" in jobOverride && jobOverride.sourceQuoteId) {
    nextJob.sourceQuoteId = jobOverride.sourceQuoteId;
  }

  if (seedJob.id === "J-2104" && "workOrderId" in jobOverride && jobOverride.workOrderId) {
    nextJob.workOrder = jobOverride.workOrderId;
  }

  if (seedJob.id === "J-2035" && "reportGenerated" in jobOverride && jobOverride.reportGenerated) {
    nextJob.reportGenerated = jobOverride.reportGenerated;
  }

  return nextJob;
}

export function getEffectivePurchaseRequest(
  seedPurchaseRequest: PurchaseRequest,
  state: DemoWorkflowState
): PurchaseRequest {
  const override = state.purchaseRequests[seedPurchaseRequest.id as "PR-3091"];
  if (!override) {
    return seedPurchaseRequest;
  }

  return {
    ...seedPurchaseRequest,
    ...(override.exists ? { status: "Submitted" } : {})
  };
}

export function getEffectiveReworkOrder(seedReworkOrder: ReworkOrder, state: DemoWorkflowState): ReworkOrder {
  const override = state.reworkOrders[seedReworkOrder.id as "RW-2042-01"];
  if (!override) {
    return seedReworkOrder;
  }

  return {
    ...seedReworkOrder,
    ...(override.exists ? { status: "Open" } : {})
  };
}

export function getEffectiveCustomerReport(
  seedReport: CustomerStatusReport,
  state: DemoWorkflowState
): CustomerStatusReport {
  const override = state.reports[CUSTOMER_REPORT_KEY];
  if (!override) {
    return seedReport;
  }

  return {
    ...seedReport,
    preparedTimestamp: override.generatedAt ?? seedReport.preparedTimestamp
  };
}

export function getEffectiveAuditEvents(seedEvents: AuditEvent[], state: DemoWorkflowState): AuditEvent[] {
  const merged = [...seedEvents, ...state.auditEvents];
  const deduped = new Map<number, AuditEvent>();

  for (const event of merged) {
    deduped.set(event.id, event);
  }

  return Array.from(deduped.values()).sort((a, b) => a.id - b.id);
}

export function isDemoStateDirty(state: DemoWorkflowState) {
  return (
    Object.keys(state.quoteStatuses).length > 0 ||
    Object.keys(state.jobs).length > 0 ||
    Object.keys(state.reworkOrders).length > 0 ||
    Object.keys(state.purchaseRequests).length > 0 ||
    Object.keys(state.reports).length > 0 ||
    state.auditEvents.length > 0
  );
}
