import type {
  AuditEvent,
  CapacitySummary,
  Customer,
  CustomerSafeJobStatus,
  DashboardRiskItem,
  Job,
  Material,
  PurchaseRequest,
  Quote,
  ReworkOrder,
  WorkCenter
} from "./types";

export function calculateMaterialAvailability(onHand: number, reserved: number) {
  return Math.max(onHand - reserved, 0);
}

export function calculateMaterialShortage(required: number, available: number) {
  return Math.max(required - available, 0);
}

export function calculateScrapRate(scrapQuantity: number, completedQuantity: number) {
  if (completedQuantity <= 0) {
    return 0;
  }
  return scrapQuantity / completedQuantity;
}

export function requiresOwnerApproval(amount: number, threshold = 50000) {
  return amount >= threshold;
}

export function getCustomerBySlug(slug: string, customers: Customer[]) {
  return customers.find((customer) => customer.slug === slug);
}

export function getCustomerByName(name: string, customers: Customer[]) {
  return customers.find(
    (customer) => customer.name.toLowerCase() === name.toLowerCase()
  );
}

export function getJobById(id: string, jobs: Job[]) {
  return jobs.find((job) => job.id === id);
}

export function getQuoteById(id: string, quotes: Quote[]) {
  return quotes.find((quote) => quote.id === id);
}

export function getMaterialBySku(sku: string, materials: Material[]) {
  return materials.find((material) => material.sku === sku);
}

export function getPurchaseRequestById(id: string, purchaseRequests: PurchaseRequest[]) {
  return purchaseRequests.find((request) => request.id === id);
}

export function getReworkOrderById(id: string, reworkOrders: ReworkOrder[]) {
  return reworkOrders.find((order) => order.id === id);
}

export function getAuditEventsByEntity(
  entityType: AuditEvent["entityType"],
  entityId: string,
  auditEvents: AuditEvent[]
) {
  return auditEvents.filter(
    (event) => event.entityType === entityType && event.entityId === entityId
  );
}

export function getDashboardRiskItems(jobs: Job[], quotes: Quote[], materials: Material[]) {
  const q1003 = quotes.find((quote) => quote.id === "Q-1003");
  const j2035 = jobs.find((job) => job.id === "J-2035");
  const j2042 = jobs.find((job) => job.id === "J-2042");
  const j2099 = jobs.find((job) => job.id === "J-2099");
  const al6061 = materials.find((material) => material.sku === "AL-6061-PLT-0.375");

  const items: DashboardRiskItem[] = [];

  if (j2035) {
    items.push({
      id: j2035.id,
      title: "Press Brake is constraining the queue",
      description: `${j2035.id} is moving through ${j2035.currentStep ?? "production"} at ${j2035.progress ?? 0}% completion.`,
      severity: "Critical",
      href: `/jobs/${j2035.id.toLowerCase()}`,
      entityLabel: j2035.id
    });
  }

  if (j2042) {
    items.push({
      id: j2042.id,
      title: "Scrap approval is required",
      description: `${j2042.id} is above tolerance and needs a disposition decision.`,
      severity: "Approval",
      href: `/quality/j-2042/scrap-approval`,
      entityLabel: j2042.id
    });
  }

  if (j2099 && al6061) {
    items.push({
      id: j2099.id,
      title: "Material shortage will delay release",
      description: `${al6061.sku} is short by ${al6061.shortage} sheets for ${j2099.id}.`,
      severity: "Warning",
      href: `/jobs/j-2099/material-impact`,
      entityLabel: j2099.id
    });
  }

  if (q1003) {
    items.push({
      id: q1003.id,
      title: "Quote approval pending",
      description: `${q1003.id} exceeds the owner approval threshold.`,
      severity: "Approval",
      href: `/quotes/q-1003`,
      entityLabel: q1003.id
    });
  }

  return items;
}

export function getCapacitySummary(workCenters: WorkCenter[]): CapacitySummary {
  const totalWorkCenters = workCenters.length;
  const availableWorkCenters = workCenters.filter(
    (workCenter) => workCenter.status === "Available"
  ).length;
  const nearCapacityWorkCenters = workCenters.filter(
    (workCenter) => workCenter.status === "Near Capacity"
  ).length;
  const bottleneckWorkCenters = workCenters.filter(
    (workCenter) => workCenter.status === "Bottleneck"
  ).length;
  const overCapacityWorkCenters = workCenters.filter(
    (workCenter) => workCenter.status === "Over Capacity"
  ).length;
  const bottleneck = workCenters.find((workCenter) => workCenter.status === "Bottleneck");

  return {
    totalWorkCenters,
    availableWorkCenters,
    nearCapacityWorkCenters,
    bottleneckWorkCenters,
    overCapacityWorkCenters,
    bottleneckLabel: bottleneck?.name ?? "None",
    capacityHoursPerWeek: bottleneck?.capacityHoursPerWeek ?? 0,
    queuedHoursPerWeek: bottleneck?.queuedHoursPerWeek ?? 0,
    utilization: bottleneck?.utilization ?? 0
  };
}

export function getCustomerSafeJobStatus(jobId: string, jobs: Job[]): CustomerSafeJobStatus | undefined {
  const job = jobs.find((entry) => entry.id === jobId);
  if (!job) {
    return undefined;
  }

  const summaryMap: Record<string, string> = {
    "In Production": "The shop is actively working the order.",
    "Waiting on Material": "The order is waiting on incoming material.",
    "Scrap Approval Required": "A quality disposition decision is pending.",
    Approved: "The job has been released to production.",
    "Ready to Ship": "The job is complete and waiting for shipment."
  };

  return {
    jobId: job.id,
    customerName: job.customerName,
    part: job.part,
    status: job.status,
    progress: job.progress ?? 0,
    nextMilestone:
      job.status === "In Production"
        ? "Inspection"
        : job.status === "Waiting on Material"
          ? "Material receipt"
          : job.status === "Scrap Approval Required"
            ? "Disposition"
            : "Next step",
    eta: job.dueDate,
    risk: job.risk,
    summary: summaryMap[job.status] ?? "Customer-safe summary available."
  };
}
