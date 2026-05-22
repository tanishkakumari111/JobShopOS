import { requiresOwnerApproval } from "./helpers";
import type {
  Quote,
  QuoteApprovalHistoryEntry,
  QuoteConversionRecord,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow
} from "./types";

export const quotes: Quote[] = [
  {
    id: "Q-1001",
    slug: "q-1001",
    customerSlug: "metrofab-industries",
    customerName: "MetroFab Industries",
    part: "Bracket Set Rev A",
    quantity: 250,
    amount: 18400,
    status: "Submitted",
    estimator: "Lena Ortiz",
    approvalThreshold: 50000,
    approvalRequiredRole: "Owner / GM",
    margin: 4200,
    labor: 8600,
    materials: 6300,
    outsideServices: 1400,
    setupOverhead: 2100,
    customerReference: "RFQ-2401",
    revision: "Rev A",
    validUntil: "14 days",
    lastUpdated: "Today 8:14 AM"
  },
  {
    id: "Q-1002",
    slug: "q-1002",
    customerSlug: "apex-rail-components",
    customerName: "Apex Rail Components",
    part: "Mounting Plate Set Rev C",
    quantity: 120,
    amount: 28600,
    status: "Draft",
    estimator: "Maya Chen",
    approvalThreshold: 50000,
    approvalRequiredRole: "Owner / GM",
    margin: 5600,
    labor: 11800,
    materials: 10900,
    outsideServices: 2400,
    setupOverhead: 3600,
    customerReference: "RFQ-2404",
    revision: "Rev C",
    validUntil: "28 days",
    lastUpdated: "Yesterday 4:20 PM"
  },
  {
    id: "Q-1003",
    slug: "q-1003",
    customerSlug: "northline-fabrication",
    customerName: "Northline Fabrication",
    part: "Custom Welded Frame Assembly",
    quantity: 75,
    amount: 72500,
    status: "Needs Owner Approval",
    estimator: "Lena Ortiz",
    approvalThreshold: 50000,
    approvalRequiredRole: "Owner / GM",
    margin: 6500,
    labor: 24000,
    materials: 31500,
    outsideServices: 6000,
    setupOverhead: 4500,
    customerReference: "RFQ-2407",
    revision: "Rev B",
    validUntil: "21 days from now",
    lastUpdated: "Today 10:42 AM",
    customerFacingNotes:
      "Pricing reflects a welded frame assembly with expedited weld queue coverage and inspection hold coordination.",
    internalNotes:
      "High-value opportunity that crosses the owner approval threshold and should remain blocked until approval is recorded."
  },
  {
    id: "Q-1004",
    slug: "q-1004",
    customerSlug: "kepler-machine-works",
    customerName: "Kepler Machine Works",
    part: "Guard Rail Assembly",
    quantity: 48,
    amount: 31800,
    status: "Approved",
    estimator: "Sam Rivera",
    approvalThreshold: 50000,
    approvalRequiredRole: "Owner / GM",
    margin: 5900,
    labor: 12400,
    materials: 9800,
    outsideServices: 1800,
    setupOverhead: 1900,
    customerReference: "RFQ-2411",
    revision: "Rev A",
    validUntil: "19 days",
    lastUpdated: "Today 9:11 AM"
  },
  {
    id: "Q-1005",
    slug: "q-1005",
    customerSlug: "delta-signworks",
    customerName: "Delta Signworks",
    part: "Aluminum Sign Frame",
    quantity: 36,
    amount: 14250,
    status: "Approved",
    estimator: "Jordan Ellis",
    approvalThreshold: 50000,
    approvalRequiredRole: "Owner / GM",
    margin: 3200,
    labor: 5900,
    materials: 4500,
    outsideServices: 700,
    setupOverhead: 950,
    customerReference: "RFQ-2414",
    revision: "Rev A",
    validUntil: "3 days",
    lastUpdated: "Today 7:58 AM",
    expiresSoon: true
  }
];

