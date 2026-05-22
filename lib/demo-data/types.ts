export type Customer = {
  slug: string;
  name: string;
  shortName: string;
  status: "Active" | "At Risk" | "Prospect";
  primaryContact: string;
  city: string;
  state: string;
};

export type CustomerProfile = {
  slug: string;
  name: string;
  accountContact: string;
  email: string;
  phone: string;
  status: Customer["status"];
  openJobs: number;
  openQuotes: number;
  onTimeDeliveryRate: number;
  lastUpdated: string;
  tabs: string[];
};

export type WorkCenter = {
  id: string;
  name: string;
  capacityHoursPerWeek: number;
  queuedHoursPerWeek: number;
  utilization: number;
  status:
    | "Available"
    | "Near Capacity"
    | "Bottleneck"
    | "Over Capacity"
    | "Maintenance";
};

export type JobRoutingStep = {
  stepNumber: number;
  operation: string;
  workCenter: string;
  plannedHours: number;
  actualHours?: number;
  assignedOperator: string;
  machine: string;
  status: "Complete" | "In Progress" | "Pending";
  timestamp?: string;
};

export type TravelerMaterialRow = {
  sku: string;
  name: string;
  requiredQuantity: string;
  reservedQuantity: string;
  lotNumber: string;
  signOff: string;
};

export type TravelerRoutingRow = {
  step: string;
  operation: string;
  workCenter: string;
  machine: string;
  plannedHours: string;
  operator: string;
  start: string;
  end: string;
  status: string;
  signOff: string;
};

export type ProductionUpdate = {
  label: string;
  detail: string;
  status: "Complete" | "Pending" | "Watch" | "Info";
};

export type InspectionQueueRow = {
  jobId: string;
  customerName: string;
  part: string;
  currentStep: string;
  inspector: string;
  result: "Passed" | "Failed" | "Pending";
  scrapRate: string;
  status:
    | "Pending Inspection"
    | "Failed"
    | "Scrap Approval Required"
    | "Waiting Supervisor Review"
    | "Passed"
    | "Approved";
  dueDate: string;
  action: string;
  href: string;
};

export type DefectReasonBreakdownRow = {
  reason: string;
  count: number;
  percentage: number;
};

export type QualityTimelineEntry = {
  title: string;
  detail: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
};

export type QualitySummary = {
  openInspections: number;
  failedInspections: number;
  scrapAboveTolerance: number;
  reworkOrdersOpen: number;
  jobsWaitingForSignOff: number;
  averageFirstPassYield: number;
};

export type ScrapEventDetail = {
  reportedBy: string;
  reportedAt: string;
  reason: string;
  operatorNote: string;
  inspectionNote: string;
};

export type AuditTrailEntry = {
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  entityType: "quote" | "job" | "workOrder" | "material" | "purchaseRequest" | "report" | "quality" | "capacity" | "reworkOrder";
  entityId: string;
  result: string;
  notes: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
};

export type Job = {
  id: string;
  slug: string;
  customerSlug: string;
  customerName: string;
  customerPo?: string;
  part: string;
  quantity: number;
  completedQuantity?: number;
  scrapQuantity?: number;
  scrapRate?: number;
  allowedTolerance?: number;
  status:
    | "Approved"
    | "Waiting on Material"
    | "Materials Reserved"
    | "In Production"
    | "In Quality"
    | "Rework"
    | "Ready to Ship"
    | "Shipped"
    | "Closed"
    | "Scrap Approval Required";
  currentStep?: string;
  blockedStep?: string;
  workCenter: string;
  risk: "Low" | "Watch" | "High" | "Critical" | "None";
  dueDate: string;
  workOrder?: string;
  reworkOrder?: string;
  requiredMaterial?: string;
  shortageSheets?: number;
  sourceQuoteId?: string;
  progress?: number;
};

export type Quote = {
  id: string;
  slug: string;
  customerSlug: string;
  customerName: string;
  part: string;
  quantity: number;
  amount: number;
  status:
    | "Draft"
    | "Submitted"
    | "Needs Owner Approval"
    | "Approved"
    | "Rejected"
    | "Expired"
    | "Converted to Job";
  estimator: string;
  approvalThreshold: number;
  approvalRequiredRole: string;
  margin: number;
  labor: number;
  materials: number;
  outsideServices: number;
  setupOverhead: number;
  customerReference?: string;
  revision?: string;
  validUntil?: string;
  lastUpdated?: string;
  expiresSoon?: boolean;
  customerFacingNotes?: string;
  internalNotes?: string;
};

