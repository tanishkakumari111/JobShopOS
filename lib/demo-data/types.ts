export type Customer = {
  slug: string;
  name: string;
  shortName: string;
  status: "Active" | "At Risk" | "Prospect";
  primaryContact: string;
  city: string;
  state: string;
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
};
