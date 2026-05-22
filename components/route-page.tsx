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
import { allStatusGroups } from "@/lib/status";
import { routeMeta, type RouteKey } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
      return (
        <>
          <MetricRow
            items={[
              { label: "Open jobs", value: "42", detail: "8 due this week", tone: "blue" },
              { label: "Capacity bottleneck", value: "Press Brake", detail: "112% load", tone: "amber" },
              { label: "Quality holds", value: "3", detail: "1 needs approval", tone: "rose" },
              { label: "On-time promise", value: "96.4%", detail: "Based on seeded schedule", tone: "emerald" }
            ]}
          />

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <RiskAlert
              severity="Critical"
              title="Press Brake is constraining the queue"
              description="The scheduler can see the bottleneck before jobs are released. Later phases will connect the capacity model to live work-center logic."
              href="/capacity"
              actionLabel="Inspect capacity"
            />
            <TimelineShell
              title="Recent operational signals"
              subtitle="Seeded events that later become live notifications."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">J-2035 moved to production</div>
                    <div className="text-xs text-slate-500">Ops queue updated 12 minutes ago</div>
                  </div>
                  <StatusBadge label="In Production" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">AL-6061 sheet reserved</div>
                    <div className="text-xs text-slate-500">Material pull created for job J-2099</div>
                  </div>
                  <StatusBadge label="Reserved" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">Q-1003 submitted for approval</div>
                    <div className="text-xs text-slate-500">Commercial review started</div>
                  </div>
                  <StatusBadge label="Needs Owner Approval" />
                </div>
              </div>
            </TimelineShell>
          </div>

          <DataTableShell
            title="Active exceptions"
            subtitle="Compact table shell for later operational lists."
            actions={<EntityLink href="/audit">Open audit trail</EntityLink>}
          >
            <TinyTable
              columns={["Entity", "Status", "Risk", "Owner"]}
              rows={[
                [
                  <EntityLink href="/jobs/j-2035">J-2035</EntityLink>,
                  <StatusBadge label="In Production" />,
                  <SeverityBadge severity="Warning" />,
                  "Scheduler"
                ],
                [
                  <EntityLink href="/quality/j-2042/scrap-approval">J-2042</EntityLink>,
                  <StatusBadge label="Scrap Approval Required" />,
                  <SeverityBadge severity="Critical" />,
                  "Quality Inspector"
                ],
                [
                  <EntityLink href="/purchase-requests/pr-3091">PR-3091</EntityLink>,
                  <StatusBadge label="Purchase Requested" />,
                  <SeverityBadge severity="Approval" />,
                  "Purchasing"
                ]
              ]}
            />
          </DataTableShell>
        </>
      );

    case "capacity":
      return (
        <>
          <MetricRow
            items={[
              { label: "Available hours", value: "184", detail: "Across seeded work centers", tone: "emerald" },
              { label: "Near capacity", value: "2 lines", detail: "One is at the press brake", tone: "amber" },
              { label: "Over capacity", value: "1 line", detail: "Triggered by J-2099 material impact", tone: "rose" },
              { label: "Bottlenecks", value: "Press Brake", detail: "Primary constraint", tone: "blue" }
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <DataTableShell title="Work center load" subtitle="Placeholder capacity grid for the scheduler view.">
              <TinyTable
                columns={["Work center", "Load", "Status", "Next action"]}
                rows={[
                  [
                    "Laser",
                    "68%",
                    <StatusBadge label="Available" />,
                    "No action"
                  ],
                  [
                    "Press Brake",
                    "112%",
                    <StatusBadge label="Bottleneck" />,
                    <EntityLink href="/jobs/j-2035">Resequence J-2035</EntityLink>
                  ],
                  [
                    "Assembly",
                    "91%",
                    <StatusBadge label="Near Capacity" />,
                    "Monitor queue"
                  ]
                ]}
              />
            </DataTableShell>

            <RiskAlert
              severity="Critical"
              title="Press Brake will delay release"
              description="The demo shows how capacity pressure becomes visible before a job is released. A later phase can add drag-to-reschedule and live load balancing."
              href="/jobs/j-2035"
              actionLabel="Inspect impacted job"
            />
          </div>
        </>
      );

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
      return (
        <>
          <MetricRow
            items={[
              { label: "Current status", value: "In Production", detail: "Released and visible to the floor", tone: "blue" },
              { label: "Traveler", value: "WO-2035", detail: "Printable output seeded for Phase 1", tone: "slate" },
              { label: "Materials", value: "Reserved", detail: "AL-6061-PLT-0.375 held", tone: "emerald" },
              { label: "Customer promise", value: "On track", detail: "Report-ready status summary", tone: "emerald" }
            ]}
          />

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <TimelineShell title="Job timeline" subtitle="Operational history that later becomes a live event stream.">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span>Quoted and approved</span>
                  <StatusBadge label="Approved" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span>Material reserved</span>
                  <StatusBadge label="Materials Reserved" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span>Released to floor</span>
                  <StatusBadge label="In Production" />
                </div>
              </div>
            </TimelineShell>

            <AuditPanel
              title="Audit trace"
              subtitle="Seeded changes for the traceability story."
              items={[
                {
                  actor: "Scheduler",
                  event: "Released job",
                  time: "10:42 AM",
                  detail: "J-2035 moved from approved to production.",
                  severity: "Automation",
                  entityHref: "/audit/jobs/j-2035",
                  entityLabel: "Audit"
                },
                {
                  actor: "Purchasing",
                  event: "Reserved material",
                  time: "11:15 AM",
                  detail: "AL-6061 sheet assigned to WO-2035.",
                  severity: "Info",
                  entityHref: "/materials/al-6061-plt-0.375",
                  entityLabel: "Material"
                }
              ]}
            />
          </div>
        </>
      );

    case "work-order-traveler":
      return (
        <>
          <PrintHeader
            title="Work Order Traveler WO-2035"
            subtitle="Printable traveler placeholder for operators and supervisors."
          />
          <Checklist
            items={[
              { label: "Verify revision", state: "Approved" },
              { label: "Confirm material lot", state: "Reserved" },
              { label: "First article signoff", state: "Pending Inspection" },
              { label: "Final ship check", state: "Ready to Ship" }
            ]}
          />
          <DataTableShell title="Operation sequence" subtitle="Dense, compact operational instructions.">
            <TinyTable
              columns={["Op", "Work center", "Instruction", "Status"]}
              rows={[
                ["10", "Laser", "Cut blanks from AL-6061", <StatusBadge label="Approved" />],
                ["20", "Press Brake", "Form two bends and check angle", <StatusBadge label="In Production" />],
                ["30", "Assembly", "Install inserts and label part", <StatusBadge label="Pending Inspection" />]
              ]}
            />
          </DataTableShell>
          <PrintFooter />
        </>
      );

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
      return (
        <>
          <RiskAlert
            severity="Critical"
            title="Scrap approval is required"
            description="The quality inspector failed the part and needs a controlled approval before the system can close the exception. Later phases will wire actual approval rules."
            href="/quality/j-2042/rework-created"
            actionLabel="Open rework"
          />
          <MetricRow
            items={[
              { label: "Inspection", value: "Failed", detail: "Surface defect detected", tone: "rose" },
              { label: "Disposition", value: "Scrap", detail: "Awaiting owner approval", tone: "amber" },
              { label: "Linked job", value: "J-2042", detail: "Traceable to source operation", tone: "blue" },
              { label: "Material impact", value: "Hold", detail: "Keep stock from shipping", tone: "rose" }
            ]}
          />
        </>
      );

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
      return (
        <>
          <RiskAlert
            severity="Critical"
            title="Material shortage threatens release"
            description="J-2099 cannot proceed without the alloy sheet. The future workflow will convert this into a purchase request and schedule exception."
            href="/purchase-requests/pr-3091"
            actionLabel="Review PR"
          />
          <MetricRow
            items={[
              { label: "Shortage", value: "Active", detail: "No free sheet inventory", tone: "rose" },
              { label: "Impact", value: "1 job", detail: "J-2099 is blocked", tone: "amber" },
              { label: "Material", value: "AL-6061-PLT-0.375", detail: "Reserved for priority work", tone: "blue" },
              { label: "Resolution", value: "PR pending", detail: "Procurement handoff seeded", tone: "emerald" }
            ]}
          />
        </>
      );

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
      return (
        <>
          <MetricRow
            items={[
              { label: "Status", value: "Needs Owner Approval", detail: "Commercial review pending", tone: "amber" },
              { label: "Quote ID", value: "Q-1003", detail: "Clickable manufacturing ID", tone: "blue" },
              { label: "Customer", value: "MetroFab", detail: "Customer-safe details ready", tone: "slate" },
              { label: "Conversion", value: "Ready", detail: "Next step is a job record", tone: "emerald" }
            ]}
          />
          <TimelineShell title="Approval trail" subtitle="Traceable approval state that later becomes workflow logic.">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span>Draft created</span>
                <StatusBadge label="Draft" />
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span>Submitted to owner</span>
                <StatusBadge label="Submitted" />
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span>Waiting for approval</span>
                <StatusBadge label="Needs Owner Approval" />
              </div>
            </div>
          </TimelineShell>
        </>
      );

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
      return (
        <>
          <InternalViewLabel />
          <AuditPanel
            title="Full traceability"
            subtitle="Everything in Phase 1 points to this seeded audit rail."
            items={[
              {
                actor: "Scheduler",
                event: "Released J-2035",
                time: "10:42 AM",
                detail: "Job moved into production with all related links preserved.",
                severity: "Automation",
                entityHref: "/jobs/j-2035",
                entityLabel: "Job J-2035"
              },
              {
                actor: "Quality Inspector",
                event: "Created rework",
                time: "1:04 PM",
                detail: "Rework record generated after failed inspection.",
                severity: "Approval",
                entityHref: "/quality/j-2042/rework-created",
                entityLabel: "RW-2042-01"
              },
              {
                actor: "Purchasing",
                event: "Raised PR-3091",
                time: "2:18 PM",
                detail: "Material shortage flow created a purchase request.",
                severity: "Info",
                entityHref: "/purchase-requests/pr-3091",
                entityLabel: "PR-3091"
              }
            ]}
          />
        </>
      );

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
      return (
        <div className="space-y-4">
          <MetricRow
            items={[
              { label: "Shell status", value: "Phase 1", detail: "App scaffold and demo routes", tone: "blue" },
              { label: "Roles", value: "8", detail: "Client-side switcher wired", tone: "emerald" },
              { label: "Steps", value: "13", detail: "Demo path configured", tone: "amber" },
              { label: "Routes", value: "24+", detail: "Placeholder screens covered", tone: "slate" }
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
                  Internal-only notes and permissions gates can be layered on in later phases.
                </div>
              </div>
            </TimelineShell>
          </div>
        </div>
      );

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
        Phase 1 keeps the record structure and visual language in place while the actual workflow
        logic is built later.
      </PresenterNote>

      {routeBlocks(routeKey)}
    </div>
  );
}
