import { createInitialDemoWorkflowState, isPristineDemoWorkflowState } from "./initial-state";
import type { DemoWorkflowState } from "./types";

const STORAGE_KEY = "jobshopos-demo-workflow-state";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuditEvent(value: unknown): value is DemoWorkflowState["auditEvents"][number] {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.eventType === "string" &&
    typeof value.entityType === "string" &&
    typeof value.entityId === "string" &&
    typeof value.title === "string" &&
    typeof value.detail === "string" &&
    typeof value.actor === "string" &&
    typeof value.actorRole === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.severity === "string"
  );
}

export function isDemoWorkflowState(value: unknown): value is DemoWorkflowState {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    isObject(value.quoteStatuses) &&
    isObject(value.jobs) &&
    isObject(value.reworkOrders) &&
    isObject(value.purchaseRequests) &&
    isObject(value.reports) &&
    Array.isArray(value.auditEvents) &&
    value.auditEvents.every(isAuditEvent) &&
    typeof value.updatedAt === "string"
  );
}

export function loadDemoWorkflowState(): DemoWorkflowState {
  if (typeof window === "undefined") {
    return createInitialDemoWorkflowState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialDemoWorkflowState();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isDemoWorkflowState(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return createInitialDemoWorkflowState();
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createInitialDemoWorkflowState();
  }
}

export function saveDemoWorkflowState(state: DemoWorkflowState) {
  if (typeof window === "undefined") {
    return;
  }

  if (isPristineDemoWorkflowState(state)) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearDemoWorkflowState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getDemoWorkflowStorageKey() {
  return STORAGE_KEY;
}
