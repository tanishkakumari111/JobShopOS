import type { Report } from "./types";

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
