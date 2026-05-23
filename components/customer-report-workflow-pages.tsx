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
import { CustomerSafeViewLabel } from "@/components/customer-safe-view-label";
import { PrintButton } from "@/components/print-button";
import { PrintFooter } from "@/components/print-footer";
import { PrintHeader } from "@/components/print-header";
import { useDemoState } from "@/components/demo-state-provider";
import {
  auditEvents,
  customerSafeTimeline,
  customerStatusReport,
  customers,
  getCustomerRiskQueue,
  getCustomerServiceSummary,
  getCustomerSafeJobStatus,
  getCustomerStatusReports,
  jobs,
  metrofabCustomerProfile,
  reports
} from "@/lib/demo-data";
import {
  getEffectiveAuditEvents,
  getEffectiveCustomerReport,
  getEffectiveJob
} from "@/lib/demo-state";

function useCustomerReportWorkflowState() {
  const { state, generateCustomerReportJ2035 } = useDemoState();
  const effectiveJobs = useMemo(() => jobs.map((job) => getEffectiveJob(job, state)), [state]);
  const effectiveCustomerReport = getEffectiveCustomerReport(customerStatusReport, state);
  const effectiveAuditEvents = getEffectiveAuditEvents(auditEvents, state);
  const reportGenerated = Boolean(state.reports["J-2035-CUSTOMER-STATUS"]?.exists);
  const generatedAt = state.reports["J-2035-CUSTOMER-STATUS"]?.generatedAt ?? effectiveCustomerReport.preparedTimestamp;

  const customerServiceSummary = useMemo(() => {
    return getCustomerServiceSummary(effectiveJobs, reports);
  }, [effectiveJobs]);

  return {
    state,
    generateCustomerReportJ2035,
    effectiveJobs,
    effectiveCustomerReport,
    effectiveAuditEvents,
    reportGenerated,
    generatedAt,
    customerServiceSummary
  };
}

export function CustomerServiceCommandCenterView() {
  const { effectiveJobs, reportGenerated, customerServiceSummary } = useCustomerReportWorkflowState();
  const riskQueue = getCustomerRiskQueue(effectiveJobs);
  const j2035 = effectiveJobs.find((job) => job.id === "J-2035");

  const customerCards = customers.map((customer) => customer.name);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CustomerSafeViewLabel />
            <StatusBadge label="Customer Service Representative" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Customer Service Command Center</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            Now we move from internal operations to customer communication. Customer Service can answer status questions quickly without interrupting the shop floor.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Customer status requests today" value={`${customerServiceSummary.customerStatusRequestsToday}`} detail="Answer questions without disrupting the floor" tone="blue" />
        <MetricCard label="Jobs due this week" value={`${customerServiceSummary.jobsDueThisWeek}`} detail="Promised work still in flight" tone="amber" />
        <MetricCard label="Jobs at risk" value={`${customerServiceSummary.jobsAtRisk}`} detail="Watch or higher risk" tone="rose" />
        <MetricCard label="Jobs ready to ship" value={`${customerServiceSummary.jobsReadyToShip}`} detail="Customer-safe delivery queue" tone="emerald" />
        <MetricCard label="Jobs waiting on material" value={`${customerServiceSummary.jobsWaitingOnMaterial}`} detail="Need procurement or replan" tone="amber" />
        <MetricCard label="Reports generated today" value={`${customerServiceSummary.reportsGeneratedToday}`} detail={reportGenerated ? "Includes runtime report" : "Customer-safe updates prepared"} tone="emerald" />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Customer Service Representative</div>
          <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-[18px] font-semibold tracking-tight text-slate-950">Search-first layout</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Search by job, quote, customer, PO, or part
              </p>
            </div>
            <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
              Search by job, quote, customer, PO, or part
            </div>
          </div>
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
              <tr key={row.jobId} className={row.highlight ? "bg-blue-50/70" : "bg-white"}>
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
                    {row.jobId === "J-2035" ? (row.highlight ? "View report" : "View status") : "View"}
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
              {reportGenerated
                ? "The report is already generated and saved to MetroFab Industries."
                : "Customer Service can answer status questions quickly without interrupting the shop floor."}
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {j2035?.reportGenerated ? "J-2035 customer report is generated." : "J-2035 customer report has not been generated yet."}
            </div>
          </div>
        </TimelineShell>
      </div>
    </div>
  );
}

