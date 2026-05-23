import {
  AuditEntityType as PrismaAuditEntityType,
  AuditSeverity as PrismaAuditSeverity,
  CustomerStatus as PrismaCustomerStatus,
  JobRisk as PrismaJobRisk,
  ProductionUpdateStatus as PrismaProductionUpdateStatus,
  JobStatus as PrismaJobStatus,
  PurchaseRequestPriority as PrismaPurchaseRequestPriority,
  PurchaseRequestStatus as PrismaPurchaseRequestStatus,
  WorkCenterStatus as PrismaWorkCenterStatus
} from "@prisma/client";

import { getPrismaClient } from "../../db/prisma";
import {
  getAuditEntityQuickFilters,
  getAuditSummary,
  getAuditTimelineRows,
  getRecentAuditEvents,
  getMaterialsSummary,
  getMaterialRows,
  getBlockedJobsByMaterialShortage,
  getMaterialSupplierPanel,
  getMaterialImpactTimeline,
  getQualitySummary,
} from "../../demo-data";
import type {
  AuditEvent,
  Customer,
  EntityTimelineEntry,
  InspectionQueueRow,
  Job,
  JobRoutingStep,
  Material,
  ProductionUpdate,
  PurchaseRequest,
  PurchaseRequestAuditEntry,
  Quote,
  QuoteApprovalHistoryEntry,
  QuoteConversionRecord,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow,
  Report,
  ReworkOrder,
  WorkCenter
} from "../../demo-data/types";
import { createDemoRepositories } from "../demo";
import type { RepositorySet } from "../types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- lazy proxy keeps database access deferred until database mode is actually used
const prisma = new Proxy({} as ReturnType<typeof getPrismaClient>, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient() as object, prop);
  }
});

function notImplemented<T>(label: string) {
  return async (): Promise<T> => {
    throw new Error(`Database repository method "${label}" is not implemented yet.`);
  };
}

function mapCustomerStatus(status: PrismaCustomerStatus): Customer["status"] {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "AT_RISK":
      return "At Risk";
    case "PROSPECT":
      return "Prospect";
  }
}

function mapJobStatus(status: PrismaJobStatus): Job["status"] {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "WAITING_ON_MATERIAL":
      return "Waiting on Material";
    case "PURCHASE_REQUESTED":
      return "Purchase Requested";
    case "MATERIALS_RESERVED":
      return "Materials Reserved";
    case "IN_PRODUCTION":
      return "In Production";
    case "IN_QUALITY":
      return "In Quality";
    case "REWORK":
      return "Rework";
    case "READY_TO_SHIP":
      return "Ready to Ship";
    case "SHIPPED":
      return "Shipped";
    case "CLOSED":
      return "Closed";
    case "SCRAP_APPROVAL_REQUIRED":
      return "Scrap Approval Required";
  }
}

function mapJobRisk(risk: PrismaJobRisk): Job["risk"] {
  switch (risk) {
    case "LOW":
      return "Low";
    case "WATCH":
      return "Watch";
    case "HIGH":
      return "High";
    case "CRITICAL":
      return "Critical";
    case "NONE":
      return "None";
  }
}

function mapWorkCenterStatus(status: PrismaWorkCenterStatus): WorkCenter["status"] {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "NEAR_CAPACITY":
      return "Near Capacity";
    case "BOTTLENECK":
      return "Bottleneck";
    case "OVER_CAPACITY":
      return "Over Capacity";
    case "MAINTENANCE":
      return "Maintenance";
  }
}

function mapPurchaseRequestStatus(status: PrismaPurchaseRequestStatus): PurchaseRequest["status"] {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "ORDERED":
      return "Ordered";
  }
}

function mapPurchaseRequestPriority(priority: PrismaPurchaseRequestPriority): PurchaseRequest["priority"] {
  switch (priority) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Medium";
    case "HIGH":
      return "High";
  }
}

function mapReportAudience(audience: "CUSTOMER" | "INTERNAL"): Report["audience"] {
  return audience === "INTERNAL" ? "Internal" : "Customer";
}

function mapAuditSeverity(severity: PrismaAuditSeverity): AuditEvent["severity"] {
  switch (severity) {
    case "INFO":
      return "Info";
    case "WARNING":
      return "Warning";
    case "CRITICAL":
      return "Critical";
    case "BLOCKED":
      return "Blocked";
    case "APPROVAL":
      return "Approval";
    case "AUTOMATION":
      return "Automation";
    case "SUCCESS":
      return "Success";
  }
}

function mapAuditEntityType(entityType: PrismaAuditEntityType): AuditEvent["entityType"] {
  switch (entityType) {
    case "QUOTE":
      return "quote";
    case "JOB":
      return "job";
    case "WORK_ORDER":
      return "workOrder";
    case "MATERIAL":
      return "material";
    case "PURCHASE_REQUEST":
      return "purchaseRequest";
    case "REPORT":
      return "report";
    case "QUALITY":
      return "quality";
    case "REWORK_ORDER":
      return "quality";
    case "CUSTOMER":
      return "report";
    case "WORK_CENTER":
      return "capacity";
    case "CAPACITY":
      return "capacity";
  }
}

function mapProductionUpdateStatus(status: PrismaProductionUpdateStatus): ProductionUpdate["status"] {
  switch (status) {
    case "COMPLETE":
      return "Complete";
    case "PENDING":
      return "Pending";
    case "WATCH":
      return "Watch";
    case "INFO":
      return "Info";
    default:
      return "Info";
  }
}

function mapJobRoutingStepStatus(status: string): JobRoutingStep["status"] {
  switch (status) {
    case "Complete":
      return "Complete";
    case "In Progress":
      return "In Progress";
    default:
      return "Pending";
  }
}

function toCustomer(row: Awaited<ReturnType<typeof prisma.customer.findUniqueOrThrow>>): Customer {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    status: mapCustomerStatus(row.status),
    primaryContact: row.primaryContact,
    city: row.city,
    state: row.state
  };
}

