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
  getPurchaseRequestById,
  getQuoteById,
  getProductionQueue,
  getRecentAuditEvents,
  getReworkOrderById,
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
      return (
        <DataTableShell title="Inspection queue" subtitle="Seeded quality record shell.">
          <TinyTable
            columns={["Inspection", "Job", "Status", "Reviewer"]}
            rows={[
              [
                <EntityLink href="/quality/j-2042/scrap-approval">Q-2042-A</EntityLink>,
                <EntityLink href="/jobs/j-2035">J-2035</EntityLink>,
                <StatusBadge label="Pending Inspection" />,
                "Quality Inspector"
              ],
              [
                <EntityLink href="/quality/j-2042/rework-created">Q-2042-B</EntityLink>,
                <EntityLink href="/jobs/j-2035">J-2035</EntityLink>,
                <StatusBadge label="Failed" />,
                "Supervisor"
              ]
            ]}
          />
        </DataTableShell>
      );

    case "quality-scrap":
      {
        const job = getJobById("J-2042", jobs);
        const rework = getReworkOrderById("RW-2042-01", reworkOrders);
        const scrapRate = job?.scrapRate ?? calculateScrapRate(job?.scrapQuantity ?? 0, job?.completedQuantity ?? 0);

        return (
          <>
            <RiskAlert
              severity="Critical"
              title="Scrap approval is required"
              description={`${job?.id ?? "J-2042"} logged ${job?.scrapQuantity ?? 18} scrap units against ${job?.completedQuantity ?? 180} completed units. A controlled approval is required before closure.`}
              href="/quality/j-2042/rework-created"
              actionLabel="Open rework"
            />
            <MetricRow
              items={[
                {
                  label: "Inspection",
                  value: "Failed",
                  detail: `${Math.round(scrapRate * 100)}% scrap rate`,
                  tone: "rose"
                },
                {
                  label: "Disposition",
                  value: "Scrap",
                  detail: `Tolerance ${Math.round((job?.allowedTolerance ?? 0.05) * 100)}%`,
                  tone: "amber"
                },
                {
                  label: "Linked job",
                  value: job?.id ?? "J-2042",
                  detail: job?.currentStep ?? "Weld",
                  tone: "blue"
                },
                {
                  label: "Material impact",
                  value: "Hold",
                  detail: rework?.reason ?? "Keep stock from shipping",
                  tone: "rose"
                }
              ]}
            />
          </>
        );
      }

    case "quality-rework":
      return (
        <AuditPanel
          title="Rework record"
          subtitle="Placeholder for the rework flow and event trace."
          items={[
            {
              actor: "Quality Inspector",
              event: "Created rework",
              time: "1:04 PM",
              detail: "RW-2042-01 created from failed inspection.",
              severity: "Approval",
              entityHref: "/quality/j-2042/scrap-approval",
              entityLabel: "Original exception"
            },
            {
              actor: "Scheduler",
              event: "Queued rework",
              time: "1:11 PM",
              detail: "Rework added to the production queue as a controlled follow-up.",
              severity: "Automation",
              entityHref: "/jobs/j-2035",
              entityLabel: "Job J-2035"
            }
          ]}
        />
      );

    case "materials":
      return (
        <DataTableShell title="Inventory" subtitle="Stock positions, reservations, and shortage signals.">
          <TinyTable
            columns={["Material", "On hand", "Status", "Linked job"]}
            rows={[
              [
                <EntityLink href="/materials/al-6061-plt-0.375">AL-6061-PLT-0.375</EntityLink>,
                "18 sheets",
                <StatusBadge label="Available" />,
                <EntityLink href="/jobs/j-2035">J-2035</EntityLink>
              ],
              [
                "AL-6061-PLT-0.250",
                "4 sheets",
                <StatusBadge label="Low Stock" />,
                <EntityLink href="/purchase-requests/pr-3091">PR-3091</EntityLink>
              ]
            ]}
          />
        </DataTableShell>
      );

    case "material-al6061":
      return (
        <>
          <MetricRow
            items={[
              { label: "Material status", value: "Available", detail: "Ready to reserve", tone: "emerald" },
              { label: "UOM", value: "Sheets", detail: "0.375 in plate", tone: "slate" },
              { label: "Reserved", value: "12", detail: "Held for seeded jobs", tone: "blue" },
              { label: "Purchase requests", value: "1", detail: "PR-3091 linked", tone: "amber" }
            ]}
          />
          <AuditPanel
            title="Lot history"
            subtitle="Traceability trail for the material record."
            items={[
              {
                actor: "Purchasing",
                event: "Received stock",
                time: "9:12 AM",
                detail: "Material added to inventory and made available.",
                severity: "Success",
                entityHref: "/materials",
                entityLabel: "Inventory"
              },
              {
                actor: "Scheduler",
                event: "Reserved lot",
                time: "10:20 AM",
                detail: "Hold placed for J-2035 and J-2099.",
                severity: "Automation",
                entityHref: "/jobs/j-2035",
                entityLabel: "Job J-2035"
              }
            ]}
          />
        </>
      );

    case "job-2099-material":
      {
        const job = getJobById("J-2099", jobs);
        const material = getMaterialBySku("AL-6061-PLT-0.375", materials);
        const pr = getPurchaseRequestById("PR-3091", purchaseRequests);

        return (
          <>
            <RiskAlert
              severity="Critical"
              title="Material shortage threatens release"
              description={`${job?.id ?? "J-2099"} cannot proceed without ${material?.sku ?? "AL-6061-PLT-0.375"}. The shortage is ${material?.shortage ?? 44} sheets.`}
              href="/purchase-requests/pr-3091"
              actionLabel="Review PR"
            />
            <MetricRow
              items={[
                {
                  label: "Shortage",
                  value: `${material?.shortage ?? 44} sheets`,
                  detail: "No free sheet inventory",
                  tone: "rose"
                },
                {
                  label: "Impact",
                  value: "1 job",
                  detail: `${job?.id ?? "J-2099"} is blocked`,
                  tone: "amber"
                },
                {
                  label: "Material",
                  value: material?.sku ?? "AL-6061-PLT-0.375",
                  detail: material?.supplier ?? "Reserved for priority work",
                  tone: "blue"
                },
                {
                  label: "Resolution",
                  value: pr?.id ?? "PR-3091",
                  detail: "Procurement handoff seeded",
                  tone: "emerald"
                }
              ]}
            />
          </>
        );
      }

    case "purchase-request":
      return (
        <>
          <MetricRow
            items={[
              { label: "Request", value: "PR-3091", detail: "Seeded procurement ticket", tone: "blue" },
              { label: "Material", value: "AL-6061", detail: "0.375 plate", tone: "slate" },
              { label: "Quantity", value: "12 sheets", detail: "Requested by scheduler", tone: "amber" },
              { label: "Priority", value: "Approval", detail: "Waiting on buyer review", tone: "rose" }
            ]}
          />
          <DataTableShell title="Request details" subtitle="Placeholder for purchasing review and supplier selection.">
            <TinyTable
              columns={["Field", "Value", "Notes"]}
              rows={[
                ["Requested by", "Scheduler", "Created from shortage impact"],
                ["Need date", "Jun 02", "Driven by J-2099 schedule"],
                ["Status", <StatusBadge label="Purchase Requested" />, "No supplier yet"]
              ]}
            />
          </DataTableShell>
        </>
      );

    case "quotes":
      return (
        <DataTableShell title="Quote pipeline" subtitle="Drafts, approvals, and conversions in one place.">
          <TinyTable
            columns={["Quote", "Customer", "Status", "Expected margin"]}
            rows={[
              [
                <EntityLink href="/quotes/q-1003">Q-1003</EntityLink>,
                "MetroFab",
                <StatusBadge label="Needs Owner Approval" />,
                "31%"
              ],
              ["Q-1002", "Northline", <StatusBadge label="Draft" />, "28%"]
            ]}
          />
        </DataTableShell>
      );

    case "quote-new":
      return (
        <DataTableShell title="New quote" subtitle="Placeholder intake form for the estimate workflow.">
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {["Customer", "Part", "Quantity", "Due date"].map((field) => (
              <label key={field} className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {field}
                </span>
                <div className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Seed placeholder
                </div>
              </label>
            ))}
          </div>
        </DataTableShell>
      );

    case "quote-1003":
      {
        const quote = getQuoteById("Q-1003", quotes);
        const quoteEvents = getAuditEventsByEntity("quote", "Q-1003", auditEvents);
        const totalCost = (quote?.labor ?? 0) + (quote?.materials ?? 0) + (quote?.outsideServices ?? 0) + (quote?.setupOverhead ?? 0);

        return (
          <>
            <MetricRow
              items={[
                {
                  label: "Status",
                  value: quote?.status ?? "Needs Owner Approval",
                  detail: `Threshold ${quote?.approvalThreshold?.toLocaleString() ?? "50,000"}`,
                  tone: "amber"
                },
                {
                  label: "Quote ID",
                  value: quote?.id ?? "Q-1003",
                  detail: "Clickable manufacturing ID",
                  tone: "blue"
                },
                {
                  label: "Customer",
                  value: quote?.customerName ?? "Northline Fabrication",
                  detail: `Estimator ${quote?.estimator ?? "Lena Ortiz"}`,
                  tone: "slate"
                },
                {
                  label: "Margin",
                  value: `$${quote?.margin.toLocaleString() ?? "6,500"}`,
                  detail: `Total cost $${totalCost.toLocaleString()}`,
                  tone: "emerald"
                }
              ]}
            />
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <DataTableShell title="Quote breakdown" subtitle="Centralized demo values drive the seeded estimate preview.">
                <TinyTable
                  columns={["Component", "Amount", "Signal"]}
                  rows={[
                    ["Labor", `$${quote?.labor.toLocaleString() ?? "24,000"}`, <StatusBadge label="Submitted" />],
                    ["Materials", `$${quote?.materials.toLocaleString() ?? "31,500"}`, <SeverityBadge severity="Approval" />],
                    ["Outside services", `$${quote?.outsideServices.toLocaleString() ?? "6,000"}`, <SeverityBadge severity="Warning" />],
                    ["Setup / overhead", `$${quote?.setupOverhead.toLocaleString() ?? "4,500"}`, <SeverityBadge severity="Success" />]
                  ]}
                />
              </DataTableShell>

              <TimelineShell title="Approval trail" subtitle="Traceable approval state that later becomes workflow logic.">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span>Amount: ${quote?.amount.toLocaleString() ?? "72,500"}</span>
                    <StatusBadge label={quote?.status ?? "Needs Owner Approval"} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span>Estimator: {quote?.estimator ?? "Lena Ortiz"}</span>
                    <StatusBadge label="Submitted" />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span>Approval role: {quote?.approvalRequiredRole ?? "Owner / GM"}</span>
                    <SeverityBadge severity="Approval" />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span>Audit events</span>
                    <EntityLink href="/audit">{quoteEvents.length} events</EntityLink>
                  </div>
                </div>
              </TimelineShell>
            </div>
          </>
        );
      }

    case "approvals":
      return (
        <DataTableShell title="Approval queue" subtitle="Owner and supervisor approvals will live here.">
          <TinyTable
            columns={["Item", "Requester", "Reason", "Status"]}
            rows={[
              ["Q-1003", "Estimator", "Margin review", <StatusBadge label="Needs Owner Approval" />],
              ["J-2042", "Quality", "Scrap disposition", <StatusBadge label="Scrap Approval Required" />]
            ]}
          />
        </DataTableShell>
      );

    case "quote-convert":
      return (
        <>
          <RiskAlert
            severity="Success"
            title="Quote conversion placeholder"
            description="The app shell can already show the conversion step that will later create a real job. Phase 2 can add persisted state and transaction logic."
            href="/jobs/j-2035"
            actionLabel="Open job template"
          />
          <Checklist
            items={[
              { label: "Validate quote scope", state: "Approved" },
              { label: "Assign job number", state: "Automation" },
              { label: "Reserve planning slot", state: "Pending Inspection" },
              { label: "Notify customer", state: "Info" }
            ]}
          />
        </>
      );

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
