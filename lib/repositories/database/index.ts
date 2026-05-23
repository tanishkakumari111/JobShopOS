import {
  AuditEntityType as PrismaAuditEntityType,
  AuditSeverity as PrismaAuditSeverity,
  CustomerStatus as PrismaCustomerStatus,
  JobRisk as PrismaJobRisk,
  JobStatus as PrismaJobStatus,
  PurchaseRequestPriority as PrismaPurchaseRequestPriority,
  PurchaseRequestStatus as PrismaPurchaseRequestStatus,
  WorkCenterStatus as PrismaWorkCenterStatus
} from "@prisma/client";

import { getPrismaClient } from "../../db/prisma";
import { getAuditEntityQuickFilters, getAuditSummary, getAuditTimelineRows, getRecentAuditEvents } from "../../demo-data";
import type {
  AuditEvent,
  AuditQuickFilter,
  AuditSummary,
  AuditTimelineRow,
  Customer,
  CustomerRiskQueueRow,
  CustomerSafeJobStatus,
  CustomerSafeTimelineItem,
  CustomerServiceSummary,
  CustomerStatusReport,
  DashboardMetrics,
  DashboardRiskItem,
  DefectReasonBreakdownRow,
  FinalValuePillar,
  InspectionQueueRow,
  Job,
  Material,
  MaterialAffectedJobRow,
  MaterialDashboardRow,
  MaterialReservationBreakdownRow,
  MaterialTimelineEntry,
  ProductionQueueRow,
  PurchaseRequest,
  PurchaseRequestAuditEntry,
  PurchaseRequestState,
  Quote,
  QuoteApprovalHistoryEntry,
  QuoteApprovalQueueRow,
  QuoteConversionRecord,
  QuoteDashboardRow,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow,
  QuoteSummary,
  QualitySummary,
  Report,
  ReworkOrder,
  ScrapEventDetail,
  WorkCenter,
  WorkCenterCapacityRow
} from "../../demo-data/types";
import { createDemoRepositories } from "../demo";
import type { RepositorySet } from "../types";

const prisma = getPrismaClient();

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

function toWorkCenter(row: Awaited<ReturnType<typeof prisma.workCenter.findUniqueOrThrow>>): WorkCenter {
  return {
    id: row.id,
    name: row.name,
    capacityHoursPerWeek: row.capacityHoursPerWeek,
    queuedHoursPerWeek: row.queuedHoursPerWeek,
    utilization: row.utilization,
    status: mapWorkCenterStatus(row.status)
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

export function createDatabaseRepositories(): RepositorySet {
  return {
    customers: {
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
      getApprovalHistory: notImplemented<QuoteApprovalHistoryEntry[]>("quotes.getApprovalHistory"),
      getQuoteRoutingEstimate: notImplemented<QuoteRoutingEstimateRow[]>("quotes.getQuoteRoutingEstimate"),
      getQuoteMaterialEstimate: notImplemented<QuoteMaterialEstimateRow[]>("quotes.getQuoteMaterialEstimate"),
      getQuoteForm: notImplemented<QuoteFormSnapshot | undefined>("quotes.getQuoteForm"),
      getConversionRecord: notImplemented<QuoteConversionRecord | undefined>("quotes.getConversionRecord"),
      requiresOwnerApproval: async (amount: number, threshold = 50000) => amount >= threshold
    },
    jobs: {
      getJobById: async (id: string) => {
        const row = await prisma.job.findUnique({ where: { id } });
        return row ? toJob(row) : undefined;
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
      getCustomerSafeJobStatus: async (jobId: string) => createDemoRepositories().customers.getCustomerSafeJobStatus(jobId)
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
      getWorkCenterCapacityRows: async () => createDemoRepositories().workCenters.getWorkCenterCapacityRows(),
      getCapacityRiskJobIds: async () => createDemoRepositories().workCenters.getCapacityRiskJobIds()
    },
    materials: {
      getMaterialBySku: async (sku: string) => {
        const row = await prisma.material.findUnique({ where: { sku } });
        return row ? toMaterial(row) : undefined;
      },
      getMaterialsSummary: async () => createDemoRepositories().materials.getMaterialsSummary(),
      getMaterialRows: async () => createDemoRepositories().materials.getMaterialRows(),
      getBlockedJobsByMaterialShortage: async () => createDemoRepositories().materials.getBlockedJobsByMaterialShortage(),
      getMaterialReservationBreakdown: async () => createDemoRepositories().materials.getMaterialReservationBreakdown(),
      getMaterialSupplierPanel: async () => createDemoRepositories().materials.getMaterialSupplierPanel(),
      getMaterialImpactTimeline: async () => createDemoRepositories().materials.getMaterialImpactTimeline()
    },
    quality: {
      getQualitySummary: async () => createDemoRepositories().quality.getQualitySummary(),
      getInspectionQueue: async () => createDemoRepositories().quality.getInspectionQueue(),
      getDefectReasonBreakdown: async () => createDemoRepositories().quality.getDefectReasonBreakdown(),
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
      getScrapEventDetail: async () => createDemoRepositories().quality.getScrapEventDetail()
    },
    purchasing: {
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
      getPurchaseRequestState: async () => createDemoRepositories().purchasing.getPurchaseRequestState(),
      getPurchaseRequestAuditEntries: async () => createDemoRepositories().purchasing.getPurchaseRequestAuditEntries()
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