export type QuoteDashboardRow = {
  quoteId: string;
  customerName: string;
  part: string;
  amount: number;
  margin: number;
  status: Quote["status"] | "Expiring Soon";
  validUntil: string;
  estimator: string;
  approvalRequirement: string;
  lastUpdated: string;
  action: string;
  href?: string;
  highlight?: boolean;
};

export type QuoteSummary = {
  draftQuotes: number;
  submittedQuotes: number;
  awaitingOwnerApproval: number;
  approvedThisMonth: number;
  convertedToJobs: number;
  expiringSoon: number;
  totalQuotedValue: number;
};

export type QuoteApprovalQueueRow = {
  quoteId: string;
  customerName: string;
  amount: number;
  margin: number;
  estimator: string;
  validUntil: string;
  risk: "Low" | "Medium" | "High";
  reasonApprovalRequired: string;
  action: string;
  href: string;
  highlight?: boolean;
};

export type QuoteRoutingEstimateRow = {
  operation: string;
  workCenter: string;
  estimatedHours: number;
  machine: string;
  notes: string;
};

export type QuoteMaterialEstimateRow = {
  sku: string;
  materialName: string;
  quantity: string;
  unitCost: number;
  extendedCost: number;
  availabilityStatus: string;
};

export type QuoteApprovalHistoryEntry = {
  timestamp: string;
  title: string;
  detail: string;
};

export type QuoteConversionRecord = {
  quoteId: string;
  customerName: string;
  jobNumber: string;
  workOrder: string;
  routingTemplate: string;
  initialMaterialReservation: string;
  scheduler: string;
  supervisor: string;
  generatedRouting: string[];
  createdRecords: string[];
  updatedQuoteStatus: string;
};

export type QuoteFormSnapshot = {
  customer: string;
  quoteCode: string;
  customerReference: string;
  partName: string;
  partRevision: string;
  quantity: number;
  requestedDueDate: string;
  validUntil: string;
  estimator: string;
  estimatedLaborHours: number;
  laborRate: number;
  materialCost: number;
  outsideServiceCost: number;
  setupCost: number;
  overhead: number;
  marginPercentage: number;
  totalQuoteAmount: number;
  routingEstimate: QuoteRoutingEstimateRow[];
  materialEstimate: QuoteMaterialEstimateRow[];
  customerFacingNotes: string;
  internalNotes: string;
  terms: string;
  validationExamples: string[];
};

export type Material = {
  sku: string;
  name: string;
  requiredForJobId: string;
  requiredSheets: number;
  onHand: number;
  reserved: number;
  available: number;
  shortage: number;
  supplier: string;
  leadTimeBusinessDays: number;
  lastPurchasePrice: number;
  suggestedOrderQuantity: number;
  reorderPoint?: number;
  contactEmail?: string;
  lastUpdated?: string;
  minimumOrderQuantity?: number;
};

export type MaterialDashboardRow = {
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  shortage: number;
  supplier: string;
  affectedJobIds: string[];
  status: "Available" | "Low Stock" | "Shortage" | "Purchase Requested" | "Blocked Job";
  action: string;
  href: string;
};

export type MaterialAffectedJobRow = {
  jobId: string;
  customerName: string;
  requiredSheets: number;
  status: "blocked" | "reserved" | "at risk";
  dueDate: string;
  href: string;
};

export type MaterialReservationBreakdownRow = {
  label: string;
  value: string;
};

export type MaterialTimelineEntry = {
  title: string;
  detail: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
};

export type PurchaseRequestState = {
  before: {
    materialStatus: string;
    jobStatus: string;
    actionNeeded: string;
  };
  after: {
    materialStatus: string;
    jobStatus: string;
    nextStep: string;
  };
};

export type PurchaseRequestAuditEntry = {
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: "PurchaseRequest" | "Job";
  entityId: string;
  result: string;
  notes: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
};