function toQuote(row: Awaited<ReturnType<typeof prisma.quote.findUniqueOrThrow>>): Quote {
  return {
    id: row.id,
    slug: row.slug,
    customerSlug: row.customerSlug,
    customerName: row.customerName,
    part: row.part,
    quantity: row.quantity,
    amount: row.amount,
    status:
      row.status === "DRAFT"
        ? "Draft"
        : row.status === "SUBMITTED"
          ? "Submitted"
          : row.status === "NEEDS_OWNER_APPROVAL"
            ? "Needs Owner Approval"
            : row.status === "APPROVED"
              ? "Approved"
              : row.status === "REJECTED"
                ? "Rejected"
                : row.status === "EXPIRED"
                  ? "Expired"
                  : "Converted to Job",
    estimator: row.estimator,
    approvalThreshold: row.approvalThreshold,
    approvalRequiredRole: row.approvalRequiredRole,
    margin: row.margin,
    labor: row.labor,
    materials: row.materials,
    outsideServices: row.outsideServices,
    setupOverhead: row.setupOverhead,
    customerReference: row.customerReference ?? undefined,
    revision: row.revision ?? undefined,
    validUntil: row.validUntil ?? undefined,
    lastUpdated: row.lastUpdated ?? undefined,
    expiresSoon: row.expiresSoon,
    customerFacingNotes: row.customerFacingNotes ?? undefined,
    internalNotes: row.internalNotes ?? undefined
  };
}

function toJob(row: Awaited<ReturnType<typeof prisma.job.findUniqueOrThrow>>): Job {
  return {
    id: row.id,
    slug: row.slug,
    customerSlug: row.customerSlug,
    customerName: row.customerName,
    customerPo: row.customerPo ?? undefined,
    part: row.part,
    quantity: row.quantity,
    completedQuantity: row.completedQuantity ?? undefined,
    scrapQuantity: row.scrapQuantity ?? undefined,
    scrapRate: row.scrapRate ?? undefined,
    allowedTolerance: row.allowedTolerance ?? undefined,
    status: mapJobStatus(row.status),
    currentStep: row.currentStep ?? undefined,
    blockedStep: row.blockedStep ?? undefined,
    workCenter: row.workCenter,
    risk: mapJobRisk(row.risk),
    dueDate: row.dueDate,
    workOrder: row.workOrder ?? undefined,
    reworkOrder: row.reworkOrder ?? undefined,
    purchaseRequestId: row.purchaseRequestId ?? undefined,
    reportGenerated: row.reportGenerated,
    requiredMaterial: row.requiredMaterial ?? undefined,
    shortageSheets: row.shortageSheets ?? undefined,
    sourceQuoteId: row.sourceQuoteId ?? undefined,
    progress: row.progress ?? undefined
  };
}

function toJobRoutingStep(row: Awaited<ReturnType<typeof prisma.jobRoutingStep.findMany>>[number]): JobRoutingStep {
  return {
    stepNumber: row.stepNumber,
    operation: row.operation,
    workCenter: row.workCenter,
    plannedHours: row.plannedHours,
    actualHours: row.actualHours ?? undefined,
    assignedOperator: row.assignedOperator,
    machine: row.machine,
    status: mapJobRoutingStepStatus(row.status),
    timestamp: row.timestamp ?? undefined
  };
}

function toProductionUpdate(row: Awaited<ReturnType<typeof prisma.productionUpdate.findMany>>[number]): ProductionUpdate {
  return {
    label: row.label,
    detail: row.detail,
    status: mapProductionUpdateStatus(row.status)
  };
}

function toMaterial(row: Awaited<ReturnType<typeof prisma.material.findUniqueOrThrow>>): Material {
  return {
    sku: row.sku,
    name: row.name,
    requiredForJobId: row.requiredForJobId,
    requiredSheets: row.requiredSheets,
    onHand: row.onHand,
    reserved: row.reserved,
    available: row.available,
    shortage: row.shortage,
    supplier: row.supplier,
    leadTimeBusinessDays: row.leadTimeBusinessDays,
    lastPurchasePrice: row.lastPurchasePrice,
    suggestedOrderQuantity: row.suggestedOrderQuantity,
    reorderPoint: row.reorderPoint ?? undefined,
    contactEmail: row.contactEmail ?? undefined,
    lastUpdated: row.lastUpdated ?? undefined,
    minimumOrderQuantity: row.minimumOrderQuantity ?? undefined
  };
}

function toPurchaseRequest(row: Awaited<ReturnType<typeof prisma.purchaseRequest.findUniqueOrThrow>>): PurchaseRequest {
  return {
    id: row.id,
    materialSku: row.materialSku,
    linkedJobId: row.linkedJobId,
    supplier: row.supplier,
    quantity: row.quantity,
    unitCost: row.unitCost,
    estimatedTotal: row.estimatedTotal,
    buyer: row.buyer,
    status: mapPurchaseRequestStatus(row.status),
    priority: mapPurchaseRequestPriority(row.priority)
  };
}

function toReport(row: Awaited<ReturnType<typeof prisma.customerReport.findUniqueOrThrow>>): Report {
  return {
    id: row.id,
    jobId: row.jobId,
    title: row.title,
    audience: mapReportAudience(row.audience),
    summary: row.summary,
    generatedAt: row.generatedAt,
    savedAs: row.savedAs ?? undefined
  };
}

function toAuditEvent(row: Awaited<ReturnType<typeof prisma.auditEvent.findMany>>[number]): AuditEvent {
  return {
    id: row.id,
    eventType: row.eventType ?? "",
    entityType: mapAuditEntityType(row.entityType),
    entityId: row.entityId,
    title: row.title ?? row.action,
    detail: row.detail ?? row.notes,
    actor: row.actor,
    actorRole: row.role,
    timestamp: row.timestamp,
    severity: mapAuditSeverity(row.severity)
  };
}

