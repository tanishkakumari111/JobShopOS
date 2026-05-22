import { calculateScrapRate } from "./helpers";
import type {
  AuditTrailEntry,
  DefectReasonBreakdownRow,
  InspectionQueueRow,
  QualityTimelineEntry,
  ReworkOrder,
  ScrapEventDetail
} from "./types";

export const reworkOrders: ReworkOrder[] = [
  {
    id: "RW-2042-01",
    linkedJobId: "J-2042",
    reason: "Weld Porosity",
    workCenter: "Welding",
    estimatedHours: 6,
    priority: "High",
    status: "Open",
    supervisor: "Dana Brooks",
    nextStep: "Weld Rework"
  }
];

export const qualityRecords = [
  {
    jobId: "J-2042",
    inspectionStatus: "Scrap Approval Required",
    scrapRate: calculateScrapRate(18, 180),
    allowedTolerance: 0.05,
    disposition: "Awaiting supervisor approval"
  }
];

export const inspectionQueueRows: InspectionQueueRow[] = [
  {
    jobId: "J-2042",
    customerName: "Northline Fabrication",
    part: "Bracket Assembly Rev B",
    currentStep: "Weld",
    inspector: "Quality Inspector",
    result: "Failed",
    scrapRate: "10%",
    status: "Scrap Approval Required",
    dueDate: "Due in 2 business days",
    action: "Review scrap approval",
    href: "/quality/j-2042/scrap-approval"
  },
  {
    jobId: "J-2035",
    customerName: "MetroFab Industries",
    part: "Bracket Set Rev A",
    currentStep: "Finish",
    inspector: "Quality Inspector",
    result: "Pending",
    scrapRate: "0%",
    status: "Pending Inspection",
    dueDate: "Due after Finish",
    action: "Monitor inspection readiness",
    href: "/jobs/j-2035"
  },
  {
    jobId: "J-2099",
    customerName: "Apex Rail Components",
    part: "Mounting Plate Set Rev C",
    currentStep: "Blocked",
    inspector: "Quality Inspector",
    result: "Pending",
    scrapRate: "0%",
    status: "Waiting Supervisor Review",
    dueDate: "Waiting on material",
    action: "Hold until material is released",
    href: "/jobs/j-2099/material-impact"
  },
  {
    jobId: "J-2104",
    customerName: "Northline Fabrication",
    part: "Custom Welded Frame Assembly",
    currentStep: "Routing",
    inspector: "Quality Inspector",
    result: "Passed",
    scrapRate: "0%",
    status: "Passed",
    dueDate: "Awaiting first article",
    action: "Review routed job",
    href: "/quotes/q-1003/convert"
  }
];

export const defectReasonBreakdownRows: DefectReasonBreakdownRow[] = [
  { reason: "Weld Porosity", count: 8, percentage: 38 },
  { reason: "Dimensional Error", count: 5, percentage: 24 },
  { reason: "Material Defect", count: 4, percentage: 19 },
  { reason: "Paint / Finish Issue", count: 2, percentage: 10 },
  { reason: "Operator Setup Error", count: 2, percentage: 9 }
];

export const j2042ScrapEventDetail: ScrapEventDetail = {
  reportedBy: "Marco Singh",
  reportedAt: "Today, 10:42 AM",
  reason: "Weld Porosity",
  operatorNote:
    "Porosity found after fixture change. Suspect shielding gas pressure issue.",
  inspectionNote:
    "Sample failed visual weld inspection. Rework recommended before final inspection."
};

export const j2042QualityTimeline: QualityTimelineEntry[] = [
  {
    title: "Inspection failed",
    detail: "Visual weld inspection flagged the failed sample at Weld.",
    timestamp: "Today 10:42 AM",
    severity: "Critical"
  },
  {
    title: "Scrap logged",
    detail: "Marco Singh recorded 18 scrap units against the completed quantity.",
    timestamp: "Today 10:42 AM",
    severity: "Warning"
  },
  {
    title: "Supervisor approval requested",
    detail: "Job J-2042 is blocked until scrap disposition is recorded.",
    timestamp: "Today 10:45 AM",
    severity: "Approval"
  },
  {
    title: "Rework order created",
    detail: "RW-2042-01 was opened and linked to the weld exception.",
    timestamp: "Today 10:46 AM",
    severity: "Automation"
  },
  {
    title: "Quality sign-off completed",
    detail: "Exception is closed as a controlled rework path, not a spreadsheet note.",
    timestamp: "Today 10:48 AM",
    severity: "Success"
  }
];

export const j2042ApprovalAuditTrail: AuditTrailEntry[] = [
  {
    timestamp: "Today 10:45 AM",
    actor: "Dana Brooks",
    actorRole: "Shop Supervisor",
    action: "Approved scrap above tolerance",
    entityType: "job",
    entityId: "J-2042",
    result: "Rework order RW-2042-01 created",
    notes: "Approved weld porosity scrap event and routed job to rework.",
    severity: "Approval"
  },
  {
    timestamp: "Today 10:46 AM",
    actor: "System",
    actorRole: "Automation",
    action: "Created rework order",
    entityType: "reworkOrder",
    entityId: "RW-2042-01",
    result: "Linked to Job J-2042",
    notes: "Created from approved scrap event.",
    severity: "Automation"
  }
];
