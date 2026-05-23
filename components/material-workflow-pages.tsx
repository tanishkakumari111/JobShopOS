"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AuditPanel } from "@/components/audit-panel";
import { DataTableShell } from "@/components/data-table-shell";
import { EntityLink } from "@/components/entity-link";
import { MetricCard } from "@/components/metric-card";
import { RiskAlert } from "@/components/risk-alert";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { TimelineShell } from "@/components/timeline-shell";
import { useDemoState } from "@/components/demo-state-provider";
import {
  auditEvents,
  getBlockedJobsByMaterialShortage,
  getMaterialBySku,
  getMaterialImpactTimeline,
  getMaterialReservationBreakdown,
  getMaterialRows,
  getMaterialSupplierPanel,
  getMaterialsSummary,
  getPurchaseRequestById,
  getPurchaseRequestState,
  materialImpactTimeline,
  materials,
  purchaseRequestState,
  purchaseRequests,
  pr3091AuditTrail,
  jobs
} from "@/lib/demo-data";
import { getEffectiveAuditEvents, getEffectiveJob, getEffectivePurchaseRequest } from "@/lib/demo-state";
import { cn } from "@/lib/utils";

function useMaterialWorkflowState() {
  const { state, createPurchaseRequestPR3091 } = useDemoState();
  const effectiveJobs = useMemo(() => jobs.map((job) => getEffectiveJob(job, state)), [state]);
  const effectivePurchaseRequest = getEffectivePurchaseRequest(
    getPurchaseRequestById("PR-3091", purchaseRequests)!,
    state
  );
  const runtimePurchaseRequestCreated = Boolean(state.purchaseRequests["PR-3091"]?.exists);
  const effectiveAuditEvents = getEffectiveAuditEvents(auditEvents, state);
  const material = getMaterialBySku("AL-6061-PLT-0.375", materials)!;

  return {
    state,
    createPurchaseRequestPR3091,
    effectiveJobs,
    effectivePurchaseRequest,
    runtimePurchaseRequestCreated,
    effectiveAuditEvents,
    material
  };
}

