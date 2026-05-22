import { calculateScrapRate } from "./helpers";
import type {
  Job,
  JobRoutingStep,
  ProductionUpdate,
  TravelerMaterialRow,
  TravelerRoutingRow
} from "./types";

export const jobs: Job[] = [
  {
    id: "J-2035",
    slug: "j-2035",
    customerSlug: "metrofab-industries",
    customerName: "MetroFab Industries",
    customerPo: "PO-8841",
    part: "Bracket Set Rev A",
    quantity: 500,
    completedQuantity: 310,
    scrapQuantity: 6,
    status: "In Production",
    currentStep: "Bend",
    workCenter: "Press Brake",
    risk: "Watch",
    dueDate: "Friday",
    workOrder: "WO-2035",
    progress: 62
  },
  {
    id: "J-2042",
    slug: "j-2042",
    customerSlug: "northline-fabrication",
    customerName: "Northline Fabrication",
    customerPo: "PO-9027",
    part: "Bracket Assembly Rev B",
    quantity: 200,
    completedQuantity: 180,
    scrapQuantity: 18,
    scrapRate: calculateScrapRate(18, 180),
    allowedTolerance: 0.05,
    status: "Scrap Approval Required",
    currentStep: "Weld",
    workCenter: "Welding",
    risk: "Critical",
    dueDate: "Friday",
    reworkOrder: "RW-2042-01",
    progress: 90
  },
  {
    id: "J-2099",
    slug: "j-2099",
    customerSlug: "apex-rail-components",
    customerName: "Apex Rail Components",
    customerPo: "PO-9182",
    part: "Mounting Plate Set Rev C",
    quantity: 120,
    status: "Waiting on Material",
    blockedStep: "CNC Mill",
    workCenter: "CNC Mill",
    requiredMaterial: "AL-6061-PLT-0.375",
    shortageSheets: 44,
    risk: "High",
    dueDate: "Next Tuesday",
    progress: 18
  },
  {
    id: "J-2104",
    slug: "j-2104",
    customerSlug: "northline-fabrication",
    customerName: "Northline Fabrication",
    sourceQuoteId: "Q-1003",
    workOrder: "WO-2104",
    part: "Custom Welded Frame Assembly",
    quantity: 75,
    status: "Approved",
    currentStep: "Routing generated from quote",
    workCenter: "Scheduling",
    risk: "Low",
    dueDate: "Ready for release",
    progress: 100
  }
];

export const j2035RoutingSteps: JobRoutingStep[] = [
  {
    stepNumber: 10,
    operation: "Cut",
    workCenter: "Laser Cutting",
    plannedHours: 6,
    actualHours: 5.5,
    assignedOperator: "A. Patel",
    machine: "Laser-02",
    status: "Complete",
    timestamp: "Today 08:10 AM"
  },
  {
    stepNumber: 20,
    operation: "Bend",
    workCenter: "Press Brake",
    plannedHours: 10,
    actualHours: 6.2,
    assignedOperator: "Marco Singh",
    machine: "Brake-01",
    status: "In Progress",
    timestamp: "Today 10:42 AM"
  },
  {
    stepNumber: 30,
    operation: "Weld",
    workCenter: "Welding",
    plannedHours: 14,
    assignedOperator: "D. Brooks",
    machine: "Weld-03",
    status: "Pending"
  },
  {
    stepNumber: 40,
    operation: "Finish",
    workCenter: "Paint / Finish",
    plannedHours: 8,
    assignedOperator: "R. Lopez",
    machine: "Booth-01",
    status: "Pending"
  },
  {
    stepNumber: 50,
    operation: "Inspect",
    workCenter: "Inspection",
    plannedHours: 3,
    assignedOperator: "K. Nguyen",
    machine: "QA Bench",
    status: "Pending"
  },
  {
    stepNumber: 60,
    operation: "Pack",
    workCenter: "Packing",
    plannedHours: 2,
    assignedOperator: "M. Diaz",
    machine: "Pack-02",
    status: "Pending"
  }
];

