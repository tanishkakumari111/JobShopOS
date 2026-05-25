"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { AuditPanel } from "@/components/audit-panel";
import { DataTableShell } from "@/components/data-table-shell";
import { EntityLink } from "@/components/entity-link";
import { MetricCard } from "@/components/metric-card";
import { RiskAlert } from "@/components/risk-alert";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { TimelineShell } from "@/components/timeline-shell";
import { useDemoState } from "@/components/demo-state-provider";
import type {
  AuditEvent,
  AuditQuickFilter,
  AuditSummary,
  AuditTimelineRow,
  EntityTimelineEntry,
  Quote,
  QuoteApprovalHistoryEntry,
  QuoteConversionRecord,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow
} from "@/lib/demo-data/types";
import {
  auditEvents,
  getAuditSummary,
  getAuditTimelineRows,
  getQuoteById,
  q1003ApprovalHistory,
  q1003ConversionRecord,
  q1003QuoteForm,
  quoteMaterialEstimateRows,
  quoteRoutingEstimateRows,
  quotes
} from "@/lib/demo-data";
import { requiresOwnerApproval } from "@/lib/demo-data";
import { getEffectiveAuditEvents, getEffectiveQuote } from "@/lib/demo-state";
import type { DataSourceMode } from "@/lib/data-source";
import { cn } from "@/lib/utils";

function getAuditHref(entityType: string, entityId: string) {
  if (entityType === "quote") {
    return "/quotes/q-1003";
  }

  if (entityType === "workOrder") {
    return "/quotes/q-1003/convert";
  }

  if (entityType === "job" && entityId === "J-2035") {
    return "/jobs/j-2035";
  }

  if (entityType === "job" && entityId === "J-2104") {
    return "/quotes/q-1003/convert";
  }

  if (entityType === "report") {
    return "/reports/customer-status/j-2035";
  }

  return "/audit";
}

type QuoteCommandButtonProps = {
  dataSourceMode: DataSourceMode;
  label: string;
  loadingLabel: string;
  successLabel: string;
  endpoint: string;
  idempotencyKey: string;
  demoAction: () => void;
  disabled?: boolean;
};