export function MaterialDashboardView() {
  const { effectiveJobs, effectivePurchaseRequest, runtimePurchaseRequestCreated, material } = useMaterialWorkflowState();
  const summary = getMaterialsSummary(materials, effectiveJobs, [effectivePurchaseRequest]);
  const blockedJobs = getBlockedJobsByMaterialShortage(effectiveJobs, materials);
  const rows = getMaterialRows(materials, effectiveJobs).map((row) =>
    row.sku === material.sku
      ? {
          ...row,
          status: runtimePurchaseRequestCreated ? "Purchase Requested" : "Blocked Job",
          action: runtimePurchaseRequestCreated ? "View purchase request" : "View job impact",
          href: runtimePurchaseRequestCreated ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact"
        }
      : row
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={runtimePurchaseRequestCreated ? "Purchase Requested" : "Waiting on Material"} />
            <SeverityBadge severity={runtimePurchaseRequestCreated ? "Approval" : "Critical"} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Materials Dashboard</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            Now we move from production readiness to inventory readiness. JobShop OS shows exactly which jobs are blocked by material shortages before the schedule breaks.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Materials below reorder point" value={`${summary.materialsBelowReorderPoint}`} detail="Inventory watch list" tone="amber" />
        <MetricCard label="Jobs blocked by shortage" value={`${summary.jobsBlockedByShortage}`} detail={blockedJobs.map((job) => job.jobId).join(", ")} tone="rose" />
        <MetricCard label="Open purchase requests" value={`${summary.openPurchaseRequests}`} detail="Submitted procurement work" tone="blue" />
        <MetricCard label="Incoming POs this week" value={`${summary.incomingPosThisWeek}`} detail="Expected supply flow" tone="emerald" />
        <MetricCard label="Reserved inventory value" value={`$${summary.reservedInventoryValue.toLocaleString()}`} detail="Held against active jobs" tone="slate" />
        <MetricCard label="Critical shortages" value={`${summary.criticalShortages}`} detail="Blocked jobs and schedule risk" tone="rose" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <RiskAlert
            severity={runtimePurchaseRequestCreated ? "Success" : "Critical"}
            title={runtimePurchaseRequestCreated ? "J-2099 now has a purchase request linked." : "J-2099 is blocked by a 44-sheet shortage."}
            description={
              runtimePurchaseRequestCreated
                ? "Material is still waiting on supplier confirmation, but PR-3091 is open and tied back to the blocked job."
                : "44 sheets of Aluminum Plate 6061 are required before CNC Mill can begin."
            }
            href={runtimePurchaseRequestCreated ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact"}
            actionLabel={runtimePurchaseRequestCreated ? "View purchase request" : "View job impact"}
          />

          <DataTableShell title="Materials table" subtitle="Shortage signal and linked jobs are visible before the schedule slips.">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">SKU</th>
                  <th className="px-4 py-2.5 font-semibold">Material name</th>
                  <th className="px-4 py-2.5 font-semibold">On hand</th>
                  <th className="px-4 py-2.5 font-semibold">Reserved</th>
                  <th className="px-4 py-2.5 font-semibold">Available</th>
                  <th className="px-4 py-2.5 font-semibold">Reorder point</th>
                  <th className="px-4 py-2.5 font-semibold">Shortage</th>
                  <th className="px-4 py-2.5 font-semibold">Supplier</th>
                  <th className="px-4 py-2.5 font-semibold">Affected jobs</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.sku} className={cn(row.sku === material.sku && "bg-rose-50/70")}>
                    <td className="px-4 py-3">
                      <EntityLink href={row.href}>{row.sku}</EntityLink>
                    </td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.onHand}</td>
                    <td className="px-4 py-3">{row.reserved}</td>
                    <td className="px-4 py-3">{row.available}</td>
                    <td className="px-4 py-3">{row.reorderPoint}</td>
                    <td className="px-4 py-3 font-semibold text-rose-700">{row.shortage}</td>
                    <td className="px-4 py-3">{row.supplier}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.affectedJobIds.map((jobId) => (
                          <EntityLink
                            key={jobId}
                            href={jobId === "J-2099" ? "/jobs/j-2099/material-impact" : jobId === "J-2035" ? "/jobs/j-2035" : "/jobs"}
                          >
                            {jobId}
                          </EntityLink>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge label={runtimePurchaseRequestCreated ? "Purchase Requested" : "Shortage"} />
                        <StatusBadge label="Blocked Job" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EntityLink href={runtimePurchaseRequestCreated ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact"}>
                        {row.action}
                      </EntityLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableShell>
        </div>

        <div className="space-y-4">
          <TimelineShell title="Incoming and purchase request preview" subtitle="The shortage becomes a seeded purchasing record.">
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <EntityLink href="/purchase-requests/pr-3091">PR-3091</EntityLink>
                <StatusBadge label={effectivePurchaseRequest.status} />
              </div>
              <div className="grid gap-2 text-sm text-slate-700">
                <div>
                  Material: <span className="font-medium text-slate-950">{material.sku}</span>
                </div>
                <div>
                  Quantity: <span className="font-medium text-slate-950">{effectivePurchaseRequest.quantity} sheets</span>
                </div>
                <div>
                  Supplier: <span className="font-medium text-slate-950">{effectivePurchaseRequest.supplier}</span>
                </div>
                <div>
                  Linked job: <EntityLink href="/jobs/j-2099/material-impact">J-2099</EntityLink>
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-600">
                {runtimePurchaseRequestCreated
                  ? "Purchase request PR-3091 is active and tied back to the blocked job."
                  : "Seeded demo preview: the purchase request is staged for the founder demo path."}
              </div>
            </div>
          </TimelineShell>

          <TimelineShell title="Demo path" subtitle="Next: Purchase Request - PR-3091">
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm leading-6 text-slate-700">
                The shortage is resolved by creating a purchase request that keeps traceability tied to the blocked job.
              </div>
              <Link
                href={runtimePurchaseRequestCreated ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact"}
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {runtimePurchaseRequestCreated ? "View PR-3091" : "Continue to J-2099 impact"}
              </Link>
            </div>
          </TimelineShell>
        </div>
      </div>
    </div>
  );
}

export function MaterialDetailView() {
  const { effectiveJobs, effectivePurchaseRequest, runtimePurchaseRequestCreated, material } = useMaterialWorkflowState();
  const rows = getBlockedJobsByMaterialShortage(effectiveJobs, materials);
  const breakdown = getMaterialReservationBreakdown(materials, effectiveJobs);
  const supplier = getMaterialSupplierPanel(materials);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <EntityLink href="/materials/al-6061-plt-0.375">AL-6061-PLT-0.375</EntityLink>
              <StatusBadge label={runtimePurchaseRequestCreated ? "Purchase Requested" : "Shortage"} />
              <StatusBadge label="Blocked Job" />
              <SeverityBadge severity="Critical" />
            </div>
            <div className="grid gap-x-4 gap-y-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
              <div>
                Material name: <span className="font-medium text-slate-950">{material.name}</span>
              </div>
              <div>
                Supplier: <span className="font-medium text-slate-950">{supplier.preferredSupplier}</span>
              </div>
              <div>
                Lead time: <span className="font-medium text-slate-950">{supplier.leadTimeBusinessDays} business days</span>
              </div>
              <div>
                Last updated: <span className="font-medium text-slate-950">{material.lastUpdated}</span>
              </div>
            </div>
          </div>
          <Link
            href={runtimePurchaseRequestCreated ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact"}
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {runtimePurchaseRequestCreated ? "View purchase request" : "View J-2099 job impact"}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="On hand" value={`${material.onHand} sheets`} detail="Physical inventory" tone="blue" />
        <MetricCard label="Reserved" value={`${material.reserved} sheets`} detail="Held for open jobs" tone="amber" />
        <MetricCard label="Available" value={`${material.available} sheets`} detail="Free for new work" tone="emerald" />
        <MetricCard label="Required by open jobs" value={`${material.requiredSheets} sheets`} detail="Driven by J-2099" tone="slate" />
        <MetricCard label="Shortage" value={`${material.shortage} sheets`} detail="Current gap" tone="rose" />
        <MetricCard label="Reorder point" value={`${material.reorderPoint ?? 20} sheets`} detail="Triggers replenishment" tone="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DataTableShell title="Affected jobs" subtitle="Jobs that are blocked, reserved, or at risk because of the shortage.">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Job</th>
                <th className="px-4 py-2.5 font-semibold">Customer</th>
                <th className="px-4 py-2.5 font-semibold">Needs</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Due date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.jobId} className={cn(row.jobId === "J-2099" && "bg-rose-50/70")}>
                  <td className="px-4 py-3">
                    <EntityLink href={row.href}>{row.jobId}</EntityLink>
                  </td>
                  <td className="px-4 py-3">{row.customerName}</td>
                  <td className="px-4 py-3">{row.requiredSheets} sheets</td>
                  <td className="px-4 py-3">
                    {row.status === "blocked" ? (
                      <StatusBadge label="Blocked Job" />
                    ) : row.status === "reserved" ? (
                      <StatusBadge label="Reserved" />
                    ) : (
                      <SeverityBadge severity="Warning" />
                    )}
                  </td>
                  <td className="px-4 py-3">{row.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>

        <TimelineShell title="Reservation breakdown" subtitle="Where the sheets are currently allocated.">
          <div className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-700">{item.label}</span>
                <span className="font-medium text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </TimelineShell>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <TimelineShell title="Supplier panel" subtitle="The material can be replenished from the preferred supplier.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Preferred supplier</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{supplier.preferredSupplier}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Contact</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{supplier.contact}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Lead time</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{supplier.leadTimeBusinessDays} business days</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last purchase price</div>
              <div className="mt-2 text-sm font-medium text-slate-950">${supplier.lastPurchasePrice}/sheet</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Minimum order quantity</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{supplier.minimumOrderQuantity} sheets</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested order quantity</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{supplier.suggestedOrderQuantity} sheets</div>
            </div>
          </div>
        </TimelineShell>

        <TimelineShell
          title={runtimePurchaseRequestCreated ? "Linked purchase request" : "Purchase request preview"}
          subtitle="The shortage is tied to procurement so the shop can act without leaving the workflow."
        >
          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <EntityLink href="/purchase-requests/pr-3091">PR-3091</EntityLink>
              <StatusBadge label={effectivePurchaseRequest.status} />
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <div>
                Material: <span className="font-medium text-slate-950">{material.sku}</span>
              </div>
              <div>
                Quantity: <span className="font-medium text-slate-950">{effectivePurchaseRequest.quantity} sheets</span>
              </div>
              <div>
                Supplier: <span className="font-medium text-slate-950">{effectivePurchaseRequest.supplier}</span>
              </div>
              <div>
                Linked job: <EntityLink href="/jobs/j-2099/material-impact">{effectivePurchaseRequest.linkedJobId}</EntityLink>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-600">
              {runtimePurchaseRequestCreated
                ? "Purchase request PR-3091 is open and awaiting supplier confirmation."
                : "Seeded demo preview: this procurement record is part of the founder demo path."}
            </div>
          </div>
        </TimelineShell>
      </div>

      <div className="flex justify-end">
        <Link
          href="/jobs/j-2099/material-impact"
          className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          View J-2099 job impact
        </Link>
      </div>
    </div>
  );
}

export function MaterialImpactView() {
  const { effectiveJobs, runtimePurchaseRequestCreated, createPurchaseRequestPR3091, effectiveAuditEvents, material } =
    useMaterialWorkflowState();
  const job = effectiveJobs.find((entry) => entry.id === "J-2099");
  const supplier = getMaterialSupplierPanel(materials);
  const timeline = getMaterialImpactTimeline(materialImpactTimeline);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <EntityLink href="/jobs/j-2099/material-impact">J-2099</EntityLink>
              <StatusBadge label={job?.status ?? "Waiting on Material"} />
              <SeverityBadge severity="Critical" />
            </div>
            <div className="grid gap-x-4 gap-y-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
              <div>
                Customer: <span className="font-medium text-slate-950">{job?.customerName ?? "Apex Rail Components"}</span>
              </div>
              <div>
                Part: <span className="font-medium text-slate-950">{job?.part ?? "Mounting Plate Set Rev C"}</span>
              </div>
              <div>
                Quantity: <span className="font-medium text-slate-950">{job?.quantity ?? 120}</span>
              </div>
              <div>
                Due date: <span className="font-medium text-slate-950">{job?.dueDate ?? "within 4 business days"}</span>
              </div>
              <div>
                Risk: <span className="font-medium text-rose-700">{job?.risk ?? "High"}</span>
              </div>
              <div>
                Blocked step: <span className="font-medium text-slate-950">{job?.blockedStep ?? "CNC Mill"}</span>
              </div>
              <div>
                Work center: <span className="font-medium text-slate-950">{job?.workCenter ?? "CNC Mill"}</span>
              </div>
              <div>
                Current status: <span className="font-medium text-slate-950">{job?.status ?? "Waiting on Material"}</span>
              </div>
            </div>
          </div>
          {runtimePurchaseRequestCreated ? (
            <Link
              href="/purchase-requests/pr-3091"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              View purchase request
            </Link>
          ) : (
            <button
              type="button"
              onClick={createPurchaseRequestPR3091}
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Create purchase request
            </button>
          )}
        </div>
      </div>

      <RiskAlert
        severity={runtimePurchaseRequestCreated ? "Success" : "Critical"}
        title={
          runtimePurchaseRequestCreated ? "Purchase request PR-3091 is linked to J-2099." : "Production blocked by material shortage"
        }
        description={
          runtimePurchaseRequestCreated
            ? "Material is still waiting on supplier confirmation, but the procurement action now exists."
            : "The shortage is 44 sheets and CNC Mill cannot start until material receipt clears the queue."
        }
        href="/purchase-requests/pr-3091"
        actionLabel={runtimePurchaseRequestCreated ? "View purchase request" : "Create purchase request"}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <TimelineShell title="Impact panel" subtitle="Shortage ripples into production readiness.">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Required material</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{material.sku}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Required quantity</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{material.requiredSheets} sheets</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Available quantity</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{material.available} sheets</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Shortage</div>
                <div className="mt-2 text-sm font-medium text-rose-700">{material.shortage} sheets</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Supplier lead time</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{supplier.leadTimeBusinessDays} business days</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Scheduler note</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">
                  CNC slot may need to be moved if material arrives after planned start.
                </div>
              </div>
            </div>
          </TimelineShell>

          <TimelineShell title="Inventory breakdown" subtitle="Reservation math that explains the blocked job.">
            <div className="space-y-3">
              {getMaterialReservationBreakdown(materials, effectiveJobs).map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-medium text-slate-950">{item.value}</span>
                </div>
              ))}
            </div>
          </TimelineShell>
        </div>

        <div className="space-y-4">
          <TimelineShell title="Timeline" subtitle="Production and procurement events leading to the shortage.">
            <div className="space-y-3">
              {[
                ...timeline,
                ...(runtimePurchaseRequestCreated
                  ? [
                      {
                        title: "Purchase request created",
                        detail: "PR-3091 now links the shortage back to purchasing.",
                        timestamp: "Today 11:12 AM",
                        severity: "Success" as const
                      },
                      {
                        title: "Job material status updated",
                        detail: "J-2099 remains waiting on material while the request routes.",
                        timestamp: "Today 11:13 AM",
                        severity: "Automation" as const
                      }
                    ]
                  : [])
              ].map((entry) => (
                <div key={`${entry.timestamp}-${entry.title}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-950">{entry.title}</div>
                    <SeverityBadge severity={entry.severity} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{entry.detail}</p>
                  <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{entry.timestamp}</div>
                </div>
              ))}
            </div>
          </TimelineShell>

          <TimelineShell title="Supplier panel" subtitle="The same supplier profile feeds the purchase request screen.">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Preferred supplier</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{supplier.preferredSupplier}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Lead time</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{supplier.leadTimeBusinessDays} business days</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last purchase price</div>
                <div className="mt-2 text-sm font-medium text-slate-950">${supplier.lastPurchasePrice}/sheet</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested order quantity</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{supplier.suggestedOrderQuantity} sheets</div>
              </div>
            </div>
          </TimelineShell>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {runtimePurchaseRequestCreated ? (
          <Link
            href="/purchase-requests/pr-3091"
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View purchase request
          </Link>
        ) : (
          <button
            type="button"
            onClick={createPurchaseRequestPR3091}
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create purchase request
          </button>
        )}
      </div>

      <AuditPanel
        title="Audit trail"
        subtitle="Standardized purchasing events link the request back to production readiness."
        items={
          runtimePurchaseRequestCreated
            ? effectiveAuditEvents
                .filter((event) => event.entityId === "PR-3091" || event.entityId === "J-2099")
                .slice(-2)
                .map((event) => ({
                  actor: event.actor,
                  actorRole: event.actorRole,
                  event: event.title,
                  time: event.timestamp,
                  detail: event.detail,
                  severity: event.severity,
                  entityHref: event.entityType === "purchaseRequest" ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact",
                  entityLabel: event.entityId,
                  result: event.detail,
                  notes: event.detail,
                  entityType: event.entityType
                }))
            : pr3091AuditTrail.map((entry) => ({
                actor: entry.actor,
                actorRole: entry.role,
                event: entry.action,
                time: entry.timestamp,
                detail: entry.result,
                severity: entry.severity,
                entityHref: entry.entityType === "PurchaseRequest" ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact",
                entityLabel: entry.entityId,
                result: entry.result,
                notes: entry.notes,
                entityType: entry.entityType
              }))
        }
      />
    </div>
  );
}

export function PurchaseRequestView() {
  const { state } = useDemoState();
  const effectivePurchaseRequest = getEffectivePurchaseRequest(
    getPurchaseRequestById("PR-3091", purchaseRequests)!,
    state
  );
  const runtimePurchaseRequestCreated = Boolean(state.purchaseRequests["PR-3091"]?.exists);
  const auditRecords = runtimePurchaseRequestCreated
    ? getEffectiveAuditEvents(auditEvents, state).filter((event) => event.entityId === "PR-3091" || event.entityId === "J-2099")
    : pr3091AuditTrail;
  const purchaseState = getPurchaseRequestState(purchaseRequestState);

  return (
    <div className="space-y-4">
      <div className={cn("rounded-md border p-4 shadow-none", runtimePurchaseRequestCreated ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", runtimePurchaseRequestCreated ? "text-emerald-700" : "text-slate-500")}>
              {runtimePurchaseRequestCreated ? "Purchase request created" : "Preview from seeded demo"}
            </div>
            <h3 className={cn("text-[15px] font-semibold", runtimePurchaseRequestCreated ? "text-emerald-950" : "text-slate-950")}>
              {runtimePurchaseRequestCreated
                ? "Purchase request PR-3091 created and linked to Job J-2099."
                : "Seeded demo preview: create the purchase request from the job impact screen."}
            </h3>
            <p className={cn("max-w-3xl text-sm leading-6", runtimePurchaseRequestCreated ? "text-emerald-900/80" : "text-slate-600")}>
              {runtimePurchaseRequestCreated
                ? "The blocked job now has a procurement action attached to it instead of a manual spreadsheet chase."
                : "The founder demo keeps the shortage visible so purchasing can act on the blocked job."}
            </p>
          </div>
          <StatusBadge label={effectivePurchaseRequest.status} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Purchase request" value={effectivePurchaseRequest.id} detail="Linked to J-2099" tone="blue" />
        <MetricCard label="Material" value={effectivePurchaseRequest.materialSku} detail="AL-6061-PLT-0.375" tone="slate" />
        <MetricCard label="Quantity" value={`${effectivePurchaseRequest.quantity} sheets`} detail="Supplier order quantity" tone="amber" />
        <MetricCard label="Estimated total" value={`$${effectivePurchaseRequest.estimatedTotal.toLocaleString()}`} detail={`Unit cost $${effectivePurchaseRequest.unitCost}/sheet`} tone="emerald" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DataTableShell title="Purchase request card" subtitle="Seeded purchasing record tied back to the blocked job.">
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase Request</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{effectivePurchaseRequest.id}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Material</div>
              <EntityLink href="/materials/al-6061-plt-0.375" className="mt-2 inline-flex">
                {effectivePurchaseRequest.materialSku}
              </EntityLink>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Supplier</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{effectivePurchaseRequest.supplier}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quantity</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{effectivePurchaseRequest.quantity} sheets</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Unit cost</div>
              <div className="mt-2 text-sm font-medium text-slate-950">${effectivePurchaseRequest.unitCost}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Estimated total</div>
              <div className="mt-2 text-sm font-medium text-slate-950">${effectivePurchaseRequest.estimatedTotal.toLocaleString()}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Linked job</div>
              <EntityLink href="/jobs/j-2099/material-impact" className="mt-2 inline-flex">
                {effectivePurchaseRequest.linkedJobId}
              </EntityLink>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Buyer</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{effectivePurchaseRequest.buyer}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
              <div className="mt-2">
                <StatusBadge label={effectivePurchaseRequest.status} />
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</div>
              <div className="mt-2">
                <SeverityBadge severity={effectivePurchaseRequest.priority === "High" ? "Critical" : "Approval"} />
              </div>
            </div>
          </div>
        </DataTableShell>

        <TimelineShell title="Before / after state" subtitle="The materials and job state stay traceable through the request.">
          <div className="space-y-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Before</div>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <div>
                  Material status: <span className="font-medium text-slate-950">{purchaseState.before.materialStatus}</span>
                </div>
                <div>
                  Job J-2099: <span className="font-medium text-slate-950">{purchaseState.before.jobStatus}</span>
                </div>
                <div>
                  Action needed: <span className="font-medium text-slate-950">{purchaseState.before.actionNeeded}</span>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">After</div>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <div>
                  Material status: <span className="font-medium text-slate-950">{purchaseState.after.materialStatus}</span>
                </div>
                <div>
                  Job J-2099: <span className="font-medium text-slate-950">{purchaseState.after.jobStatus}</span>
                </div>
                <div>
                  Next step: <span className="font-medium text-slate-950">{purchaseState.after.nextStep}</span>
                </div>
              </div>
            </div>
          </div>
        </TimelineShell>
      </div>

      <AuditPanel
        title="Audit trail"
        subtitle="Standardized purchasing events link the request back to production readiness."
        items={auditRecords.map((entry) =>
          "action" in entry
            ? {
                actor: entry.actor,
                actorRole: entry.role,
                event: entry.action,
                time: entry.timestamp,
                detail: entry.result,
                severity: entry.severity,
                entityHref: entry.entityType === "PurchaseRequest" ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact",
                entityLabel: entry.entityId,
                result: entry.result,
                notes: entry.notes,
                entityType: entry.entityType
              }
            : {
                actor: entry.actor,
                actorRole: entry.actorRole,
                event: entry.title,
                time: entry.timestamp,
                detail: entry.detail,
                severity: entry.severity,
                entityHref: entry.entityType === "purchaseRequest" ? "/purchase-requests/pr-3091" : "/jobs/j-2099/material-impact",
                entityLabel: entry.entityId,
                result: entry.detail,
                notes: entry.detail,
                entityType: entry.entityType
              }
        )}
      />

      <div className="flex justify-end">
        <Link
          href={runtimePurchaseRequestCreated ? "/quotes/q-1003" : "/jobs/j-2099/material-impact"}
          className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {runtimePurchaseRequestCreated ? "Review high-value quote approval Q-1003" : "Create purchase request from J-2099 impact"}
        </Link>
      </div>
    </div>
  );
}