export const j2035TravelerRoutingRows: TravelerRoutingRow[] = [
  {
    step: "10",
    operation: "Cut",
    workCenter: "Laser Cutting",
    machine: "Laser-02",
    plannedHours: "6h",
    operator: "A. Patel",
    start: "Today 08:00",
    end: "Today 08:42",
    status: "Complete",
    signOff: "AP"
  },
  {
    step: "20",
    operation: "Bend",
    workCenter: "Press Brake",
    machine: "Brake-01",
    plannedHours: "10h",
    operator: "Marco Singh",
    start: "Today 10:42",
    end: "In progress",
    status: "In Progress",
    signOff: "MS"
  },
  {
    step: "30",
    operation: "Weld",
    workCenter: "Welding",
    machine: "Weld-03",
    plannedHours: "14h",
    operator: "D. Brooks",
    start: "Pending",
    end: "Pending",
    status: "Pending",
    signOff: "—"
  },
  {
    step: "40",
    operation: "Finish",
    workCenter: "Paint / Finish",
    machine: "Booth-01",
    plannedHours: "8h",
    operator: "R. Lopez",
    start: "Pending",
    end: "Pending",
    status: "Pending",
    signOff: "—"
  },
  {
    step: "50",
    operation: "Inspect",
    workCenter: "Inspection",
    machine: "QA Bench",
    plannedHours: "3h",
    operator: "K. Nguyen",
    start: "Pending",
    end: "Pending",
    status: "Pending",
    signOff: "—"
  },
  {
    step: "60",
    operation: "Pack",
    workCenter: "Packing",
    machine: "Pack-02",
    plannedHours: "2h",
    operator: "M. Diaz",
    start: "Pending",
    end: "Pending",
    status: "Pending",
    signOff: "—"
  }
];

export const j2035TravelerMaterials: TravelerMaterialRow[] = [
  {
    sku: "AL-6061-PLT-0.375",
    name: "Aluminum Plate 6061, 3/8 inch",
    requiredQuantity: "48 sheets",
    reservedQuantity: "12 sheets",
    lotNumber: "LOT-AL-2402",
    signOff: "Reserved"
  }
];

export const j2035ProductionUpdates: ProductionUpdate[] = [
  { label: "Cut step completed", detail: "Laser-02 finished blanks for J-2035.", status: "Complete" },
  { label: "Bend step started", detail: "Press Brake is actively bending the bracket set.", status: "Info" },
  { label: "Fixture confirmed", detail: "Forming fixture has been verified against Rev A.", status: "Complete" },
  { label: "First article check pending", detail: "Inspection sign-off will happen after finish.", status: "Pending" }
];

export const j2035QualityReadiness = [
  { label: "Quality status", value: "Pending final inspection" },
  { label: "Inspection requirement", value: "After Finish" },
  { label: "Active quality exception", value: "None" }
];

export const j2035TravelerShipping = [
  { label: "Packed by", value: "Pending" },
  { label: "Final quantity", value: "Pending" },
  { label: "Ship date", value: "Pending" },
  { label: "Carrier", value: "Pending" },
  { label: "Tracking number", value: "Pending" },
  { label: "Final sign-off", value: "Pending" }
];

export const j2035TravelerSignOffFields = [
  { label: "Operation complete", value: "Pending" },
  { label: "Quantity completed", value: "Pending" },
  { label: "Scrap quantity", value: "0" },
  { label: "Operator initials", value: "MS" },
  { label: "Date/time", value: "Today 10:42" },
  { label: "Supervisor sign-off", value: "Pending" }
];

export const j2035QualityInspectionChecks = [
  { label: "First article inspection", value: "Passed" },
  { label: "In-process check", value: "Pending Inspection" },
  { label: "Final inspection", value: "Pending Inspection" },
  { label: "Inspector initials", value: "KN" },
  { label: "Pass/fail", value: "Pending" },
  { label: "Notes", value: "After Finish" }
];

export const j2035ScrapAndReworkFields = [
  { label: "Scrap quantity", value: "0" },
  { label: "Reason code", value: "Pending" },
  { label: "Rework required", value: "No" },
  { label: "Supervisor sign-off", value: "Pending" }
];