function buildInspectionQueueRows(jobs: Job[]): InspectionQueueRow[] {
  const jobById = new Map(jobs.map((job) => [job.id, job]));
  const rowFor = (jobId: string): InspectionQueueRow | undefined => {
    const job = jobById.get(jobId);
    if (!job) return undefined;

    if (jobId === "J-2042") {
      return {
        jobId,
        customerName: job.customerName,
        part: job.part,
        currentStep: job.currentStep ?? "Weld",
        inspector: "Quality Inspector",
        result: job.status === "Rework" ? "Passed" : "Failed",
        scrapRate: `${Math.round((job.scrapRate ?? 0) * 100)}%`,
        status: job.status === "Rework" ? "Approved" : "Scrap Approval Required",
        dueDate: "Due in 2 business days",
        action: job.status === "Rework" ? "View rework" : "Review scrap approval",
        href: job.status === "Rework" ? "/quality/j-2042/rework-created" : "/quality/j-2042/scrap-approval"
      };
    }

    if (jobId === "J-2035") {
      return {
        jobId,
        customerName: job.customerName,
        part: job.part,
        currentStep: job.currentStep ?? "Finish",
        inspector: "Quality Inspector",
        result: "Pending",
        scrapRate: "0%",
        status: "Pending Inspection",
        dueDate: "Due after Finish",
        action: "Monitor inspection readiness",
        href: "/jobs/j-2035"
      };
    }

    if (jobId === "J-2099") {
      return {
        jobId,
        customerName: job.customerName,
        part: job.part,
        currentStep: "Blocked",
        inspector: "Quality Inspector",
        result: "Pending",
        scrapRate: "0%",
        status: "Waiting Supervisor Review",
        dueDate: "Waiting on material",
        action: "Hold until material is released",
        href: "/jobs/j-2099/material-impact"
      };
    }

    return {
      jobId,
      customerName: job.customerName,
      part: job.part,
      currentStep: "Routing",
      inspector: "Quality Inspector",
      result: "Passed",
      scrapRate: "0%",
      status: "Passed",
      dueDate: "Awaiting first article",
      action: "Review routed job",
      href: "/quotes/q-1003/convert"
    };
  };

  return ["J-2042", "J-2035", "J-2099", "J-2104"].map((jobId) => rowFor(jobId)).filter((row): row is InspectionQueueRow => Boolean(row));
}

function toPurchaseRequestAuditEntry(row: Awaited<ReturnType<typeof prisma.auditEvent.findMany>>[number]): PurchaseRequestAuditEntry {
  return {
    timestamp: row.timestamp,
    actor: row.actor,
    role: row.role,
    action: row.action,
    entityType: row.entityType === "PURCHASE_REQUEST" ? "PurchaseRequest" : "Job",
    entityId: row.entityId,
    result: row.result,
    notes: row.notes,
    severity: mapAuditSeverity(row.severity)
  };
}

function toEntityTimelineEntryFromAuditEvent(row: Awaited<ReturnType<typeof prisma.auditEvent.findMany>>[number]): EntityTimelineEntry {
  return {
    title: row.title ?? row.action,
    detail: row.detail ?? row.notes,
    timestamp: row.timestamp,
    severity: mapAuditSeverity(row.severity)
  };
}