function QuoteCommandButton({
  dataSourceMode,
  label,
  loadingLabel,
  successLabel,
  endpoint,
  idempotencyKey,
  demoAction,
  disabled = false
}: QuoteCommandButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSucceeded, setHasSucceeded] = useState(false);

  useEffect(() => {
    setStatusMessage(null);
    setErrorMessage(null);
    setHasSucceeded(false);
    setIsSubmitting(false);
  }, [dataSourceMode, endpoint, idempotencyKey]);

  async function handleClick() {
    if (disabled || isSubmitting) {
      return;
    }

    if (dataSourceMode === "demo") {
      demoAction();
      setHasSucceeded(true);
      setStatusMessage(successLabel);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        }
      });
      const payload = (await response.json()) as { message?: string; error?: { message?: string } };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? payload.message ?? "Quote command failed.");
      }

      setHasSucceeded(true);
      setStatusMessage(successLabel);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Quote command failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isSubmitting ? loadingLabel : hasSucceeded ? successLabel : label}
      </button>
      {statusMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-900">
          {statusMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}

type QuoteDetailViewProps = {
  dataSourceMode: DataSourceMode;
  quote?: Quote;
  auditEvents?: AuditEvent[];
  approvalHistory?: QuoteApprovalHistoryEntry[];
  routingEstimateRows?: QuoteRoutingEstimateRow[];
  materialEstimateRows?: QuoteMaterialEstimateRow[];
  quoteForm?: QuoteFormSnapshot;
  conversionRecord?: QuoteConversionRecord;
};

export function QuoteDetailView({
  dataSourceMode,
  quote: baseQuote,
  auditEvents: baseAuditEvents,
  approvalHistory = q1003ApprovalHistory,
  routingEstimateRows = quoteRoutingEstimateRows,
  materialEstimateRows = quoteMaterialEstimateRows,
  quoteForm = q1003QuoteForm,
  conversionRecord = q1003ConversionRecord
}: QuoteDetailViewProps) {
  const { state } = useDemoState();
  const quote =
    dataSourceMode === "demo"
      ? getEffectiveQuote(baseQuote ?? getQuoteById("Q-1003", quotes)!, state)
      : baseQuote ?? getQuoteById("Q-1003", quotes)!;
  const effectiveAuditEvents = dataSourceMode === "demo" ? getEffectiveAuditEvents(baseAuditEvents ?? auditEvents, state) : baseAuditEvents ?? auditEvents;
  const quoteAuditEvents = effectiveAuditEvents.filter((event) =>
    ["Q-1003", "WO-2104", "J-2104"].includes(event.entityId)
  );
  const totalCost = (quote.labor ?? 0) + (quote.materials ?? 0) + (quote.outsideServices ?? 0) + (quote.setupOverhead ?? 0);
  const isApproved = quote.status === "Approved" || quote.status === "Converted to Job";
  const isConverted = quote.status === "Converted to Job";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <EntityLink href="/quotes/q-1003">Q-1003</EntityLink>
              <StatusBadge label={quote.status} />
              <SeverityBadge severity={isConverted ? "Success" : isApproved ? "Approval" : "Approval"} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Quote Detail - Q-1003</h1>
            <p className="max-w-4xl text-sm leading-6 text-slate-500">
              High-value quote for Northline Fabrication. Owner approval is required before conversion.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isApproved ? (
              <button
                type="button"
                disabled
                title="Owner approval required before conversion."
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
              >
                Convert to Job
              </button>
            ) : isConverted ? (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
              >
                Converted to Job
              </button>
            ) : (
              <Link
                href="/quotes/q-1003/convert"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Convert to Job
              </Link>
            )}
          <Link
            href={!isApproved ? "/approvals" : isConverted ? "/customer-service/jobs/j-2035" : "/audit"}
            className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
              {isConverted ? "Generate customer-safe status report" : isApproved ? "View approval audit" : "Open Owner Approval Queue"}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Customer" value={quote.customerName} detail="Estimator Lena Ortiz" tone="blue" />
          <MetricCard label="Amount" value={`$${quote.amount.toLocaleString()}`} detail="Threshold $50,000" tone="rose" />
          <MetricCard label="Valid until" value={quote.validUntil ?? "21 days from now"} detail="Quote expiration window" tone="amber" />
          <MetricCard label="Margin" value={`$${quote.margin.toLocaleString()}`} detail={`Total cost $${totalCost.toLocaleString()}`} tone="emerald" />
        </div>
      </div>

      {!isApproved ? (
        <RiskAlert
          severity="Approval"
          title="This quote exceeds the $50,000 approval threshold."
          description="Owner / GM approval is required before it can be converted into a production job."
          href="/approvals"
          actionLabel="Open approval queue"
        />
      ) : isConverted ? (
        <RiskAlert
          severity="Success"
          title="Quote Q-1003 converted to Job J-2104."
          description="Job J-2104 and Work Order WO-2104 were carried forward from the approved quote."
          href="/customer-service/jobs/j-2035"
          actionLabel="Generate customer-safe status report"
        />
      ) : (
        <RiskAlert
          severity="Success"
          title="Quote Q-1003 is approved and ready for conversion."
          description="Owner / GM approval is recorded. Continue to the conversion screen to create J-2104 and WO-2104."
          href="/quotes/q-1003/convert"
          actionLabel="Convert to Job"
        />
      )}

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
                  ["Labor", quote.labor ?? 24000, "Submitted"],
                  ["Materials", quote.materials ?? 31500, "Approval"],
                  ["Outside services", quote.outsideServices ?? 6000, "Warning"],
                  ["Setup / overhead", quote.setupOverhead ?? 4500, "Success"],
                  ["Margin", quote.margin ?? 6500, "Approval"],
                  ["Total", quote.amount ?? 72500, "Critical"]
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
                {routingEstimateRows.map((step) => (
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
                {materialEstimateRows.map((material) => (
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
                  <StatusBadge label={quote.status} />
                  <SeverityBadge severity="Approval" />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {quote.approvalRequiredRole ?? "Owner / GM"} required before production conversion.
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Margin summary</div>
                <div className="mt-2 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Margin</span>
                    <span className="font-mono text-[13px]">${quote.margin.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total cost</span>
                    <span className="font-mono text-[13px]">${totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Threshold</span>
                    <span className="font-mono text-[13px]">${quote.approvalThreshold.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {isConverted ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Created records</div>
                  <div className="mt-2 grid gap-2 text-sm text-emerald-900">
                    <div className="flex items-center justify-between">
                      <span>Job</span>
                      <EntityLink href="/quotes/q-1003/convert">{conversionRecord.jobNumber}</EntityLink>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Work order</span>
                      <EntityLink href="/quotes/q-1003/convert">{conversionRecord.workOrder}</EntityLink>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Source quote</span>
                      <EntityLink href="/quotes/q-1003">{conversionRecord.quoteId}</EntityLink>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </TimelineShell>

          <TimelineShell title="Notes and approval history" subtitle="What the estimator captured and what leadership needs to know.">
            <div className="space-y-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer-facing notes</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {quoteForm.customerFacingNotes ?? quote.customerFacingNotes ?? "Customer-facing notes will be shown here."}
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Internal notes</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {quoteForm.internalNotes ?? quote.internalNotes ?? "Internal notes will be shown here."}
                      </p>
                    </div>
              <div className="space-y-2">
                {approvalHistory.map((entry) => (
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
            subtitle="The approval trail and downstream conversion events are now live."
            items={quoteAuditEvents.map((event) => ({
              actor: event.actor,
              actorRole: event.actorRole,
              event: event.title,
              time: event.timestamp,
              detail: event.detail,
              severity: event.severity,
              entityHref: getAuditHref(event.entityType, event.entityId),
              entityLabel: event.entityId,
              result: event.detail,
              notes: event.detail,
              entityType: event.entityType
            }))}
          />
        </div>
      </div>
    </div>
  );
}

type ApprovalsViewProps = {
  dataSourceMode: DataSourceMode;
  baseQuotes?: Quote[];
};

export function ApprovalsView({ dataSourceMode, baseQuotes = quotes }: ApprovalsViewProps) {
  const { state, approveQuoteQ1003 } = useDemoState();
  const effectiveQuotes = useMemo(
    () =>
      dataSourceMode === "demo" ? baseQuotes.map((quote) => getEffectiveQuote(quote, state)) : baseQuotes,
    [baseQuotes, dataSourceMode, state]
  );
  const quote = effectiveQuotes.find((entry) => entry.id === "Q-1003")!;
  const pendingApprovalQuotes = useMemo(
    () =>
      effectiveQuotes.filter(
        (entry) => entry.status === "Needs Owner Approval" || requiresOwnerApproval(entry.amount, entry.approvalThreshold)
      ),
    [effectiveQuotes]
  );
  const approvalRows = useMemo(() => {
    const displayQuotes = [
      ...pendingApprovalQuotes,
      ...(quote.id === "Q-1003" && quote.status !== "Needs Owner Approval" ? [quote] : [])
    ];

    return displayQuotes.map((entry) => ({
        quoteId: entry.id,
        customerName: entry.customerName,
        amount: entry.amount,
        margin: entry.margin,
        estimator: entry.estimator,
        validUntil: entry.validUntil ?? "21 days",
        risk: entry.id === "Q-1003" ? "Medium" : entry.amount >= entry.approvalThreshold * 1.25 ? "High" : "Medium",
        reasonApprovalRequired:
          entry.id === "Q-1003"
            ? entry.status === "Needs Owner Approval"
              ? "Above $50,000 threshold"
              : entry.status === "Approved"
                ? "Approved by Owner / GM"
                : "Converted to Job"
            : "Requires owner review",
        action:
          entry.id === "Q-1003"
            ? entry.status === "Needs Owner Approval"
              ? "Review approval"
              : entry.status === "Approved"
                ? "Continue to conversion"
                : "View conversion"
            : entry.status === "Draft"
              ? "Complete quote"
              : entry.expiresSoon
                ? "Prioritize review"
                : "View quote",
        href:
          entry.id === "Q-1003"
            ? entry.status === "Needs Owner Approval"
              ? "/quotes/q-1003"
              : "/quotes/q-1003/convert"
            : `/quotes/${entry.id.toLowerCase()}`,
        highlight: entry.id === "Q-1003",
        status: entry.status
      }));
  }, [pendingApprovalQuotes, quote]);
  const pendingValue = pendingApprovalQuotes.reduce((sum, entry) => sum + entry.amount, 0);
  const quoteApproved = quote.status === "Approved" || quote.status === "Converted to Job";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Quotes awaiting approval" value={`${pendingApprovalQuotes.length}`} detail="Owner / GM queue" tone="amber" />
        <MetricCard label="Total value pending approval" value={`$${pendingValue.toLocaleString()}`} detail="High-value opportunities" tone="rose" />
        <MetricCard
          label="Oldest pending approval"
          value={pendingApprovalQuotes[0]?.validUntil ?? "None"}
          detail={pendingApprovalQuotes.length > 0 ? "Q-1003 is first in line" : "Queue cleared"}
          tone="blue"
        />
        <MetricCard label="High-margin opportunities" value={`${approvalRows.filter((row) => row.margin >= 6000).length}`} detail="Leadership review worthy" tone="emerald" />
        <MetricCard label="Expiring soon" value={`${effectiveQuotes.filter((entry) => entry.expiresSoon).length}`} detail="Requires quick turnaround" tone="amber" />
      </div>

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
                    <div className="flex flex-wrap items-center gap-2">
                      <EntityLink href={row.href}>{row.quoteId}</EntityLink>
                      {row.quoteId === "Q-1003" ? <StatusBadge label={row.status} /> : null}
                    </div>
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
            {quoteApproved ? (
              <RiskAlert
                severity="Success"
                title="Q-1003 is approved."
                description="The quote can now be converted into a production job."
                href="/quotes/q-1003/convert"
                actionLabel="Continue to conversion"
              />
            ) : (
              <RiskAlert
                severity="Approval"
                title="Approving this quote will allow it to be converted into a production job."
                description="This is the last gated step before Job J-2104 and WO-2104 are created."
                href="/quotes/q-1003/convert"
                actionLabel="Approve Quote"
              />
            )}
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
              {quoteApproved ? (
                <Link
                  href="/quotes/q-1003/convert"
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Continue to conversion
                </Link>
              ) : dataSourceMode === "database" ? (
                <QuoteCommandButton
                  dataSourceMode={dataSourceMode}
                  label="Approve Quote"
                  loadingLabel="Approving..."
                  successLabel="Q-1003 approved"
                  endpoint="/api/commands/quotes/q-1003/approve"
                  idempotencyKey="ui-quote-q-1003-approve"
                  demoAction={approveQuoteQ1003}
                />
              ) : (
                <button
                  type="button"
                  onClick={approveQuoteQ1003}
                  className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Approve Quote
                </button>
              )}
            </div>
            {quoteApproved ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                Quote Q-1003 approved by Owner / GM and ready for conversion.
              </div>
            ) : null}
          </div>
        </TimelineShell>
      </div>
    </div>
  );
}

type QuoteConversionViewProps = {
  dataSourceMode: DataSourceMode;
  quote?: Quote;
  auditEvents?: AuditEvent[];
  conversionRecord?: QuoteConversionRecord;
};

export function QuoteConversionView({
  dataSourceMode,
  quote: baseQuote,
  auditEvents: baseAuditEvents,
  conversionRecord = q1003ConversionRecord
}: QuoteConversionViewProps) {
  const { state, convertQuoteQ1003 } = useDemoState();
  const quote =
    dataSourceMode === "demo"
      ? getEffectiveQuote(baseQuote ?? getQuoteById("Q-1003", quotes)!, state)
      : baseQuote ?? getQuoteById("Q-1003", quotes)!;
  const effectiveAuditEvents = dataSourceMode === "demo" ? getEffectiveAuditEvents(baseAuditEvents ?? auditEvents, state) : baseAuditEvents ?? auditEvents;
  const quoteEvents = effectiveAuditEvents.filter((event) => ["Q-1003", "WO-2104", "J-2104"].includes(event.entityId));
  const isApproved = quote.status === "Approved" || quote.status === "Converted to Job";
  const isConverted = quote.status === "Converted to Job";

  const conversionCards = [
    ["Quote", conversionRecord.quoteId],
    ["Customer", conversionRecord.customerName],
    ["Job number", conversionRecord.jobNumber],
    ["Work order", conversionRecord.workOrder],
    ["Routing template", conversionRecord.routingTemplate],
    ["Initial material reservation", conversionRecord.initialMaterialReservation],
    ["Scheduler", conversionRecord.scheduler],
    ["Supervisor", conversionRecord.supervisor]
  ] as const;

  return (
    <div className="space-y-4">
      {!isApproved ? (
        <RiskAlert
          severity="Blocked"
          title="Quote Q-1003 is not yet approved."
          description="Owner / GM approval is required before conversion can create J-2104 and WO-2104."
          href="/approvals"
          actionLabel="Open Owner Approval Queue"
        />
      ) : isConverted ? (
        <RiskAlert
          severity="Success"
          title="Quote Q-1003 converted to Job J-2104."
          description="The job, work order, and routing were created and the workflow state is persisted locally."
          href="/customer-service/jobs/j-2035"
          actionLabel="Generate customer-safe status report"
        />
      ) : (
        <RiskAlert
          severity="Success"
          title="Quote Q-1003 approved by Owner / GM."
          description="The quote is cleared for production conversion and carries forward all seeded routing and material context."
          href="/customer-service/jobs/j-2035"
          actionLabel="Generate customer-safe status report"
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Quote status" value={quote.status === "Converted to Job" ? "Converted to Job" : quote.status === "Approved" ? "Approved" : "Needs Owner Approval"} detail="Approval audit event written" tone="emerald" />
            <MetricCard label="Job number" value={conversionRecord.jobNumber} detail="Created from the approved quote" tone="blue" />
            <MetricCard label="Work order" value={conversionRecord.workOrder} detail="Routing and traveler follow" tone="amber" />
            <MetricCard label="Scheduler" value={conversionRecord.scheduler} detail={conversionRecord.supervisor} tone="slate" />
          </div>

          <DataTableShell title="Convert Quote Q-1003 to Production Job" subtitle="The seeded conversion state carries the quote into a job and work order.">
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {conversionCards.map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">{value}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Generated routing preview</div>
              <div className="mt-3 flex flex-wrap gap-2">
                  {conversionRecord.generatedRouting.map((step) => (
                    <StatusBadge key={step} label={step} />
                  ))}
              </div>
              {!isApproved ? (
                <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
                  Quote approval is required before conversion can proceed.
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  Converting this quote will create a job, work order, initial routing, and material reservation tasks.
                </div>
              )}
            </div>
          </DataTableShell>

          <DataTableShell title="Post-conversion state" subtitle="The approved quote becomes executable production work.">
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {[
                ["Job", conversionRecord.jobNumber],
                ["Work order", conversionRecord.workOrder],
                ["Source quote", conversionRecord.quoteId],
                ["Customer", conversionRecord.customerName],
                ["Routing", "Generated"],
                ["Initial material reservation", "Pending"],
                ["Assigned scheduler", conversionRecord.scheduler],
                ["Assigned supervisor", conversionRecord.supervisor]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm font-medium text-slate-950">{value}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={isConverted ? "Converted to Job" : "Approved"} />
                <StatusBadge label="WO-2104 created" />
                <SeverityBadge severity="Automation" />
              </div>
            </div>
          </DataTableShell>

          <TimelineShell title="Permission reminder" subtitle="Role-based guidance for the quote-to-job transition.">
            <div className="grid gap-2 md:grid-cols-2">
              {[
                ["Estimator can create and submit quotes", "Approved"],
                ["Owner / GM can approve high-value quotes", "Approval"],
                ["Operator cannot approve quotes or view sensitive margin details", "Blocked"],
                ["Scheduler receives the job only after approval and conversion", "Automation"]
              ].map(([label, stateLabel]) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-slate-950">{label}</span>
                  <StatusBadge label={stateLabel} />
                </div>
              ))}
            </div>
          </TimelineShell>

          {isConverted ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              Quote Q-1003 converted to Job J-2104. J-2104, WO-2104, and the seeded routing context are now part of the persistent demo state.
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <AuditPanel
            title="Audit panel"
            subtitle="Standardized conversion events show the end-to-end trace."
            items={quoteEvents.map((event) => ({
              actor: event.actor,
              actorRole: event.actorRole,
              event: event.title,
              time: event.timestamp,
              detail: event.detail,
              severity: event.severity,
              entityHref: getAuditHref(event.entityType, event.entityId),
              entityLabel: event.entityId,
              result: event.detail,
              notes: event.detail,
              entityType: event.entityType
            }))}
          />

          <TimelineShell title="Conversion action" subtitle="Execute the browser-local workflow state transition.">
            <div className="space-y-3">
              {isConverted ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                  Quote Q-1003 converted to Job J-2104.
                </div>
              ) : isApproved ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    This stateful action persists in localStorage and appends audit events without changing the seeded fallback.
                  </div>
                  {dataSourceMode === "database" ? (
                    <QuoteCommandButton
                      dataSourceMode={dataSourceMode}
                      label="Convert to Job"
                      loadingLabel="Converting..."
                      successLabel="Q-1003 converted"
                      endpoint="/api/commands/quotes/q-1003/convert"
                      idempotencyKey="ui-quote-q-1003-convert"
                      demoAction={convertQuoteQ1003}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={convertQuoteQ1003}
                      className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Convert to Job
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
                    Owner / GM approval is required before conversion can proceed.
                  </div>
                  <Link
                    href="/approvals"
                    className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Back to Owner Approval Queue
                  </Link>
                </div>
              )}

              {isConverted ? (
                <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Created records</div>
                  <div className="grid gap-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Job</span>
                      <EntityLink href="/quotes/q-1003/convert">{q1003ConversionRecord.jobNumber}</EntityLink>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Work order</span>
                      <EntityLink href="/quotes/q-1003/convert">{q1003ConversionRecord.workOrder}</EntityLink>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Source quote</span>
                      <EntityLink href="/quotes/q-1003">{q1003ConversionRecord.quoteId}</EntityLink>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </TimelineShell>

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

type AuditTrailViewProps = {
  dataSourceMode: "demo" | "database";
  auditEvents: AuditEvent[];
  summary: AuditSummary;
  auditRows: AuditTimelineRow[];
  quickFilters: AuditQuickFilter[];
};

export function AuditTrailView({
  dataSourceMode,
  auditEvents: baseAuditEvents,
  summary: baseSummary,
  auditRows: baseAuditRows,
  quickFilters
}: AuditTrailViewProps) {
  const { state } = useDemoState();
  const founderAuditEvents =
    dataSourceMode === "demo"
      ? getEffectiveAuditEvents(baseAuditEvents, state).filter((event) => event.id !== 16)
      : baseAuditEvents;
  const summary = dataSourceMode === "demo" ? getAuditSummary(founderAuditEvents) : baseSummary;
  const auditRows = dataSourceMode === "demo" ? getAuditTimelineRows(founderAuditEvents) : baseAuditRows;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-none">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Full Traceability" />
            {state.auditEvents.length > 0 ? <StatusBadge label="Runtime events appended" /> : null}
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Audit Trail</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            Complete operational history across quotes, jobs, materials, quality, customer reports, and system events.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Audit events today" value={`${summary.auditEventsToday}`} detail="Traceability already captured" tone="blue" />
        <MetricCard label="Events requiring review" value={`${summary.eventsRequiringReview}`} detail="Approvals and escalations" tone="amber" />
        <MetricCard label="User actions logged" value={`${summary.userActionsLogged}`} detail="Human activity recorded" tone="emerald" />
        <MetricCard label="System automations logged" value={`${summary.systemAutomationsLogged}`} detail="Workflow and orchestration" tone="slate" />
        <MetricCard label="Exports generated" value={`${summary.exportsGenerated}`} detail="Traveler and report outputs" tone="blue" />
        <MetricCard label="Compliance-ready records" value={`${summary.complianceReadyRecords}`} detail="A complete founder trail" tone="rose" />
      </div>

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

        <DataTableShell title="Founder audit timeline" subtitle="All 15 founder demo events, plus any runtime actions in chronological trace order.">
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

type EntityTimelineViewProps = {
  entityTimeline: EntityTimelineEntry[];
  auditRecords: AuditEvent[];
};

export function EntityTimelineView({ entityTimeline, auditRecords }: EntityTimelineViewProps) {
  const timelineAuditRecords = auditRecords.filter((event) =>
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
              <div className="mt-2 text-sm font-medium text-slate-950">Work Order Traveler</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer report</div>
              <div className="mt-2 text-sm font-medium text-slate-950">Customer Job Status Report</div>
            </div>
          </div>
        </TimelineShell>

        <TimelineShell title="Timeline events" subtitle="The same job lineage is visible from quote approval to customer reporting.">
          <div className="space-y-2">
            {entityTimeline.map((item) => (
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
      </div>

      <AuditPanel
        title="Audit records"
        subtitle="Filtered records related to J-2035 and its customer report lineage."
        items={timelineAuditRecords.map((event) => ({
          actor: event.actor,
          actorRole: event.actorRole,
          event: event.title,
          time: event.timestamp,
          detail: event.detail,
          severity: event.severity,
          entityHref: getAuditHref(event.entityType, event.entityId),
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
