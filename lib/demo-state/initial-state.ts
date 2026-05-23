import type { DemoWorkflowState } from "./types";

export function createInitialDemoWorkflowState(): DemoWorkflowState {
  return {
    version: 1,
    quoteStatuses: {},
    jobs: {},
    reworkOrders: {},
    purchaseRequests: {},
    reports: {},
    auditEvents: [],
    updatedAt: ""
  };
}

export const demoWorkflowInitialState = createInitialDemoWorkflowState();

export function isPristineDemoWorkflowState(state: DemoWorkflowState) {
  return (
    state.version === 1 &&
    Object.keys(state.quoteStatuses).length === 0 &&
    Object.keys(state.jobs).length === 0 &&
    Object.keys(state.reworkOrders).length === 0 &&
    Object.keys(state.purchaseRequests).length === 0 &&
    Object.keys(state.reports).length === 0 &&
    state.auditEvents.length === 0 &&
    state.updatedAt === ""
  );
}
