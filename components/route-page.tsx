import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { DemoStepper } from "@/components/demo-stepper";
import { PresenterNote } from "@/components/presenter-note";
import { MetricCard } from "@/components/metric-card";
import { DataTableShell } from "@/components/data-table-shell";
import { TimelineShell } from "@/components/timeline-shell";
import { RiskAlert } from "@/components/risk-alert";
import { AuditPanel } from "@/components/audit-panel";
import { StatusBadge } from "@/components/status-badge";
import { SeverityBadge } from "@/components/severity-badge";
import { EntityLink } from "@/components/entity-link";
import { InternalViewLabel } from "@/components/internal-view-label";
import { CustomerSafeViewLabel } from "@/components/customer-safe-view-label";
import { PrintHeader } from "@/components/print-header";
import { PrintFooter } from "@/components/print-footer";
import { PrintButton } from "@/components/print-button";
import { allStatusGroups } from "@/lib/status";
import { routeMeta, type RouteKey } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  auditEvents,
  calculateScrapRate,
  customers,
  getAuditEventsByEntity,
  getCapacitySummary,
  getCustomerSafeJobStatus,
  getDashboardRiskItems,
  getDashboardMetrics,
  getCapacityRiskJobIds,
  getJobById,
  getJobTraceEvents,
  getMaterialBySku,
  getMaterialsSummary,
  getMaterialRows,
  getBlockedJobsByMaterialShortage,
  getMaterialReservationBreakdown,
  getMaterialSupplierPanel,
  getMaterialImpactTimeline,
  getPurchaseRequestById,
  getPurchaseRequestState,
  getPurchaseRequestAuditEntries,
  getQuoteById,
  getQuoteSummary,
  getQuoteRows,
  getApprovalQueueRows,
  getProductionQueue,
  getQualitySummary,
  getInspectionQueue,
  getDefectReasonBreakdown,
  getRecentAuditEvents,
  getReworkOrderById,
  defectReasonBreakdownRows,
  inspectionQueueRows,
  j2042ApprovalAuditTrail,
  j2042QualityTimeline,
  j2042ScrapEventDetail,
  materialImpactTimeline,
  quoteRoutingEstimateRows,
  quoteMaterialEstimateRows,
  q1003ApprovalHistory,
  q1003QuoteForm,
  q1003ConversionRecord,
  j2035ProductionUpdates,
  j2035QualityInspectionChecks,
  j2035QualityReadiness,
  j2035ScrapAndReworkFields,
  j2035RoutingSteps,
  j2035TravelerMaterials,
  j2035TravelerRoutingRows,
  j2035TravelerSignOffFields,
  j2035TravelerShipping,
  jobs,
  materials,
  purchaseRequests,
  purchaseRequestState,
  pr3091AuditTrail,
  quotes,
  reworkOrders,
  demoPath,
  getWorkCenterCapacityRows,
  workCenters
} from "@/lib/demo-data";

