import type { DemoStep } from "./demo-path";

export type RouteKey =
  | "home"
  | "capacity"
  | "jobs"
  | "job-2035"
  | "work-order-traveler"
  | "quality"
  | "quality-scrap"
  | "quality-rework"
  | "materials"
  | "material-al6061"
  | "job-2099-material"
  | "purchase-request"
  | "quotes"
  | "quote-new"
  | "quote-1003"
  | "approvals"
  | "quote-convert"
  | "customer-service"
  | "customer-metrofab"
  | "customer-service-job"
  | "customer-report"
  | "customer-report-print"
  | "audit"
  | "audit-job"
  | "demo-summary";

export type RouteMeta = {
  path: string;
  title: string;
  summary: string;
  action: string;
  audience: "internal" | "customer";
  demoStep?: DemoStep["stepNumber"];
  presenterNote?: string;
};

export const routeMeta: Record<RouteKey, RouteMeta> = {
  home: {
    path: "/",
    title: "Production Command Center",
    summary: "Live production health, risks, bottlenecks, and demo path for JobShop OS.",
    action: "Begin walkthrough",
    audience: "internal",
    demoStep: 1,
    presenterNote:
      "Start with the full shop view. JobShop OS surfaces production risk before it becomes missed delivery, hidden scrap, or customer escalation."
  },
  capacity: {
    path: "/capacity",
    title: "Capacity",
    summary: "Visualize bottlenecks, near-capacity queues, and work-center load.",
    action: "Review bottlenecks",
    audience: "internal",
    demoStep: 2
  },
  jobs: {
    path: "/jobs",
    title: "Jobs",
    summary: "Track active and planned jobs with their current status and next action.",
    action: "Open job queue",
    audience: "internal"
  },
  "job-2035": {
    path: "/jobs/j-2035",
    title: "Job J-2035",
    summary: "Primary production record with routing, status, and linked materials.",
    action: "Print traveler",
    audience: "internal",
    demoStep: 3
  },
  "work-order-traveler": {
    path: "/output/work-order-traveler/j-2035",
    title: "Work Order Traveler",
    summary: "Printable traveler view with work instructions and signoff checkpoints.",
    action: "Download traveler",
    audience: "internal",
    demoStep: 4
  },
  quality: {
    path: "/quality",
    title: "Quality",
    summary: "Inspection queue, exceptions, and release state across the floor.",
    action: "Review inspections",
    audience: "internal"
  },
  "quality-scrap": {
    path: "/quality/j-2042/scrap-approval",
    title: "Quality Exception",
    summary: "Scrap approval flow for a failed inspection with controlled follow-up.",
    action: "Approve scrap",
    audience: "internal",
    demoStep: 5
  },
  "quality-rework": {
    path: "/quality/j-2042/rework-created",
    title: "Rework Created",
    summary: "Rework record linked back to the original inspection and material lot.",
    action: "Open rework",
    audience: "internal",
    demoStep: 6
  },
  materials: {
    path: "/materials",
    title: "Materials",
    summary: "Inventory positions, shortages, reservations, and purchasing signals.",
    action: "Inspect stock",
    audience: "internal"
  },
  "material-al6061": {
    path: "/materials/al-6061-plt-0.375",
    title: "Material AL-6061-PLT-0.375",
    summary: "Seed-ready material record with reservations and procurement history.",
    action: "View lot history",
    audience: "internal"
  },
  "job-2099-material": {
    path: "/jobs/j-2099/material-impact",
    title: "Material Shortage Impact",
    summary: "Impact analysis showing how a shortage flows into the job schedule.",
    action: "Open shortage",
    audience: "internal",
    demoStep: 7
  },
  "purchase-request": {
    path: "/purchase-requests/pr-3091",
    title: "Purchase Request PR-3091",
    summary: "Seeded procurement request linked to the affected job and material need.",
    action: "Review request",
    audience: "internal",
    demoStep: 8
  },
  quotes: {
    path: "/quotes",
    title: "Quotes",
    summary: "Quote pipeline with drafts, approvals, and conversion readiness.",
    action: "New quote",
    audience: "internal"
  },
  "quote-new": {
    path: "/quotes/new",
    title: "New Quote",
    summary: "Placeholder entry screen for future estimation workflows.",
    action: "Save draft",
    audience: "internal"
  },
  "quote-1003": {
    path: "/quotes/q-1003",
    title: "Quote Q-1003",
    summary: "Approval-ready quote record with scope, pricing, and status history.",
    action: "Submit for approval",
    audience: "internal",
    demoStep: 9
  },
  approvals: {
    path: "/approvals",
    title: "Approvals",
    summary: "Owner and supervisor approvals will land here in a future phase.",
    action: "Review approvals",
    audience: "internal"
  },
  "quote-convert": {
    path: "/quotes/q-1003/convert",
    title: "Convert Quote",
    summary: "Controlled conversion placeholder from quote approval to active job.",
    action: "Convert to job",
    audience: "internal",
    demoStep: 10
  },
  "customer-service": {
    path: "/customer-service",
    title: "Customer Service",
    summary: "Customer-facing support desk view for job status and communication.",
    action: "Open support queue",
    audience: "customer"
  },
  "customer-metrofab": {
    path: "/customers/metrofab-industries",
    title: "MetroFab Industries",
    summary: "Customer account placeholder for future relationship and account management.",
    action: "Open account",
    audience: "customer"
  },
  "customer-service-job": {
    path: "/customer-service/jobs/j-2035",
    title: "Customer Job View",
    summary: "Customer-safe summary of J-2035 progress and estimated completion.",
    action: "Send update",
    audience: "customer",
    demoStep: 11
  },
  "customer-report": {
    path: "/reports/customer-status/j-2035",
    title: "Customer Status Report",
    summary: "Customer-ready status report assembled from the live operational record.",
    action: "Prepare report",
    audience: "customer",
    demoStep: 11
  },
  "customer-report-print": {
    path: "/reports/customer-status/j-2035/print",
    title: "Printable Customer Report",
    summary: "Print-ready customer report placeholder using the same report skeleton.",
    action: "Print report",
    audience: "customer",
    demoStep: 12
  },
  audit: {
    path: "/audit",
    title: "Audit Trail",
    summary: "Full traceability stream across quote, job, quality, and procurement events.",
    action: "Inspect audit",
    audience: "internal",
    demoStep: 13
  },
  "audit-job": {
    path: "/audit/jobs/j-2035",
    title: "Job Audit Trail",
    summary: "Job-level event stream with who changed what and when.",
    action: "Open event detail",
    audience: "internal"
  },
  "demo-summary": {
    path: "/demo/summary",
    title: "Demo Summary",
    summary: "Kitchen-sink demo page for the Phase 1 shell, badges, labels, and links.",
    action: "Walk the demo",
    audience: "internal"
  }
};

export const routeMetaByPath = Object.values(routeMeta).reduce<
  Record<string, RouteMeta>
>((acc, meta) => {
  acc[meta.path] = meta;
  return acc;
}, {});
