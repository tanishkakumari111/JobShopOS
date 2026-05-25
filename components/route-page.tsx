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
import {
  CustomerDetailView,
  CustomerReportPrintView,
  CustomerReportView,
  CustomerServiceCommandCenterView,
  CustomerServiceJobView
} from "@/components/customer-report-workflow-pages";
import {
  ApprovalsView,
  QuoteConversionView,
  QuoteDetailView
} from "@/components/quote-workflow-pages";
import {
  MaterialDashboardView,
  MaterialDetailView,
  MaterialImpactView,
  PurchaseRequestView
} from "@/components/material-workflow-pages";
import {
  QualityDashboardView,
  ReworkCreatedView,
  ScrapApprovalView
} from "@/components/quality-workflow-pages";
import { routeMeta, type RouteKey } from "@/lib/routes";
import { getDataSourceMode } from "@/lib/data-source";
import { cn } from "@/lib/utils";
import {
  auditEvents,
  getCapacitySummary,
  getDashboardRiskItems,
  getDashboardMetrics,
  getProductionQueue,
  getWorkCenterCapacityRows,
  getRecentAuditEvents,
  getFinalValuePillars,
  getDemoPathRecap,
  q1003QuoteForm,
  jobs,
  materials,
  quotes,
  reworkOrders,
  demoPath,
  workCenters
} from "@/lib/demo-data";
import {
  getCapacityPlannerReadModel,
  getJobDetailReadModel,
  getWorkOrderTravelerReadModel
} from "@/lib/read-models/production";
import {
  getCustomerDetailReadModel,
  getCustomerSafeJobStatusReadModel,
  getCustomerServiceReadModel,
  getCustomerStatusReportReadModel,
  getPrintableCustomerReportReadModel
} from "@/lib/read-models/customer-reporting";
import {
  getMaterialDetailReadModel,
  getMaterialImpactReadModel,
  getMaterialsDashboardReadModel,
  getPurchaseRequestReadModel
} from "@/lib/read-models/materials";
import {
  getQualityDashboardReadModel,
  getReworkCreatedReadModel,
  getScrapApprovalReadModel
} from "@/lib/read-models/quality";
import {
  getApprovalsReadModel,
  getQuoteDetailReadModel,
  getQuotesDashboardReadModel
} from "@/lib/read-models/quotes";