export type PurchaseRequest = {
  id: string;
  materialSku: string;
  linkedJobId: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  estimatedTotal: number;
  buyer: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Ordered";
  priority: "Low" | "Medium" | "High";
};

export type ReworkOrder = {
  id: string;
  linkedJobId: string;
  reason: string;
  workCenter: string;
  estimatedHours: number;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Complete" | "Closed";
  supervisor: string;
  nextStep?: string;
};

export type Report = {
  id: string;
  jobId: string;
  title: string;
  audience: "Internal" | "Customer";
  summary: string;
  generatedAt: string;
  savedAs?: string;
};

export type CustomerServiceSummary = {
  customerStatusRequestsToday: number;
  jobsDueThisWeek: number;
  jobsAtRisk: number;
  jobsReadyToShip: number;
  jobsWaitingOnMaterial: number;
  reportsGeneratedToday: number;
};

export type CustomerRiskQueueRow = {
  jobId: string;
  customerName: string;
  customerPo: string;
  part: string;
  currentInternalStatus: string;
  dueDate: string;
  customerFacingStatus: string;
  internalBlocker: string;
  lastUpdate: string;
  href: string;
  highlight?: boolean;
};

export type CustomerStatusReport = {
  customer: string;
  contact: string;
  jobId: string;
  customerPo: string;
  part: string;
  quantity: number;
  dueDate: string;
  currentStatus: string;
  customerFacingStatus: string;
  progress: number;
  nextMilestone: string;
  shipmentReadiness: string;
  preparedBy: string;
  preparedTimestamp: string;
  message: string;
  reportSavedTo: string;
};

export type CustomerSafeTimelineItem = {
  title: string;
  detail: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
};

export type AuditSummary = {
  auditEventsToday: number;
  eventsRequiringReview: number;
  userActionsLogged: number;
  systemAutomationsLogged: number;
  exportsGenerated: number;
  complianceReadyRecords: number;
};

export type AuditQuickFilter = {
  label: string;
};

export type AuditTimelineRow = {
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  entityType: AuditEvent["entityType"];
  entityId: string;
  result: string;
  notes: string;
  severity: AuditEvent["severity"];
  href: string;
};

export type EntityTimelineEntry = {
  title: string;
  detail: string;
  timestamp: string;
  severity: AuditEvent["severity"] | CustomerSafeTimelineItem["severity"];
};

export type FinalValuePillar = {
  title: string;
  description: string;
};

export type AuditEvent = {
  id: number;
  eventType: string;
  entityType: "quote" | "job" | "workOrder" | "material" | "purchaseRequest" | "report" | "quality" | "capacity";
  entityId: string;
  title: string;
  detail: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
};

export type DashboardRiskItem = {
  id: string;
  title: string;
  description: string;
  severity: "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success";
  href: string;
  entityLabel: string;
  ctaLabel?: string;
};

export type CapacitySummary = {
  totalWorkCenters: number;
  availableWorkCenters: number;
  nearCapacityWorkCenters: number;
  bottleneckWorkCenters: number;
  overCapacityWorkCenters: number;
  bottleneckLabel: string;
  capacityHoursPerWeek: number;
  queuedHoursPerWeek: number;
  utilization: number;
};

export type CustomerSafeJobStatus = {
  jobId: string;
  customerName: string;
  part: string;
  status: string;
  progress: number;
  nextMilestone: string;
  eta: string;
  risk: string;
  summary: string;
};

export type DashboardMetrics = {
  activeJobs: number;
  atRiskJobs: number;
  wipValue: number;
  jobsDueThisWeek: number;
  scrapReworkCount: number;
  materialBlockers: number;
  capacityBottlenecks: number;
  auditEventsToday: number;
};

export type ProductionQueueRow = {
  jobId: string;
  customerName: string;
  part: string;
  status: Job["status"];
  currentStep: string;
  workCenter: string;
  risk: Job["risk"];
  nextAction: string;
  href: string;
};

export type WorkCenterCapacityRow = {
  name: string;
  capacityHoursPerWeek: number;
  queuedHoursPerWeek: number;
  utilization: number;
  status: WorkCenter["status"];
  affectedJobs: string[];
  nextAction: string;
  ctaHref?: string;
};
