"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auditEvents as seedAuditEvents } from "@/lib/demo-data";
import { createDemoAuditEvent, formatDemoTimestamp, getNextAuditEventId } from "@/lib/demo-state/audit";
import { demoWorkflowInitialState } from "@/lib/demo-state/initial-state";
import { demoWorkflowReducer } from "@/lib/demo-state/reducer";
import { clearDemoWorkflowState, loadDemoWorkflowState, saveDemoWorkflowState } from "@/lib/demo-state/storage";
import type { DemoStateContextValue, DemoWorkflowAction } from "@/lib/demo-state/types";

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

function createNextAuditEventId(stateAuditEvents: DemoStateContextValue["state"]["auditEvents"]) {
  return getNextAuditEventId([...seedAuditEvents, ...stateAuditEvents]);
}

function appendAuditEventToState(
  state: DemoStateContextValue["state"],
  event: Parameters<typeof createDemoAuditEvent>[0]
) {
  return demoWorkflowReducer(state, {
    type: "APPEND_AUDIT_EVENT",
    event
  });
}

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(demoWorkflowInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadDemoWorkflowState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveDemoWorkflowState(state);
  }, [hydrated, state]);

  const dispatch = useCallback((action: DemoWorkflowAction) => {
    setState((current) => demoWorkflowReducer(current, action));
  }, []);

  const approveQuoteQ1003 = useCallback(() => {
    setState((current) => {
      if (current.quoteStatuses["Q-1003"] === "Approved" || current.quoteStatuses["Q-1003"] === "Converted to Job") {
        return current;
      }

      const nextAuditEventId = createNextAuditEventId(current.auditEvents);
      const approvedState = demoWorkflowReducer(current, { type: "APPROVE_QUOTE_Q1003" });
      const auditEvent = createDemoAuditEvent({
        id: nextAuditEventId,
        eventType: "owner-approved",
        entityType: "quote",
        entityId: "Q-1003",
        title: "Approved high-value quote",
        detail: "Approved $72,500 quote above $50k threshold.",
        actor: "Owner / GM",
        actorRole: "Owner / GM",
        timestamp: formatDemoTimestamp(),
        severity: "Success"
      });

      return appendAuditEventToState(approvedState, auditEvent);
    });
  }, []);

  const convertQuoteQ1003 = useCallback(() => {
    setState((current) => {
      if (current.quoteStatuses["Q-1003"] === "Converted to Job" && current.jobs["J-2104"]?.exists) {
        return current;
      }

      if (current.quoteStatuses["Q-1003"] !== "Approved" && current.quoteStatuses["Q-1003"] !== "Converted to Job") {
        return current;
      }

      const nextAuditEventId = createNextAuditEventId(current.auditEvents);
      const convertedState = demoWorkflowReducer(current, { type: "CONVERT_QUOTE_Q1003" });
      const convertedEvent = createDemoAuditEvent({
        id: nextAuditEventId,
        eventType: "quote-converted",
        entityType: "quote",
        entityId: "Q-1003",
        title: "Converted quote to job",
        detail: "Converted Q-1003 into production job J-2104.",
        actor: "Scheduler",
        actorRole: "Scheduler",
        timestamp: formatDemoTimestamp(),
        severity: "Automation"
      });
      const workOrderEvent = createDemoAuditEvent({
        id: nextAuditEventId + 1,
        eventType: "work-order-created",
        entityType: "workOrder",
        entityId: "WO-2104",
        title: "Created work order WO-2104",
        detail: "Work order created from converted quote.",
        actor: "System",
        actorRole: "Automation",
        timestamp: formatDemoTimestamp(),
        severity: "Automation"
      });
      const routingEvent = createDemoAuditEvent({
        id: nextAuditEventId + 2,
        eventType: "routing-generated",
        entityType: "job",
        entityId: "J-2104",
        title: "Generated routing for J-2104",
        detail: "Cut, Bend, Weld, Finish, Inspect, and Pack routing created.",
        actor: "System",
        actorRole: "Automation",
        timestamp: formatDemoTimestamp(),
        severity: "Automation"
      });

      return appendAuditEventToState(
        appendAuditEventToState(appendAuditEventToState(convertedState, convertedEvent), workOrderEvent),
        routingEvent
      );
    });
  }, []);

  const approveScrapJ2042 = useCallback(() => {
    setState((current) => {
      if (current.jobs["J-2042"]?.status === "Rework" && current.reworkOrders["RW-2042-01"]?.exists) {
        return current;
      }

      const nextAuditEventId = createNextAuditEventId(current.auditEvents);
      const reworkState = demoWorkflowReducer(current, { type: "APPROVE_SCRAP_J2042" });
      const approvedEvent = createDemoAuditEvent({
        id: nextAuditEventId,
        eventType: "scrap-approved",
        entityType: "quality",
        entityId: "J-2042",
        title: "Approved scrap above tolerance",
        detail: "Approved weld porosity scrap event and routed job to rework.",
        actor: "Dana Brooks",
        actorRole: "Shop Supervisor",
        timestamp: formatDemoTimestamp(),
        severity: "Approval"
      });
      const reworkCreatedEvent = createDemoAuditEvent({
        id: nextAuditEventId + 1,
        eventType: "rework-created",
        entityType: "quality",
        entityId: "RW-2042-01",
        title: "Created rework order",
        detail: "Created from approved scrap event and linked to J-2042.",
        actor: "System",
        actorRole: "Automation",
        timestamp: formatDemoTimestamp(),
        severity: "Automation"
      });

      return appendAuditEventToState(
        appendAuditEventToState(reworkState, approvedEvent),
        reworkCreatedEvent
      );
    });
  }, []);

  const createPurchaseRequestPR3091 = useCallback(() => {
    setState((current) => {
      if (current.purchaseRequests["PR-3091"]?.exists) {
        return current;
      }

      const nextAuditEventId = createNextAuditEventId(current.auditEvents);
      const prState = demoWorkflowReducer(current, { type: "CREATE_PURCHASE_REQUEST_PR3091" });
      const purchaseRequestEvent = createDemoAuditEvent({
        id: nextAuditEventId,
        eventType: "purchase-request-created",
        entityType: "purchaseRequest",
        entityId: "PR-3091",
        title: "Created purchase request",
        detail: "50 sheets requested from Midwest Metals Supply for Job J-2099.",
        actor: "Priya Mehta",
        actorRole: "Purchasing",
        timestamp: formatDemoTimestamp(),
        severity: "Approval"
      });
      const jobMaterialStatusEvent = createDemoAuditEvent({
        id: nextAuditEventId + 1,
        eventType: "job-material-status-updated",
        entityType: "job",
        entityId: "J-2099",
        title: "Updated job material status",
        detail: "Status remains Waiting on Material, purchase request linked.",
        actor: "System",
        actorRole: "Automation",
        timestamp: formatDemoTimestamp(),
        severity: "Automation"
      });

      return appendAuditEventToState(
        appendAuditEventToState(prState, purchaseRequestEvent),
        jobMaterialStatusEvent
      );
    });
  }, []);

  const generateCustomerReportJ2035 = useCallback(() => {
    setState((current) => {
      if (current.reports["J-2035-CUSTOMER-STATUS"]?.exists) {
        return current;
      }

      const nextAuditEventId = createNextAuditEventId(current.auditEvents);
      const reportState = demoWorkflowReducer(current, { type: "GENERATE_CUSTOMER_REPORT_J2035" });
      const reportGeneratedEvent = createDemoAuditEvent({
        id: nextAuditEventId,
        eventType: "customer-report-generated",
        entityType: "report",
        entityId: "RPT-J-2035-CUSTOMER",
        title: "Generated customer status report",
        detail: "Customer-facing report created.",
        actor: "Customer Service",
        actorRole: "Customer Service Representative",
        timestamp: formatDemoTimestamp(),
        severity: "Info"
      });
      const reportSavedEvent = createDemoAuditEvent({
        id: nextAuditEventId + 1,
        eventType: "customer-report-saved",
        entityType: "report",
        entityId: "RPT-J-2035-CUSTOMER",
        title: "Saved report to customer record",
        detail: "Customer-safe status report for J-2035 saved.",
        actor: "System",
        actorRole: "Automation",
        timestamp: formatDemoTimestamp(),
        severity: "Success"
      });

      return appendAuditEventToState(
        appendAuditEventToState(reportState, reportGeneratedEvent),
        reportSavedEvent
      );
    });
  }, []);

  const resetDemoState = useCallback(() => {
    setState(demoWorkflowInitialState);
    clearDemoWorkflowState();
  }, []);

  const value = useMemo<DemoStateContextValue>(
    () => ({
      state,
      dispatch,
      resetDemoState,
      approveQuoteQ1003,
      convertQuoteQ1003,
      approveScrapJ2042,
      createPurchaseRequestPR3091,
      generateCustomerReportJ2035
    }),
    [
      approveQuoteQ1003,
      approveScrapJ2042,
      convertQuoteQ1003,
      createPurchaseRequestPR3091,
      dispatch,
      generateCustomerReportJ2035,
      resetDemoState,
      state
    ]
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState() {
  const value = useContext(DemoStateContext);
  if (!value) {
    throw new Error("useDemoState must be used within a DemoStateProvider");
  }
  return value;
}