function PageHeader({
  title,
  summary,
  action,
  audience
}: {
  title: string;
  summary: string;
  action: string;
  audience: "internal" | "customer";
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">{title}</h1>
            {audience === "internal" ? <InternalViewLabel /> : <CustomerSafeViewLabel />}
          </div>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">{summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-text transition hover:border-accent/30 hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            Placeholder
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <FileText className="h-4 w-4" />
            {action}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  items
}: {
  items: Array<{
    label: string;
    value: string;
    detail?: string;
    tone?: "slate" | "emerald" | "amber" | "rose" | "blue";
  }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}

function TinyTable({
  columns,
  rows
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
        <tr>
          {columns.map((column) => (
            <th key={column} className="px-4 py-2.5 font-semibold">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="align-top">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-4 py-3">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Checklist({
  items
}: {
  items: Array<{ label: string; state: string }>;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5"
        >
          <span className="text-sm font-medium text-slate-950">{item.label}</span>
          <StatusBadge label={item.state} />
        </div>
      ))}
    </div>
  );
}

function routeBlocks(routeKey: RouteKey) {
  switch (routeKey) {
    case "home":
      {
        const metrics = getDashboardMetrics(jobs, workCenters, auditEvents, reworkOrders);
        const capacitySummary = getCapacitySummary(workCenters);
        const risks = getDashboardRiskItems(jobs, quotes, materials, workCenters);
        const productionQueue = getProductionQueue(jobs);
        const capacityRows = getWorkCenterCapacityRows(workCenters, jobs);
        const recentAudit = getRecentAuditEvents(5);

        return (
          <>
            <MetricRow
              items={[
                {
                  label: "Active jobs",
                  value: `${metrics.activeJobs}`,
                  detail: "Released or in flight",
                  tone: "blue"
                },
                {
                  label: "At-risk jobs",
                  value: `${metrics.atRiskJobs}`,
                  detail: "Watch, high, or critical",
                  tone: "amber"
                },
                {
                  label: "WIP value",
                  value: `$${metrics.wipValue.toLocaleString()}`,
                  detail: "Estimated active work",
                  tone: "rose"
                },
                {
                  label: "Jobs due this week",
                  value: `${metrics.jobsDueThisWeek}`,
                  detail: "Friday commitments seeded",
                  tone: "emerald"
                },
                {
                  label: "Scrap / rework",
                  value: `${metrics.scrapReworkCount}`,
                  detail: "Disposition and follow-up",
                  tone: "amber"
                },
                {
                  label: "Material blockers",
                  value: `${metrics.materialBlockers}`,
                  detail: "Waiting on material flow",
                  tone: "rose"
                },
                {
                  label: "Capacity bottlenecks",
                  value: `${metrics.capacityBottlenecks}`,
                  detail: capacitySummary.bottleneckLabel,
                  tone: "blue"
                },
                {
                  label: "Audit events today",
                  value: `${metrics.auditEventsToday}`,
                  detail: "Traceability already captured",
                  tone: "emerald"
                }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <DataTableShell
                title="Operational Risks"
                subtitle="Issues the shop needs to act on before they become a missed promise."
              >
                <div className="space-y-3 p-4">
                  {risks.map((risk) => (
                    <div key={risk.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <SeverityBadge severity={risk.severity} />
                            <EntityLink href={risk.href}>{risk.entityLabel}</EntityLink>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-950">{risk.title}</h3>
                          <p className="text-sm leading-6 text-slate-600">{risk.description}</p>
                        </div>
                        <Link
                          href={risk.href}
                          className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                        >
                          {risk.ctaLabel ?? "Open"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </DataTableShell>

              <TimelineShell title="Founder Demo Path" subtitle="Step 1 active. 13 steps total.">
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Step 1 active
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-950">Production Command Center</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Risk appears - right person acts - system updates - audit trail proves it.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {demoPath.slice(0, 4).map((step) => (
                      <Link
                        key={step.route}
                        href={step.route}
                        className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-slate-50 font-mono text-[11px] font-semibold text-slate-700">
                          {step.stepNumber}
                        </span>
                        <span className="font-medium">{step.title}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/capacity"
                      className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Begin Walkthrough
                    </Link>
                    <span className="text-xs text-slate-500">Starts the founder demo at the bottleneck.</span>
                  </div>
                </div>
              </TimelineShell>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <DataTableShell title="Capacity snapshot" subtitle="Work-center load across the seeded shop floor.">
                <TinyTable
                  columns={["Work center", "Capacity", "Queued", "Utilization", "Status"]}
                  rows={capacityRows.map((workCenter) => [
                    workCenter.name,
                    `${workCenter.capacityHoursPerWeek}h`,
                    workCenter.name === "Press Brake" ? (
                      <span className="font-semibold text-rose-700">{workCenter.queuedHoursPerWeek}h</span>
                    ) : (
                      `${workCenter.queuedHoursPerWeek}h`
                    ),
                    workCenter.name === "Press Brake" ? (
                      <span className="font-semibold text-rose-700">{workCenter.utilization}%</span>
                    ) : (
                      `${workCenter.utilization}%`
                    ),
                    <StatusBadge label={workCenter.status} />
                  ])}
                />
              </DataTableShell>

              <AuditPanel
                title="Recent audit activity"
                subtitle="Latest seeded events from the founder demo path."
                items={recentAudit.map((event) => ({
                  actor: event.actor,
                  event: event.title,
                  time: event.timestamp,
                  detail: event.detail,
                  severity: event.severity,
                  entityHref:
                    event.entityType === "quote"
                      ? "/quotes/q-1003"
                      : event.entityType === "job"
                        ? event.entityId === "J-2099"
                          ? "/jobs/j-2099/material-impact"
                          : "/jobs/j-2035"
                        : event.entityType === "workOrder"
                          ? event.entityId === "WO-2035"
                            ? "/output/work-order-traveler/j-2035"
                            : "/quotes/q-1003"
                          : event.entityType === "material"
                            ? "/jobs/j-2099/material-impact"
                            : event.entityType === "purchaseRequest"
                              ? "/purchase-requests/pr-3091"
                              : event.entityType === "report"
                                ? "/reports/customer-status/j-2035"
                                : event.entityType === "quality"
                                  ? "/quality/j-2042/scrap-approval"
                                  : "/capacity",
                  entityLabel: event.entityId
                }))}
              />
              <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs leading-6 text-slate-500 xl:col-span-2">
                Also seeded in the trace: PR-3091 purchase request creation and customer report generation/saving for
                J-2035.
              </div>
            </div>

            <DataTableShell
              title="Today's production queue"
              subtitle="The job list behind the operational risks and capacity signals."
              actions={<EntityLink href="/jobs/j-2035">Open J-2035</EntityLink>}
            >
              <TinyTable
                columns={["Job", "Customer", "Part", "Status", "Current step", "Work center", "Risk", "Next action"]}
                rows={productionQueue.map((job) => [
                  <EntityLink href={job.href}>{job.jobId}</EntityLink>,
                  job.customerName,
                  job.part,
                  <StatusBadge label={job.status} />,
                  job.currentStep,
                  job.workCenter,
                  <SeverityBadge severity={job.risk === "None" ? "Info" : job.risk === "Low" ? "Success" : job.risk === "Watch" ? "Warning" : job.risk === "High" ? "Critical" : "Blocked"} />,
                  job.nextAction
                ])}
              />
            </DataTableShell>
          </>
        );
      }

    case "capacity":
      {
        const summary = getCapacitySummary(workCenters);
        const capacityRows = getWorkCenterCapacityRows(workCenters, jobs);
        const capacityRiskJobIds = getCapacityRiskJobIds(jobs, workCenters);

        return (
          <>
            <MetricRow
              items={[
                {
                  label: "Total work centers",
                  value: `${summary.totalWorkCenters}`,
                  detail: "Seeded shop-floor operations",
                  tone: "blue"
                },
                {
                  label: "Work centers over capacity",
                  value: `${summary.overCapacityWorkCenters}`,
                  detail: "Only Press Brake is over capacity",
                  tone: "rose"
                },
                {
                  label: "Highest utilization",
                  value: `${summary.utilization}%`,
                  detail: summary.bottleneckLabel,
                  tone: "amber"
                },
                {
                  label: "Queued hours",
                  value: `${summary.queuedHoursPerWeek}h`,
                  detail: "Press Brake queue",
                  tone: "rose"
                },
                {
                  label: "Available hours",
                  value: `${summary.capacityHoursPerWeek}h`,
                  detail: "Weekly capacity per center",
                  tone: "emerald"
                },
                {
                  label: "Jobs at risk from capacity",
                  value: `${capacityRiskJobIds.length}`,
                  detail: capacityRiskJobIds.map((jobId) => jobId).join(", "),
                  tone: "blue"
                }
              ]}
            />
            <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
              <DataTableShell title="Capacity grid" subtitle="Work-center load across the seeded shop floor.">
                <TinyTable
                  columns={["Work center", "Capacity hours", "Queued hours", "Utilization %", "Status", "Affected jobs", "Next action"]}
                  rows={capacityRows.map((row) => [
                    row.name,
                    `${row.capacityHoursPerWeek}h/week`,
                    row.name === "Press Brake" ? (
                      <span className="font-semibold text-rose-700">{row.queuedHoursPerWeek}h/week</span>
                    ) : (
                      `${row.queuedHoursPerWeek}h/week`
                    ),
                    row.name === "Press Brake" ? (
                      <span className="font-semibold text-rose-700">{row.utilization}%</span>
                    ) : (
                      `${row.utilization}%`
                    ),
                    row.name === "Press Brake" ? (
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge label="Bottleneck" />
                        <StatusBadge label="Over Capacity" />
                      </div>
                    ) : (
                      <StatusBadge label={row.status} />
                    ),
                    row.affectedJobs.length ? (
                      <div className="flex flex-wrap gap-2">
                        {row.affectedJobs.map((jobId) => (
                          <EntityLink key={jobId} href={`/jobs/${jobId.toLowerCase()}`}>
                            {jobId}
                          </EntityLink>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">None</span>
                    ),
                    row.ctaHref ? (
                      <EntityLink href={row.ctaHref}>{row.nextAction}</EntityLink>
                    ) : (
                      row.nextAction
                    )
                  ])}
                />
              </DataTableShell>
              <div className="space-y-4">
                <RiskAlert
                  severity="Critical"
                  title="Press Brake Bottleneck"
                  description={`52h queued against ${summary.capacityHoursPerWeek}h weekly capacity at ${summary.utilization}% utilization.`}
                  href="/jobs/j-2035"
                  actionLabel="View Job J-2035"
                />

                <section className="rounded-md border border-slate-200 bg-white shadow-none">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-950">Bottleneck detail</h3>
                    <p className="mt-1 text-sm text-slate-500">How the overload is affecting the current release window.</p>
                  </div>
                  <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span>52h queued against 40h weekly capacity</span>
                      <SeverityBadge severity="Critical" />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span>Current affected job</span>
                      <EntityLink href="/jobs/j-2035">J-2035</EntityLink>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span>Current operation</span>
                      <StatusBadge label="Bend" />
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 leading-6 text-slate-600">
                      Bend may delay downstream Weld and Finish steps. Review schedule or move non-critical work.
                    </div>
                    <div className="pt-1">
                      <Link
                        href="/jobs/j-2035"
                        className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        View Job J-2035
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="rounded-md border border-slate-200 bg-white shadow-none">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-950">Demo path</h3>
                    <p className="mt-1 text-sm text-slate-500">Next: Production Job — J-2035</p>
                  </div>
                  <div className="px-4 py-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Step 3 of 13
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">Production Job — J-2035</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        The bottleneck resolves into the production record so the team can see the operational impact.
                      </p>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="/jobs/j-2035"
                        className="inline-flex items-center gap-2 rounded-sm border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                      >
                        Continue to J-2035
                      </Link>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        );
      }

    case "jobs":
      return (
        <DataTableShell
          title="Job queue"
          subtitle="Seed-ready placeholder list of active and queued jobs."
          actions={<EntityLink href="/jobs/j-2035">Open J-2035</EntityLink>}
        >
          <TinyTable
            columns={["Job", "Customer", "Status", "Due date", "Action"]}
            rows={[
              [
                <EntityLink href="/jobs/j-2035">J-2035</EntityLink>,
                "MetroFab",
                <StatusBadge label="In Production" />,
                "May 29",
                "Traveler ready"
              ],
              [
                <EntityLink href="/jobs/j-2099/material-impact">J-2099</EntityLink>,
                "MetroFab",
                <StatusBadge label="Waiting on Material" />,
                "Jun 02",
                "Material impact"
              ],
              [
                <EntityLink href="/jobs/j-2035">J-2104</EntityLink>,
                "Northline",
                <StatusBadge label="Approved" />,
                "Jun 10",
                "Waiting release"
              ]
            ]}
          />
        </DataTableShell>
      );

    case "job-2035":
      {
        const job = getJobById("J-2035", jobs);
        const customerSafe = getCustomerSafeJobStatus("J-2035", jobs);
        const jobTrace = getJobTraceEvents("J-2035", auditEvents);
        const pressBrake = workCenters.find((workCenter) => workCenter.name === "Press Brake");

        return (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EntityLink href="/jobs/j-2035">J-2035</EntityLink>
                    <StatusBadge label={job?.status ?? "In Production"} />
                    <SeverityBadge severity="Warning" />
                    <InternalViewLabel />
                  </div>
                  <div className="grid gap-x-4 gap-y-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <div>Customer: <span className="font-medium text-slate-950">{job?.customerName ?? "MetroFab Industries"}</span></div>
                    <div>Customer PO: <span className="font-medium text-slate-950">{job?.customerPo ?? "PO-8841"}</span></div>
                    <div>Part: <span className="font-medium text-slate-950">{job?.part ?? "Bracket Set Rev A"}</span></div>
                    <div>Quantity: <span className="font-medium text-slate-950">{job?.quantity ?? 500}</span></div>
                    <div>Due date: <span className="font-medium text-slate-950">{job?.dueDate ?? "Friday"}</span></div>
                    <div>Current step: <span className="font-medium text-slate-950">{job?.currentStep ?? "Bend"}</span></div>
                    <div>Work center: <span className="font-medium text-slate-950">{job?.workCenter ?? "Press Brake"}</span></div>
                    <div>Work order: <span className="font-medium text-slate-950">{job?.workOrder ?? "WO-2035"}</span></div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/output/work-order-traveler/j-2035"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Print Traveler
                  </Link>
                  <Link
                    href="/customer-service/jobs/j-2035"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                  >
                    View Customer-Safe Status
                  </Link>
                  <Link
                    href="/audit/jobs/j-2035"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                  >
                    View Audit Trail
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                  >
                    Log Production Update
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              <div className="flex items-center gap-2">
                <InternalViewLabel />
              </div>
              <p className="mt-2">
                This view includes routing, material reservations, operator updates, quality status, and audit history.
              </p>
            </div>

            <MetricRow
              items={[
                {
                  label: "Current status",
                  value: job?.status ?? "In Production",
                  detail: `Progress ${job?.progress ?? 62}%`,
                  tone: "blue"
                },
                {
                  label: "Work order",
                  value: job?.workOrder ?? "WO-2035",
                  detail: "Printable traveler linked",
                  tone: "slate"
                },
                {
                  label: "Current step",
                  value: job?.currentStep ?? "Bend",
                  detail: job?.workCenter ?? "Press Brake",
                  tone: "amber"
                },
                {
                  label: "Risk",
                  value: job?.risk ?? "Watch",
                  detail: customerSafe?.summary ?? "Customer-safe status available",
                  tone: "amber"
                }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <DataTableShell title="Routing timeline" subtitle="Cut through finish, with the Bend operation currently in progress.">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Step</th>
                        <th className="px-4 py-2.5 font-semibold">Operation</th>
                        <th className="px-4 py-2.5 font-semibold">Work center</th>
                        <th className="px-4 py-2.5 font-semibold">Planned hours</th>
                        <th className="px-4 py-2.5 font-semibold">Actual hours</th>
                        <th className="px-4 py-2.5 font-semibold">Operator</th>
                        <th className="px-4 py-2.5 font-semibold">Machine</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                        <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {j2035RoutingSteps.map((step) => {
                        const current = step.operation === "Bend";
                        return (
                          <tr key={step.stepNumber} className={cn(current && "bg-rose-50/50")}>
                            <td className="px-4 py-3 font-mono font-semibold text-slate-900">{step.stepNumber}</td>
                            <td className="px-4 py-3 font-medium text-slate-950">{step.operation}</td>
                            <td className="px-4 py-3 text-slate-700">{step.workCenter}</td>
                            <td className="px-4 py-3 text-slate-700">{step.plannedHours}h</td>
                            <td className="px-4 py-3 text-slate-700">{step.actualHours ? `${step.actualHours}h` : "—"}</td>
                            <td className="px-4 py-3 text-slate-700">{step.assignedOperator}</td>
                            <td className="px-4 py-3 font-mono text-slate-700">{step.machine}</td>
                            <td className="px-4 py-3">
                              {current ? (
                                <div className="flex flex-wrap gap-2">
                                  <StatusBadge label="In Progress" />
                                  <SeverityBadge severity="Warning" />
                                </div>
                              ) : (
                                <StatusBadge label={step.status === "Complete" ? "Approved" : "Pending Inspection"} />
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{step.timestamp ?? "Pending"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </DataTableShell>

              <div className="space-y-4">
                <RiskAlert
                  severity="Critical"
                  title="Why this job is at risk"
                  description={`Press Brake weekly capacity: ${pressBrake?.capacityHoursPerWeek ?? 40}h. Queued load: ${pressBrake?.queuedHoursPerWeek ?? 52}h. Current Bend step may delay downstream Weld and Finish steps.`}
                  href="/capacity"
                  actionLabel="Open Press Brake capacity view"
                />

                <section className="rounded-md border border-slate-200 bg-white shadow-none">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-950">Material reservation</h3>
                    <p className="mt-1 text-sm text-slate-500">Material status is reserved with no current blocker for J-2035.</p>
                  </div>
                  <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span>Material status</span>
                      <StatusBadge label="Reserved" />
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Message</div>
                      <div className="mt-2 leading-6 text-slate-700">No current material blocker for J-2035.</div>
                    </div>
                    <div className="space-y-2">
                      {j2035TravelerMaterials.map((row) => (
                        <div key={row.sku} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <EntityLink href={`/materials/${row.sku.toLowerCase()}`}>{row.sku}</EntityLink>
                              <div className="text-sm text-slate-600">{row.name}</div>
                            </div>
                            <StatusBadge label={row.signOff} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-md border border-slate-200 bg-white shadow-none">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-950">Quality readiness</h3>
                    <p className="mt-1 text-sm text-slate-500">Inspection gates stay visible while production continues.</p>
                  </div>
                  <div className="space-y-3 px-4 py-4">
                    {j2035QualityReadiness.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="font-medium text-slate-950">{item.value}</span>
                      </div>
                    ))}
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-600">
                      No active quality exception for J-2035. Inspection will be required after Finish.
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <DataTableShell title="Production updates" subtitle="Operator-facing updates for the live production record.">
                <div className="space-y-3 p-4">
                  {j2035ProductionUpdates.map((update) => (
                    <div key={update.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-slate-950">{update.label}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">{update.detail}</div>
                        </div>
                        <SeverityBadge
                          severity={update.status === "Complete" ? "Success" : update.status === "Pending" ? "Approval" : update.status === "Watch" ? "Warning" : "Info"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DataTableShell>

              <AuditPanel
                title="Audit history preview"
                subtitle="Recent events related to J-2035 and the surrounding traceability chain."
                items={jobTrace.map((event) => ({
                  actor: event.actor,
                  event: event.title,
                  time: event.timestamp,
                  detail: event.detail,
                  severity: event.severity,
                  entityHref:
                    event.entityType === "workOrder"
                      ? "/output/work-order-traveler/j-2035"
                      : event.entityType === "report"
                        ? "/reports/customer-status/j-2035"
                        : "/jobs/j-2035",
                  entityLabel: event.entityId
                }))}
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/output/work-order-traveler/j-2035"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Open printable work order traveler
              </Link>
            </div>
          </>
        );
      }

    case "work-order-traveler":
      {
        const job = getJobById("J-2035", jobs);

      return (
        <div className="space-y-4">
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/jobs/j-2035"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
              >
                Back to Job J-2035
              </Link>
              <PrintButton />
            </div>
          </div>

          <PrintHeader
            title="Work Order Traveler - J-2035"
            subtitle="Printable traveler connecting digital planning to physical production."
          />

          <section className="rounded-md border border-slate-300 bg-white p-6 shadow-none print:border-slate-400">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-300 pb-5">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Work Order Traveler
                </div>
                <h2 className="text-[24px] font-semibold tracking-tight text-slate-950">J-2035</h2>
                <p className="text-sm text-slate-500">Customer PO {job?.customerPo ?? "PO-8841"} · MetroFab Industries</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid gap-1 text-right text-xs uppercase tracking-[0.18em] text-slate-500">
                  <span>Barcode / QR</span>
                  <div className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-slate-900">
                    ||| ||| || ||| ||| J-2035 ||| |||
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-300 py-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Work Order</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{job?.workOrder ?? "WO-2035"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{job?.customerName ?? "MetroFab Industries"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer PO</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{job?.customerPo ?? "PO-8841"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Part</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{job?.part ?? "Bracket Set Rev A"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quantity</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{job?.quantity ?? 500}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Revision</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">Rev A</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Due date</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{job?.dueDate ?? "Friday"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <StatusBadge label={job?.status ?? "In Production"} />
                  <SeverityBadge severity="Warning" />
                </div>
              </div>
            </div>

            <div className="py-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Production Routing
              </div>
              <div className="overflow-hidden rounded-md border border-slate-300">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Step</th>
                      <th className="px-3 py-2.5 font-semibold">Operation</th>
                      <th className="px-3 py-2.5 font-semibold">Work center</th>
                      <th className="px-3 py-2.5 font-semibold">Machine</th>
                      <th className="px-3 py-2.5 font-semibold">Planned hours</th>
                      <th className="px-3 py-2.5 font-semibold">Operator</th>
                      <th className="px-3 py-2.5 font-semibold">Start</th>
                      <th className="px-3 py-2.5 font-semibold">End</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 font-semibold">Sign-off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {j2035TravelerRoutingRows.map((row) => (
                      <tr key={row.step} className={cn(row.operation === "Bend" && "bg-rose-50/40")}>
                        <td className="px-3 py-3 font-mono font-semibold text-slate-950">{row.step}</td>
                        <td className="px-3 py-3 text-slate-800">{row.operation}</td>
                        <td className="px-3 py-3 text-slate-800">{row.workCenter}</td>
                        <td className="px-3 py-3 font-mono text-slate-700">{row.machine}</td>
                        <td className="px-3 py-3 font-mono text-slate-700">{row.plannedHours}</td>
                        <td className="px-3 py-3 text-slate-700">{row.operator}</td>
                        <td className="px-3 py-3 text-slate-700">{row.start}</td>
                        <td className="px-3 py-3 text-slate-700">{row.end}</td>
                        <td className="px-3 py-3">
                          <StatusBadge label={row.status === "Complete" ? "Approved" : row.status === "In Progress" ? "In Production" : "Pending Inspection"} />
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-700">{row.signOff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-300 pt-5 xl:grid-cols-2">
              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Materials</div>
                <div className="overflow-hidden rounded-md border border-slate-300">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Material SKU</th>
                        <th className="px-3 py-2.5 font-semibold">Material name</th>
                        <th className="px-3 py-2.5 font-semibold">Required</th>
                        <th className="px-3 py-2.5 font-semibold">Reserved</th>
                        <th className="px-3 py-2.5 font-semibold">Lot number</th>
                        <th className="px-3 py-2.5 font-semibold">Sign-off</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {j2035TravelerMaterials.map((row) => (
                        <tr key={row.sku}>
                          <td className="px-3 py-3">
                            <EntityLink href={`/materials/${row.sku.toLowerCase()}`}>{row.sku}</EntityLink>
                          </td>
                          <td className="px-3 py-3 text-slate-800">{row.name}</td>
                          <td className="px-3 py-3 text-slate-700">{row.requiredQuantity}</td>
                          <td className="px-3 py-3 text-slate-700">{row.reservedQuantity}</td>
                          <td className="px-3 py-3 font-mono text-slate-700">{row.lotNumber}</td>
                          <td className="px-3 py-3">
                            <StatusBadge label={row.signOff} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Operator sign-off</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {j2035TravelerSignOffFields.map((field) => (
                    <div key={field.label} className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{field.label}</div>
                      <div className="mt-2 text-sm font-medium text-slate-950">{field.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-4 border-t border-slate-300 pt-5 xl:grid-cols-3">
              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Quality inspection</div>
                <div className="space-y-2 rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
                  {j2035QualityInspectionChecks.slice(0, 3).map((check) => (
                    <div key={check.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5">
                      <span>{check.label}</span>
                      <StatusBadge label={check.value} />
                    </div>
                  ))}
                  <div className="grid gap-3 md:grid-cols-3">
                    {j2035QualityInspectionChecks.slice(3).map((check) => (
                      <div key={check.label} className="rounded-md border border-slate-200 bg-white px-3 py-2.5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{check.label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-950">{check.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Scrap and rework</div>
                <div className="space-y-2 rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
                  {j2035ScrapAndReworkFields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5">
                      <span>{field.label}</span>
                      <span className="font-medium text-slate-950">{field.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping sign-off</div>
                <div className="space-y-2 rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
                  {j2035TravelerShipping.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5">
                      <span>{item.label}</span>
                      <span className="font-medium text-slate-950">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <PrintFooter preparedAt="Today 10:42 AM" version="v1.0" generatedBy="Prepared from seeded demo data" />
            <div className="flex justify-end">
              <Link
                href="/quality/j-2042/scrap-approval"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Review quality exception J-2042
              </Link>
            </div>
          </section>
        </div>
      );
      }

    case "quality":
      {
        const summary = getQualitySummary(jobs, reworkOrders, inspectionQueueRows);
        const inspectionQueue = getInspectionQueue(inspectionQueueRows);
        const defectReasons = getDefectReasonBreakdown(defectReasonBreakdownRows);

        return (
          <>
            <MetricRow
              items={[
                {
                  label: "Open inspections",
                  value: `${summary.openInspections}`,
                  detail: "Inspection queue activity",
                  tone: "blue"
                },
                {
                  label: "Failed inspections",
                  value: `${summary.failedInspections}`,
                  detail: "Jobs that need disposition",
                  tone: "rose"
                },
                {
                  label: "Scrap above tolerance",
                  value: `${summary.scrapAboveTolerance}`,
                  detail: "Jobs blocked on approval",
                  tone: "amber"
                },
                {
                  label: "Rework orders open",
                  value: `${summary.reworkOrdersOpen}`,
                  detail: "Controlled follow-up work",
                  tone: "rose"
                },
                {
                  label: "Jobs waiting for sign-off",
                  value: `${summary.jobsWaitingForSignOff}`,
                  detail: "Supervisor or inspector action",
                  tone: "amber"
                },
                {
                  label: "Average first-pass yield",
                  value: `${summary.averageFirstPassYield.toFixed(1)}%`,
                  detail: "Based on seeded job records",
                  tone: "emerald"
                }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <RiskAlert
                  severity="Critical"
                  title="J-2042 requires immediate scrap approval"
                  description="Scrap exceeds tolerance. Supervisor approval required before production can continue."
                  href="/quality/j-2042/scrap-approval"
                  actionLabel="Review scrap approval"
                />

                <DataTableShell
                  title="Inspection queue"
                  subtitle="Primary exception plus a few supporting rows from the seeded quality record."
                >
                  <TinyTable
                    columns={["Job", "Customer", "Part", "Current step", "Inspector", "Result", "Scrap rate", "Status", "Due date", "Action"]}
                    rows={inspectionQueue.map((row) => [
                      <EntityLink href={row.href}>{row.jobId}</EntityLink>,
                      row.customerName,
                      row.part,
                      row.currentStep,
                      row.inspector,
                      <StatusBadge label={row.result} />,
                      row.scrapRate,
                      <StatusBadge label={row.status} />,
                      row.dueDate,
                      <EntityLink href={row.href}>{row.action}</EntityLink>
                    ])}
                  />
                </DataTableShell>
              </div>

              <div className="space-y-4">
                <TimelineShell
                  title="Defect reason breakdown"
                  subtitle="Most common defect families contributing to scrap and rework."
                >
                  <div className="space-y-3">
                    {defectReasons.map((reason) => (
                      <div key={reason.reason} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-950">{reason.reason}</span>
                          <span className="font-mono text-slate-500">
                            {reason.count} / {reason.percentage}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-rose-500"
                            style={{ width: `${reason.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TimelineShell>

                <TimelineShell
                  title="Recent quality events"
                  subtitle="Timeline from inspection failure through controlled rework."
                >
                  <div className="space-y-3">
                    {j2042QualityTimeline.map((entry) => (
                      <div key={`${entry.timestamp}-${entry.title}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-slate-950">{entry.title}</div>
                          <SeverityBadge severity={entry.severity} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{entry.detail}</p>
                        <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          {entry.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </TimelineShell>
              </div>
            </div>
          </>
        );
      }

    case "quality-scrap":
      {
        const job = getJobById("J-2042", jobs);
        const rework = getReworkOrderById("RW-2042-01", reworkOrders);
        const scrapRate = job?.scrapRate ?? calculateScrapRate(job?.scrapQuantity ?? 0, job?.completedQuantity ?? 0);
        const toleranceRate = job?.allowedTolerance ?? 0.05;
        const selectedDecision = "Approve scrap and create rework";

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EntityLink href="/jobs/j-2042">J-2042</EntityLink>
                    <StatusBadge label="Scrap Approval Required" />
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
                <Link
                  href="/quality/j-2042/rework-created"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Approve scrap and create rework
                </Link>
              </div>
            </div>

            <RiskAlert
              severity="Critical"
              title="Scrap approval is required"
              description="Scrap rate is above the 5% tolerance. Production is blocked until a supervisor decision is recorded."
              href="/quality/j-2042/rework-created"
              actionLabel="Approve scrap and create rework"
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
                      const selected = option === selectedDecision;
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
                        <div className="mt-2 text-sm font-medium text-slate-950">{selectedDecision}</div>
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
              </div>
            </div>
          </div>
        );
      }

    case "quality-rework":
      {
        const rework = getReworkOrderById("RW-2042-01", reworkOrders);

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Rework created
                  </div>
                  <h3 className="text-[15px] font-semibold text-emerald-950">
                    Rework order RW-2042-01 created and linked to Job J-2042.
                  </h3>
                  <p className="max-w-3xl text-sm leading-6 text-emerald-900/80">
                    The job is now controlled through rework routing instead of an open scrap exception.
                  </p>
                </div>
                <StatusBadge label="Rework Created" />
              </div>
            </div>

            <MetricRow
              items={[
                {
                  label: "Job status",
                  value: "Rework",
                  detail: "Changed from Scrap Approval Required",
                  tone: "rose"
                },
                {
                  label: "Scrap event",
                  value: "Approved",
                  detail: "Supervisor decision recorded",
                  tone: "emerald"
                },
                {
                  label: "Rework order",
                  value: rework?.id ?? "RW-2042-01",
                  detail: "Controlled follow-up routing",
                  tone: "blue"
                },
                {
                  label: "Quality dashboard",
                  value: "Updated",
                  detail: "Exception counts recalculate",
                  tone: "emerald"
                }
              ]}
            />

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
                        <SeverityBadge severity={item.tone} />
                      </div>
                    ))}
                  </div>
                </TimelineShell>

                <AuditPanel
                  title="Audit panel"
                  subtitle="Supervisor and system events show the controlled handoff from scrap to rework."
                  items={j2042ApprovalAuditTrail.map((entry) => ({
                    actor: entry.actor,
                    actorRole: entry.actorRole,
                    event: entry.action,
                    time: entry.timestamp,
                    detail: entry.result,
                    severity: entry.severity,
                    entityHref:
                      entry.entityId === "J-2042"
                        ? "/quality/j-2042/scrap-approval"
                        : "/quality/j-2042/rework-created",
                    entityLabel: entry.entityId,
                    result: entry.result,
                    notes: entry.notes,
                    entityType: entry.entityType
                  }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/jobs/j-2099/material-impact"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Review material shortage J-2099
              </Link>
            </div>
          </div>
        );
      }

    case "materials":
      {
        const summary = getMaterialsSummary(materials, jobs, purchaseRequests);
        const rows = getMaterialRows(materials, jobs);
        const blockedJobs = getBlockedJobsByMaterialShortage(jobs, materials);
        const material = getMaterialBySku("AL-6061-PLT-0.375", materials);
        const pr = getPurchaseRequestById("PR-3091", purchaseRequests);

        return (
          <>
            <MetricRow
              items={[
                {
                  label: "Materials below reorder point",
                  value: `${summary.materialsBelowReorderPoint}`,
                  detail: material?.sku ?? "Seeded shortage material",
                  tone: "amber"
                },
                {
                  label: "Jobs blocked by shortage",
                  value: `${summary.jobsBlockedByShortage}`,
                  detail: blockedJobs.map((job) => job.jobId).join(", "),
                  tone: "rose"
                },
                {
                  label: "Open purchase requests",
                  value: `${summary.openPurchaseRequests}`,
                  detail: "Submitted procurement work",
                  tone: "blue"
                },
                {
                  label: "Incoming POs this week",
                  value: `${summary.incomingPosThisWeek}`,
                  detail: "Expected supply flow",
                  tone: "emerald"
                },
                {
                  label: "Reserved inventory value",
                  value: `$${summary.reservedInventoryValue.toLocaleString()}`,
                  detail: "Held against active jobs",
                  tone: "slate"
                },
                {
                  label: "Critical shortages",
                  value: `${summary.criticalShortages}`,
                  detail: "Blocked jobs and schedule risk",
                  tone: "rose"
                }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-4">
                <RiskAlert
                  severity="Critical"
                  title="Job J-2099 is blocked"
                  description="44 sheets of Aluminum Plate 6061 are required before CNC Mill can begin."
                  href="/jobs/j-2099/material-impact"
                  actionLabel="View job impact"
                />

                <DataTableShell
                  title="Materials table"
                  subtitle="Shortage signal and linked jobs are visible before the schedule slips."
                >
                  <TinyTable
                    columns={["SKU", "Material name", "On hand", "Reserved", "Available", "Reorder point", "Shortage", "Supplier", "Affected jobs", "Status", "Action"]}
                    rows={rows.map((row) => [
                      <EntityLink href={row.href}>{row.sku}</EntityLink>,
                      row.name,
                      `${row.onHand}`,
                      `${row.reserved}`,
                      `${row.available}`,
                      `${row.reorderPoint}`,
                      <span className="font-semibold text-rose-700">{row.shortage}</span>,
                      row.supplier,
                      <div className="flex flex-wrap gap-2">
                        {row.affectedJobIds.map((jobId) => (
                          <EntityLink
                            key={jobId}
                            href={
                              jobId === "J-2099"
                                ? "/jobs/j-2099/material-impact"
                                : jobId === "J-2035"
                                  ? "/jobs/j-2035"
                                  : "/jobs"
                            }
                          >
                            {jobId}
                          </EntityLink>
                        ))}
                      </div>,
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge label="Shortage" />
                        <StatusBadge label="Blocked Job" />
                      </div>,
                      <EntityLink href="/jobs/j-2099/material-impact">{row.action}</EntityLink>
                    ])}
                  />
                </DataTableShell>
              </div>

              <div className="space-y-4">
                <TimelineShell title="Incoming and purchase request preview" subtitle="The shortage becomes a seeded purchasing record.">
                  <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <EntityLink href="/purchase-requests/pr-3091">PR-3091</EntityLink>
                      <StatusBadge label={pr?.status ?? "Submitted"} />
                    </div>
                    <div className="grid gap-2 text-sm text-slate-700">
                      <div>Material: <span className="font-medium text-slate-950">{material?.sku ?? "AL-6061-PLT-0.375"}</span></div>
                      <div>Quantity: <span className="font-medium text-slate-950">{pr?.quantity ?? 50} sheets</span></div>
                      <div>Supplier: <span className="font-medium text-slate-950">{pr?.supplier ?? "Midwest Metals Supply"}</span></div>
                      <div>Linked job: <EntityLink href="/jobs/j-2099/material-impact">J-2099</EntityLink></div>
                    </div>
                  </div>
                </TimelineShell>

                <TimelineShell title="Demo path" subtitle="Next: Purchase Request - PR-3091">
                  <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-sm leading-6 text-slate-700">
                      The shortage is resolved by creating a purchase request that keeps traceability tied to the blocked job.
                    </div>
                    <Link
                      href="/purchase-requests/pr-3091"
                      className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Continue to PR-3091
                    </Link>
                  </div>
                </TimelineShell>
              </div>
            </div>
          </>
        );
      }

    case "material-al6061":
      {
        const material = getMaterialBySku("AL-6061-PLT-0.375", materials);
        const rows = getBlockedJobsByMaterialShortage(jobs, materials);
        const breakdown = getMaterialReservationBreakdown(materials, jobs);
        const supplier = getMaterialSupplierPanel(materials);

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EntityLink href="/materials/al-6061-plt-0.375">AL-6061-PLT-0.375</EntityLink>
                    <StatusBadge label="Shortage" />
                    <StatusBadge label="Blocked Job" />
                    <SeverityBadge severity="Critical" />
                  </div>
                  <div className="grid gap-x-4 gap-y-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <div>Material name: <span className="font-medium text-slate-950">{material?.name ?? "Aluminum Plate 6061, 3/8 inch"}</span></div>
                    <div>Supplier: <span className="font-medium text-slate-950">{supplier.preferredSupplier}</span></div>
                    <div>Lead time: <span className="font-medium text-slate-950">{supplier.leadTimeBusinessDays} business days</span></div>
                    <div>Last updated: <span className="font-medium text-slate-950">{material?.lastUpdated ?? "Today 9:15 AM"}</span></div>
                  </div>
                </div>
                <Link
                  href="/jobs/j-2099/material-impact"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  View J-2099 job impact
                </Link>
              </div>
            </div>

            <MetricRow
              items={[
                { label: "On hand", value: `${material?.onHand ?? 12} sheets`, detail: "Physical inventory", tone: "blue" },
                { label: "Reserved", value: `${material?.reserved ?? 8} sheets`, detail: "Held for open jobs", tone: "amber" },
                { label: "Available", value: `${material?.available ?? 4} sheets`, detail: "Free for new work", tone: "emerald" },
                { label: "Required by open jobs", value: `${material?.requiredSheets ?? 48} sheets`, detail: "Driven by J-2099", tone: "slate" },
                { label: "Shortage", value: `${material?.shortage ?? 44} sheets`, detail: "Current gap", tone: "rose" },
                { label: "Reorder point", value: `${material?.reorderPoint ?? 20} sheets`, detail: "Triggers replenishment", tone: "amber" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <DataTableShell title="Affected jobs" subtitle="Jobs that are blocked, reserved, or at risk because of the shortage.">
                <TinyTable
                  columns={["Job", "Customer", "Needs", "Status", "Due date"]}
                  rows={rows.map((row) => [
                    <EntityLink href={row.href}>{row.jobId}</EntityLink>,
                    row.customerName,
                    `${row.requiredSheets} sheets`,
                    row.status === "blocked" ? (
                      <StatusBadge label="Blocked Job" />
                    ) : row.status === "reserved" ? (
                      <StatusBadge label="Reserved" />
                    ) : (
                      <SeverityBadge severity="Warning" />
                    ),
                    row.dueDate
                  ])}
                />
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
          </div>
        );
      }

    case "job-2099-material":
      {
        const job = getJobById("J-2099", jobs);
        const material = getMaterialBySku("AL-6061-PLT-0.375", materials);
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
                    <div>Customer: <span className="font-medium text-slate-950">{job?.customerName ?? "Apex Rail Components"}</span></div>
                    <div>Part: <span className="font-medium text-slate-950">{job?.part ?? "Mounting Plate Set Rev C"}</span></div>
                    <div>Quantity: <span className="font-medium text-slate-950">{job?.quantity ?? 120}</span></div>
                    <div>Due date: <span className="font-medium text-slate-950">{job?.dueDate ?? "within 4 business days"}</span></div>
                    <div>Risk: <span className="font-medium text-rose-700">{job?.risk ?? "High"}</span></div>
                    <div>Blocked step: <span className="font-medium text-slate-950">{job?.blockedStep ?? "CNC Mill"}</span></div>
                    <div>Work center: <span className="font-medium text-slate-950">{job?.workCenter ?? "CNC Mill"}</span></div>
                    <div>Current status: <span className="font-medium text-slate-950">{job?.status ?? "Waiting on Material"}</span></div>
                  </div>
                </div>
                <Link
                  href="/purchase-requests/pr-3091"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create purchase request
                </Link>
              </div>
            </div>

            <RiskAlert
              severity="Critical"
              title="Production blocked by material shortage"
              description="The shortage is 44 sheets and CNC Mill cannot start until material receipt clears the queue."
              href="/purchase-requests/pr-3091"
              actionLabel="Create purchase request"
            />

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <TimelineShell title="Impact panel" subtitle="Shortage ripples into production readiness.">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Required material</div>
                      <div className="mt-2 text-sm font-medium text-slate-950">{material?.sku ?? "AL-6061-PLT-0.375"}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Required quantity</div>
                      <div className="mt-2 text-sm font-medium text-slate-950">{material?.requiredSheets ?? 48} sheets</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Available quantity</div>
                      <div className="mt-2 text-sm font-medium text-slate-950">{material?.available ?? 4} sheets</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Shortage</div>
                      <div className="mt-2 text-sm font-medium text-rose-700">{material?.shortage ?? 44} sheets</div>
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
                    {getMaterialReservationBreakdown(materials, jobs).map((item) => (
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
                    {timeline.map((entry) => (
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
          </div>
        );
      }

    case "purchase-request":
      {
        const pr = getPurchaseRequestById("PR-3091", purchaseRequests);
        const state = getPurchaseRequestState(purchaseRequestState);
        const auditTrail = getPurchaseRequestAuditEntries(pr3091AuditTrail);
        const material = getMaterialBySku("AL-6061-PLT-0.375", materials);

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Purchase request created
                  </div>
                  <h3 className="text-[15px] font-semibold text-emerald-950">
                    Purchase request PR-3091 created and linked to Job J-2099.
                  </h3>
                  <p className="max-w-3xl text-sm leading-6 text-emerald-900/80">
                    The blocked job now has a procurement action attached to it instead of a manual spreadsheet chase.
                  </p>
                </div>
                <StatusBadge label={pr?.status ?? "Submitted"} />
              </div>
            </div>

            <MetricRow
              items={[
                { label: "Purchase request", value: pr?.id ?? "PR-3091", detail: "Linked to J-2099", tone: "blue" },
                { label: "Material", value: pr?.materialSku ?? "AL-6061-PLT-0.375", detail: material?.name ?? "Aluminum Plate 6061, 3/8 inch", tone: "slate" },
                { label: "Quantity", value: `${pr?.quantity ?? 50} sheets`, detail: "Supplier order quantity", tone: "amber" },
                { label: "Estimated total", value: `$${(pr?.estimatedTotal ?? 9250).toLocaleString()}`, detail: `Unit cost $${pr?.unitCost ?? 185}/sheet`, tone: "emerald" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <DataTableShell title="Purchase request card" subtitle="Seeded purchasing record tied back to the blocked job.">
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase Request</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">{pr?.id ?? "PR-3091"}</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Material</div>
                    <EntityLink href="/materials/al-6061-plt-0.375" className="mt-2 inline-flex">
                      {pr?.materialSku ?? "AL-6061-PLT-0.375"}
                    </EntityLink>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Supplier</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">{pr?.supplier ?? "Midwest Metals Supply"}</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quantity</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">{pr?.quantity ?? 50} sheets</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Unit cost</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">${pr?.unitCost ?? 185}</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Estimated total</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">${(pr?.estimatedTotal ?? 9250).toLocaleString()}</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Linked job</div>
                    <EntityLink href="/jobs/j-2099/material-impact" className="mt-2 inline-flex">
                      {pr?.linkedJobId ?? "J-2099"}
                    </EntityLink>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Buyer</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">{pr?.buyer ?? "Priya Mehta"}</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
                    <div className="mt-2"><StatusBadge label={pr?.status ?? "Submitted"} /></div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</div>
                    <div className="mt-2"><SeverityBadge severity={pr?.priority === "High" ? "Critical" : "Approval"} /></div>
                  </div>
                </div>
              </DataTableShell>

              <TimelineShell title="Before / after state" subtitle="The materials and job state stay traceable through the request.">
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Before</div>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      <div>Material status: <span className="font-medium text-slate-950">{state.before.materialStatus}</span></div>
                      <div>Job J-2099: <span className="font-medium text-slate-950">{state.before.jobStatus}</span></div>
                      <div>Action needed: <span className="font-medium text-slate-950">{state.before.actionNeeded}</span></div>
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">After</div>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      <div>Material status: <span className="font-medium text-slate-950">{state.after.materialStatus}</span></div>
                      <div>Job J-2099: <span className="font-medium text-slate-950">{state.after.jobStatus}</span></div>
                      <div>Next step: <span className="font-medium text-slate-950">{state.after.nextStep}</span></div>
                    </div>
                  </div>
                </div>
              </TimelineShell>
            </div>

            <AuditPanel
              title="Audit trail"
              subtitle="Standardized purchasing events link the request back to production readiness."
              items={auditTrail.map((entry) => ({
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
              }))}
            />

            <div className="flex justify-end">
              <Link
                href="/quotes/q-1003"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Review high-value quote approval Q-1003
              </Link>
            </div>
          </div>
        );
      }

    case "quotes":
      {
        const summary = getQuoteSummary(quotes, jobs);
        const quoteRows = getQuoteRows(quotes);
        const filterChips = ["All", "Draft", "Submitted", "Needs Owner Approval", "Approved", "Expiring Soon"];

        return (
          <>
            <MetricRow
              items={[
                { label: "Draft quotes", value: `${summary.draftQuotes}`, detail: "Estimates still in progress", tone: "slate" },
                { label: "Submitted quotes", value: `${summary.submittedQuotes}`, detail: "Ready for review", tone: "blue" },
                { label: "Awaiting owner approval", value: `${summary.awaitingOwnerApproval}`, detail: "Blocked by threshold", tone: "amber" },
                { label: "Approved this month", value: `${summary.approvedThisMonth}`, detail: "Leadership cleared", tone: "emerald" },
                { label: "Converted to jobs", value: `${summary.convertedToJobs}`, detail: "Jobs created from quotes", tone: "emerald" },
                { label: "Expiring soon", value: `${summary.expiringSoon}`, detail: "Quotes needing follow-up", tone: "amber" },
                { label: "Total quoted value", value: `$${summary.totalQuotedValue.toLocaleString()}`, detail: "Current pipeline value", tone: "rose" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <DataTableShell
                title="Quote table"
                subtitle="Dashboard rows stay seeded until the estimate workflow is built."
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    {filterChips.map((chip, index) => (
                      <span
                        key={chip}
                        className={cn(
                          "rounded-sm border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                          index === 0 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-600"
                        )}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                }
              >
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Quote code</th>
                      <th className="px-4 py-2.5 font-semibold">Customer</th>
                      <th className="px-4 py-2.5 font-semibold">Part / description</th>
                      <th className="px-4 py-2.5 font-semibold">Amount</th>
                      <th className="px-4 py-2.5 font-semibold">Margin</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                      <th className="px-4 py-2.5 font-semibold">Valid until</th>
                      <th className="px-4 py-2.5 font-semibold">Estimator</th>
                      <th className="px-4 py-2.5 font-semibold">Approval requirement</th>
                      <th className="px-4 py-2.5 font-semibold">Last updated</th>
                      <th className="px-4 py-2.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quoteRows.map((row) => (
                      <tr key={row.quoteId} className={cn("align-top", row.highlight ? "bg-amber-50/70" : "bg-white")}>
                        <td className="px-4 py-3">
                          <EntityLink href={row.href ?? "/quotes"}>{row.quoteId}</EntityLink>
                        </td>
                        <td className="px-4 py-3">{row.customerName}</td>
                        <td className="px-4 py-3">{row.part}</td>
                        <td className="px-4 py-3 font-mono text-[13px] text-slate-900">${row.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[13px] text-slate-900">${row.margin.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={row.status} />
                        </td>
                        <td className="px-4 py-3">{row.validUntil}</td>
                        <td className="px-4 py-3">{row.estimator}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <SeverityBadge severity={row.highlight ? "Approval" : "Info"} />
                            <span className="text-sm text-slate-600">{row.approvalRequirement}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{row.lastUpdated}</td>
                        <td className="px-4 py-3">
                          {row.href ? (
                            <Link
                              href={row.href}
                              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                            >
                              {row.action}
                            </Link>
                          ) : (
                            <span className="inline-flex rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                              {row.action}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableShell>

              <TimelineShell title="Founder demo path" subtitle="Step 9: Quote Approval - Q-1003">
                <div className="space-y-3">
                  <RiskAlert
                    severity="Approval"
                    title="Next: Owner Approval - Q-1003"
                    description="High-value work stops at the threshold until the owner reviews margin, timing, and risk."
                    href="/approvals"
                    actionLabel="Open approval queue"
                  />
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Demo path cue
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      The dashboard points directly into the approval flow so the demo can move from estimate to governed release.
                    </p>
                  </div>
                </div>
              </TimelineShell>
            </div>
          </>
        );
      }

    case "quote-new":
      {
        const routingHours = q1003QuoteForm.routingEstimate.reduce((sum, step) => sum + step.estimatedHours, 0);
        const totalMaterials = q1003QuoteForm.materialEstimate.reduce((sum, material) => sum + material.extendedCost, 0);

        return (
          <div className="space-y-4">
            <MetricRow
              items={[
                { label: "Quote code", value: q1003QuoteForm.quoteCode, detail: "Unique estimate identifier", tone: "blue" },
                { label: "Customer", value: q1003QuoteForm.customer, detail: q1003QuoteForm.customerReference, tone: "emerald" },
                { label: "Total quote amount", value: `$${q1003QuoteForm.totalQuoteAmount.toLocaleString()}`, detail: "Seeded estimate result", tone: "rose" },
                { label: "Routing hours", value: `${routingHours}h`, detail: "Estimated labor load", tone: "amber" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <DataTableShell title="Customer and quote details" subtitle="Estimator-focused layout with seeded validation states.">
                  <div className="grid gap-3 p-4 md:grid-cols-2">
                    {[
                      ["Customer", q1003QuoteForm.customer],
                      ["Quote code", q1003QuoteForm.quoteCode],
                      ["Customer PO / RFQ reference", q1003QuoteForm.customerReference],
                      ["Part name", q1003QuoteForm.partName],
                      ["Part revision", q1003QuoteForm.partRevision],
                      ["Quantity", `${q1003QuoteForm.quantity}`],
                      ["Requested due date", q1003QuoteForm.requestedDueDate],
                      ["Valid until", q1003QuoteForm.validUntil],
                      ["Estimator", q1003QuoteForm.estimator]
                    ].map(([label, value]) => (
                      <label key={label} className="space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
                        <div className="min-h-11 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          {value}
                        </div>
                      </label>
                    ))}
                  </div>
                </DataTableShell>

                <DataTableShell title="Cost build-up" subtitle="No submission yet - this is the estimator preview.">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Component</th>
                        <th className="px-4 py-2.5 font-semibold">Amount</th>
                        <th className="px-4 py-2.5 font-semibold">Signal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        ["Estimated labor hours", `${q1003QuoteForm.estimatedLaborHours}h`, "Info"],
                        ["Labor rate", `$${q1003QuoteForm.laborRate}`, "Info"],
                        ["Material cost", `$${q1003QuoteForm.materialCost.toLocaleString()}`, "Warning"],
                        ["Outside service cost", `$${q1003QuoteForm.outsideServiceCost.toLocaleString()}`, "Warning"],
                        ["Setup cost", `$${q1003QuoteForm.setupCost.toLocaleString()}`, "Info"],
                        ["Overhead", `$${q1003QuoteForm.overhead.toLocaleString()}`, "Info"],
                        ["Margin percentage", `${q1003QuoteForm.marginPercentage}%`, "Success"],
                        ["Total quote amount", `$${q1003QuoteForm.totalQuoteAmount.toLocaleString()}`, "Critical"]
                      ].map(([label, amount, severity]) => (
                        <tr key={label}>
                          <td className="px-4 py-3">{label}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">{amount}</td>
                          <td className="px-4 py-3">
                            <SeverityBadge severity={severity as "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>

                <DataTableShell title="Routing estimate" subtitle="Cut, bend, weld, finish, inspect, and pack are defined before submit.">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Operation</th>
                        <th className="px-4 py-2.5 font-semibold">Work center</th>
                        <th className="px-4 py-2.5 font-semibold">Estimated hours</th>
                        <th className="px-4 py-2.5 font-semibold">Machine</th>
                        <th className="px-4 py-2.5 font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {q1003QuoteForm.routingEstimate.map((step) => (
                        <tr key={step.operation}>
                          <td className="px-4 py-3 font-medium text-slate-950">{step.operation}</td>
                          <td className="px-4 py-3">{step.workCenter}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">{step.estimatedHours}h</td>
                          <td className="px-4 py-3 font-mono text-[13px]">{step.machine}</td>
                          <td className="px-4 py-3 text-slate-600">{step.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>

                <DataTableShell title="Materials estimate" subtitle="Seeded material rows show where availability and shortage matter.">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">SKU</th>
                        <th className="px-4 py-2.5 font-semibold">Material name</th>
                        <th className="px-4 py-2.5 font-semibold">Quantity</th>
                        <th className="px-4 py-2.5 font-semibold">Unit cost</th>
                        <th className="px-4 py-2.5 font-semibold">Extended cost</th>
                        <th className="px-4 py-2.5 font-semibold">Availability status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {q1003QuoteForm.materialEstimate.map((material) => (
                        <tr key={material.sku}>
                          <td className="px-4 py-3 font-mono text-[13px]">{material.sku}</td>
                          <td className="px-4 py-3">{material.materialName}</td>
                          <td className="px-4 py-3">{material.quantity}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">${material.unitCost}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">${material.extendedCost.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <StatusBadge label={material.availabilityStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>
              </div>

              <div className="space-y-4">
                <TimelineShell title="Validation and assumptions" subtitle="Static validation states show how the form will behave later.">
                  <div className="space-y-3">
                    {q1003QuoteForm.validationExamples.map((example) => (
                      <div key={example} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                        {example}
                      </div>
                    ))}
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                      <div className="font-semibold text-slate-950">Notes and assumptions</div>
                      <p className="mt-2">Internal notes: {q1003QuoteForm.internalNotes}</p>
                      <p className="mt-2">Customer-facing notes: {q1003QuoteForm.customerFacingNotes}</p>
                      <p className="mt-2">Terms: {q1003QuoteForm.terms}</p>
                    </div>
                  </div>
                </TimelineShell>

                <TimelineShell title="Estimate snapshot" subtitle="Useful for estimating the eventual quote total.">
                  <div className="grid gap-3 md:grid-cols-2">
                    <MetricCard label="Materials total" value={`$${totalMaterials.toLocaleString()}`} detail="Seeded material estimate" tone="amber" />
                    <MetricCard label="Routing hours" value={`${routingHours}h`} detail="Seeded routing estimate" tone="blue" />
                    <MetricCard label="Margin" value={`${q1003QuoteForm.marginPercentage}%`} detail="Targeted quote margin" tone="emerald" />
                    <MetricCard label="Quote amount" value={`$${q1003QuoteForm.totalQuoteAmount.toLocaleString()}`} detail="Validation example" tone="rose" />
                  </div>
                </TimelineShell>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Submit quote
                  </button>
                  <Link
                    href="/quotes"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }

    case "quote-1003":
      {
        const quote = getQuoteById("Q-1003", quotes);
        const quoteEvents = getAuditEventsByEntity("quote", "Q-1003", auditEvents);
        const totalCost = (quote?.labor ?? 0) + (quote?.materials ?? 0) + (quote?.outsideServices ?? 0) + (quote?.setupOverhead ?? 0);

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <EntityLink href="/quotes/q-1003">Q-1003</EntityLink>
                    <StatusBadge label={quote?.status ?? "Needs Owner Approval"} />
                    <SeverityBadge severity="Approval" />
                  </div>
                  <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Quote Detail - Q-1003</h1>
                  <p className="max-w-4xl text-sm leading-6 text-slate-500">
                    High-value quote for Northline Fabrication. Owner approval is required before conversion.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled
                    title="Owner approval required before conversion."
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
                  >
                    Convert to Job
                  </button>
                  <Link
                    href="/approvals"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Open Owner Approval Queue
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Customer" value={quote?.customerName ?? "Northline Fabrication"} detail="Estimator Lena Ortiz" tone="blue" />
                <MetricCard label="Amount" value={`$${quote?.amount.toLocaleString() ?? "72,500"}`} detail="Threshold $50,000" tone="rose" />
                <MetricCard label="Valid until" value={quote?.validUntil ?? "21 days from now"} detail="Quote expiration window" tone="amber" />
                <MetricCard label="Margin" value={`$${quote?.margin.toLocaleString() ?? "6,500"}`} detail={`Total cost $${totalCost.toLocaleString()}`} tone="emerald" />
              </div>
            </div>

            <RiskAlert
              severity="Approval"
              title="This quote exceeds the $50,000 approval threshold."
              description="Owner / GM approval is required before it can be converted into a production job."
              href="/approvals"
              actionLabel="Open approval queue"
            />

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <DataTableShell title="Cost breakdown" subtitle="Centralized quote economics for Q-1003.">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Component</th>
                        <th className="px-4 py-2.5 font-semibold">Amount</th>
                        <th className="px-4 py-2.5 font-semibold">Signal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        ["Labor", quote?.labor ?? 24000, "Submitted"],
                        ["Materials", quote?.materials ?? 31500, "Approval"],
                        ["Outside services", quote?.outsideServices ?? 6000, "Warning"],
                        ["Setup / overhead", quote?.setupOverhead ?? 4500, "Success"],
                        ["Margin", quote?.margin ?? 6500, "Approval"],
                        ["Total", quote?.amount ?? 72500, "Critical"]
                      ].map(([label, amount, severity]) => (
                        <tr key={label}>
                          <td className="px-4 py-3 font-medium text-slate-950">{label}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">${Number(amount).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <SeverityBadge severity={severity as "Info" | "Warning" | "Critical" | "Blocked" | "Approval" | "Automation" | "Success"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>

                <DataTableShell title="Routing estimate" subtitle="Production routing carries forward once the quote is approved.">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Operation</th>
                        <th className="px-4 py-2.5 font-semibold">Work center</th>
                        <th className="px-4 py-2.5 font-semibold">Estimated hours</th>
                        <th className="px-4 py-2.5 font-semibold">Machine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {quoteRoutingEstimateRows.map((step) => (
                        <tr key={step.operation}>
                          <td className="px-4 py-3">{step.operation}</td>
                          <td className="px-4 py-3">{step.workCenter}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">{step.estimatedHours}h</td>
                          <td className="px-4 py-3 font-mono text-[13px]">{step.machine}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>

                <DataTableShell title="Material estimate" subtitle="Availability and shortage are visible before conversion.">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">SKU</th>
                        <th className="px-4 py-2.5 font-semibold">Material</th>
                        <th className="px-4 py-2.5 font-semibold">Qty</th>
                        <th className="px-4 py-2.5 font-semibold">Unit cost</th>
                        <th className="px-4 py-2.5 font-semibold">Extended</th>
                        <th className="px-4 py-2.5 font-semibold">Availability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {quoteMaterialEstimateRows.map((material) => (
                        <tr key={material.sku}>
                          <td className="px-4 py-3 font-mono text-[13px]">{material.sku}</td>
                          <td className="px-4 py-3">{material.materialName}</td>
                          <td className="px-4 py-3">{material.quantity}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">${material.unitCost}</td>
                          <td className="px-4 py-3 font-mono text-[13px]">${material.extendedCost.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <StatusBadge label={material.availabilityStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>
              </div>

              <div className="space-y-4">
                <TimelineShell title="Quote summary" subtitle="The seeded quote carries all the important commercial detail.">
                  <div className="space-y-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Approval requirement</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge label={quote?.status ?? "Needs Owner Approval"} />
                        <SeverityBadge severity="Approval" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {quote?.approvalRequiredRole ?? "Owner / GM"} required before production conversion.
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Margin summary</div>
                      <div className="mt-2 grid gap-2 text-sm text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>Margin</span>
                          <span className="font-mono text-[13px]">${quote?.margin.toLocaleString() ?? "6,500"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total cost</span>
                          <span className="font-mono text-[13px]">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Threshold</span>
                          <span className="font-mono text-[13px]">${quote?.approvalThreshold.toLocaleString() ?? "50,000"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TimelineShell>

                <TimelineShell title="Notes and approval history" subtitle="What the estimator captured and what leadership needs to know.">
                  <div className="space-y-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer-facing notes</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {quote?.customerFacingNotes ?? "Customer-facing notes will be shown here."}
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Internal notes</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {quote?.internalNotes ?? "Internal notes will be shown here."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {q1003ApprovalHistory.map((entry) => (
                        <div key={entry.timestamp + entry.title} className="rounded-md border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-slate-950">{entry.title}</div>
                            <span className="text-xs text-slate-500">{entry.timestamp}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{entry.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TimelineShell>

                <AuditPanel
                  title="Audit events"
                  subtitle="The approval trail is already recorded in the seeded audit stream."
                  items={quoteEvents.map((event) => ({
                    actor: event.actor,
                    actorRole: event.actorRole,
                    event: event.title,
                    time: event.timestamp,
                    detail: event.detail,
                    severity: event.severity,
                    entityHref: "/quotes/q-1003",
                    entityLabel: event.entityId
                  }))}
                />
              </div>
            </div>
          </div>
        );
      }

    case "approvals":
      {
        const approvalRows = getApprovalQueueRows(quotes);
        const pendingValue = approvalRows.reduce((sum, row) => sum + row.amount, 0);

        return (
          <div className="space-y-4">
            <MetricRow
              items={[
                { label: "Quotes awaiting approval", value: `${approvalRows.length}`, detail: "Owner / GM queue", tone: "amber" },
                { label: "Total value pending approval", value: `$${pendingValue.toLocaleString()}`, detail: "High-value opportunities", tone: "rose" },
                { label: "Oldest pending approval", value: approvalRows[0]?.validUntil ?? "21 days", detail: "Q-1003 is first in line", tone: "blue" },
                { label: "High-margin opportunities", value: `${approvalRows.filter((row) => row.margin >= 6000).length}`, detail: "Leadership review worthy", tone: "emerald" },
                { label: "Expiring soon", value: `${quotes.filter((quote) => quote.expiresSoon).length}`, detail: "Requires quick turnaround", tone: "amber" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <DataTableShell title="Approval table" subtitle="Owner / GM reviews high-value estimates here.">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Quote</th>
                      <th className="px-4 py-2.5 font-semibold">Customer</th>
                      <th className="px-4 py-2.5 font-semibold">Amount</th>
                      <th className="px-4 py-2.5 font-semibold">Margin</th>
                      <th className="px-4 py-2.5 font-semibold">Estimator</th>
                      <th className="px-4 py-2.5 font-semibold">Valid until</th>
                      <th className="px-4 py-2.5 font-semibold">Risk</th>
                      <th className="px-4 py-2.5 font-semibold">Reason approval required</th>
                      <th className="px-4 py-2.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {approvalRows.map((row) => (
                      <tr key={row.quoteId} className={cn(row.highlight ? "bg-amber-50/70" : "bg-white")}>
                        <td className="px-4 py-3">
                          <EntityLink href={row.href}>{row.quoteId}</EntityLink>
                        </td>
                        <td className="px-4 py-3">{row.customerName}</td>
                        <td className="px-4 py-3 font-mono text-[13px]">${row.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[13px]">${row.margin.toLocaleString()}</td>
                        <td className="px-4 py-3">{row.estimator}</td>
                        <td className="px-4 py-3">{row.validUntil}</td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={row.risk === "High" ? "Critical" : row.risk === "Medium" ? "Warning" : "Info"} />
                        </td>
                        <td className="px-4 py-3">{row.reasonApprovalRequired}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={row.href}
                            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                          >
                            {row.action}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableShell>

              <TimelineShell title="Approve Quote Q-1003" subtitle="Controlled owner review before conversion.">
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Decision</div>
                    <div className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                      Approve quote
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Owner note</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Approved for production conversion. Margin and timeline acceptable.
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Conditions</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Scheduler to confirm capacity before release.
                    </p>
                  </div>
                  <RiskAlert
                    severity="Approval"
                    title="Approving this quote will allow it to be converted into a production job."
                    description="This is the last gated step before Job J-2104 and WO-2104 are created."
                    href="/quotes/q-1003/convert"
                    actionLabel="Approve Quote"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                    >
                      Request Revision
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                    >
                      Reject
                    </button>
                    <Link
                      href="/quotes/q-1003/convert"
                      className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Approve Quote
                    </Link>
                  </div>
                </div>
              </TimelineShell>
            </div>
          </div>
        );
      }

    case "quote-convert":
      {
        const quote = getQuoteById("Q-1003", quotes);
        const quoteApproved = getAuditEventsByEntity("quote", "Q-1003", auditEvents);
        const workOrderEvents = getAuditEventsByEntity("workOrder", "WO-2104", auditEvents);
        const jobEvents = getAuditEventsByEntity("job", "J-2104", auditEvents);
        const conversionAuditEvents = [
          quoteApproved.find((event) => event.eventType === "owner-approved"),
          quoteApproved.find((event) => event.eventType === "quote-converted"),
          workOrderEvents[0],
          jobEvents.find((event) => event.eventType === "routing-generated")
        ].filter((event): event is NonNullable<typeof event> => Boolean(event));

        return (
          <div className="space-y-4">
            <RiskAlert
              severity="Success"
              title="Quote Q-1003 approved by Owner / GM."
              description="The quote is now cleared for production conversion and carries forward all seeded routing and material context."
              href="/customer-service/jobs/j-2035"
              actionLabel="Generate customer-safe status report"
            />

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <MetricRow
                  items={[
                    { label: "Quote status", value: quote?.status === "Converted to Job" ? "Converted to Job" : "Approved", detail: "Approval audit event written", tone: "emerald" },
                    { label: "Job number", value: q1003ConversionRecord.jobNumber, detail: "Created from the approved quote", tone: "blue" },
                    { label: "Work order", value: q1003ConversionRecord.workOrder, detail: "Routing and traveler follow", tone: "amber" },
                    { label: "Scheduler", value: q1003ConversionRecord.scheduler, detail: q1003ConversionRecord.supervisor, tone: "slate" }
                  ]}
                />

                <DataTableShell title="Convert Quote Q-1003 to Production Job" subtitle="The seeded conversion state carries the quote into a job and work order.">
                  <div className="grid gap-3 p-4 md:grid-cols-2">
                    {[
                      ["Quote", q1003ConversionRecord.quoteId],
                      ["Customer", q1003ConversionRecord.customerName],
                      ["Job number", q1003ConversionRecord.jobNumber],
                      ["Work order", q1003ConversionRecord.workOrder],
                      ["Routing template", q1003ConversionRecord.routingTemplate],
                      ["Initial material reservation", q1003ConversionRecord.initialMaterialReservation],
                      ["Scheduler", q1003ConversionRecord.scheduler],
                      ["Supervisor", q1003ConversionRecord.supervisor]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-950">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Generated routing preview</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q1003ConversionRecord.generatedRouting.map((step) => (
                        <StatusBadge key={step} label={step} />
                      ))}
                    </div>
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                      Converting this quote will create a job, work order, initial routing, and material reservation tasks.
                    </div>
                  </div>
                </DataTableShell>

                <DataTableShell title="Post-conversion state" subtitle="The approved quote becomes executable production work.">
                  <div className="grid gap-3 p-4 md:grid-cols-2">
                    {[
                      ["Job", q1003ConversionRecord.jobNumber],
                      ["Work order", q1003ConversionRecord.workOrder],
                      ["Source quote", q1003ConversionRecord.quoteId],
                      ["Customer", q1003ConversionRecord.customerName],
                      ["Routing", "Generated"],
                      ["Initial material reservation", "Pending"],
                      ["Assigned scheduler", q1003ConversionRecord.scheduler],
                      ["Assigned supervisor", q1003ConversionRecord.supervisor]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-950">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label="Converted to Job" />
                      <StatusBadge label="Approved" />
                      <SeverityBadge severity="Automation" />
                    </div>
                  </div>
                </DataTableShell>

                <TimelineShell title="Permission reminder" subtitle="Role-based guidance for the quote-to-job transition.">
                  <Checklist
                    items={[
                      { label: "Estimator can create and submit quotes", state: "Approved" },
                      { label: "Owner / GM can approve high-value quotes", state: "Approval" },
                      { label: "Operator cannot approve quotes or view sensitive margin details", state: "Blocked" },
                      { label: "Scheduler receives the job only after approval and conversion", state: "Automation" }
                    ]}
                  />
                </TimelineShell>
              </div>

              <div className="space-y-4">
                <AuditPanel
                  title="Audit panel"
                  subtitle="Standardized conversion events show the end-to-end trace."
                  items={conversionAuditEvents.map((event) => ({
                    actor: event.actor,
                    actorRole: event.actorRole,
                    event: event.title,
                    time: event.timestamp,
                    detail: event.detail,
                    severity: event.severity,
                    entityHref:
                      event.entityType === "quote"
                        ? "/quotes/q-1003"
                        : event.entityType === "workOrder"
                          ? "/quotes/q-1003/convert"
                          : "/quotes/q-1003/convert",
                    entityLabel: event.entityId,
                    result: event.detail,
                    notes: event.detail,
                    entityType: event.entityType
                  }))}
                />

                <TimelineShell title="Next step" subtitle="Continue the founder demo into the customer-safe reporting flow.">
                  <Link
                    href="/customer-service/jobs/j-2035"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Generate customer-safe status report
                  </Link>
                </TimelineShell>
              </div>
            </div>
          </div>
        );
      }

    case "customer-service":
      return (
        <>
          <CustomerSafeViewLabel />
          <MetricRow
            items={[
              { label: "Open requests", value: "6", detail: "Customer updates pending", tone: "blue" },
              { label: "At risk", value: "1", detail: "Material delay visible", tone: "amber" },
              { label: "Completed today", value: "14", detail: "Customer-safe communication sent", tone: "emerald" },
              { label: "Awaiting reply", value: "2", detail: "Seeded inbox placeholder", tone: "slate" }
            ]}
          />
        </>
      );

    case "customer-metrofab":
      return (
        <>
          <CustomerSafeViewLabel />
          <MetricRow
            items={[
              { label: "Account", value: "MetroFab Industries", detail: "Seeded customer account", tone: "blue" },
              { label: "Active jobs", value: "3", detail: "Shared customer-facing status only", tone: "emerald" },
              { label: "Open approvals", value: "1", detail: "Awaiting client response", tone: "amber" },
              { label: "Last update", value: "Today", detail: "No internal notes shown", tone: "slate" }
            ]}
          />
          <DataTableShell title="Customer summary" subtitle="Future phase will connect this to actual CRM data.">
            <TinyTable
              columns={["Job", "Public status", "Promise date"]}
              rows={[
                [<EntityLink href="/customer-service/jobs/j-2035">J-2035</EntityLink>, <StatusBadge label="In Production" />, "May 29"],
                [<EntityLink href="/customer-service/jobs/j-2035">J-2042</EntityLink>, <StatusBadge label="Waiting on Material" />, "Jun 02"]
              ]}
            />
          </DataTableShell>
        </>
      );

    case "customer-service-job":
      return (
        <>
          <CustomerSafeViewLabel />
          <PageHeader
            title={routeMeta[routeKey].title}
            summary="Customer-safe job status with no internal pricing or exception notes."
            action="Send status update"
            audience="customer"
          />
          <MetricRow
            items={[
              { label: "Job", value: "J-2035", detail: "Public record", tone: "blue" },
              { label: "Status", value: "In Production", detail: "Shop is working the order", tone: "emerald" },
              { label: "Next milestone", value: "Inspection", detail: "Expected this week", tone: "amber" },
              { label: "Customer visibility", value: "Safe", detail: "Internal notes hidden", tone: "slate" }
            ]}
          />
        </>
      );

    case "customer-report":
      return (
        <>
          <CustomerSafeViewLabel />
          <PrintHeader
            title="Customer Status Report - J-2035"
            subtitle="Report assembled from the operational source of truth and simplified for customer sharing."
          />
          <MetricRow
            items={[
              { label: "Progress", value: "72%", detail: "Seeded report metric", tone: "blue" },
              { label: "Current state", value: "In Production", detail: "Public-safe status", tone: "emerald" },
              { label: "Risk", value: "Low", detail: "No customer-facing hold", tone: "slate" },
              { label: "ETA", value: "May 29", detail: "Projected ship date", tone: "amber" }
            ]}
          />
        </>
      );

    case "customer-report-print":
      return (
        <>
          <CustomerSafeViewLabel />
          <PrintHeader
            title="Printable Customer Report"
            subtitle="Print-ready placeholder showing layout and paper-friendly styling."
          />
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Job" value="J-2035" detail="Customer-safe" tone="slate" />
              <MetricCard label="Status" value="In Production" detail="Public view" tone="emerald" />
              <MetricCard label="ETA" value="May 29" detail="Printed summary" tone="amber" />
            </div>
          </div>
          <PrintFooter />
        </>
      );

    case "audit":
      {
        const severityCounts = auditEvents.reduce<Record<string, number>>((counts, event) => {
          counts[event.severity] = (counts[event.severity] ?? 0) + 1;
          return counts;
        }, {});

        return (
          <>
            <InternalViewLabel />
            <MetricRow
              items={[
                { label: "Events", value: `${auditEvents.length}`, detail: "Founder trail seeded", tone: "blue" },
                { label: "Approvals", value: `${severityCounts.Approval ?? 0}`, detail: "Decision points captured", tone: "amber" },
                { label: "Critical", value: `${severityCounts.Critical ?? 0}`, detail: "Escalations and blockers", tone: "rose" },
                { label: "Traceability", value: "Full", detail: "Jobs, quotes, quality, and purchasing", tone: "emerald" }
              ]}
            />
            <AuditPanel
              title="Full traceability"
              subtitle="Everything in Phase 1 points to this seeded audit rail."
              items={auditEvents.slice(0, 8).map((event) => {
                const entityHref =
                  event.entityType === "quote"
                    ? "/quotes/q-1003"
                    : event.entityType === "job"
                      ? event.entityId === "J-2104"
                        ? "/quotes/q-1003"
                        : "/jobs/j-2035"
                      : event.entityType === "workOrder"
                        ? event.entityId === "WO-2035"
                          ? "/output/work-order-traveler/j-2035"
                          : "/quotes/q-1003"
                        : event.entityType === "material"
                          ? "/jobs/j-2099/material-impact"
                          : event.entityType === "purchaseRequest"
                            ? "/purchase-requests/pr-3091"
                            : event.entityType === "report"
                              ? "/reports/customer-status/j-2035"
                              : event.entityType === "quality"
                                ? "/quality/j-2042/scrap-approval"
                                : "/capacity";

                return {
                  actor: event.actor,
                  event: event.title,
                  time: event.timestamp,
                  detail: event.detail,
                  severity: event.severity,
                  entityHref,
                  entityLabel: event.entityId
                };
              })}
            />
          </>
        );
      }

    case "audit-job":
      return (
        <AuditPanel
          title="Job audit trail"
          subtitle="Job-level change history for seeded traceability."
          items={[
            {
              actor: "Owner / GM",
              event: "Approved quote",
              time: "8:42 AM",
              detail: "Q-1003 approved and linked to the production job.",
              severity: "Approval",
              entityHref: "/quotes/q-1003",
              entityLabel: "Q-1003"
            },
            {
              actor: "Scheduler",
              event: "Changed release date",
              time: "9:20 AM",
              detail: "Schedule shifted to preserve the press brake constraint.",
              severity: "Automation",
              entityHref: "/capacity",
              entityLabel: "Capacity"
            }
          ]}
        />
      );

    case "demo-summary":
      {
        const summary = getCapacitySummary(workCenters);

        return (
          <div className="space-y-4">
            <MetricRow
              items={[
                {
                  label: "Shell status",
                  value: "Phase 2 seed",
                  detail: "Centralized data layer wired",
                  tone: "blue"
                },
                {
                  label: "Customers",
                  value: `${customers.length}`,
                  detail: "Seeded customer accounts",
                  tone: "emerald"
                },
                {
                  label: "Steps",
                  value: "13",
                  detail: "Founder demo path preserved",
                  tone: "amber"
                },
                {
                  label: "Bottleneck",
                  value: summary.bottleneckLabel,
                  detail: `${summary.utilization}% load`,
                  tone: "slate"
                }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <DataTableShell title="Status badges" subtitle="Centralized style map for all major states.">
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {Object.entries(allStatusGroups).map(([group, statuses]) => (
                    <div key={group} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {group}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                          <StatusBadge key={status} label={status} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DataTableShell>

              <TimelineShell title="Shared component showcase" subtitle="Everything that Phase 1 exposes as reusable UI.">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EntityLink href="/jobs/j-2035">J-2035</EntityLink>
                    <EntityLink href="/quotes/q-1003">Q-1003</EntityLink>
                    <EntityLink href="/purchase-requests/pr-3091">PR-3091</EntityLink>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SeverityBadge severity="Info" />
                    <SeverityBadge severity="Warning" />
                    <SeverityBadge severity="Critical" />
                    <SeverityBadge severity="Blocked" />
                    <SeverityBadge severity="Approval" />
                    <SeverityBadge severity="Automation" />
                    <SeverityBadge severity="Success" />
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    Centralized demo records now drive the preview routes and future phase workflows.
                  </div>
                </div>
              </TimelineShell>
            </div>
          </div>
        );
      }

    default:
      return null;
  }
}

export function RoutePage({ routeKey }: { routeKey: RouteKey }) {
  const meta = routeMeta[routeKey];

  return (
    <div className="space-y-4">
      {meta.demoStep ? <DemoStepper /> : null}
      <PageHeader
        title={meta.title}
        summary={meta.summary}
        action={meta.action}
        audience={meta.audience}
      />

      <PresenterNote
        className={cn(
          meta.audience === "customer"
            ? "border-blue-200 bg-blue-50 text-blue-900"
            : "border-slate-200 bg-slate-50 text-slate-700"
        )}
      >
        {meta.presenterNote ??
          "Phase 1 keeps the record structure and visual language in place while the actual workflow logic is built later."}
      </PresenterNote>

      {routeBlocks(routeKey)}
    </div>
  );
}
