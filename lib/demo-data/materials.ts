import { calculateMaterialAvailability, calculateMaterialShortage } from "./helpers";
import type {
  Material,
  MaterialAffectedJobRow,
  MaterialDashboardRow,
  MaterialReservationBreakdownRow,
  MaterialTimelineEntry
} from "./types";

export const materials: Material[] = [
  {
    sku: "AL-6061-PLT-0.375",
    name: "Aluminum Plate 6061, 3/8 inch",
    requiredForJobId: "J-2099",
    requiredSheets: 48,
    onHand: 12,
    reserved: 8,
    available: calculateMaterialAvailability(12, 8),
    shortage: calculateMaterialShortage(48, calculateMaterialAvailability(12, 8)),
    supplier: "Midwest Metals Supply",
    leadTimeBusinessDays: 3,
    lastPurchasePrice: 185,
    suggestedOrderQuantity: 50,
    reorderPoint: 20,
    contactEmail: "purchasing@midwestmetals.example",
    lastUpdated: "Today 9:15 AM",
    minimumOrderQuantity: 25
  }
];

export const materialDashboardRows: MaterialDashboardRow[] = [
  {
    sku: "AL-6061-PLT-0.375",
    name: "Aluminum Plate 6061, 3/8 inch",
    onHand: 12,
    reserved: 8,
    available: 4,
    reorderPoint: 20,
    shortage: 44,
    supplier: "Midwest Metals Supply",
    affectedJobIds: ["J-2099"],
    status: "Blocked Job",
    action: "View job impact",
    href: "/jobs/j-2099/material-impact"
  }
];

export const materialAffectedJobs: MaterialAffectedJobRow[] = [
  {
    jobId: "J-2099",
    customerName: "Apex Rail Components",
    requiredSheets: 48,
    status: "blocked",
    dueDate: "Due in 4 business days",
    href: "/jobs/j-2099/material-impact"
  },
  {
    jobId: "J-2035",
    customerName: "MetroFab Industries",
    requiredSheets: 8,
    status: "reserved",
    dueDate: "In production",
    href: "/jobs/j-2035"
  },
  {
    jobId: "J-2070",
    customerName: "Kepler Machine Works",
    requiredSheets: 16,
    status: "at risk",
    dueDate: "Due soon",
    href: "/jobs"
  }
];

export const materialReservationBreakdown: MaterialReservationBreakdownRow[] = [
  { label: "Reserved for J-2035", value: "8 sheets" },
  { label: "Available for new work", value: "4 sheets" },
  { label: "Required for J-2099", value: "48 sheets" },
  { label: "Remaining shortage", value: "44 sheets" }
];

export const materialImpactTimeline: MaterialTimelineEntry[] = [
  {
    title: "Quote approved",
    detail: "Q-1003 converted into the active job flow.",
    timestamp: "Today 10:46 AM",
    severity: "Success"
  },
  {
    title: "Job created",
    detail: "J-2099 released with CNC Mill routing.",
    timestamp: "Today 10:47 AM",
    severity: "Automation"
  },
  {
    title: "Material reservation attempted",
    detail: "Scheduler attempted to reserve AL-6061-PLT-0.375.",
    timestamp: "Today 10:48 AM",
    severity: "Warning"
  },
  {
    title: "Shortage detected",
    detail: "Only 4 sheets available against 48 required.",
    timestamp: "Today 10:49 AM",
    severity: "Critical"
  },
  {
    title: "Job marked Waiting on Material",
    detail: "J-2099 cannot start CNC Mill yet.",
    timestamp: "Today 10:49 AM",
    severity: "Blocked"
  },
  {
    title: "Scheduler risk flagged",
    detail: "CNC slot may need to move if material arrives late.",
    timestamp: "Today 10:50 AM",
    severity: "Approval"
  },
  {
    title: "Purchase request recommended",
    detail: "PR-3091 should be created from the shortage signal.",
    timestamp: "Today 10:51 AM",
    severity: "Automation"
  }
];