export function CustomerDetailView() {
  const { effectiveCustomerReport, reportGenerated, generatedAt } = useCustomerReportWorkflowState();
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
              <div>
                Account contact: <span className="font-medium text-slate-950">{metrofabCustomerProfile.accountContact}</span>
              </div>
              <div>
                Email: <span className="font-medium text-slate-950">{metrofabCustomerProfile.email}</span>
              </div>
              <div>
                Phone: <span className="font-medium text-slate-950">{metrofabCustomerProfile.phone}</span>
              </div>
              <div>
                Open jobs: <span className="font-medium text-slate-950">{metrofabCustomerProfile.openJobs}</span>
              </div>
              <div>
                Open quotes: <span className="font-medium text-slate-950">{metrofabCustomerProfile.openQuotes}</span>
              </div>
              <div>
                On-time delivery rate: <span className="font-medium text-slate-950">{metrofabCustomerProfile.onTimeDeliveryRate}%</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Customer status" value={metrofabCustomerProfile.status} detail="Active account" tone="emerald" />
            <MetricCard label="Open jobs" value={`${metrofabCustomerProfile.openJobs}`} detail="Production and support" tone="blue" />
            <MetricCard label="Open quotes" value={`${metrofabCustomerProfile.openQuotes}`} detail="Commercial pipeline" tone="amber" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {metrofabCustomerProfile.tabs.map((tab, index) => (
          <span
            key={tab}
            className={
              index === 0
                ? "rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                : "rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"
            }
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
                      {job.id === "J-2035" ? "View report" : "View"}
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
              <div className="mt-1 text-sm text-slate-600">{reportGenerated ? "Status: Generated" : "Status: Preview"}</div>
              <div className="mt-1 text-sm text-slate-600">Last update: {generatedAt}</div>
              <div className="mt-3">
                <Link
                  href="/reports/customer-status/j-2035"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
                >
                  Open report
                </Link>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {reportGenerated
                ? "Customer Job Status Report for J-2035 is generated and saved to MetroFab Industries."
                : "Preview from seeded demo: report can be generated from the customer-safe job view."}
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              Current live report timestamp: <span className="font-medium text-slate-950">{effectiveCustomerReport.preparedTimestamp}</span>
            </div>
          </div>
        </TimelineShell>
      </div>
    </div>
  );
}

export function CustomerServiceJobView() {
  const { generateCustomerReportJ2035, reportGenerated, effectiveCustomerReport, effectiveAuditEvents } =
    useCustomerReportWorkflowState();

  const customerSafe = getCustomerSafeJobStatus("J-2035", jobs);
  const customerSafeSummary =
    customerSafe?.summary ??
    "The shop is actively working the order while customer-safe details remain visible.";
  const customerSafeStatus = customerSafe?.status ?? "In Production";
  const auditRecords = effectiveAuditEvents.filter((event) => event.entityId === "J-2035" || event.entityId === "RPT-J-2035-CUSTOMER");

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
            <p className="max-w-3xl text-sm leading-6 text-slate-500">{customerSafeSummary}</p>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Customer-Facing Job Status - J-2035</h1>
            <div className="grid gap-x-4 gap-y-1 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
              <div>
                Customer: <span className="font-medium text-slate-950">MetroFab Industries</span>
              </div>
              <div>
                Customer PO: <span className="font-medium text-slate-950">PO-8841</span>
              </div>
              <div>
                Part: <span className="font-medium text-slate-950">Bracket Set Rev A</span>
              </div>
              <div>
                Quantity: <span className="font-medium text-slate-950">500</span>
              </div>
              <div>
                Due date: <span className="font-medium text-slate-950">Friday</span>
              </div>
              <div>
                Customer-facing status: <span className="font-medium text-slate-950">On Track</span>
              </div>
              <div>
                Internal status: <span className="font-medium text-slate-950">{customerSafeStatus}</span>
              </div>
              <div>
                Current routing step: <span className="font-medium text-slate-950">Bend</span>
              </div>
              <div>
                Work center: <span className="font-medium text-slate-950">Press Brake</span>
              </div>
              <div>
                Progress: <span className="font-medium text-slate-950">62%</span>
              </div>
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
          {customerSafeSummary}
        </div>
        <div className="space-y-2">
          {[
            "Quote approved",
            "Work order released",
            "Material reserved",
            "Cutting complete",
            "Bending in progress",
            "Welding pending",
            "Finishing pending",
            "Quality inspection pending",
            "Packing and shipment pending"
          ].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </TimelineShell>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <TimelineShell title="Customer update summary" subtitle="Short, accurate communication for MetroFab Industries.">
          <div className="space-y-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {effectiveCustomerReport.message}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
              >
                Copy customer update
              </button>
              {reportGenerated ? (
                <Link
                  href="/reports/customer-status/j-2035"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Open report
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={generateCustomerReportJ2035}
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Generate status report
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
              >
                Email report
              </button>
              <Link
                href="/reports/customer-status/j-2035/print"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
              >
                Print report
              </Link>
              <Link
                href="/jobs/j-2035"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
              >
                View internal job detail
              </Link>
              {reportGenerated ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
                >
                  Report already generated
                </button>
              ) : (
                <button
                  type="button"
                  onClick={generateCustomerReportJ2035}
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Generate status report
                </button>
              )}
            </div>
            {reportGenerated ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                Customer report generated and saved to MetroFab Industries customer record.
              </div>
            ) : null}
          </div>
        </TimelineShell>

        <AuditPanel
          title="Audit preview"
          subtitle="Standardized event from customer report generation."
          items={auditRecords.map((event) => ({
            actor: event.actor,
            actorRole: event.actorRole,
            event: event.title,
            time: event.timestamp,
            detail: event.detail,
            severity: event.severity,
            entityHref: event.entityType === "report" ? "/reports/customer-status/j-2035" : "/customer-service/jobs/j-2035",
            entityLabel: event.entityId,
            result: event.detail,
            notes: event.detail,
            entityType: event.entityType
          }))}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/reports/customer-status/j-2035/print"
          className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Print report
        </Link>
        <Link
          href="/audit"
          className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
        >
          View full audit trail
        </Link>
        <Link
          href="/customer-service"
          className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent"
        >
          Back to customer service
        </Link>
      </div>
    </div>
  );
}

export function CustomerReportView() {
  const { effectiveCustomerReport, reportGenerated, generatedAt, effectiveAuditEvents } = useCustomerReportWorkflowState();
  const auditRecords = effectiveAuditEvents.filter((event) => event.entityId === "J-2035" || event.entityId === "RPT-J-2035-CUSTOMER");
  const customerReportView = getCustomerStatusReports(
    {
      ...effectiveCustomerReport,
      preparedTimestamp: generatedAt
    },
    customerSafeTimeline
  );

  return (
    <div className="space-y-4">
      <div className={reportGenerated ? "rounded-md border border-emerald-200 bg-emerald-50 p-4 shadow-none" : "rounded-md border border-slate-200 bg-white p-4 shadow-none"}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className={reportGenerated ? "text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700" : "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"}>
              {reportGenerated ? "Generated report status" : "Preview from seeded demo"}
            </div>
            <h1 className={reportGenerated ? "text-[22px] font-semibold tracking-tight text-emerald-950" : "text-[22px] font-semibold tracking-tight text-slate-950"}>
              Customer Status Report - J-2035
            </h1>
            <p className={reportGenerated ? "max-w-4xl text-sm leading-6 text-emerald-900/80" : "max-w-4xl text-sm leading-6 text-slate-500"}>
              {reportGenerated
                ? "Report saved under MetroFab Industries customer record."
                : "The customer-safe report can be generated from the customer-service workflow."}
            </p>
          </div>
          <StatusBadge label={reportGenerated ? "Generated" : "Preview"} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Customer" value={customerReportView.report.customer} detail={customerReportView.report.contact} tone="slate" />
        <MetricCard label="Current status" value={customerReportView.report.currentStatus} detail={customerReportView.report.customerFacingStatus} tone="emerald" />
        <MetricCard label="Progress" value={`${customerReportView.report.progress}%`} detail="Customer-safe" tone="amber" />
        <MetricCard label="Next milestone" value={customerReportView.report.nextMilestone} detail="Welding is next" tone="slate" />
        <MetricCard label="Shipment readiness" value={customerReportView.report.shipmentReadiness} detail="Pending inspection" tone="rose" />
        <MetricCard label="Prepared by" value={customerReportView.report.preparedBy} detail={customerReportView.report.preparedTimestamp} tone="blue" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <TimelineShell title="Report preview" subtitle="A clean customer-ready card with no internal detail.">
          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Customer", customerReportView.report.customer],
                ["Contact", customerReportView.report.contact],
                ["Job", customerReportView.report.jobId],
                ["Customer PO", customerReportView.report.customerPo],
                ["Part", customerReportView.report.part],
                ["Quantity", `${customerReportView.report.quantity}`],
                ["Due date", customerReportView.report.dueDate],
                ["Current status", customerReportView.report.currentStatus],
                ["Customer-facing status", customerReportView.report.customerFacingStatus],
                ["Progress", `${customerReportView.report.progress}%`],
                ["Next milestone", customerReportView.report.nextMilestone],
                ["Shipment readiness", customerReportView.report.shipmentReadiness],
                ["Prepared by", customerReportView.report.preparedBy],
                ["Prepared timestamp", customerReportView.report.preparedTimestamp]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </TimelineShell>

        <div className="space-y-4">
          <TimelineShell title="Customer-safe timeline" subtitle="Shared from the same operational source of truth, but without internal detail.">
            <div className="space-y-2">
              {customerReportView.timeline.map((item) => (
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
              {customerReportView.report.message}
            </div>
          </TimelineShell>
        </div>
      </div>

      <AuditPanel
        title="Audit preview"
        subtitle="Standardized event from customer report generation."
        items={auditRecords.map((event) => ({
          actor: event.actor,
          actorRole: event.actorRole,
          event: event.title,
          time: event.timestamp,
          detail: event.detail,
          severity: event.severity,
          entityHref: event.entityType === "report" ? "/reports/customer-status/j-2035" : "/customer-service/jobs/j-2035",
          entityLabel: event.entityId,
          result: event.detail,
          notes: event.detail,
          entityType: event.entityType
        }))}
      />

      <div className="flex flex-wrap gap-2">
        {reportGenerated ? (
          <Link
            href="/reports/customer-status/j-2035/print"
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Print report
          </Link>
        ) : (
          <Link
            href="/customer-service/jobs/j-2035"
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Generate report from customer-safe status
          </Link>
        )}
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

export function CustomerReportPrintView() {
  const { effectiveCustomerReport, reportGenerated, generatedAt } = useCustomerReportWorkflowState();
  const preparedTimestamp = generatedAt ?? customerStatusReport.preparedTimestamp;

  const printReport = {
    ...effectiveCustomerReport,
    preparedTimestamp
  };

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <CustomerSafeViewLabel />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrintButton />
          <Link href="/reports/customer-status/j-2035" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
            Back to report preview
          </Link>
          <Link href="/audit" className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent">
            View audit trail
          </Link>
        </div>
      </div>

      <PrintHeader title="Customer Job Status Report" subtitle="MetroFab Industries - customer-safe status summary" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Customer" value={printReport.customer} detail={printReport.contact} tone="slate" />
        <MetricCard label="Job" value={printReport.jobId} detail={printReport.customerPo} tone="blue" />
        <MetricCard label="Current status" value={printReport.currentStatus} detail={printReport.customerFacingStatus} tone="emerald" />
        <MetricCard label="Progress" value={`${printReport.progress}%`} detail="Customer-safe" tone="amber" />
        <MetricCard label="Next milestone" value={printReport.nextMilestone} detail="Welding is next" tone="slate" />
        <MetricCard label="Prepared by" value={printReport.preparedBy} detail={printReport.preparedTimestamp} tone="blue" />
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 print:border-slate-300">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Customer", printReport.customer],
            ["Contact", printReport.contact],
            ["Job", printReport.jobId],
            ["Customer PO", printReport.customerPo],
            ["Part", printReport.part],
            ["Quantity", `${printReport.quantity}`],
            ["Due date", printReport.dueDate],
            ["Current status", printReport.currentStatus],
            ["Customer-facing status", printReport.customerFacingStatus],
            ["Progress", `${printReport.progress}%`],
            ["Next milestone", printReport.nextMilestone],
            ["Shipment readiness", printReport.shipmentReadiness],
            ["Prepared by", printReport.preparedBy],
            ["Prepared timestamp", printReport.preparedTimestamp]
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
        {printReport.message}
      </div>

      <PrintFooter preparedAt={preparedTimestamp} version="v1.0" generatedBy={reportGenerated ? "Generated from runtime demo state" : "Prepared from seeded demo data"} />
    </div>
  );
}
