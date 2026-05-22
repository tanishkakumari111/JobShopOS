export type DemoStep = {
  stepNumber: number;
  title: string;
  route: string;
  nextRoute?: string;
  previousRoute?: string;
  presenterNote: string;
};

export const demoPath: DemoStep[] = [
  {
    stepNumber: 1,
    title: "Production Command Center",
    route: "/",
    nextRoute: "/capacity",
    presenterNote:
      "Start with the operational home screen so the team understands the command-center model before drilling into any workflow."
  },
  {
    stepNumber: 2,
    title: "Capacity Bottleneck - Press Brake",
    route: "/capacity",
    previousRoute: "/",
    nextRoute: "/jobs/j-2035",
    presenterNote:
      "Show the bottleneck signal and how the system highlights constrained work centers before schedule commitments are made."
  },
  {
    stepNumber: 3,
    title: "Production Job - J-2035",
    route: "/jobs/j-2035",
    previousRoute: "/capacity",
    nextRoute: "/output/work-order-traveler/j-2035",
    presenterNote:
      "Move from the capacity issue into a live production job so the audience can see the linked operational record."
  },
  {
    stepNumber: 4,
    title: "Work Order Traveler - J-2035",
    route: "/output/work-order-traveler/j-2035",
    previousRoute: "/jobs/j-2035",
    nextRoute: "/quality/j-2042/scrap-approval",
    presenterNote:
      "Reveal the traveler output that operators and supervisors would use on the floor."
  },
  {
    stepNumber: 5,
    title: "Quality Exception - J-2042",
    route: "/quality/j-2042/scrap-approval",
    previousRoute: "/output/work-order-traveler/j-2035",
    nextRoute: "/quality/j-2042/rework-created",
    presenterNote:
      "Demonstrate how a failed inspection becomes a controlled exception instead of a spreadsheet side quest."
  },
  {
    stepNumber: 6,
    title: "Rework Created - RW-2042-01",
    route: "/quality/j-2042/rework-created",
    previousRoute: "/quality/j-2042/scrap-approval",
    nextRoute: "/jobs/j-2099/material-impact",
    presenterNote:
      "Show the immediate follow-on task and how the system keeps the trace between inspection and rework intact."
  },
  {
    stepNumber: 7,
    title: "Material Shortage - J-2099",
    route: "/jobs/j-2099/material-impact",
    previousRoute: "/quality/j-2042/rework-created",
    nextRoute: "/purchase-requests/pr-3091",
    presenterNote:
      "Introduce the shortage impact so the audience sees that schedule risks are tied to real inventory conditions."
  },
  {
    stepNumber: 8,
    title: "Purchase Request - PR-3091",
    route: "/purchase-requests/pr-3091",
    previousRoute: "/jobs/j-2099/material-impact",
    nextRoute: "/quotes/q-1003",
    presenterNote:
      "Surface the procurement handoff and make the request traceable back to the affected work."
  },
  {
    stepNumber: 9,
    title: "Quote Approval - Q-1003",
    route: "/quotes/q-1003",
    previousRoute: "/purchase-requests/pr-3091",
    nextRoute: "/quotes/q-1003/convert",
    presenterNote:
      "Switch to the commercial side and show how an estimate becomes a governed approval event."
  },
  {
    stepNumber: 10,
    title: "Convert Quote to Job - J-2104",
    route: "/quotes/q-1003/convert",
    previousRoute: "/quotes/q-1003",
    nextRoute: "/reports/customer-status/j-2035",
    presenterNote:
      "Show the conversion handoff so the audience can see how a quote becomes an executable job record."
  },
  {
    stepNumber: 11,
    title: "Customer Status Report - J-2035",
    route: "/reports/customer-status/j-2035",
    previousRoute: "/quotes/q-1003/convert",
    nextRoute: "/reports/customer-status/j-2035/print",
    presenterNote:
      "Switch to the customer-facing view and point out that the report is assembled from the same operational source of truth."
  },
  {
    stepNumber: 12,
    title: "Printable Customer Report",
    route: "/reports/customer-status/j-2035/print",
    previousRoute: "/reports/customer-status/j-2035",
    nextRoute: "/audit",
    presenterNote:
      "Show the print-ready format that can be exported without rewriting the underlying report logic."
  },
  {
    stepNumber: 13,
    title: "Audit Trail - Full Traceability",
    route: "/audit",
    previousRoute: "/reports/customer-status/j-2035/print",
    presenterNote:
      "Close with the traceability layer so the audience can connect every major event back to the source record."
  }
];

export function getDemoStepByRoute(route: string) {
  return demoPath.find((step) => step.route === route);
}
