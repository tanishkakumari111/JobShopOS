type Tone =
  | "emerald"
  | "amber"
  | "rose"
  | "blue"
  | "slate"
  | "violet";

const toneClasses: Record<Tone, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700"
};

const statusToneLookup: Record<string, Tone> = {
  Draft: "slate",
  Submitted: "blue",
  "Needs Owner Approval": "amber",
  Approved: "emerald",
  Rejected: "rose",
  Expired: "slate",
  "Converted to Job": "emerald",
  "Waiting on Material": "amber",
  "Materials Reserved": "blue",
  "In Production": "blue",
  "In Quality": "amber",
  Rework: "rose",
  "Ready to Ship": "emerald",
  Shipped: "emerald",
  Closed: "slate",
  "Pending Inspection": "amber",
  Passed: "emerald",
  Failed: "rose",
  "Scrap Approval Required": "rose",
  "Rework Created": "amber",
  "Waiting Supervisor Review": "blue",
  Open: "blue",
  Complete: "emerald",
  Pending: "amber",
  Selected: "emerald",
  Available: "emerald",
  "Low Stock": "amber",
  Reserved: "blue",
  Shortage: "rose",
  "Purchase Requested": "amber",
  Incoming: "blue",
  "Blocked Job": "rose",
  "Near Capacity": "amber",
  "Over Capacity": "rose",
  Bottleneck: "rose",
  Info: "slate",
  Warning: "amber",
  Critical: "rose",
  Blocked: "rose",
  Approval: "blue",
  Automation: "slate",
  Success: "emerald"
};

export const quoteStatuses = [
  "Draft",
  "Submitted",
  "Needs Owner Approval",
  "Approved",
  "Rejected",
  "Expired",
  "Converted to Job"
] as const;

export const jobStatuses = [
  "Approved",
  "Waiting on Material",
  "Materials Reserved",
  "In Production",
  "In Quality",
  "Rework",
  "Ready to Ship",
  "Shipped",
  "Closed"
] as const;

export const qualityStatuses = [
  "Pending Inspection",
  "Passed",
  "Failed",
  "Scrap Approval Required",
  "Rework Created",
  "Waiting Supervisor Review"
] as const;

export const materialStatuses = [
  "Available",
  "Low Stock",
  "Reserved",
  "Shortage",
  "Purchase Requested",
  "Incoming",
  "Blocked Job"
] as const;

export const capacityStatuses = [
  "Available",
  "Near Capacity",
  "Over Capacity",
  "Bottleneck"
] as const;

export const severityStatuses = [
  "Info",
  "Warning",
  "Critical",
  "Blocked",
  "Approval",
  "Automation",
  "Success"
] as const;

export function getToneForStatus(status: string): Tone {
  return statusToneLookup[status] ?? "slate";
}

export function getStatusClasses(status: string) {
  return toneClasses[getToneForStatus(status)];
}

export const allStatusGroups = {
  quote: quoteStatuses,
  job: jobStatuses,
  quality: qualityStatuses,
  material: materialStatuses,
  capacity: capacityStatuses,
  severity: severityStatuses
} as const;
