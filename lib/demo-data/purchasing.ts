import type { PurchaseRequest, PurchaseRequestAuditEntry, PurchaseRequestState } from "./types";

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "PR-3091",
    materialSku: "AL-6061-PLT-0.375",
    linkedJobId: "J-2099",
    supplier: "Midwest Metals Supply",
    quantity: 50,
    unitCost: 185,
    estimatedTotal: 9250,
    buyer: "Priya Mehta",
    status: "Submitted",
    priority: "High"
  }
];

export const purchaseRequestState: PurchaseRequestState = {
  before: {
    materialStatus: "Shortage",
    jobStatus: "Waiting on Material",
    actionNeeded: "Create purchase request"
  },
  after: {
    materialStatus: "Purchase Requested",
    jobStatus: "Waiting on Material",
    nextStep: "Awaiting supplier confirmation"
  }
};

export const pr3091AuditTrail: PurchaseRequestAuditEntry[] = [
  {
    timestamp: "Today 11:12 AM",
    actor: "Priya Mehta",
    role: "Purchasing",
    action: "Created purchase request",
    entityType: "PurchaseRequest",
    entityId: "PR-3091",
    result: "Submitted to supplier workflow",
    notes: "50 sheets requested from Midwest Metals Supply for Job J-2099.",
    severity: "Approval"
  },
  {
    timestamp: "Today 11:13 AM",
    actor: "System",
    role: "Automation",
    action: "Updated job material status",
    entityType: "Job",
    entityId: "J-2099",
    result: "Status remains Waiting on Material, purchase request linked",
    notes: "Awaiting supplier confirmation.",
    severity: "Automation"
  }
];
