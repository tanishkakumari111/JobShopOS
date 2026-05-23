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
import { auditEvents, defectReasonBreakdownRows, getQualitySummary, inspectionQueueRows, j2042QualityTimeline, j2042ScrapEventDetail, jobs, reworkOrders } from "@/lib/demo-data";
import { getEffectiveAuditEvents, getEffectiveJob, getEffectiveReworkOrder } from "@/lib/demo-state";
import { cn } from "@/lib/utils";

function getQualityAuditHref(entityId: string) {
  if (entityId === "J-2042") {
    return "/quality/j-2042/scrap-approval";
  }

  if (entityId === "RW-2042-01") {
    return "/quality/j-2042/rework-created";
  }

  return "/audit";
}

export function QualityDashboardView() {
  const { state } = useDemoState();
  const effectiveJobs = useMemo(() => jobs.map((job) => getEffectiveJob(job, state)), [state]);
  const effectiveReworkOrders = useMemo(() => reworkOrders.map((order) => getEffectiveReworkOrder(order, state)), [state]);
  const effectiveAuditEvents = getEffectiveAuditEvents(auditEvents, state);
  const summary = getQualitySummary(effectiveJobs, effectiveReworkOrders, inspectionQueueRows);
  const j2042 = effectiveJobs.find((job) => job.id === "J-2042");
  const hasRuntimeApproval = j2042?.status === "Rework";
  const inspectionQueue = inspectionQueueRows.map((row) =>
    row.jobId === "J-2042"
      ? {
          ...row,
          status: j2042?.status === "Rework" ? "Rework Created" : "Scrap Approval Required",
          action: j2042?.status === "Rework" ? "View rework" : "Review scrap approval",
          href: j2042?.status === "Rework" ? "/quality/j-2042/rework-created" : "/quality/j-2042/scrap-approval"
        }
      : row
  );
  const recentQualityEvents = useMemo(
    () =>
      [
        ...j2042QualityTimeline,
        ...effectiveAuditEvents
          .filter((event) => event.entityId === "J-2042" || event.entityId === "RW-2042-01")
          .slice(-2)
          .map((event) => ({
            title: event.title,
            detail: event.detail,
            timestamp: event.timestamp,
            severity: event.severity
          }))
      ].slice(-5),
    [effectiveAuditEvents]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={hasRuntimeApproval ? "Rework" : "Scrap Approval Required"} />
            <SeverityBadge severity={hasRuntimeApproval ? "Success" : "Critical"} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Quality Dashboard</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            Now we move from normal production execution to an exception. JobShop OS detects when scrap exceeds tolerance and prevents the issue from being buried.
          </p>
        </div>
      </div>

      <MetricCard
        label="Open inspections"
        value={`${summary.openInspections}`}
        detail="Inspection queue activity"
        tone="blue"
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Open inspections" value={`${summary.openInspections}`} detail="Inspection queue activity" tone="blue" />
        <MetricCard label="Failed inspections" value={`${summary.failedInspections}`} detail="Jobs that need disposition" tone="rose" />
        <MetricCard label="Scrap above tolerance" value={`${summary.scrapAboveTolerance}`} detail="Jobs blocked on approval" tone="amber" />
        <MetricCard label="Rework orders open" value={`${summary.reworkOrdersOpen}`} detail="Controlled follow-up work" tone="rose" />
        <MetricCard label="Jobs waiting for sign-off" value={`${summary.jobsWaitingForSignOff}`} detail="Supervisor or inspector action" tone="amber" />
        <MetricCard label="Average first-pass yield" value={`${summary.averageFirstPassYield.toFixed(1)}%`} detail="Based on seeded job records" tone="emerald" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <RiskAlert
            severity={hasRuntimeApproval ? "Success" : "Critical"}
            title={hasRuntimeApproval ? "J-2042 is now in rework." : "J-2042 requires immediate scrap approval"}
            description={
              hasRuntimeApproval
                ? "Scrap above tolerance was approved and the job is now controlled through rework."
                : "Scrap exceeds tolerance. Supervisor approval required before production can continue."
            }
            href={hasRuntimeApproval ? "/quality/j-2042/rework-created" : "/quality/j-2042/scrap-approval"}
            actionLabel={hasRuntimeApproval ? "View rework" : "Review scrap approval"}
          />

          <DataTableShell title="Inspection queue" subtitle="Primary exception plus a few supporting rows from the seeded quality record.">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Job</th>
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-4 py-2.5 font-semibold">Part</th>
                  <th className="px-4 py-2.5 font-semibold">Current step</th>
                  <th className="px-4 py-2.5 font-semibold">Inspector</th>
                  <th className="px-4 py-2.5 font-semibold">Result</th>
                  <th className="px-4 py-2.5 font-semibold">Scrap rate</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Due date</th>
                  <th className="px-4 py-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inspectionQueue.map((row) => (
                  <tr key={row.jobId} className={cn(row.jobId === "J-2042" && "bg-rose-50/70")}>
                    <td className="px-4 py-3">
                      <EntityLink href={row.href}>{row.jobId}</EntityLink>
                    </td>
                    <td className="px-4 py-3">{row.customerName}</td>
                    <td className="px-4 py-3">{row.part}</td>
                    <td className="px-4 py-3">{row.currentStep}</td>
                    <td className="px-4 py-3">{row.inspector}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={row.result} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px]">{row.scrapRate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={row.status} />
                    </td>
                    <td className="px-4 py-3">{row.dueDate}</td>
                    <td className="px-4 py-3">
                      <Link href={row.href} className="text-sm font-medium text-slate-950 underline underline-offset-4">
                        {row.action}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableShell>
        </div>

        <div className="space-y-4">
          <TimelineShell title="Defect reason breakdown" subtitle="Most common defect families contributing to scrap and rework.">
            <div className="space-y-3">
              {defectReasonBreakdownRows.map((reason) => (
                <div key={reason.reason} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-950">{reason.reason}</span>
                    <span className="font-mono text-slate-500">
                      {reason.count} / {reason.percentage}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-rose-500" style={{ width: `${reason.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </TimelineShell>

          <TimelineShell title="Recent quality events" subtitle="Timeline from inspection failure through controlled rework.">
            <div className="space-y-3">
              {recentQualityEvents.map((entry) => (
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

          {hasRuntimeApproval ? (
            <TimelineShell title="Runtime update" subtitle="The seeded exception now has a browser-local resolution.">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                Rework order RW-2042-01 is active and linked to Job J-2042.
              </div>
            </TimelineShell>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ScrapApprovalView() {
  const { state, approveScrapJ2042 } = useDemoState();
  const effectiveJobs = useMemo(() => jobs.map((job) => getEffectiveJob(job, state)), [state]);
  const effectiveReworkOrders = useMemo(() => reworkOrders.map((order) => getEffectiveReworkOrder(order, state)), [state]);
  const effectiveAuditEvents = getEffectiveAuditEvents(auditEvents, state);
  const job = effectiveJobs.find((entry) => entry.id === "J-2042");
  const rework = effectiveReworkOrders.find((entry) => entry.id === "RW-2042-01");
  const approved = job?.status === "Rework";
  const scrapRate = job?.scrapRate ?? 0.1;
  const toleranceRate = job?.allowedTolerance ?? 0.05;
  const auditRecords = effectiveAuditEvents.filter((event) => event.entityId === "J-2042" || event.entityId === "RW-2042-01");

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <EntityLink href="/jobs/j-2042">J-2042</EntityLink>
              <StatusBadge label={job?.status ?? "Scrap Approval Required"} />
              <SeverityBadge severity="Critical" />
            </div>
            <div className="grid gap-x-4 gap-y-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
              <div>Customer: <span className="font-medium text-slate-950">{job?.customerName ?? "Northline Fabrication"}</span></div>
              <div>Part: <span className="font-medium text-slate-950">{job?.part ?? "Bracket Assembly Rev B"}</span></div>
              <div>Quantity: <span className="font-medium text-slate-950">{job?.quantity ?? 200}</span></div>
              <div>Completed quantity: <span className="font-medium text-slate-950">{job?.completedQuantity ?? 180}</span></div>
              <div>Scrap quantity: <span className="font-medium text-slate-950">{job?.scrapQuantity ?? 18}</span></div>
              <div>Scrap rate: <span className="font-medium text-rose-700">{Math.round(scrapRate * 100)}%</span></div>
              <div>Allowed tolerance: <span className="font-medium text-slate-950">{Math.round(toleranceRate * 100)}%</span></div>
              <div>Work center: <span className="font-medium text-slate-950">{job?.workCenter ?? "Welding"}</span></div>
              <div>Current routing step: <span className="font-medium text-slate-950">{job?.currentStep ?? "Weld"}</span></div>
              <div>Assigned operator: <span className="font-medium text-slate-950">Marco Singh</span></div>
              <div>Supervisor: <span className="font-medium text-slate-950">Dana Brooks</span></div>
              <div>Due date risk: <span className="font-medium text-rose-700">High</span></div>
            </div>
          </div>

          {approved ? (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
            >
              Rework already created
            </button>
          ) : (
            <button
              type="button"
              onClick={approveScrapJ2042}
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Approve scrap and create rework
            </button>
          )}
        </div>
      </div>

      <RiskAlert
        severity={approved ? "Success" : "Critical"}
        title={approved ? "Scrap approval recorded." : "Scrap approval is required"}
        description={
          approved
            ? "The job is now controlled through rework routing instead of an open scrap exception."
            : "Scrap rate is above the 5% tolerance. Production is blocked until a supervisor decision is recorded."
        }
        href={approved ? "/quality/j-2042/rework-created" : "/quality/j-2042/scrap-approval"}
        actionLabel={approved ? "View rework" : "Review scrap approval"}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <TimelineShell title="Scrap event details" subtitle="Recorded by the operator and reviewed by quality.">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Reported by operator</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{j2042ScrapEventDetail.reportedBy}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Reported at</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{j2042ScrapEventDetail.reportedAt}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Reason</div>
                <div className="mt-2 text-sm font-medium text-slate-950">{j2042ScrapEventDetail.reason}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operator note</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{j2042ScrapEventDetail.operatorNote}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspection note</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{j2042ScrapEventDetail.inspectionNote}</div>
              </div>
            </div>
          </TimelineShell>

          <DataTableShell title="Decision panel" subtitle="Static supervisor decision UI for the quality exception.">
            <div className="space-y-3 p-4">
              {[
                "Approve scrap and create rework",
                "Reject scrap log and return to operator",
                "Hold job for engineering review"
              ].map((option) => {
                const selected = option === "Approve scrap and create rework";
                return (
                  <div
                    key={option}
                    className={cn(
                      "rounded-md border p-3",
                      selected ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{option}</div>
                        {selected ? (
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Supervisor note: Approve scrap event. Create weld rework and inspect fixture setup before continuing.
                          </p>
                        ) : null}
                      </div>
                      {selected ? <StatusBadge label="Selected" /> : <StatusBadge label="Pending" />}
                    </div>
                  </div>
                );
              })}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Decision</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">Approve scrap and create rework</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rework required</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">Yes</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rework routing step</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">{rework?.nextStep ?? "Weld Rework"}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Estimated rework hours</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">{rework?.estimatedHours ?? 6}h</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">{rework?.priority ?? "High"}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Supervisor note</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    Approve scrap event. Create weld rework and inspect fixture setup before continuing.
                  </div>
                </div>
              </div>
            </div>
          </DataTableShell>
        </div>

        <div className="space-y-4">
          <TimelineShell title="Rework preview" subtitle="Controlled follow-up that links the quality exception to the new job path.">
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <EntityLink href="/quality/j-2042/rework-created">RW-2042-01</EntityLink>
                <StatusBadge label={rework?.status ?? "Open"} />
              </div>
              <div className="grid gap-2 text-sm text-slate-700">
                <div>Linked job: <span className="font-medium text-slate-950">{rework?.linkedJobId ?? "J-2042"}</span></div>
                <div>Step: <span className="font-medium text-slate-950">{rework?.nextStep ?? "Weld Rework"}</span></div>
                <div>Work center: <span className="font-medium text-slate-950">{rework?.workCenter ?? "Welding"}</span></div>
                <div>Estimated hours: <span className="font-medium text-slate-950">{rework?.estimatedHours ?? 6}h</span></div>
                <div>Priority: <span className="font-medium text-slate-950">{rework?.priority ?? "High"}</span></div>
                <div>Supervisor: <span className="font-medium text-slate-950">{rework?.supervisor ?? "Dana Brooks"}</span></div>
              </div>
            </div>
          </TimelineShell>

          <TimelineShell title="Permission cue" subtitle="Who can act on the quality exception.">
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-950">Supervisor approval required</div>
              <div className="grid gap-2">
                <div>Operator can log scrap</div>
                <div>Shop Supervisor approves scrap/rework</div>
                <div>Quality Inspector records inspection</div>
                <div>Owner / GM can view exception status</div>
              </div>
            </div>
          </TimelineShell>

          <AuditPanel
            title="Audit events"
            subtitle="The quality trace captures both the quality decision and the rework follow-up."
            items={auditRecords.map((event) => ({
              actor: event.actor,
              actorRole: event.actorRole,
              event: event.title,
              time: event.timestamp,
              detail: event.detail,
              severity: event.severity,
              entityHref: getQualityAuditHref(event.entityId),
              entityLabel: event.entityId,
              result: event.detail,
              notes: event.detail,
              entityType: event.entityType
            }))}
          />
        </div>
      </div>

      {!approved ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-none">
          Press the supervisor approval button to create the browser-local rework state.
        </div>
      ) : null}
    </div>
  );
}

export function ReworkCreatedView() {
  const { state } = useDemoState();
  const effectiveJobs = useMemo(() => jobs.map((job) => getEffectiveJob(job, state)), [state]);
  const effectiveReworkOrders = useMemo(() => reworkOrders.map((order) => getEffectiveReworkOrder(order, state)), [state]);
  const effectiveAuditEvents = getEffectiveAuditEvents(auditEvents, state);
  const job = effectiveJobs.find((entry) => entry.id === "J-2042");
  const rework = effectiveReworkOrders.find((entry) => entry.id === "RW-2042-01");
  const approved = job?.status === "Rework";
  const auditRecords = effectiveAuditEvents.filter((event) => event.entityId === "J-2042" || event.entityId === "RW-2042-01");

  return (
    <div className="space-y-4">
      <div className={cn("rounded-md border p-4 shadow-none", approved ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {approved ? "Rework created" : "Preview from seeded demo"}
            </div>
            <h3 className="text-[15px] font-semibold text-slate-950">
              {approved
                ? "Rework order RW-2042-01 created and linked to Job J-2042."
                : "Seeded demo preview: approve scrap to create the rework order."}
            </h3>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {approved
                ? "The job is now controlled through rework routing instead of an open scrap exception."
                : "The seeded founder demo remains visible until the supervisor approval is recorded."}
            </p>
          </div>
          <StatusBadge label={approved ? "Rework Created" : "Preview"} />
        </div>
      </div>

      <MetricCard label="Job status" value={approved ? "Rework" : "Scrap Approval Required"} detail="Changed from Scrap Approval Required" tone={approved ? "rose" : "amber"} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Job status" value={approved ? "Rework" : "Scrap Approval Required"} detail="Changed from Scrap Approval Required" tone={approved ? "rose" : "amber"} />
        <MetricCard label="Scrap event" value={approved ? "Approved" : "Pending"} detail={approved ? "Supervisor decision recorded" : "Awaiting supervisor approval"} tone={approved ? "emerald" : "amber"} />
        <MetricCard label="Rework order" value={rework?.id ?? "RW-2042-01"} detail="Controlled follow-up routing" tone="blue" />
        <MetricCard label="Quality dashboard" value="Updated" detail="Exception counts recalculate" tone="emerald" />
      </div>

      {approved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          Rework order RW-2042-01 created and linked to Job J-2042.
        </div>
      ) : (
        <RiskAlert
          severity="Approval"
          title="Approve scrap first"
          description="This page is a seeded preview until the supervisor records the scrap disposition."
          href="/quality/j-2042/scrap-approval"
          actionLabel="Approve scrap first"
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <TimelineShell title="Rework order card" subtitle="Controlled follow-up linked back to the original job.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rework order</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.id ?? "RW-2042-01"}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Job</div>
              <EntityLink href="/jobs/j-2042" className="mt-2 inline-flex">
                {rework?.linkedJobId ?? "J-2042"}
              </EntityLink>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</div>
              <div className="mt-2 text-sm font-medium text-slate-950">Northline Fabrication</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Reason</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.reason ?? "Weld Porosity"}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Work center</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.workCenter ?? "Welding"}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Estimated hours</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.estimatedHours ?? 6}h</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.priority ?? "High"}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
              <div className="mt-2"><StatusBadge label={rework?.status ?? "Open"} /></div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Assigned supervisor</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.supervisor ?? "Dana Brooks"}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Next step</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{rework?.nextStep ?? "Weld Rework"}</div>
            </div>
          </div>
        </TimelineShell>

        <div className="space-y-4">
          <TimelineShell title="Updated job timeline" subtitle="The exception is now a controlled production task.">
            <div className="space-y-3">
              {[
                { label: "Inspection failed", detail: "Sample failed visual weld inspection.", tone: "Critical" },
                { label: "Scrap logged", detail: "Marco Singh recorded 18 scrap units.", tone: "Warning" },
                { label: "Supervisor review required", detail: "Production blocked until a decision is recorded.", tone: "Approval" },
                { label: "Scrap approved", detail: "Dana Brooks approved the disposition.", tone: "Success" },
                { label: "Rework order created", detail: "RW-2042-01 linked to J-2042.", tone: "Automation" },
                { label: "Awaiting weld rework", detail: "Controlled routing is now active.", tone: "Info" }
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-slate-950">{item.label}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</div>
                  </div>
                  <StatusBadge label={item.tone} />
                </div>
              ))}
            </div>
          </TimelineShell>

          <AuditPanel
            title="Audit events"
            subtitle="The quality trace records both the supervisor decision and the rework creation."
            items={auditRecords.map((event) => ({
              actor: event.actor,
              actorRole: event.actorRole,
              event: event.title,
              time: event.timestamp,
              detail: event.detail,
              severity: event.severity,
              entityHref: getQualityAuditHref(event.entityId),
              entityLabel: event.entityId,
              result: event.detail,
              notes: event.detail,
              entityType: event.entityType
            }))}
          />

          {approved ? (
            <Link
              href="/jobs/j-2099/material-impact"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Review material shortage J-2099
            </Link>
          ) : (
            <Link
              href="/quality/j-2042/scrap-approval"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Approve scrap first
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
