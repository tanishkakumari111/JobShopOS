import type { Dispatch } from "react";
import type { AuditEvent, CustomerStatusReport, Job, PurchaseRequest, Quote, ReworkOrder, Report } from "@/lib/demo-data";

export type DemoQuoteStatus = Extract<Quote["status"], "Needs Owner Approval" | "Approved" | "Converted to Job">;

export type DemoWorkflowState = {
  version: 1;
  quoteStatuses: {
    "Q-1003"?: DemoQuoteStatus;
  };
  jobs: {
    "J-2042"?: {
      status?: "Scrap Approval Required" | "Rework";
      reworkOrderId?: "RW-2042-01";
    };
    "J-2099"?: {
      status?: "Waiting on Material" | "Purchase Requested";
      purchaseRequestId?: "PR-3091";
    };
    "J-2104"?: {
      exists?: boolean;
      sourceQuoteId?: "Q-1003";
      workOrderId?: "WO-2104";
    };
    "J-2035"?: {
      reportGenerated?: boolean;
    };
  };
  reworkOrders: {
    "RW-2042-01"?: {
      exists: boolean;
    };
  };
  purchaseRequests: {
    "PR-3091"?: {
      exists: boolean;
    };
  };
  reports: {
    "J-2035-CUSTOMER-STATUS"?: {
      exists: boolean;
      generatedAt?: string;
    };
  };
  auditEvents: AuditEvent[];
  updatedAt: string;
};

export type DemoWorkflowAction =
  | { type: "APPROVE_QUOTE_Q1003"; timestamp?: string }
  | { type: "CONVERT_QUOTE_Q1003"; timestamp?: string }
  | { type: "APPROVE_SCRAP_J2042"; timestamp?: string }
  | { type: "CREATE_PURCHASE_REQUEST_PR3091"; timestamp?: string }
  | { type: "GENERATE_CUSTOMER_REPORT_J2035"; timestamp?: string }
  | { type: "APPEND_AUDIT_EVENT"; event: AuditEvent }
  | { type: "RESET_DEMO_STATE" };

export type DemoStateContextValue = {
  state: DemoWorkflowState;
  dispatch: Dispatch<DemoWorkflowAction>;
  resetDemoState: () => void;
  approveQuoteQ1003: () => void;
  convertQuoteQ1003: () => void;
  approveScrapJ2042: () => void;
  createPurchaseRequestPR3091: () => void;
  generateCustomerReportJ2035: () => void;
};

export type DemoQuoteRecord = Quote;
export type DemoJobRecord = Job;
export type DemoPurchaseRequestRecord = PurchaseRequest;
export type DemoReworkOrderRecord = ReworkOrder;
export type DemoReportRecord = Report | CustomerStatusReport;
