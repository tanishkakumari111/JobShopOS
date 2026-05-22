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
import { routeMeta, type RouteKey } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  auditEvents,
  calculateScrapRate,
  customers,
  getAuditEventsByEntity,
  getCapacitySummary,
  getCustomerSafeJobStatus,
  getCustomerServiceSummary,
  getCustomerRiskQueue,
  getCustomerStatusReports,
  getAuditSummary,
  getAuditEntityQuickFilters,
  getAuditTimelineRows,
  getDashboardRiskItems,
  getDashboardMetrics,
  getCapacityRiskJobIds,
  getJobById,
  getJ2035EntityTimeline,
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
  getFinalValuePillars,
  getDemoPathRecap,
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
  reports,
  customerSafeTimeline,
  customerStatusReport,
  metrofabCustomerProfile,
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
      {
        const summary = getCustomerServiceSummary(jobs, reports);
        const riskQueue = getCustomerRiskQueue(jobs);
        const customerCards = customers.map((customer) => customer.name);

        return (
          <div className="space-y-4">
            <MetricRow
              items={[
                { label: "Customer status requests today", value: `${summary.customerStatusRequestsToday}`, detail: "Answer questions without disrupting the floor", tone: "blue" },
                { label: "Jobs due this week", value: `${summary.jobsDueThisWeek}`, detail: "Promised work still in flight", tone: "amber" },
                { label: "Jobs at risk", value: `${summary.jobsAtRisk}`, detail: "Watch or higher risk", tone: "rose" },
                { label: "Jobs ready to ship", value: `${summary.jobsReadyToShip}`, detail: "Customer-safe delivery queue", tone: "emerald" },
                { label: "Jobs waiting on material", value: `${summary.jobsWaitingOnMaterial}`, detail: "Need procurement or replan", tone: "amber" },
                { label: "Reports generated today", value: `${summary.reportsGeneratedToday}`, detail: "Customer-safe updates prepared", tone: "emerald" }
              ]}
            />

            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Customer Service Representative</div>
                <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Customer Service Command Center</h1>
                <p className="max-w-4xl text-sm leading-6 text-slate-500">
                  Now we move from internal operations to customer communication. Customer Service can answer status questions quickly without interrupting the shop floor.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Search-first layout</div>
              <div className="mt-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                Search by job, quote, customer, PO, or part
              </div>
            </div>

            <DataTableShell title="Customer risk queue" subtitle="Customer-safe statuses are derived from the operational source of truth.">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Job</th>
                    <th className="px-4 py-2.5 font-semibold">Customer</th>
                    <th className="px-4 py-2.5 font-semibold">Customer PO</th>
                    <th className="px-4 py-2.5 font-semibold">Part</th>
                    <th className="px-4 py-2.5 font-semibold">Current internal status</th>
                    <th className="px-4 py-2.5 font-semibold">Due date</th>
                    <th className="px-4 py-2.5 font-semibold">Customer-facing status</th>
                    <th className="px-4 py-2.5 font-semibold">Internal blocker</th>
                    <th className="px-4 py-2.5 font-semibold">Last update</th>
                    <th className="px-4 py-2.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {riskQueue.map((row) => (
                    <tr key={row.jobId} className={cn(row.highlight ? "bg-blue-50/70" : "bg-white")}>
                      <td className="px-4 py-3">
                        <EntityLink href={row.href}>{row.jobId}</EntityLink>
                      </td>
                      <td className="px-4 py-3">{row.customerName}</td>
                      <td className="px-4 py-3 font-mono text-[13px]">{row.customerPo}</td>
                      <td className="px-4 py-3">{row.part}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={row.currentInternalStatus} />
                      </td>
                      <td className="px-4 py-3">{row.dueDate}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={row.customerFacingStatus === "On Track" ? "Success" : row.customerFacingStatus === "Watch" ? "Warning" : "Critical"} />
                        <span className="ml-2 text-sm text-slate-600">{row.customerFacingStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.internalBlocker}</td>
                      <td className="px-4 py-3 text-slate-600">{row.lastUpdate}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={row.href}
                          className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                        >
                          {row.jobId === "J-2035" ? "View status" : "View"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableShell>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <DataTableShell title="Recent customer records" subtitle="MetroFab is the demo target for the customer-service walkthrough.">
                <div className="space-y-2 p-4">
                  {customerCards.map((customer) => (
                    <div key={customer} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span className="text-sm font-medium text-slate-950">{customer}</span>
                      {customer === "MetroFab Industries" ? (
                        <Link
                          href="/customers/metrofab-industries"
                          className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                        >
                          Open customer
                        </Link>
                      ) : (
                        <StatusBadge label="Active" />
                      )}
                    </div>
                  ))}
                </div>
              </DataTableShell>

              <TimelineShell title="Demo path" subtitle="Step 11 of 13 - Customer Status Report - J-2035">
                <div className="space-y-3">
                  <RiskAlert
                    severity="Info"
                    title="View customer-safe status for J-2035"
                    description="This route strips out sensitive internal detail while preserving accurate delivery communication."
                    href="/customer-service/jobs/j-2035"
                    actionLabel="View customer-safe status"
                  />
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    Customer Service can answer status questions quickly without interrupting the shop floor.
                  </div>
                </div>
              </TimelineShell>
            </div>
          </div>
        );
      }

    case "customer-metrofab":
      {
        const customerJobs = jobs.filter((job) => job.customerSlug === "metrofab-industries" || job.id === "J-2035");

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CustomerSafeViewLabel />
                    <StatusBadge label={metrofabCustomerProfile.status} />
                  </div>
                  <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Customer Detail - MetroFab Industries</h1>
                  <div className="grid gap-x-4 gap-y-1 text-sm text-slate-600 md:grid-cols-2">
                    <div>Account contact: <span className="font-medium text-slate-950">{metrofabCustomerProfile.accountContact}</span></div>
                    <div>Email: <span className="font-medium text-slate-950">{metrofabCustomerProfile.email}</span></div>
                    <div>Phone: <span className="font-medium text-slate-950">{metrofabCustomerProfile.phone}</span></div>
                    <div>Open jobs: <span className="font-medium text-slate-950">{metrofabCustomerProfile.openJobs}</span></div>
                    <div>Open quotes: <span className="font-medium text-slate-950">{metrofabCustomerProfile.openQuotes}</span></div>
                    <div>On-time delivery rate: <span className="font-medium text-slate-950">{metrofabCustomerProfile.onTimeDeliveryRate}%</span></div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <MetricCard label="Customer status" value={metrofabCustomerProfile.status} detail="Active account" tone="emerald" />
                  <MetricCard label="Open jobs" value={`${metrofabCustomerProfile.openJobs}` } detail="Production and support" tone="blue" />
                  <MetricCard label="Open quotes" value={`${metrofabCustomerProfile.openQuotes}` } detail="Commercial pipeline" tone="amber" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {metrofabCustomerProfile.tabs.map((tab, index) => (
                <span
                  key={tab}
                  className={cn(
                    "rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
                    index === 0 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-600"
                  )}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <DataTableShell title="Open jobs" subtitle="Active MetroFab jobs available to Customer Service.">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Job</th>
                      <th className="px-4 py-2.5 font-semibold">Customer PO</th>
                      <th className="px-4 py-2.5 font-semibold">Part</th>
                      <th className="px-4 py-2.5 font-semibold">Quantity</th>
                      <th className="px-4 py-2.5 font-semibold">Current status</th>
                      <th className="px-4 py-2.5 font-semibold">Due date</th>
                      <th className="px-4 py-2.5 font-semibold">Risk</th>
                      <th className="px-4 py-2.5 font-semibold">Last update</th>
                      <th className="px-4 py-2.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customerJobs.map((job) => (
                      <tr key={job.id} className={job.id === "J-2035" ? "bg-blue-50/70" : "bg-white"}>
                        <td className="px-4 py-3">
                          <EntityLink href="/customer-service/jobs/j-2035">{job.id}</EntityLink>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px]">{job.customerPo}</td>
                        <td className="px-4 py-3">{job.part}</td>
                        <td className="px-4 py-3">{job.quantity}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={job.id === "J-2035" ? "In Production" : job.status} />
                        </td>
                        <td className="px-4 py-3">{job.dueDate}</td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={job.risk === "None" ? "Info" : job.risk === "Low" ? "Success" : job.risk === "Watch" ? "Warning" : job.risk === "High" ? "Critical" : "Blocked"} />
                        </td>
                        <td className="px-4 py-3">{job.id === "J-2035" ? "Updated 12 min ago" : "Updated recently"}</td>
                        <td className="px-4 py-3">
                          <Link
                            href="/customer-service/jobs/j-2035"
                            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                          >
                            View customer-safe status
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableShell>

              <TimelineShell title="Status reports" subtitle="Previous and generated report preview.">
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer Job Status Report</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">J-2035</div>
                    <div className="mt-1 text-sm text-slate-600">Prepared by Customer Service</div>
                    <div className="mt-1 text-sm text-slate-600">Status: Generated</div>
                    <div className="mt-1 text-sm text-slate-600">Last update: Today 3:01 PM</div>
                    <div className="mt-3">
                      <Link
                        href="/reports/customer-status/j-2035"
                        className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                      >
                        Open report
                      </Link>
                    </div>
                  </div>
                </div>
              </TimelineShell>
            </div>
          </div>
        );
      }

    case "customer-service-job":
      {
        const customerSafe = getCustomerSafeJobStatus("J-2035", jobs);
        const customerSafeSummary =
          customerSafe?.summary ??
          "This view hides margin, internal cost, operator blame, detailed scrap blame, supervisor-only notes, and internal approval comments.";

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <EntityLink href="/jobs/j-2035">J-2035</EntityLink>
                    <CustomerSafeViewLabel />
                    <StatusBadge label="On Track" />
                  </div>
                  <p className="max-w-3xl text-sm leading-6 text-slate-500">
                    {customerSafeSummary}
                  </p>
                  <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Customer-Facing Job Status - J-2035</h1>
                  <div className="grid gap-x-4 gap-y-1 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <div>Customer: <span className="font-medium text-slate-950">MetroFab Industries</span></div>
                    <div>Customer PO: <span className="font-medium text-slate-950">PO-8841</span></div>
                    <div>Part: <span className="font-medium text-slate-950">Bracket Set Rev A</span></div>
                    <div>Quantity: <span className="font-medium text-slate-950">500</span></div>
                    <div>Due date: <span className="font-medium text-slate-950">Friday</span></div>
                    <div>Customer-facing status: <span className="font-medium text-slate-950">{customerSafe?.summary ? "On Track" : "On Track"}</span></div>
                    <div>Internal status: <span className="font-medium text-slate-950">{customerSafe?.status ?? "In Production"}</span></div>
                    <div>Current routing step: <span className="font-medium text-slate-950">Bend</span></div>
                    <div>Work center: <span className="font-medium text-slate-950">Press Brake</span></div>
                    <div>Progress: <span className="font-medium text-slate-950">62%</span></div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <MetricCard label="Customer-facing status" value="On Track" detail="Safe to share" tone="emerald" />
                  <MetricCard label="Internal status" value="In Production" detail="Operational record" tone="blue" />
                  <MetricCard label="Progress" value="62%" detail="Bend in progress" tone="amber" />
                </div>
              </div>
            </div>

            <TimelineShell title="Customer-safe view" subtitle="This view hides margin, internal cost, operator blame, supervisor-only notes, and sensitive quality details.">
              <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                This view hides margin, internal cost, operator blame, supervisor-only notes, and sensitive quality details.
              </div>
              <div className="space-y-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Quote approved</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Work order released</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Material reserved</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Cutting complete</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Bending in progress</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Welding pending</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Finishing pending</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Quality inspection pending</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Packing and shipment pending</div>
              </div>
            </TimelineShell>

            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <TimelineShell title="Customer update summary" subtitle="Short, accurate communication for MetroFab Industries.">
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    <div className="font-semibold text-slate-950">Current status</div>
                    <p className="mt-1">In production</p>
                    <div className="mt-3 font-semibold text-slate-950">Next milestone</div>
                    <p className="mt-1">Welding</p>
                    <div className="mt-3 font-semibold text-slate-950">Expected completion</div>
                    <p className="mt-1">On schedule</p>
                    <div className="mt-3 font-semibold text-slate-950">Shipping readiness</div>
                    <p className="mt-1">Pending final quality inspection</p>
                  </div>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                  Your order is currently in production and remains on schedule. The bending step is in progress, with welding and final inspection scheduled next.
                </div>
              </div>
            </TimelineShell>

              <TimelineShell title="Hidden internal data reminder" subtitle="Do not expose sensitive shop-floor detail.">
                <div className="space-y-2 text-sm text-slate-700">
                  {[
                    "Margin",
                    "Internal cost",
                    "Operator blame",
                    "Detailed scrap blame",
                    "Supervisor-only notes",
                    "Internal approval comments"
                  ].map((item) => (
                    <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      {item}
                    </div>
                  ))}
                </div>
              </TimelineShell>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                Copy customer update
              </button>
              <Link href="/reports/customer-status/j-2035" className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Generate status report
              </Link>
              <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                Email report
              </button>
              <Link href="/reports/customer-status/j-2035/print" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                Print report
              </Link>
              <Link href="/jobs/j-2035" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                View internal job detail
              </Link>
            </div>
          </div>
        );
      }

    case "customer-report":
      {
        const customerReport = getCustomerStatusReports(customerStatusReport, customerSafeTimeline);

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Generated report status</div>
                <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Customer Status Report - J-2035</h1>
                <p className="max-w-4xl text-sm leading-6 text-slate-500">
                  This report gives Customer Service a professional, customer-safe way to communicate accurate status without exposing sensitive internal operations.
                </p>
                <div className="text-sm text-slate-600">
                  Report saved under <span className="font-medium text-slate-950">{customerReport.report.reportSavedTo}</span>
                </div>
                <div className="text-sm text-slate-600">
                  Last customer update timestamp: <span className="font-medium text-slate-950">{customerReport.report.preparedTimestamp}</span>
                </div>
              </div>
            </div>

            <PrintHeader
              title="Customer Status Report - J-2035"
              subtitle="Report assembled from the operational source of truth and simplified for customer sharing."
            />

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 print:border-slate-300">
              Company Header Placeholder
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <MetricCard label="Customer" value={customerReport.report.customer} detail={customerReport.report.contact} tone="blue" />
                    <MetricCard label="Current status" value={customerReport.report.currentStatus} detail={customerReport.report.customerFacingStatus} tone="emerald" />
                    <MetricCard label="Progress" value={`${customerReport.report.progress}%`} detail="Customer-safe" tone="amber" />
                    <MetricCard label="Next milestone" value={customerReport.report.nextMilestone} detail="Welding is next" tone="slate" />
                    <MetricCard label="Shipment readiness" value={customerReport.report.shipmentReadiness} detail="Pending inspection" tone="rose" />
                    <MetricCard label="Prepared by" value={customerReport.report.preparedBy} detail={customerReport.report.preparedTimestamp} tone="blue" />
                  </div>
                </div>

                <TimelineShell title="Customer-safe timeline" subtitle="Shared from the same operational source of truth, but without internal detail.">
                  <div className="space-y-2">
                    {customerReport.timeline.map((item) => (
                      <div key={item.title} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <div>
                          <div className="text-sm font-medium text-slate-950">{item.title}</div>
                          <div className="text-sm text-slate-600">{item.detail}</div>
                        </div>
                        <SeverityBadge severity={item.severity} />
                      </div>
                    ))}
                  </div>
                </TimelineShell>

                <TimelineShell title="Customer-safe message" subtitle="What Customer Service can send with confidence.">
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                    {customerReport.report.message}
                  </div>
                </TimelineShell>
              </div>

              <AuditPanel
                title="Audit preview"
                subtitle="Standardized event from customer report generation."
                items={[
                  {
                    actor: "Customer Service",
                    actorRole: "Customer Service Representative",
                    event: "Generated customer status report",
                    time: customerReport.report.preparedTimestamp,
                    detail: "Customer-facing report created",
                    severity: "Info",
                    entityHref: "/customer-service/jobs/j-2035",
                    entityLabel: "J-2035",
                    result: "Customer-facing report created",
                    notes: "Report saved to MetroFab Industries customer record",
                    entityType: "Job"
                  }
                ]}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/reports/customer-status/j-2035/print" className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Print report
              </Link>
              <Link href="/audit" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                View full audit trail
              </Link>
              <Link href="/customer-service/jobs/j-2035" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                Back to customer-safe status
              </Link>
            </div>
          </div>
        );
      }

    case "customer-report-print":
      {
        const customerReport = customerStatusReport;

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none print:border-0 print:p-0">
              <div className="flex items-center justify-between gap-4 print:hidden">
                <CustomerSafeViewLabel />
                <div className="flex items-center gap-2">
                  <PrintButton />
                  <Link href="/reports/customer-status/j-2035" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                    Back to report preview
                  </Link>
                  <Link href="/audit" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
                    View audit trail
                  </Link>
                </div>
              </div>

              <PrintHeader
                title="Customer Job Status Report"
                subtitle="MetroFab Industries - customer-safe status summary"
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard label="Customer" value={customerReport.customer} detail={customerReport.contact} tone="slate" />
                <MetricCard label="Job" value={customerReport.jobId} detail={customerReport.customerPo} tone="blue" />
                <MetricCard label="Current status" value={customerReport.currentStatus} detail={customerReport.customerFacingStatus} tone="emerald" />
                <MetricCard label="Progress" value={`${customerReport.progress}%`} detail="Customer-safe" tone="amber" />
                <MetricCard label="Next milestone" value={customerReport.nextMilestone} detail="Welding is next" tone="slate" />
                <MetricCard label="Prepared by" value={customerReport.preparedBy} detail={customerReport.preparedTimestamp} tone="blue" />
              </div>

              <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 print:border-slate-300">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Customer", customerReport.customer],
                    ["Contact", customerReport.contact],
                    ["Job", customerReport.jobId],
                    ["Customer PO", customerReport.customerPo],
                    ["Part", customerReport.part],
                    ["Quantity", `${customerReport.quantity}`],
                    ["Due date", customerReport.dueDate],
                    ["Current status", customerReport.currentStatus],
                    ["Customer-facing status", customerReport.customerFacingStatus],
                    ["Progress", `${customerReport.progress}%`],
                    ["Next milestone", customerReport.nextMilestone],
                    ["Shipment readiness", customerReport.shipmentReadiness],
                    ["Prepared by", customerReport.preparedBy],
                    ["Prepared timestamp", customerReport.preparedTimestamp]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                      <div className="mt-2 text-sm font-medium text-slate-950">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <TimelineShell title="Customer-safe timeline" subtitle="Printed report keeps the communication aligned and readable.">
                <div className="space-y-2">
                  {customerSafeTimeline.map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium text-slate-950">{item.title}</div>
                        <div className="text-sm text-slate-600">{item.detail}</div>
                      </div>
                      <SeverityBadge severity={item.severity} />
                    </div>
                  ))}
                </div>
              </TimelineShell>

              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                {customerReport.message}
              </div>

              <PrintFooter />
            </div>
          </div>
        );
      }

    case "audit":
      {
        const founderAuditEvents = auditEvents.filter((event) => event.id !== 16);
        const summary = getAuditSummary(founderAuditEvents);
        const auditRows = getAuditTimelineRows(founderAuditEvents);
        const quickFilters = getAuditEntityQuickFilters();

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <InternalViewLabel />
                  <StatusBadge label="Full Traceability" />
                </div>
                <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Audit Trail</h1>
                <p className="max-w-4xl text-sm leading-6 text-slate-500">
                  Complete operational history across quotes, jobs, materials, quality, customer reports, and system events.
                </p>
              </div>
            </div>

            <MetricRow
              items={[
                { label: "Audit events today", value: `${summary.auditEventsToday}`, detail: "Traceability already captured", tone: "blue" },
                { label: "Events requiring review", value: `${summary.eventsRequiringReview}`, detail: "Approvals and escalations", tone: "amber" },
                { label: "User actions logged", value: `${summary.userActionsLogged}`, detail: "Human activity recorded", tone: "emerald" },
                { label: "System automations logged", value: `${summary.systemAutomationsLogged}`, detail: "Workflow and orchestration", tone: "slate" },
                { label: "Exports generated", value: `${summary.exportsGenerated}`, detail: "Traveler and report outputs", tone: "blue" },
                { label: "Compliance-ready records", value: `${summary.complianceReadyRecords}`, detail: "A complete founder trail", tone: "rose" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <TimelineShell title="Filters" subtitle="Static controls for the audit log.">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    "Date range",
                    "Actor",
                    "Role",
                    "Entity type",
                    "Entity ID",
                    "Action type",
                    "Severity",
                    "Workflow",
                    "Search audit log"
                  ].map((label) => (
                    <label key={label} className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
                      <input
                        type="text"
                        readOnly
                        value={label === "Search audit log" ? "Search audit log" : "All"}
                        className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Entity quick filters
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickFilters.map((filter) => (
                      <button
                        key={filter.label}
                        type="button"
                        className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </TimelineShell>

              <DataTableShell title="Founder audit timeline" subtitle="All 15 founder demo events, in chronological trace order.">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                        <th className="px-4 py-2.5 font-semibold">Actor</th>
                        <th className="px-4 py-2.5 font-semibold">Role</th>
                        <th className="px-4 py-2.5 font-semibold">Action</th>
                        <th className="px-4 py-2.5 font-semibold">Entity type</th>
                        <th className="px-4 py-2.5 font-semibold">Entity ID</th>
                        <th className="px-4 py-2.5 font-semibold">Result</th>
                        <th className="px-4 py-2.5 font-semibold">Notes</th>
                        <th className="px-4 py-2.5 font-semibold">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {auditRows.map((row) => (
                        <tr key={`${row.timestamp}-${row.action}`} className="align-top">
                          <td className="px-4 py-3 text-slate-700">{row.timestamp}</td>
                          <td className="px-4 py-3 font-medium text-slate-950">{row.actor}</td>
                          <td className="px-4 py-3 text-slate-700">{row.actorRole}</td>
                          <td className="px-4 py-3 text-slate-700">{row.action}</td>
                          <td className="px-4 py-3 text-slate-700">{row.entityType}</td>
                          <td className="px-4 py-3">
                            <EntityLink href={row.href}>{row.entityId}</EntityLink>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{row.result}</td>
                          <td className="px-4 py-3 text-slate-600">{row.notes}</td>
                          <td className="px-4 py-3">
                            <SeverityBadge severity={row.severity} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataTableShell>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-none">
              <div className="text-sm text-slate-600">
                The trail spans quotes, jobs, quality, purchasing, customer communication, and system automation.
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                >
                  Export Audit CSV
                </button>
                <Link
                  href="/audit/jobs/j-2035"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  View entity timeline
                </Link>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/audit/jobs/j-2035"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View J-2035 entity timeline
              </Link>
            </div>
          </div>
        );
      }

    case "audit-job":
      {
        const entityTimeline = getJ2035EntityTimeline();
        const auditRecords = auditEvents.filter((event) =>
          [
            "job-moved-production",
            "traveler-printed",
            "customer-report-generated",
            "customer-report-saved"
          ].includes(event.eventType)
        );

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <EntityLink href="/jobs/j-2035">J-2035</EntityLink>
                  <StatusBadge label="In Production" />
                  <StatusBadge label="On Track" />
                </div>
                <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Entity Timeline — J-2035</h1>
                <p className="max-w-4xl text-sm leading-6 text-slate-500">
                  Job-level lineage showing the linked quote, production release, traveler, customer-safe report, and final audit proof.
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <TimelineShell title="Linked entities" subtitle="Everything points back to the same production record.">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Work order</div>
                    <EntityLink href="/output/work-order-traveler/j-2035" className="mt-2 inline-flex">
                      WO-2035
                    </EntityLink>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">MetroFab Industries</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer PO</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">PO-8841</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Traveler</div>
                    <EntityLink href="/output/work-order-traveler/j-2035" className="mt-2 inline-flex">
                      Work Order Traveler
                    </EntityLink>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer report</div>
                    <EntityLink href="/reports/customer-status/j-2035" className="mt-2 inline-flex">
                      Customer Job Status Report
                    </EntityLink>
                  </div>
                </div>
              </TimelineShell>

              <TimelineShell title="Timeline events" subtitle="Lineage from approval through customer communication.">
                <div className="space-y-3">
                  {entityTimeline.map((item) => (
                    <div key={`${item.timestamp}-${item.title}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                        <SeverityBadge severity={item.severity} />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                      <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {item.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </TimelineShell>
            </div>

            <AuditPanel
              title="Audit records"
              subtitle="Filtered job events for the J-2035 lineage."
              items={auditRecords.map((event) => ({
                actor: event.actor,
                actorRole: event.actorRole,
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
                entityLabel: event.entityId,
                result: event.detail,
                notes: event.detail,
                entityType: event.entityType
              }))}
            />

            <div className="flex justify-end">
              <Link
                href="/demo/summary"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View final demo summary
              </Link>
            </div>
          </div>
        );
      }

    case "demo-summary":
      {
        const pillars = getFinalValuePillars();
        const demoRecap = getDemoPathRecap();

        return (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
              <div className="space-y-2">
                <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">
                  JobShop OS: One Operating System for Custom Manufacturing
                </h1>
                <p className="max-w-4xl text-sm leading-6 text-slate-500">
                  Quote governance, capacity visibility, production control, materials readiness, quality accountability,
                  customer communication, and auditability - all connected.
                </p>
              </div>
            </div>

            <MetricRow
              items={[
                { label: "Founder demo steps", value: "13", detail: "End-to-end trace path", tone: "blue" },
                { label: "Highlighted risks", value: "5", detail: "Capacity, quality, material, quote, production", tone: "amber" },
                { label: "Customer-safe reports", value: "1", detail: "MetroFab communication package", tone: "emerald" },
                { label: "Audit trail", value: "Full", detail: "Traceability across every phase", tone: "rose" }
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <DataTableShell title="Seven value pillars" subtitle="The operating model the founder demo communicates.">
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {pillars.map((pillar) => (
                    <div key={pillar.title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{pillar.title}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </DataTableShell>

              <TimelineShell title="Demo path recap" subtitle="From the dashboard to full traceability.">
                <div className="flex flex-wrap gap-2">
                  {demoRecap.map((step, index) => (
                    <div
                      key={step}
                      className={cn(
                        "rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
                        index === 0 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-600"
                      )}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                  JobShop OS helps custom manufacturers catch risks early, keep jobs moving, and run quoting, production,
                  quality, materials, purchasing, customer updates, and audit history from one operating system.
                </div>
              </TimelineShell>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
              <TimelineShell title="Final value statement" subtitle="What the founder demo closes with.">
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                  JobShop OS helps custom manufacturers catch risks early, keep jobs moving, and run quoting, production,
                  quality, materials, purchasing, customer updates, and audit history from one operating system.
                </div>
              </TimelineShell>
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Restart founder demo
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                >
                  Open Production Dashboard
                </Link>
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                >
                  View full audit trail
                </Link>
                <Link
                  href="/audit/jobs/j-2035"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                >
                  View J-2035 timeline
                </Link>
              </div>
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