export const quoteRoutingEstimateRows: QuoteRoutingEstimateRow[] = [
  {
    operation: "Cut",
    workCenter: "Laser Cutting",
    estimatedHours: 8,
    machine: "Laser-02",
    notes: "Break out welded frame blanks and deburr before bend."
  },
  {
    operation: "Bend",
    workCenter: "Press Brake",
    estimatedHours: 12,
    machine: "Brake-01",
    notes: "Form long legs with a dedicated setup check."
  },
  {
    operation: "Weld",
    workCenter: "Welding",
    estimatedHours: 36,
    machine: "Weld-03",
    notes: "Primary fabrication pass with fixture verification."
  },
  {
    operation: "Finish",
    workCenter: "Paint / Finish",
    estimatedHours: 10,
    machine: "Booth-01",
    notes: "Powder prep and final surface finish."
  },
  {
    operation: "Inspect",
    workCenter: "Inspection",
    estimatedHours: 6,
    machine: "QA Bench",
    notes: "Dimensional verification and weld acceptance."
  },
  {
    operation: "Pack",
    workCenter: "Packing",
    estimatedHours: 4,
    machine: "Pack-02",
    notes: "Crate, label, and release to shipping."
  }
];

export const quoteMaterialEstimateRows: QuoteMaterialEstimateRow[] = [
  {
    sku: "AL-6061-PLT-0.375",
    materialName: "Aluminum Plate 6061, 3/8 inch",
    quantity: "48 sheets",
    unitCost: 185,
    extendedCost: 8880,
    availabilityStatus: "Shortage - 44 sheets short"
  },
  {
    sku: "WLD-ER70S-6",
    materialName: "ER70S-6 Welding Wire",
    quantity: "2 spools",
    unitCost: 96,
    extendedCost: 192,
    availabilityStatus: "Available"
  },
  {
    sku: "FIN-PWD-BLK",
    materialName: "Black Powder Coat",
    quantity: "1 lot",
    unitCost: 260,
    extendedCost: 260,
    availabilityStatus: "Available"
  }
];

export const q1003ApprovalHistory: QuoteApprovalHistoryEntry[] = [
  {
    timestamp: "Today 10:40 AM",
    title: "Quote created by Lena Ortiz",
    detail: "Initial pricing and routing estimate captured from the estimate workflow."
  },
  {
    timestamp: "Today 10:42 AM",
    title: "Quote submitted",
    detail: "Estimator submitted Q-1003 for owner review."
  },
  {
    timestamp: "Today 10:42 AM",
    title: "Approval threshold detected",
    detail: "Amount exceeded the $50,000 owner approval rule."
  },
  {
    timestamp: "Today 10:45 AM",
    title: "Routed to Owner / GM",
    detail: "The quote is now waiting on leadership approval before conversion."
  }
];

export const q1003QuoteForm: QuoteFormSnapshot = {
  customer: "Northline Fabrication",
  quoteCode: "Q-1003",
  customerReference: "RFQ-2407",
  partName: "Custom Welded Frame Assembly",
  partRevision: "Rev B",
  quantity: 75,
  requestedDueDate: "June 14, 2026",
  validUntil: "21 days from now",
  estimator: "Lena Ortiz",
  estimatedLaborHours: 72,
  laborRate: 125,
  materialCost: 31500,
  outsideServiceCost: 6000,
  setupCost: 4500,
  overhead: 4500,
  marginPercentage: 8.9,
  totalQuoteAmount: 72500,
  routingEstimate: quoteRoutingEstimateRows,
  materialEstimate: quoteMaterialEstimateRows,
  customerFacingNotes:
    "Pricing reflects a welded frame assembly with a controlled lead time and inspection hold built in.",
  internalNotes:
    "Use this seeded example to show validation, cost build-up, and routing estimate structure before submit.",
  terms: "Net 30, quote valid for 21 days, subject to final owner approval.",
  validationExamples: [
    "Quote code Q-1001 already exists.",
    "Quote amount must be positive.",
    "Add at least one routing step before submitting."
  ]
};

export const q1003ConversionRecord: QuoteConversionRecord = {
  quoteId: "Q-1003",
  customerName: "Northline Fabrication",
  jobNumber: "J-2104",
  workOrder: "WO-2104",
  routingTemplate: "Welded Frame Assembly Routing",
  initialMaterialReservation: "Enabled",
  scheduler: "Sam Rivera",
  supervisor: "Dana Brooks",
  generatedRouting: ["Cut", "Bend", "Weld", "Finish", "Inspect", "Pack"],
  createdRecords: ["Job J-2104", "Work Order WO-2104", "Initial routing", "Material reservation tasks"],
  updatedQuoteStatus: "Converted to Job"
};

export const quoteApprovalRequired = requiresOwnerApproval(quotes.find((quote) => quote.id === "Q-1003")?.amount ?? 0);
