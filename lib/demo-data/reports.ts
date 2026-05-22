import type { CustomerStatusReport, Report, CustomerSafeTimelineItem } from "./types";

export const reports: Report[] = [
  {
    id: "RPT-J-2035-CUSTOMER",
    jobId: "J-2035",
    title: "Customer Status Report",
    audience: "Customer",
    summary: "Customer-safe summary for J-2035 with no internal notes.",
    generatedAt: "Today",
    savedAs: "Customer PDF"
  },
  {
    id: "RPT-J-2035-INTERNAL",
    jobId: "J-2035",
    title: "Customer Status Report",
    audience: "Internal",
    summary: "Internal report source used for customer-safe export.",
    generatedAt: "Today"
  }
];

export const customerStatusReport: CustomerStatusReport = {
  customer: "MetroFab Industries",
  contact: "Elena Morris",
  jobId: "J-2035",
  customerPo: "PO-8841",
  part: "Bracket Set Rev A",
  quantity: 500,
  dueDate: "Friday",
  currentStatus: "In Production",
  customerFacingStatus: "On Track",
  progress: 62,
  nextMilestone: "Welding",
  shipmentReadiness: "Pending final quality inspection",
  preparedBy: "Customer Service",
  preparedTimestamp: "Today 3:01 PM",
  message:
    "Your order is currently in production and remains on schedule. The bending step is in progress, with welding and final inspection scheduled next. We will continue to monitor progress and provide updates if the schedule changes.",
  reportSavedTo: "MetroFab Industries customer record"
};

export const customerSafeTimeline: CustomerSafeTimelineItem[] = [
  {
    title: "Quote approved",
    detail: "Commercial approval complete and job released.",
    timestamp: "Today 10:45 AM",
    severity: "Success"
  },
  {
    title: "Work order released",
    detail: "WO-2035 moved to the production queue.",
    timestamp: "Today 11:02 AM",
    severity: "Automation"
  },
  {
    title: "Material reserved",
    detail: "Inventory is secured for the current routing.",
    timestamp: "Today 11:08 AM",
    severity: "Info"
  },
  {
    title: "Cutting complete",
    detail: "Laser cutting finished the initial blanks.",
    timestamp: "Today 08:42 AM",
    severity: "Success"
  },
  {
    title: "Bending in progress",
    detail: "Press brake is actively working the order.",
    timestamp: "Today 10:42 AM",
    severity: "Warning"
  },
  {
    title: "Welding pending",
    detail: "Queue is staged for the next operation.",
    timestamp: "Pending",
    severity: "Info"
  },
  {
    title: "Finishing pending",
    detail: "Surface finish will follow weld completion.",
    timestamp: "Pending",
    severity: "Info"
  },
  {
    title: "Final inspection pending",
    detail: "Quality sign-off remains queued after finish.",
    timestamp: "Pending",
    severity: "Approval"
  },
  {
    title: "Shipment pending",
    detail: "Packing and shipment are still ahead.",
    timestamp: "Pending",
    severity: "Blocked"
  }
];
