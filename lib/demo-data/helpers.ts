import type {
  AuditEvent,
  CapacitySummary,
  DefectReasonBreakdownRow,
  Customer,
  CustomerSafeJobStatus,
  DashboardMetrics,
  DashboardRiskItem,
  InspectionQueueRow,
  Job,
  Material,
  MaterialDashboardRow,
  MaterialReservationBreakdownRow,
  MaterialTimelineEntry,
  PurchaseRequest,
  PurchaseRequestAuditEntry,
  PurchaseRequestState,
  Quote,
  QuoteApprovalQueueRow,
  QuoteDashboardRow,
  QuoteSummary,
  ProductionQueueRow,
  QualitySummary,
  ReworkOrder,
  WorkCenterCapacityRow,
  WorkCenter
} from "./types";
import { auditEvents } from "./audit-events";

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

export function getQuoteSummary(quotes: Quote[], jobs: Job[] = []): QuoteSummary {
  const convertedToJobs = jobs.filter((job) => job.sourceQuoteId).length;

  return {
    draftQuotes: quotes.filter((quote) => quote.status === "Draft").length,
    submittedQuotes: quotes.filter((quote) => quote.status === "Submitted").length,
    awaitingOwnerApproval: quotes.filter((quote) => quote.status === "Needs Owner Approval").length,
    approvedThisMonth: quotes.filter((quote) => quote.status === "Approved").length,
    convertedToJobs,
    expiringSoon: quotes.filter((quote) => quote.expiresSoon).length,
    totalQuotedValue: quotes.reduce((sum, quote) => sum + quote.amount, 0)
  };
}

export function getQuoteRows(quotes: Quote[]): QuoteDashboardRow[] {
  return quotes.map((quote) => ({
    quoteId: quote.id,
    customerName: quote.customerName,
    part: quote.part,
    amount: quote.amount,
    margin: quote.margin,
    status: quote.expiresSoon ? "Expiring Soon" : quote.status,
    validUntil: quote.validUntil ?? "21 days",
    estimator: quote.estimator,
    approvalRequirement:
      quote.id === "Q-1003"
        ? "Owner / GM required"
        : quote.status === "Draft"
          ? "Incomplete"
          : quote.status === "Submitted"
            ? "Ready for approval"
            : quote.expiresSoon
              ? "Expiring soon"
              : "Approved",
    lastUpdated: quote.lastUpdated ?? "Today",
    action:
      quote.id === "Q-1003"
        ? "Review approval"
        : quote.status === "Draft"
          ? "Complete quote"
          : quote.expiresSoon
            ? "Prioritize review"
            : quote.status === "Approved"
              ? "View quote"
              : "View",
    href: quote.id === "Q-1003" ? "/quotes/q-1003" : undefined,
    highlight: quote.id === "Q-1003"
  }));
}

