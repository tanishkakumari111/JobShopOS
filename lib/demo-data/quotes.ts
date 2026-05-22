import { requiresOwnerApproval } from "./helpers";
import type { Quote } from "./types";

export const quotes: Quote[] = [
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
    setupOverhead: 4500
  }
];

export const quoteApprovalRequired = requiresOwnerApproval(quotes[0].amount, quotes[0].approvalThreshold);
