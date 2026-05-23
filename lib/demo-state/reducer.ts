import { createInitialDemoWorkflowState } from "./initial-state";
import type { DemoWorkflowAction, DemoWorkflowState } from "./types";

function updateJobState<TJobKey extends keyof DemoWorkflowState["jobs"]>(
  state: DemoWorkflowState,
  key: TJobKey,
  next: NonNullable<DemoWorkflowState["jobs"][TJobKey]>
): DemoWorkflowState {
  return {
    ...state,
    jobs: {
      ...state.jobs,
      [key]: {
        ...state.jobs[key],
        ...next
      }
    }
  };
}

export function demoWorkflowReducer(
  state: DemoWorkflowState,
  action: DemoWorkflowAction
): DemoWorkflowState {
  switch (action.type) {
    case "APPROVE_QUOTE_Q1003":
      return {
        ...state,
        quoteStatuses: {
          ...state.quoteStatuses,
          "Q-1003": "Approved"
        },
        updatedAt: action.timestamp ?? state.updatedAt
      };
    case "CONVERT_QUOTE_Q1003":
      return {
        ...updateJobState(state, "J-2104", {
          exists: true,
          sourceQuoteId: "Q-1003",
          workOrderId: "WO-2104"
        }),
        quoteStatuses: {
          ...state.quoteStatuses,
          "Q-1003": "Converted to Job"
        },
        updatedAt: action.timestamp ?? state.updatedAt
      };
    case "APPROVE_SCRAP_J2042":
      return {
        ...updateJobState(state, "J-2042", {
          status: "Rework",
          reworkOrderId: "RW-2042-01"
        }),
        reworkOrders: {
          ...state.reworkOrders,
          "RW-2042-01": { exists: true }
        },
        updatedAt: action.timestamp ?? state.updatedAt
      };
    case "CREATE_PURCHASE_REQUEST_PR3091":
      return {
        ...updateJobState(state, "J-2099", {
          status: "Purchase Requested",
          purchaseRequestId: "PR-3091"
        }),
        purchaseRequests: {
          ...state.purchaseRequests,
          "PR-3091": { exists: true }
        },
        updatedAt: action.timestamp ?? state.updatedAt
      };
    case "GENERATE_CUSTOMER_REPORT_J2035":
      return {
        ...updateJobState(state, "J-2035", {
          reportGenerated: true
        }),
        reports: {
          ...state.reports,
          "J-2035-CUSTOMER-STATUS": {
            exists: true,
            generatedAt: action.timestamp ?? state.updatedAt
          }
        },
        updatedAt: action.timestamp ?? state.updatedAt
      };
    case "APPEND_AUDIT_EVENT":
      return {
        ...state,
        auditEvents: [...state.auditEvents, action.event],
        updatedAt: action.event.timestamp
      };
    case "RESET_DEMO_STATE":
      return createInitialDemoWorkflowState();
    default:
      return state;
  }
}