export function createDatabaseRepositories(): RepositorySet {
  const prisma = getPrismaClient();

  return {
    customers: {
      getCustomers: async () => {
        const rows = await prisma.customer.findMany({ orderBy: { slug: "asc" } });
        return rows.map(toCustomer);
      },
      getCustomerBySlug: async (slug: string) => {
        const row = await prisma.customer.findUnique({ where: { slug } });
        return row ? toCustomer(row) : undefined;
      },
      getCustomerByName: async (name: string) => {
        const row = await prisma.customer.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
        return row ? toCustomer(row) : undefined;
      },
      getCustomerSafeJobStatus: async (jobId: string) => {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return undefined;
        return {
          jobId: job.id,
          customerName: job.customerName,
          part: job.part,
          status: mapJobStatus(job.status),
          progress: job.progress ?? 0,
          nextMilestone:
            job.status === "IN_PRODUCTION"
              ? "Inspection"
              : job.status === "WAITING_ON_MATERIAL"
                ? "Material receipt"
                : job.status === "PURCHASE_REQUESTED"
                  ? "Supplier confirmation"
                  : job.status === "SCRAP_APPROVAL_REQUIRED"
                    ? "Disposition"
                    : "Next step",
          eta: job.dueDate,
          risk: mapJobRisk(job.risk),
          summary:
            job.status === "IN_PRODUCTION"
              ? "The shop is actively working the order."
              : job.status === "WAITING_ON_MATERIAL"
                ? "The order is waiting on incoming material."
                : job.status === "PURCHASE_REQUESTED"
                  ? "The order is waiting on supplier confirmation."
                  : job.status === "SCRAP_APPROVAL_REQUIRED"
                    ? "A quality disposition decision is pending."
                    : "Customer-safe summary available."
        };
      },
      getCustomerServiceSummary: async () => {
        const [jobs, reports] = await Promise.all([
          prisma.job.findMany(),
          prisma.customerReport.findMany({ where: { audience: "CUSTOMER" } })
        ]);
        return {
          customerStatusRequestsToday: 8,
          jobsDueThisWeek: jobs.filter((job) => job.dueDate === "Friday" || job.dueDate.includes("days")).length,
          jobsAtRisk: jobs.filter((job) => ["WATCH", "HIGH", "CRITICAL"].includes(job.risk)).length,
          jobsReadyToShip: jobs.filter((job) => job.status === "READY_TO_SHIP").length,
          jobsWaitingOnMaterial: jobs.filter((job) => ["WAITING_ON_MATERIAL", "PURCHASE_REQUESTED"].includes(job.status)).length,
          reportsGeneratedToday: reports.filter((report) => report.generatedAt === "Today").length
        };
      },
      getCustomerRiskQueue: async () => {
        const jobs = await prisma.job.findMany();
        return jobs
          .map((job) => ({
            jobId: job.id,
            customerName: job.customerName,
            customerPo: job.customerPo ?? "",
            part: job.part,
            currentInternalStatus: mapJobStatus(job.status),
            dueDate: job.id === "J-2035" ? "Friday" : job.id === "J-2042" ? "Due in 2 days" : job.id === "J-2099" ? "Due in 4 days" : "Due soon",
            customerFacingStatus: job.id === "J-2035" ? "On Track" : job.id === "J-2042" ? "At Risk" : job.id === "J-2099" ? "Delayed Risk" : "Watch",
            internalBlocker: job.id === "J-2035" ? "Current step: Bend" : job.id === "J-2042" ? "Quality rework" : job.id === "J-2099" ? "Material shortage" : "Capacity constraint",
            lastUpdate: job.id === "J-2035" ? "Updated 12 min ago" : job.id === "J-2042" ? "Updated 8 min ago" : job.id === "J-2099" ? "Updated 5 min ago" : "Updated 18 min ago",
            href: "/customer-service/jobs/j-2035",
            highlight: job.id === "J-2035"
          }))
          .filter((row) => ["J-2035", "J-2042", "J-2099", "J-2070"].includes(row.jobId));
      },
      getCustomerStatusReports: async (jobId: string) => {
        const report = await prisma.customerReport.findFirst({ where: { jobId, audience: "CUSTOMER" } });
        if (!report) return undefined;
        return {
          report: {
            customer: report.customerName ?? "",
            contact: report.contact ?? "",
            jobId: report.jobId,
            customerPo: report.customerPo ?? "",
            part: report.part ?? "",
            quantity: report.quantity ?? 0,
            dueDate: report.dueDate ?? "",
            currentStatus: report.currentStatus ?? "",
            customerFacingStatus: report.customerFacingStatus ?? "",
            progress: report.progress ?? 0,
            nextMilestone: report.nextMilestone ?? "",
            shipmentReadiness: report.shipmentReadiness ?? "",
            preparedBy: report.preparedBy ?? "",
            preparedTimestamp: report.preparedTimestamp ?? report.generatedAt,
            message: report.message ?? "",
            reportSavedTo: report.reportSavedTo ?? report.savedAs ?? ""
          },
          timeline: jobId === "J-2035"
            ? [
                { title: "Quote approved", detail: "Q-1003 approved and released to production.", timestamp: "Today 10:45 AM", severity: "Success" },
                { title: "Work order released", detail: "WO-2035 created for the current production run.", timestamp: "Today 11:02 AM", severity: "Automation" },
                { title: "Material reserved", detail: "AL-6061-PLT-0.375 reserved for J-2035.", timestamp: "Today 11:08 AM", severity: "Info" }
              ]
            : []
        };
      }
    },
    quotes: {
      getQuotes: async () => {
        const rows = await prisma.quote.findMany({ orderBy: { id: "asc" } });
        return rows.map(toQuote);
      },
      getQuoteById: async (id: string) => {
        const row = await prisma.quote.findUnique({ where: { id } });
        return row ? toQuote(row) : undefined;
      },
      getQuoteSummary: async () => {
        const [quotes, jobs] = await Promise.all([prisma.quote.findMany(), prisma.job.findMany()]);
        return {
          draftQuotes: quotes.filter((quote) => quote.status === "DRAFT").length,
          submittedQuotes: quotes.filter((quote) => quote.status === "SUBMITTED").length,
          awaitingOwnerApproval: quotes.filter((quote) => quote.status === "NEEDS_OWNER_APPROVAL").length,
          approvedThisMonth: quotes.filter((quote) => quote.status === "APPROVED").length,
          convertedToJobs: jobs.filter((job) => Boolean(job.sourceQuoteId)).length,
          expiringSoon: quotes.filter((quote) => quote.expiresSoon).length,
          totalQuotedValue: quotes.reduce((sum, quote) => sum + quote.amount, 0)
        };
      },
      getQuoteRows: async () => {
        const quotes = await prisma.quote.findMany();
        return quotes.map((quote) => ({
          quoteId: quote.id,
          customerName: quote.customerName,
          part: quote.part,
          amount: quote.amount,
          margin: quote.margin,
          status:
            quote.expiresSoon
              ? "Expiring Soon"
              : quote.status === "DRAFT"
                ? "Draft"
                : quote.status === "SUBMITTED"
                  ? "Submitted"
                  : quote.status === "NEEDS_OWNER_APPROVAL"
                    ? "Needs Owner Approval"
                    : quote.status === "APPROVED"
                      ? "Approved"
                      : quote.status === "REJECTED"
                        ? "Rejected"
                        : quote.status === "EXPIRED"
                          ? "Expired"
                          : "Converted to Job",
          validUntil: quote.validUntil ?? "21 days",
          estimator: quote.estimator,
          approvalRequirement:
            quote.id === "Q-1003"
              ? "Owner / GM required"
              : quote.status === "DRAFT"
                ? "Incomplete"
                : quote.status === "SUBMITTED"
                  ? "Ready for approval"
                  : quote.expiresSoon
                    ? "Expiring soon"
                    : "Approved",
          lastUpdated: quote.lastUpdated ?? "Today",
          action:
            quote.id === "Q-1003"
              ? "Review approval"
              : quote.status === "DRAFT"
                ? "Complete quote"
                : quote.expiresSoon
                  ? "Prioritize review"
                  : quote.status === "APPROVED"
                    ? "View quote"
                    : "View",
          href: quote.id === "Q-1003" ? "/quotes/q-1003" : undefined,
          highlight: quote.id === "Q-1003"
        }));
      },
      getApprovalQueueRows: async () => {
        const quotes = await prisma.quote.findMany();
        return quotes
          .filter((quote) => quote.status === "NEEDS_OWNER_APPROVAL" || quote.amount >= quote.approvalThreshold)
          .map((quote) => ({
            quoteId: quote.id,
            customerName: quote.customerName,
            amount: quote.amount,
            margin: quote.margin,
            estimator: quote.estimator,
            validUntil: quote.validUntil ?? "21 days",
            risk: quote.id === "Q-1003" ? "Medium" : "Medium",
            reasonApprovalRequired: quote.id === "Q-1003" ? "Above $50,000 threshold" : "Requires owner review",
            action: `Approve ${quote.id}`,
            href: quote.id === "Q-1003" ? "/quotes/q-1003/convert" : `/quotes/${quote.id.toLowerCase()}`,
            highlight: quote.id === "Q-1003"
          }));
      },
      getApprovalHistory: async (id: string) => {
        const rows = await prisma.quoteApprovalHistory.findMany({
          where: { quoteId: id },
          orderBy: { createdAt: "asc" }
        });

        return rows.map((row): QuoteApprovalHistoryEntry => ({
          timestamp: row.timestamp,
          title: row.title,
          detail: row.detail
        }));
      },
      getQuoteRoutingEstimate: notImplemented<QuoteRoutingEstimateRow[]>("quotes.getQuoteRoutingEstimate"),
      getQuoteMaterialEstimate: notImplemented<QuoteMaterialEstimateRow[]>("quotes.getQuoteMaterialEstimate"),
      getQuoteForm: notImplemented<QuoteFormSnapshot | undefined>("quotes.getQuoteForm"),
      getConversionRecord: notImplemented<QuoteConversionRecord | undefined>("quotes.getConversionRecord"),
      requiresOwnerApproval: async (amount: number, threshold = 50000) => amount >= threshold
    },
    jobs: {
      getJobs: async () => {
        const rows = await prisma.job.findMany({ orderBy: { id: "asc" } });
        return rows.map(toJob);
      },
      getJobById: async (id: string) => {
        const row = await prisma.job.findUnique({ where: { id } });
        return row ? toJob(row) : undefined;
      },
      getJobRoutingSteps: async (jobId: string) => {
        const rows = await prisma.jobRoutingStep.findMany({
          where: { jobId },
          orderBy: { stepNumber: "asc" }
        });
        return rows.map(toJobRoutingStep);
      },
      getProductionUpdates: async (jobId: string) => {
        const rows = await prisma.productionUpdate.findMany({
          where: { jobId },
          orderBy: { createdAt: "asc" }
        });
        return rows.map(toProductionUpdate);
      },
      getDashboardMetrics: async () => {
        const [jobs, workCenters, auditEvents, reworkOrders] = await Promise.all([
          prisma.job.findMany(),
          prisma.workCenter.findMany(),
          prisma.auditEvent.findMany(),
          prisma.reworkOrder.findMany()
        ]);
        return {
          activeJobs: jobs.filter((job) => !["SHIPPED", "CLOSED"].includes(job.status)).length,
          atRiskJobs: jobs.filter((job) => ["WATCH", "HIGH", "CRITICAL"].includes(job.risk)).length,
          wipValue: jobs.filter((job) => !["SHIPPED", "CLOSED"].includes(job.status)).reduce((sum, job) => sum + job.quantity * 145, 0),
          jobsDueThisWeek: jobs.filter((job) => job.dueDate === "Friday").length,
          scrapReworkCount: jobs.filter((job) => job.status === "SCRAP_APPROVAL_REQUIRED").length + reworkOrders.length,
          materialBlockers: jobs.filter((job) => ["WAITING_ON_MATERIAL", "PURCHASE_REQUESTED"].includes(job.status)).length,
          capacityBottlenecks: workCenters.filter((workCenter) => workCenter.status === "BOTTLENECK").length,
          auditEventsToday: auditEvents.length
        };
      },
      getDashboardRiskItems: async () => {
        // Keep this intentional first pass aligned with the seeded founder-demo UX.
        const demo = createDemoRepositories();
        return demo.jobs.getDashboardRiskItems();
      },
      getProductionQueue: async () => {
        const demo = createDemoRepositories();
        return demo.jobs.getProductionQueue();
      },
      getJobTraceEvents: async (jobId: string) => {
        const events = await prisma.auditEvent.findMany({ orderBy: { id: "asc" } });
        return events
          .map(toAuditEvent)
          .filter((event) => event.entityType === "job" && event.entityId === jobId);
      },
      getJ2035EntityTimeline: async () => createDemoRepositories().jobs.getJ2035EntityTimeline(),
      getCustomerSafeJobStatus: async (jobId: string) => {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return undefined;

        const summaryMap: Record<string, string> = {
          IN_PRODUCTION: "The shop is actively working the order.",
          WAITING_ON_MATERIAL: "The order is waiting on incoming material.",
          PURCHASE_REQUESTED: "The order is waiting on supplier confirmation.",
          SCRAP_APPROVAL_REQUIRED: "A quality disposition decision is pending.",
          APPROVED: "The job has been released to production.",
          READY_TO_SHIP: "The job is complete and waiting for shipment."
        };

        return {
          jobId: job.id,
          customerName: job.customerName,
          part: job.part,
          status: mapJobStatus(job.status),
          progress: job.progress ?? 0,
          nextMilestone:
            job.status === "IN_PRODUCTION"
              ? "Inspection"
              : job.status === "WAITING_ON_MATERIAL"
                ? "Material receipt"
                : job.status === "PURCHASE_REQUESTED"
                  ? "Supplier confirmation"
                  : job.status === "SCRAP_APPROVAL_REQUIRED"
                    ? "Disposition"
                    : "Next step",
          eta: job.dueDate,
          risk: mapJobRisk(job.risk),
          summary: summaryMap[job.status] ?? "Customer-safe summary available."
        };
      }
    },
    workCenters: {
      getCapacitySummary: async () => {
        const workCenters = await prisma.workCenter.findMany();
        const bottleneck = workCenters.find((workCenter) => workCenter.status === "BOTTLENECK");
        return {
          totalWorkCenters: workCenters.length,
          availableWorkCenters: workCenters.filter((workCenter) => workCenter.status === "AVAILABLE").length,
          nearCapacityWorkCenters: workCenters.filter((workCenter) => workCenter.status === "NEAR_CAPACITY").length,
          bottleneckWorkCenters: workCenters.filter((workCenter) => workCenter.status === "BOTTLENECK").length,
          overCapacityWorkCenters: workCenters.filter((workCenter) => workCenter.status === "OVER_CAPACITY").length,
          bottleneckLabel: bottleneck?.name ?? "None",
          capacityHoursPerWeek: bottleneck?.capacityHoursPerWeek ?? 0,
          queuedHoursPerWeek: bottleneck?.queuedHoursPerWeek ?? 0,
          utilization: bottleneck?.utilization ?? 0
        };
      },
      getWorkCenterCapacityRows: async () => {
        const [workCenters, jobs] = await Promise.all([
          prisma.workCenter.findMany(),
          prisma.job.findMany()
        ]);

        return workCenters.map((workCenter) => {
          const affectedJobs = jobs
            .filter((job) => job.workCenter === workCenter.name)
            .map((job) => job.id);

          return {
            name: workCenter.name,
            capacityHoursPerWeek: workCenter.capacityHoursPerWeek,
            queuedHoursPerWeek: workCenter.queuedHoursPerWeek,
            utilization: workCenter.utilization,
            status: mapWorkCenterStatus(workCenter.status),
            affectedJobs,
            nextAction:
              workCenter.status === "BOTTLENECK"
                ? "View affected job"
                : workCenter.status === "OVER_CAPACITY"
                  ? "Rebalance load"
                  : "Monitor queue",
            ctaHref:
              workCenter.name === "Press Brake"
                ? "/jobs/j-2035"
                : workCenter.name === "Welding"
                  ? "/quality/j-2042/scrap-approval"
                  : workCenter.name === "CNC Mill"
                    ? "/jobs/j-2099/material-impact"
                    : undefined
          };
        });
      },
      getCapacityRiskJobIds: async () => {
        const [workCenters, jobs] = await Promise.all([
          prisma.workCenter.findMany(),
          prisma.job.findMany()
        ]);

        return workCenters
          .filter((workCenter) => workCenter.status === "BOTTLENECK" || workCenter.status === "OVER_CAPACITY")
          .flatMap((workCenter) =>
            jobs.filter((job) => job.workCenter === workCenter.name).map((job) => job.id)
          );
      }
    },
    materials: {
      getMaterials: async () => {
        const rows = await prisma.material.findMany({ orderBy: { sku: "asc" } });
        const mapped = rows.map(toMaterial);
        return mapped.length > 0 ? mapped : createDemoRepositories().materials.getMaterials();
      },
      getMaterialBySku: async (sku: string) => {
        const row = await prisma.material.findUnique({ where: { sku } });
        return row ? toMaterial(row) : undefined;
      },
      getMaterialsSummary: async () => {
        const [materials, jobs, purchaseRequests] = await Promise.all([
          prisma.material.findMany({ orderBy: { sku: "asc" } }),
          prisma.job.findMany({ orderBy: { id: "asc" } }),
          prisma.purchaseRequest.findMany({ orderBy: { id: "asc" } })
        ]);

        const mappedMaterials = materials.map(toMaterial);
        const mappedJobs = jobs.map(toJob);
        const mappedRequests = purchaseRequests.map(toPurchaseRequest);

        return getMaterialsSummary(
          mappedMaterials.length > 0 ? mappedMaterials : await createDemoRepositories().materials.getMaterials(),
          mappedJobs.length > 0 ? mappedJobs : await createDemoRepositories().jobs.getJobs(),
          mappedRequests.length > 0 ? mappedRequests : await createDemoRepositories().purchasing.getPurchaseRequests()
        );
      },
      getMaterialRows: async () => {
        const [materials, jobs] = await Promise.all([
          prisma.material.findMany({ orderBy: { sku: "asc" } }),
          prisma.job.findMany({ orderBy: { id: "asc" } })
        ]);

        const mappedMaterials = materials.map(toMaterial);
        const mappedJobs = jobs.map(toJob);
        return getMaterialRows(
          mappedMaterials.length > 0 ? mappedMaterials : await createDemoRepositories().materials.getMaterials(),
          mappedJobs.length > 0 ? mappedJobs : await createDemoRepositories().jobs.getJobs()
        );
      },
      getBlockedJobsByMaterialShortage: async () => {
        const [materials, jobs] = await Promise.all([
          prisma.material.findMany({ orderBy: { sku: "asc" } }),
          prisma.job.findMany({ orderBy: { id: "asc" } })
        ]);

        const mappedMaterials = materials.map(toMaterial);
        const mappedJobs = jobs.map(toJob);
        return getBlockedJobsByMaterialShortage(
          mappedJobs.length > 0 ? mappedJobs : await createDemoRepositories().jobs.getJobs(),
          mappedMaterials.length > 0 ? mappedMaterials : await createDemoRepositories().materials.getMaterials()
        );
      },
      getMaterialReservationBreakdown: async () => {
        const [materials, reservations, requirements] = await Promise.all([
          prisma.material.findMany({ orderBy: { sku: "asc" } }),
          prisma.jobMaterialReservation.findMany({ orderBy: { id: "asc" } }),
          prisma.jobMaterialRequirement.findMany({ orderBy: { id: "asc" } })
        ]);

        const mappedMaterials = materials.map(toMaterial);
        const targetSku = "AL-6061-PLT-0.375";

        if (mappedMaterials.length === 0 || reservations.length === 0 || requirements.length === 0) {
          return createDemoRepositories().materials.getMaterialReservationBreakdown();
        }

        const reservedForJ2035 = reservations
          .filter((reservation) => reservation.sku === targetSku && reservation.jobId === "J-2035")
          .reduce((sum, reservation) => sum + reservation.reservedQuantity, 0);
        const requiredForJ2099 = requirements
          .filter((requirement) => requirement.sku === targetSku && requirement.jobId === "J-2099")
          .reduce((sum, requirement) => sum + requirement.requiredQuantity, 0);

        if (reservedForJ2035 <= 0 || requiredForJ2099 <= 0) {
          return createDemoRepositories().materials.getMaterialReservationBreakdown();
        }

        return [
          { label: "Reserved for J-2035", value: `${reservedForJ2035} sheets` },
          { label: "Available for new work", value: `${mappedMaterials.find((material) => material.sku === targetSku)?.available ?? 4} sheets` },
          { label: "Required for J-2099", value: `${requiredForJ2099} sheets` },
          {
            label: "Remaining shortage",
            value: `${mappedMaterials.find((material) => material.sku === targetSku)?.shortage ?? Math.max(requiredForJ2099 - (mappedMaterials.find((material) => material.sku === targetSku)?.available ?? 4), 0)} sheets`
          }
        ];
      },
      getMaterialSupplierPanel: async () => {
        const rows = await prisma.material.findMany({ orderBy: { sku: "asc" } });
        const mapped = rows.map(toMaterial);
        return mapped.length > 0 ? getMaterialSupplierPanel(mapped) : createDemoRepositories().materials.getMaterialSupplierPanel();
      },
      getMaterialImpactTimeline: async () => {
        const auditRows = await prisma.auditEvent.findMany({ orderBy: { createdAt: "asc" } });

        const mappedTimeline = getMaterialImpactTimeline(
          auditRows
            .filter((event) =>
              ["material-shortage-detected", "purchase-request-created", "job-moved-production", "quote-converted", "material-reservation-attempted"].includes(event.eventType ?? "")
            )
            .map(toEntityTimelineEntryFromAuditEvent)
        );

        if (mappedTimeline.length > 0) {
          return mappedTimeline;
        }

        return createDemoRepositories().materials.getMaterialImpactTimeline();
      }
    },
    quality: {
      getReworkOrders: async () => {
        const rows = await prisma.reworkOrder.findMany({ orderBy: { id: "asc" } });
        const mapped: ReworkOrder[] = rows.map((row): ReworkOrder => ({
          id: row.id,
          linkedJobId: row.linkedJobId,
          reason: row.reason,
          workCenter: row.workCenter,
          estimatedHours: row.estimatedHours,
          priority: row.priority === "LOW" ? "Low" : row.priority === "MEDIUM" ? "Medium" : "High",
          status: row.status === "OPEN" ? "Open" : row.status === "IN_PROGRESS" ? "In Progress" : row.status === "COMPLETE" ? "Complete" : "Closed",
          supervisor: row.supervisor,
          nextStep: row.nextStep ?? undefined
        }));

        return mapped.length > 0 ? mapped : createDemoRepositories().quality.getReworkOrders();
      },
      getQualitySummary: async () => {
        const [jobs, reworkOrders, inspectionQueueRows] = await Promise.all([
          prisma.job.findMany({ orderBy: { id: "asc" } }),
          prisma.reworkOrder.findMany({ orderBy: { id: "asc" } }),
          prisma.job.findMany({ where: { id: { in: ["J-2042", "J-2035", "J-2099", "J-2104"] } }, orderBy: { id: "asc" } })
        ]);

        const mappedJobs = jobs.map(toJob);
        const mappedReworkOrders: ReworkOrder[] = reworkOrders.map((row): ReworkOrder => ({
          id: row.id,
          linkedJobId: row.linkedJobId,
          reason: row.reason,
          workCenter: row.workCenter,
          estimatedHours: row.estimatedHours,
          priority: row.priority === "LOW" ? "Low" : row.priority === "MEDIUM" ? "Medium" : "High",
          status: row.status === "OPEN" ? "Open" : row.status === "IN_PROGRESS" ? "In Progress" : row.status === "COMPLETE" ? "Complete" : "Closed",
          supervisor: row.supervisor,
          nextStep: row.nextStep ?? undefined
        }));
        const queueRows = buildInspectionQueueRows(inspectionQueueRows.map(toJob));

        if (mappedJobs.length === 0 || mappedReworkOrders.length === 0 || queueRows.length < 4) {
          return createDemoRepositories().quality.getQualitySummary();
        }

        return getQualitySummary(mappedJobs, mappedReworkOrders, queueRows);
      },
      getInspectionQueue: async () => {
        const jobs = await prisma.job.findMany({ where: { id: { in: ["J-2042", "J-2035", "J-2099", "J-2104"] } }, orderBy: { id: "asc" } });
        const mapped = buildInspectionQueueRows(jobs.map(toJob));
        return mapped.length > 0 ? mapped : createDemoRepositories().quality.getInspectionQueue();
      },
      getDefectReasonBreakdown: async () => {
        const rows = await prisma.qualityEvent.findMany({ where: { reason: { not: null } }, orderBy: { createdAt: "asc" } });
        const counts = new Map<string, number>();
        for (const row of rows) {
          const reason = row.reason ?? "";
          counts.set(reason, (counts.get(reason) ?? 0) + 1);
        }

        if (counts.size < 5) {
          return createDemoRepositories().quality.getDefectReasonBreakdown();
        }

        const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
        return Array.from(counts.entries())
          .map(([reason, count]) => ({
            reason,
            count,
            percentage: Math.round((count / total) * 100)
          }))
          .sort((a, b) => b.count - a.count);
      },
      getQualityTimeline: async (jobId: string) => {
        const rows = await prisma.qualityEvent.findMany({ where: { jobId }, orderBy: { createdAt: "asc" } });
        const mapped = rows.map((row) => ({
          title: row.title,
          detail: row.detail,
          timestamp: row.timestamp,
          severity: row.severity ? mapAuditSeverity(row.severity) : "Info"
        }));

        return mapped.length > 0 ? mapped : createDemoRepositories().quality.getQualityTimeline(jobId);
      },
      getReworkOrderById: async (id: string) => {
        const row = await prisma.reworkOrder.findUnique({ where: { id } });
        return row
          ? {
              id: row.id,
              linkedJobId: row.linkedJobId,
              reason: row.reason,
              workCenter: row.workCenter,
              estimatedHours: row.estimatedHours,
              priority: row.priority === "LOW" ? "Low" : row.priority === "MEDIUM" ? "Medium" : "High",
              status: row.status === "OPEN" ? "Open" : row.status === "IN_PROGRESS" ? "In Progress" : row.status === "COMPLETE" ? "Complete" : "Closed",
              supervisor: row.supervisor,
              nextStep: row.nextStep ?? undefined
            }
          : undefined;
      },
      getScrapEventDetail: async (jobId: string) => {
        const row = await prisma.qualityEvent.findFirst({
          where: {
            jobId,
            eventType: {
              in: ["INSPECTION_FAILED", "SCRAP_LOGGED"]
            }
          },
          orderBy: { createdAt: "desc" }
        });

        if (!row) {
          return createDemoRepositories().quality.getScrapEventDetail(jobId);
        }

        return {
          reportedBy: row.reportedBy ?? "Marco Singh",
          reportedAt: row.reportedAt ?? row.timestamp,
          reason: row.reason ?? "Weld Porosity",
          operatorNote: row.operatorNote ?? "Porosity found after fixture change. Suspect shielding gas pressure issue.",
          inspectionNote: row.inspectionNote ?? "Sample failed visual weld inspection. Rework recommended before final inspection."
        };
      }
    },
    purchasing: {
      getPurchaseRequests: async () => {
        const rows = await prisma.purchaseRequest.findMany({ orderBy: { id: "asc" } });
        const mapped = rows.map(toPurchaseRequest);
        return mapped.length > 0 ? mapped : createDemoRepositories().purchasing.getPurchaseRequests();
      },
      getPurchaseRequestById: async (id: string) => {
        const row = await prisma.purchaseRequest.findUnique({ where: { id } });
        return row
          ? {
              id: row.id,
              materialSku: row.materialSku,
              linkedJobId: row.linkedJobId,
              supplier: row.supplier,
              quantity: row.quantity,
              unitCost: row.unitCost,
              estimatedTotal: row.estimatedTotal,
              buyer: row.buyer,
              status: mapPurchaseRequestStatus(row.status),
              priority: mapPurchaseRequestPriority(row.priority)
            }
          : undefined;
      },
      getPurchaseRequestState: async (id: string) => {
        const request = await prisma.purchaseRequest.findUnique({ where: { id } });
        if (!request) {
          return createDemoRepositories().purchasing.getPurchaseRequestState(id);
        }

        return {
          before: {
            materialStatus: "Shortage",
            jobStatus: "Waiting on Material",
            actionNeeded: "Create purchase request"
          },
          after: {
            materialStatus: request.status === "DRAFT" ? "Shortage" : "Purchase Requested",
            jobStatus: "Waiting on Material",
            nextStep: request.status === "DRAFT" ? "Create purchase request" : "Awaiting supplier confirmation"
          }
        };
      },
      getPurchaseRequestAuditEntries: async (id: string) => {
        const rows = await prisma.auditEvent.findMany({
          where: {
            OR: [
              { entityId: id, entityType: "PURCHASE_REQUEST" },
              { entityId: "J-2099", entityType: "JOB" }
            ]
          },
          orderBy: { createdAt: "asc" }
        });

        const mapped = rows.map(toPurchaseRequestAuditEntry);
        return mapped.length > 0 ? mapped : createDemoRepositories().purchasing.getPurchaseRequestAuditEntries(id);
      }
    },
    reports: {
      getReports: async () => {
        const rows = await prisma.customerReport.findMany();
        return rows.map(toReport);
      },
      getCustomerStatusReport: async (jobId: string) => {
        const row = await prisma.customerReport.findFirst({ where: { jobId, audience: "CUSTOMER" } });
        if (!row) return undefined;
        return {
          customer: row.customerName ?? "",
          contact: row.contact ?? "",
          jobId: row.jobId,
          customerPo: row.customerPo ?? "",
          part: row.part ?? "",
          quantity: row.quantity ?? 0,
          dueDate: row.dueDate ?? "",
          currentStatus: row.currentStatus ?? "",
          customerFacingStatus: row.customerFacingStatus ?? "",
          progress: row.progress ?? 0,
          nextMilestone: row.nextMilestone ?? "",
          shipmentReadiness: row.shipmentReadiness ?? "",
          preparedBy: row.preparedBy ?? "",
          preparedTimestamp: row.preparedTimestamp ?? row.generatedAt,
          message: row.message ?? "",
          reportSavedTo: row.reportSavedTo ?? row.savedAs ?? ""
        };
      },
      getCustomerStatusTimeline: async (jobId: string) => {
        const report = await prisma.customerReport.findFirst({ where: { jobId, audience: "CUSTOMER" } });
        if (!report) return [];
        return [
          { title: "Quote approved", detail: "Q-1003 approved and released to production.", timestamp: report.generatedAt, severity: "Success" },
          { title: "Work order released", detail: "Work order created and queued.", timestamp: report.generatedAt, severity: "Automation" }
        ];
      }
    },
    audit: {
      getAuditEvents: async () => {
        const rows = await prisma.auditEvent.findMany({ orderBy: { id: "asc" } });
        return rows.map(toAuditEvent);
      },
      getAuditEventsByEntity: async (entityType: AuditEvent["entityType"], entityId: string) => {
        const rows = await prisma.auditEvent.findMany({ orderBy: { id: "asc" } });
        return rows.map(toAuditEvent).filter((event) => event.entityType === entityType && event.entityId === entityId);
      },
      getAuditSummary: async () => {
        const rows = await prisma.auditEvent.findMany({ orderBy: { id: "asc" } });
        return getAuditSummary(rows.map(toAuditEvent));
      },
      getAuditTimelineRows: async () => {
        const rows = await prisma.auditEvent.findMany({ orderBy: { id: "asc" } });
        return getAuditTimelineRows(rows.map(toAuditEvent));
      },
      getAuditEntityQuickFilters: async () => getAuditEntityQuickFilters(),
      getRecentAuditEvents: async (limit: number) => {
        const rows = await prisma.auditEvent.findMany({ orderBy: { id: "asc" } });
        return getRecentAuditEvents(limit, rows.map(toAuditEvent));
      },
      getFinalValuePillars: async () => createDemoRepositories().audit.getFinalValuePillars()
    }
  };
}