export function getApprovalQueueRows(quotes: Quote[]): QuoteApprovalQueueRow[] {
  return quotes
    .filter((quote) => quote.status === "Needs Owner Approval" || requiresOwnerApproval(quote.amount, quote.approvalThreshold))
    .map((quote) => ({
      quoteId: quote.id,
      customerName: quote.customerName,
      amount: quote.amount,
      margin: quote.margin,
      estimator: quote.estimator,
      validUntil: quote.validUntil ?? "21 days",
      risk: quote.id === "Q-1003" ? "Medium" : quote.amount >= quote.approvalThreshold * 1.25 ? "High" : "Medium",
      reasonApprovalRequired:
        quote.id === "Q-1003"
          ? "Above $50,000 threshold"
          : "Requires owner review",
      action: `Approve ${quote.id}`,
      href: quote.id === "Q-1003" ? "/quotes/q-1003/convert" : `/quotes/${quote.id.toLowerCase()}`,
      highlight: quote.id === "Q-1003"
    }));
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

export function getDashboardMetrics(
  jobs: Job[],
  workCenters: WorkCenter[],
  auditEvents: AuditEvent[],
  reworkOrders: ReworkOrder[]
): DashboardMetrics {
  const activeJobs = jobs.filter((job) => job.status !== "Shipped" && job.status !== "Closed").length;
  const atRiskJobs = jobs.filter((job) => job.risk === "Watch" || job.risk === "High" || job.risk === "Critical").length;
  const wipValue = jobs
    .filter((job) => job.status !== "Shipped" && job.status !== "Closed")
    .reduce((sum, job) => sum + job.quantity * 145, 0);
  const jobsDueThisWeek = jobs.filter((job) => job.dueDate === "Friday").length;
  const scrapReworkCount =
    jobs.filter((job) => job.status === "Scrap Approval Required").length + reworkOrders.length;
  const materialBlockers = jobs.filter((job) => job.status === "Waiting on Material").length;
  const capacityBottlenecks = workCenters.filter((workCenter) => workCenter.status === "Bottleneck").length;

  return {
    activeJobs,
    atRiskJobs,
    wipValue,
    jobsDueThisWeek,
    scrapReworkCount,
    materialBlockers,
    capacityBottlenecks,
    auditEventsToday: auditEvents.length
  };
}

export function getDashboardRiskItems(
  jobs: Job[],
  quotes: Quote[],
  materials: Material[],
  workCenters: WorkCenter[]
) {
  const pressBrake = workCenters.find((workCenter) => workCenter.name === "Press Brake");
  const q1003 = quotes.find((quote) => quote.id === "Q-1003");
  const j2035 = jobs.find((job) => job.id === "J-2035");
  const j2042 = jobs.find((job) => job.id === "J-2042");
  const j2099 = jobs.find((job) => job.id === "J-2099");
  const al6061 = materials.find((material) => material.sku === "AL-6061-PLT-0.375");

  const items: DashboardRiskItem[] = [];

  if (pressBrake) {
    items.push({
      id: pressBrake.id,
      title: "Press Brake is over capacity",
      description: `${pressBrake.queuedHoursPerWeek}h queued against ${pressBrake.capacityHoursPerWeek}h capacity at ${pressBrake.utilization}% utilization.`,
      severity: "Critical",
      href: "/capacity",
      entityLabel: pressBrake.name,
      ctaLabel: "Open capacity"
    });
  }

  if (j2035) {
    items.push({
      id: j2035.id,
      title: "J-2035 is in production",
      description: `Current step ${j2035.currentStep ?? "production"} on ${j2035.workCenter}.`,
      severity: "Info",
      href: `/jobs/${j2035.id.toLowerCase()}`,
      entityLabel: j2035.id,
      ctaLabel: "Open job"
    });
  }

  if (j2042) {
    items.push({
      id: j2042.id,
      title: "J-2042 has scrap above tolerance",
      description: `${((j2042.scrapRate ?? 0) * 100).toFixed(0)}% scrap vs ${(j2042.allowedTolerance ?? 0) * 100}% tolerance.`,
      severity: "Approval",
      href: `/quality/j-2042/scrap-approval`,
      entityLabel: j2042.id,
      ctaLabel: "Review scrap"
    });
  }

  if (j2099 && al6061) {
    items.push({
      id: j2099.id,
      title: "J-2099 is blocked by material shortage",
      description: `${al6061.shortage} sheets short on ${al6061.sku} for ${j2099.id}.`,
      severity: "Blocked",
      href: `/jobs/j-2099/material-impact`,
      entityLabel: j2099.id,
      ctaLabel: "Review impact"
    });
  }

  if (q1003) {
    items.push({
      id: q1003.id,
      title: "Q-1003 requires Owner / GM approval",
      description: `$${q1003.amount.toLocaleString()} quote over $${q1003.approvalThreshold.toLocaleString()} threshold.`,
      severity: "Approval",
      href: `/quotes/q-1003`,
      entityLabel: q1003.id,
      ctaLabel: "Open quote"
    });
  }

  return items;
}

export function getQualitySummary(
  jobs: Job[],
  reworkOrders: ReworkOrder[],
  inspectionQueueRows: InspectionQueueRow[]
): QualitySummary {
  const openInspections = inspectionQueueRows.filter(
    (row) => row.status !== "Passed" && row.status !== "Approved"
  ).length;
  const failedInspections = inspectionQueueRows.filter((row) => row.result === "Failed").length;
  const scrapAboveTolerance = jobs.filter((job) => job.status === "Scrap Approval Required").length;
  const reworkOrdersOpen = reworkOrders.filter((order) => order.status === "Open").length;
  const jobsWaitingForSignOff = inspectionQueueRows.filter((row) =>
    row.status === "Pending Inspection" ||
    row.status === "Scrap Approval Required" ||
    row.status === "Waiting Supervisor Review"
  ).length;

  const inspectedJobs = jobs.filter(
    (job) =>
      typeof job.completedQuantity === "number" &&
      typeof job.scrapQuantity === "number" &&
      job.completedQuantity > 0
  );

  const totalCompleted = inspectedJobs.reduce(
    (sum, job) => sum + (job.completedQuantity ?? 0),
    0
  );
  const totalGood = inspectedJobs.reduce(
    (sum, job) =>
      sum + Math.max((job.completedQuantity ?? 0) - (job.scrapQuantity ?? 0), 0),
    0
  );

  const averageFirstPassYield =
    totalCompleted > 0 ? Math.round((totalGood / totalCompleted) * 1000) / 10 : 0;

  return {
    openInspections,
    failedInspections,
    scrapAboveTolerance,
    reworkOrdersOpen,
    jobsWaitingForSignOff,
    averageFirstPassYield
  };
}

export function getInspectionQueue(rows: InspectionQueueRow[]) {
  return rows;
}

export function getDefectReasonBreakdown(rows: DefectReasonBreakdownRow[]) {
  return rows.slice().sort((a, b) => b.count - a.count);
}

export function getMaterialsSummary(
  materials: Material[],
  jobs: Job[],
  purchaseRequests: PurchaseRequest[]
) {
  const belowReorderPoint = materials.filter(
    (material) => material.available <= (material.reorderPoint ?? material.requiredSheets)
  ).length;
  const jobsBlockedByShortage = jobs.filter((job) => job.status === "Waiting on Material").length;
  const openPurchaseRequests = purchaseRequests.filter((request) => request.status === "Submitted").length;
  const incomingPosThisWeek = purchaseRequests.filter((request) => request.status === "Submitted").length;
  const reservedInventoryValue = materials.reduce((sum, material) => sum + material.reserved * material.lastPurchasePrice, 0);
  const criticalShortages = materials.filter((material) => material.shortage > 0).length;

  return {
    materialsBelowReorderPoint: belowReorderPoint,
    jobsBlockedByShortage,
    openPurchaseRequests,
    incomingPosThisWeek,
    reservedInventoryValue,
    criticalShortages
  };
}

export function getMaterialRows(
  materials: Material[],
  jobs: Job[] = []
): MaterialDashboardRow[] {
  return materials.map((material) => ({
    sku: material.sku,
    name: material.name,
    onHand: material.onHand,
    reserved: material.reserved,
    available: material.available,
    reorderPoint: material.reorderPoint ?? 0,
    shortage: material.shortage,
    supplier: material.supplier,
    affectedJobIds: jobs.filter((job) => job.requiredMaterial === material.sku).map((job) => job.id),
    status:
      material.shortage > 0
        ? "Blocked Job"
        : material.available <= (material.reorderPoint ?? 0)
          ? "Shortage"
          : "Available",
    action: material.shortage > 0 ? "View job impact" : "Open material record",
    href: `/materials/${material.sku.toLowerCase()}`
  }));
}

export function getBlockedJobsByMaterialShortage(jobs: Job[], materials: Material[]) {
  const shortageBySku = new Map(materials.map((material) => [material.sku, material.shortage]));

  return jobs
    .filter((job) => job.status === "Waiting on Material" || (job.requiredMaterial && (shortageBySku.get(job.requiredMaterial) ?? 0) > 0))
    .map((job) => ({
      jobId: job.id,
      customerName: job.customerName,
      requiredSheets: job.id === "J-2099" ? 48 : job.id === "J-2035" ? 8 : 16,
      status:
        job.id === "J-2099" ? ("blocked" as const) : job.id === "J-2035" ? ("reserved" as const) : ("at risk" as const),
      dueDate:
        job.id === "J-2099"
          ? "Due in 4 business days"
          : job.id === "J-2035"
            ? "In production"
            : "Due soon",
      href:
        job.id === "J-2099"
          ? "/jobs/j-2099/material-impact"
          : job.id === "J-2035"
            ? "/jobs/j-2035"
            : "/jobs"
    }));
}

export function getMaterialReservationBreakdown(materials: Material[], jobs: Job[]) {
  const material = materials.find((entry) => entry.sku === "AL-6061-PLT-0.375");
  return [
    { label: "Reserved for J-2035", value: `${jobs.some((job) => job.id === "J-2035") ? 8 : material?.reserved ?? 0} sheets` },
    { label: "Available for new work", value: `${material?.available ?? 0} sheets` },
    { label: "Required for J-2099", value: "48 sheets" },
    { label: "Remaining shortage", value: `${material?.shortage ?? 44} sheets` }
  ] satisfies MaterialReservationBreakdownRow[];
}

export function getMaterialSupplierPanel(materials: Material[]) {
  const material = materials.find((entry) => entry.sku === "AL-6061-PLT-0.375");
  return {
    preferredSupplier: material?.supplier ?? "Midwest Metals Supply",
    contact: material?.contactEmail ?? "purchasing@midwestmetals.example",
    leadTimeBusinessDays: material?.leadTimeBusinessDays ?? 3,
    lastPurchasePrice: material?.lastPurchasePrice ?? 185,
    minimumOrderQuantity: material?.minimumOrderQuantity ?? 25,
    suggestedOrderQuantity: material?.suggestedOrderQuantity ?? 50
  };
}

export function getMaterialImpactTimeline(rows: MaterialTimelineEntry[]) {
  return rows;
}

export function getPurchaseRequestState(state: PurchaseRequestState) {
  return state;
}

export function getPurchaseRequestAuditEntries(entries: PurchaseRequestAuditEntry[]) {
  return entries;
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

export function getWorkCenterCapacityRows(
  workCenters: WorkCenter[],
  jobs: Job[] = []
): WorkCenterCapacityRow[] {
  return workCenters.map((workCenter) => {
    const affectedJobs = jobs
      .filter((job) => job.workCenter === workCenter.name)
      .map((job) => job.id);

    return {
      name: workCenter.name,
      capacityHoursPerWeek: workCenter.capacityHoursPerWeek,
      queuedHoursPerWeek: workCenter.queuedHoursPerWeek,
      utilization: workCenter.utilization,
      status: workCenter.status,
      affectedJobs,
      nextAction:
        workCenter.status === "Bottleneck"
          ? "View affected job"
          : workCenter.status === "Over Capacity"
            ? "Rebalance load"
            : "Monitor queue",
      ctaHref:
        workCenter.name === "Press Brake"
          ? "/jobs/j-2035"
          : workCenter.name === "Welding"
            ? "/quality/j-2042/scrap-approval"
            : workCenter.name === "CNC Mill"
              ? "/jobs/j-2099/material-impact"
              : undefined
    };
  });
}

export function getCapacityRiskJobIds(jobs: Job[], workCenters: WorkCenter[]) {
  const capacityRows = getWorkCenterCapacityRows(workCenters);
  const riskyCenterNames = capacityRows
    .filter((row) => row.status === "Bottleneck" || row.status === "Over Capacity")
    .flatMap((row) => row.affectedJobs);

  return jobs.filter((job) => riskyCenterNames.includes(job.id)).map((job) => job.id);
}

export function getProductionQueue(jobs: Job[]): ProductionQueueRow[] {
  const queueOrder = ["J-2035", "J-2042", "J-2099", "J-2104"];

  return queueOrder
    .map((jobId) => jobs.find((job) => job.id === jobId))
    .filter((job): job is Job => Boolean(job))
    .map((job) => ({
      jobId: job.id,
      customerName: job.customerName,
      part: job.part,
      status: job.status,
      currentStep: job.currentStep ?? (job.status === "Waiting on Material" ? "Blocked" : "Routing"),
      workCenter: job.workCenter,
      risk: job.risk,
      nextAction:
        job.id === "J-2035"
          ? "Finish bend and send to inspection"
          : job.id === "J-2042"
            ? "Approve scrap and open rework"
            : job.id === "J-2099"
              ? "Release PR-3091 to resolve shortage"
              : "Release routing to the floor",
      href:
        job.id === "J-2035"
          ? "/jobs/j-2035"
          : job.id === "J-2042"
            ? "/quality/j-2042/scrap-approval"
            : job.id === "J-2099"
              ? "/jobs/j-2099/material-impact"
              : "/quotes/q-1003/convert"
    }));
}

export function getRecentAuditEvents(limit: number, events: AuditEvent[] = auditEvents) {
  const priorityEventTypes = [
    "owner-approved",
    "job-moved-production",
    "traveler-printed",
    "scrap-approved",
    "material-shortage-detected",
    "purchase-request-created",
    "customer-report-generated",
    "customer-report-saved"
  ];

  const prioritized = priorityEventTypes.flatMap((type) =>
    events.filter((event) => event.eventType === type)
  );
  const remaining = events.filter((event) => !priorityEventTypes.includes(event.eventType));

  return [...prioritized, ...remaining].slice(0, limit);
}

export function getJobTraceEvents(jobId: string, events: AuditEvent[] = auditEvents) {
  const workOrderId = jobId === "J-2035" ? "WO-2035" : undefined;
  const reportId = jobId === "J-2035" ? "RPT-J-2035-CUSTOMER" : undefined;

  return [
    events.find((event) => event.eventType === "job-moved-production" && event.entityId === jobId),
    workOrderId
      ? events.find((event) => event.eventType === "traveler-printed" && event.entityId === workOrderId)
      : undefined,
    reportId
      ? events.find((event) => event.eventType === "customer-report-generated" && event.entityId === reportId)
      : undefined
  ].filter((event): event is AuditEvent => Boolean(event));
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