function PageHeader({
  title,
  summary,
  action,
  audience,
  hideActions = false
}: {
  title: string;
  summary: string;
  action: string;
  audience: "internal" | "customer";
  hideActions?: boolean;
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
        {!hideActions ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-text transition hover:border-accent/30 hover:text-accent"
            >
              <Plus className="h-4 w-4" />
              Secondary action
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <FileText className="h-4 w-4" />
              {action}
            </button>
          </div>
        ) : null}
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

async function routeBlocks(routeKey: RouteKey) {
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
        const readModel = await getCapacityPlannerReadModel();
        const { summary, capacityRows, capacityRiskJobIds } = readModel;

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
        const readModel = await getJobDetailReadModel("J-2035");
        const { job, customerSafe, capacitySummary, jobTrace, routingSteps, productionUpdates, qualityReadiness, travelerMaterials } = readModel;

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
                      {routingSteps.map((step) => {
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
                  description={`Press Brake weekly capacity: ${capacitySummary.capacityHoursPerWeek}h. Queued load: ${capacitySummary.queuedHoursPerWeek}h. Current Bend step may delay downstream Weld and Finish steps.`}
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
                      {travelerMaterials.map((row) => (
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
                    {qualityReadiness.map((item) => (
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
                  {productionUpdates.map((update) => (
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
        const readModel = await getWorkOrderTravelerReadModel("J-2035");
        const {
          job,
          travelerRoutingRows,
          travelerMaterials,
          travelerSignOffFields,
          qualityInspectionChecks,
          scrapAndReworkFields,
          travelerShipping
        } = readModel;

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
                    {travelerRoutingRows.map((row) => (
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
                      {travelerMaterials.map((row) => (
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
                  {travelerSignOffFields.map((field) => (
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
                  {qualityInspectionChecks.slice(0, 3).map((check) => (
                    <div key={check.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5">
                      <span>{check.label}</span>
                      <StatusBadge label={check.value} />
                    </div>
                  ))}
                  <div className="grid gap-3 md:grid-cols-3">
                    {qualityInspectionChecks.slice(3).map((check) => (
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
                  {scrapAndReworkFields.map((field) => (
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
                  {travelerShipping.map((item) => (
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
        const model = await getQualityDashboardReadModel();
        return (
          <QualityDashboardView
            dataSourceMode={getDataSourceMode()}
            baseJobs={model.baseJobs}
            baseReworkOrders={model.baseReworkOrders}
            baseAuditEvents={model.baseAuditEvents}
            baseInspectionQueueRows={model.baseInspectionQueueRows}
            baseDefectReasonBreakdownRows={model.baseDefectReasonBreakdownRows}
            baseQualityTimeline={model.baseQualityTimeline}
          />
        );
      }
    case "quality-scrap":
      {
        const model = await getScrapApprovalReadModel("J-2042");
        return (
          <ScrapApprovalView
            dataSourceMode={getDataSourceMode()}
            baseJobs={model.baseJobs}
            baseReworkOrders={model.baseReworkOrders}
            baseAuditEvents={model.baseAuditEvents}
            baseScrapEventDetail={model.baseScrapEventDetail}
          />
        );
      }
    case "quality-rework":
      {
        const model = await getReworkCreatedReadModel("J-2042");
        return (
          <ReworkCreatedView
            dataSourceMode={getDataSourceMode()}
            baseJobs={model.baseJobs}
            baseReworkOrders={model.baseReworkOrders}
            baseAuditEvents={model.baseAuditEvents}
          />
        );
      }
    case "materials":
      {
        const model = await getMaterialsDashboardReadModel();
      return (
        <MaterialDashboardView
          dataSourceMode={getDataSourceMode()}
          baseJobs={model.baseJobs}
          baseMaterials={model.baseMaterials}
          basePurchaseRequests={model.basePurchaseRequests}
            baseAuditEvents={model.baseAuditEvents}
            baseMaterialRows={model.baseMaterialRows}
            baseBlockedJobs={model.baseBlockedJobs}
            baseReservationBreakdown={model.baseReservationBreakdown}
            baseSupplierPanel={model.baseSupplierPanel}
            baseMaterialImpactTimeline={model.baseMaterialImpactTimeline}
            basePurchaseRequestState={model.basePurchaseRequestState}
            basePurchaseRequestAuditTrail={model.basePurchaseRequestAuditTrail}
          />
        );
      }
    case "material-al6061":
      {
        const model = await getMaterialDetailReadModel("AL-6061-PLT-0.375");
      return (
        <MaterialDetailView
          dataSourceMode={getDataSourceMode()}
          baseJobs={model.baseJobs}
          baseMaterials={model.baseMaterials}
          basePurchaseRequests={model.basePurchaseRequests}
            baseAuditEvents={model.baseAuditEvents}
            baseMaterialRows={model.baseMaterialRows}
            baseBlockedJobs={model.baseBlockedJobs}
            baseReservationBreakdown={model.baseReservationBreakdown}
            baseSupplierPanel={model.baseSupplierPanel}
            baseMaterialImpactTimeline={model.baseMaterialImpactTimeline}
            basePurchaseRequestState={model.basePurchaseRequestState}
            basePurchaseRequestAuditTrail={model.basePurchaseRequestAuditTrail}
          />
        );
      }
    case "job-2099-material":
      {
        const model = await getMaterialImpactReadModel("J-2099");
      return (
        <MaterialImpactView
          dataSourceMode={getDataSourceMode()}
          baseJobs={model.baseJobs}
          baseMaterials={model.baseMaterials}
          basePurchaseRequests={model.basePurchaseRequests}
            baseAuditEvents={model.baseAuditEvents}
            baseMaterialRows={model.baseMaterialRows}
            baseBlockedJobs={model.baseBlockedJobs}
            baseReservationBreakdown={model.baseReservationBreakdown}
            baseSupplierPanel={model.baseSupplierPanel}
            baseMaterialImpactTimeline={model.baseMaterialImpactTimeline}
            basePurchaseRequestState={model.basePurchaseRequestState}
            basePurchaseRequestAuditTrail={model.basePurchaseRequestAuditTrail}
          />
        );
      }
    case "purchase-request":
      {
        const model = await getPurchaseRequestReadModel("PR-3091");
      return (
        <PurchaseRequestView
          dataSourceMode={getDataSourceMode()}
          baseJobs={model.baseJobs}
          baseMaterials={model.baseMaterials}
          basePurchaseRequests={model.basePurchaseRequests}
            baseAuditEvents={model.baseAuditEvents}
            baseMaterialRows={model.baseMaterialRows}
            baseBlockedJobs={model.baseBlockedJobs}
            baseReservationBreakdown={model.baseReservationBreakdown}
            baseSupplierPanel={model.baseSupplierPanel}
            baseMaterialImpactTimeline={model.baseMaterialImpactTimeline}
            basePurchaseRequestState={model.basePurchaseRequestState}
            basePurchaseRequestAuditTrail={model.basePurchaseRequestAuditTrail}
          />
        );
      }
    case "quotes":
      {
        const { summary, quoteRows } = await getQuotesDashboardReadModel();
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
        const readModel = await getQuoteDetailReadModel("Q-1003");

        return (
          <QuoteDetailView
            dataSourceMode={getDataSourceMode()}
            quote={readModel.quote}
            auditEvents={readModel.auditEvents}
            approvalHistory={readModel.approvalHistory}
            routingEstimateRows={readModel.routingEstimateRows}
            materialEstimateRows={readModel.materialEstimateRows}
            quoteForm={readModel.quoteForm}
            conversionRecord={readModel.conversionRecord}
          />
        );
      }
    case "quote-convert":
      {
        const readModel = await getQuoteDetailReadModel("Q-1003");

        return (
          <QuoteConversionView
            dataSourceMode={getDataSourceMode()}
            quote={readModel.quote}
            auditEvents={readModel.auditEvents}
            conversionRecord={readModel.conversionRecord}
          />
        );
      }

    case "approvals":
      {
        const readModel = await getApprovalsReadModel();

        return <ApprovalsView dataSourceMode={getDataSourceMode()} baseQuotes={readModel.quotes} />;
      }

    case "customer-service":
      {
        const model = await getCustomerServiceReadModel();
        return <CustomerServiceCommandCenterView {...model} />;
      }
    case "customer-metrofab":
      {
        const model = await getCustomerDetailReadModel("metrofab-industries");
        return <CustomerDetailView {...model} />;
      }
    case "customer-service-job":
      {
        const model = await getCustomerSafeJobStatusReadModel("J-2035");
        return <CustomerServiceJobView {...model} />;
      }
    case "customer-report":
      {
        const model = await getCustomerStatusReportReadModel("J-2035");
        return <CustomerReportView {...model} />;
      }
    case "customer-report-print":
      {
        const model = await getPrintableCustomerReportReadModel("J-2035");
        return <CustomerReportPrintView {...model} />;
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

export async function RoutePage({ routeKey }: { routeKey: RouteKey }) {
  const meta = routeMeta[routeKey];

  return (
    <div className="space-y-4">
      {meta.demoStep ? <DemoStepper /> : null}
      <PageHeader
        title={meta.title}
        summary={meta.summary}
        action={meta.action}
        audience={meta.audience}
        hideActions={meta.suppressShellActions ?? false}
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

      {await routeBlocks(routeKey)}
    </div>
  );
}



