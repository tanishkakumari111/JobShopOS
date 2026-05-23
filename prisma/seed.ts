import {
  AuditEntityType as PrismaAuditEntityType,
  AuditSeverity as PrismaAuditSeverity,
  CustomerStatus as PrismaCustomerStatus,
  JobRisk as PrismaJobRisk,
  JobStatus as PrismaJobStatus,
  Prisma,
  ProductionUpdateStatus as PrismaProductionUpdateStatus,
  PurchaseRequestPriority as PrismaPurchaseRequestPriority,
  PurchaseRequestStatus as PrismaPurchaseRequestStatus,
  QualityEventType as PrismaQualityEventType,
  QuoteStatus as PrismaQuoteStatus,
  ReportAudience as PrismaReportAudience,
  ReworkOrderPriority as PrismaReworkOrderPriority,
  ReworkOrderStatus as PrismaReworkOrderStatus,
  WorkCenterStatus as PrismaWorkCenterStatus
} from "@prisma/client";
import {
  auditEvents,
  customers,
  customerStatusReport,
  j2035ProductionUpdates,
  j2035RoutingSteps,
  j2035TravelerMaterials,
  j2042QualityTimeline,
  j2042ScrapEventDetail,
  jobs,
  materials,
  metrofabCustomerProfile,
  purchaseRequests,
  q1003ApprovalHistory,
  q1003ConversionRecord,
  quoteMaterialEstimateRows,
  quoteRoutingEstimateRows,
  quotes,
  qualityRecords,
  reworkOrders,
  reports,
  workCenters
} from "../lib/demo-data";
import { getPrismaClient } from "../lib/db/prisma";

function slugify(value: string) {
  return value
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function parseCount(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

type EnumValue<T extends Record<string, string>> = T[keyof T];

type CustomerStatusValue = EnumValue<typeof PrismaCustomerStatus>;
type QuoteStatusValue = EnumValue<typeof PrismaQuoteStatus>;
type JobStatusValue = EnumValue<typeof PrismaJobStatus>;
type JobRiskValue = EnumValue<typeof PrismaJobRisk>;
type WorkCenterStatusValue = EnumValue<typeof PrismaWorkCenterStatus>;
type PurchaseRequestStatusValue = EnumValue<typeof PrismaPurchaseRequestStatus>;
type PurchaseRequestPriorityValue = EnumValue<typeof PrismaPurchaseRequestPriority>;
type ReportAudienceValue = EnumValue<typeof PrismaReportAudience>;
type ProductionUpdateStatusValue = EnumValue<typeof PrismaProductionUpdateStatus>;
type QualityEventTypeValue = EnumValue<typeof PrismaQualityEventType>;
type ReworkOrderPriorityValue = EnumValue<typeof PrismaReworkOrderPriority>;
type ReworkOrderStatusValue = EnumValue<typeof PrismaReworkOrderStatus>;
type AuditSeverityValue = EnumValue<typeof PrismaAuditSeverity>;
type AuditEntityTypeValue = EnumValue<typeof PrismaAuditEntityType>;

function mapCustomerStatus(status: string): CustomerStatusValue {
  switch (status) {
    case "Active":
      return "ACTIVE";
    case "At Risk":
      return "AT_RISK";
    case "Prospect":
      return "PROSPECT";
    default:
      return "ACTIVE";
  }
}

function mapQuoteStatus(status: string): QuoteStatusValue {
  switch (status) {
    case "Draft":
      return "DRAFT";
    case "Submitted":
      return "SUBMITTED";
    case "Needs Owner Approval":
      return "NEEDS_OWNER_APPROVAL";
    case "Approved":
      return "APPROVED";
    case "Rejected":
      return "REJECTED";
    case "Expired":
      return "EXPIRED";
    case "Converted to Job":
      return "CONVERTED_TO_JOB";
    default:
      return "DRAFT";
  }
}

function mapJobStatus(status: string): JobStatusValue {
  switch (status) {
    case "Approved":
      return "APPROVED";
    case "Waiting on Material":
      return "WAITING_ON_MATERIAL";
    case "Purchase Requested":
      return "PURCHASE_REQUESTED";
    case "Materials Reserved":
      return "MATERIALS_RESERVED";
    case "In Production":
      return "IN_PRODUCTION";
    case "In Quality":
      return "IN_QUALITY";
    case "Rework":
      return "REWORK";
    case "Ready to Ship":
      return "READY_TO_SHIP";
    case "Shipped":
      return "SHIPPED";
    case "Closed":
      return "CLOSED";
    case "Scrap Approval Required":
      return "SCRAP_APPROVAL_REQUIRED";
    default:
      return "APPROVED";
  }
}

function mapJobRisk(risk: string): JobRiskValue {
  switch (risk) {
    case "Low":
      return "LOW";
    case "Watch":
      return "WATCH";
    case "High":
      return "HIGH";
    case "Critical":
      return "CRITICAL";
    default:
      return "NONE";
  }
}

function mapWorkCenterStatus(status: string): WorkCenterStatusValue {
  switch (status) {
    case "Available":
      return "AVAILABLE";
    case "Near Capacity":
      return "NEAR_CAPACITY";
    case "Bottleneck":
      return "BOTTLENECK";
    case "Over Capacity":
      return "OVER_CAPACITY";
    case "Maintenance":
      return "MAINTENANCE";
    default:
      return "AVAILABLE";
  }
}

function mapPurchaseRequestStatus(status: string): PurchaseRequestStatusValue {
  switch (status) {
    case "Draft":
      return "DRAFT";
    case "Submitted":
      return "SUBMITTED";
    case "Approved":
      return "APPROVED";
    case "Rejected":
      return "REJECTED";
    case "Ordered":
      return "ORDERED";
    default:
      return "SUBMITTED";
  }
}

function mapPurchaseRequestPriority(priority: string): PurchaseRequestPriorityValue {
  switch (priority) {
    case "Low":
      return "LOW";
    case "Medium":
      return "MEDIUM";
    case "High":
      return "HIGH";
    default:
      return "MEDIUM";
  }
}

function mapReportAudience(audience: string): ReportAudienceValue {
  return audience === "Internal" ? "INTERNAL" : "CUSTOMER";
}

function mapProductionUpdateStatus(status: string): ProductionUpdateStatusValue {
  switch (status) {
    case "Complete":
      return "COMPLETE";
    case "Pending":
      return "PENDING";
    case "Watch":
      return "WATCH";
    default:
      return "INFO";
  }
}

function mapQualityEventType(title: string): QualityEventTypeValue {
  const normalized = title.toLowerCase();
  if (normalized.includes("inspection failed")) {
    return "INSPECTION_FAILED";
  }
  if (normalized.includes("scrap approved")) {
    return "SCRAP_APPROVED";
  }
  if (normalized.includes("rework")) {
    return "REWORK_CREATED";
  }
  if (normalized.includes("scrap logged")) {
    return "SCRAP_LOGGED";
  }
  return "QUALITY_SIGNOFF";
}

function mapAuditEntityType(entityType: string): AuditEntityTypeValue {
  switch (entityType) {
    case "quote":
      return "QUOTE";
    case "job":
      return "JOB";
    case "workOrder":
      return "WORK_ORDER";
    case "material":
      return "MATERIAL";
    case "purchaseRequest":
      return "PURCHASE_REQUEST";
    case "report":
      return "REPORT";
    case "quality":
      return "QUALITY";
    case "reworkOrder":
      return "REWORK_ORDER";
    case "capacity":
      return "CAPACITY";
    case "customer":
      return "CUSTOMER";
    default:
      return "QUOTE";
  }
}

function mapAuditSeverity(severity: string): AuditSeverityValue {
  switch (severity) {
    case "Info":
      return "INFO";
    case "Warning":
      return "WARNING";
    case "Critical":
      return "CRITICAL";
    case "Blocked":
      return "BLOCKED";
    case "Approval":
      return "APPROVAL";
    case "Automation":
      return "AUTOMATION";
    case "Success":
      return "SUCCESS";
    default:
      return "INFO";
  }
}

async function seedCustomers(tx: Prisma.TransactionClient) {
  for (const customer of customers) {
    const profile = customer.slug === "metrofab-industries" ? metrofabCustomerProfile : undefined;

    await tx.customer.upsert({
      where: { slug: customer.slug },
      update: {
        name: customer.name,
        shortName: customer.shortName,
        status: mapCustomerStatus(customer.status),
        primaryContact: customer.primaryContact,
        city: customer.city,
        state: customer.state,
        accountContact: profile?.accountContact,
        email: profile?.email,
        phone: profile?.phone,
        openJobs: profile?.openJobs,
        openQuotes: profile?.openQuotes,
        onTimeDeliveryRate: profile?.onTimeDeliveryRate,
        lastUpdated: profile?.lastUpdated,
        tabs: profile?.tabs ?? undefined
      },
      create: {
        slug: customer.slug,
        name: customer.name,
        shortName: customer.shortName,
        status: mapCustomerStatus(customer.status),
        primaryContact: customer.primaryContact,
        city: customer.city,
        state: customer.state,
        accountContact: profile?.accountContact,
        email: profile?.email,
        phone: profile?.phone,
        openJobs: profile?.openJobs,
        openQuotes: profile?.openQuotes,
        onTimeDeliveryRate: profile?.onTimeDeliveryRate,
        lastUpdated: profile?.lastUpdated,
        tabs: profile?.tabs ?? undefined
      }
    });
  }
}

async function seedWorkCenters(tx: Prisma.TransactionClient) {
  for (const workCenter of workCenters) {
    await tx.workCenter.upsert({
      where: { id: workCenter.id },
      update: {
        name: workCenter.name,
        capacityHoursPerWeek: workCenter.capacityHoursPerWeek,
        queuedHoursPerWeek: workCenter.queuedHoursPerWeek,
        utilization: workCenter.utilization,
        status: mapWorkCenterStatus(workCenter.status)
      },
      create: {
        id: workCenter.id,
        name: workCenter.name,
        capacityHoursPerWeek: workCenter.capacityHoursPerWeek,
        queuedHoursPerWeek: workCenter.queuedHoursPerWeek,
        utilization: workCenter.utilization,
        status: mapWorkCenterStatus(workCenter.status)
      }
    });
  }
}

async function seedMaterials(tx: Prisma.TransactionClient) {
  for (const material of materials) {
    await tx.material.upsert({
      where: { sku: material.sku },
      update: {
        name: material.name,
        requiredForJobId: material.requiredForJobId,
        requiredSheets: material.requiredSheets,
        onHand: material.onHand,
        reserved: material.reserved,
        available: material.available,
        shortage: material.shortage,
        supplier: material.supplier,
        leadTimeBusinessDays: material.leadTimeBusinessDays,
        lastPurchasePrice: material.lastPurchasePrice,
        suggestedOrderQuantity: material.suggestedOrderQuantity,
        reorderPoint: material.reorderPoint,
        contactEmail: material.contactEmail,
        lastUpdated: material.lastUpdated,
        minimumOrderQuantity: material.minimumOrderQuantity
      },
      create: {
        sku: material.sku,
        name: material.name,
        requiredForJobId: material.requiredForJobId,
        requiredSheets: material.requiredSheets,
        onHand: material.onHand,
        reserved: material.reserved,
        available: material.available,
        shortage: material.shortage,
        supplier: material.supplier,
        leadTimeBusinessDays: material.leadTimeBusinessDays,
        lastPurchasePrice: material.lastPurchasePrice,
        suggestedOrderQuantity: material.suggestedOrderQuantity,
        reorderPoint: material.reorderPoint,
        contactEmail: material.contactEmail,
        lastUpdated: material.lastUpdated,
        minimumOrderQuantity: material.minimumOrderQuantity
      }
    });
  }
}

async function seedQuotes(tx: Prisma.TransactionClient) {
  for (const quote of quotes) {
    await tx.quote.upsert({
      where: { id: quote.id },
      update: {
        slug: quote.slug,
        customerSlug: quote.customerSlug,
        customerName: quote.customerName,
        part: quote.part,
        quantity: quote.quantity,
        amount: quote.amount,
        status: mapQuoteStatus(quote.status),
        estimator: quote.estimator,
        approvalThreshold: quote.approvalThreshold,
        approvalRequiredRole: quote.approvalRequiredRole,
        margin: quote.margin,
        labor: quote.labor,
        materials: quote.materials,
        outsideServices: quote.outsideServices,
        setupOverhead: quote.setupOverhead,
        customerReference: quote.customerReference,
        revision: quote.revision,
        validUntil: quote.validUntil,
        lastUpdated: quote.lastUpdated,
        expiresSoon: quote.expiresSoon ?? false,
        customerFacingNotes: quote.customerFacingNotes,
        internalNotes: quote.internalNotes
      },
      create: {
        id: quote.id,
        slug: quote.slug,
        customerSlug: quote.customerSlug,
        customerName: quote.customerName,
        part: quote.part,
        quantity: quote.quantity,
        amount: quote.amount,
        status: mapQuoteStatus(quote.status),
        estimator: quote.estimator,
        approvalThreshold: quote.approvalThreshold,
        approvalRequiredRole: quote.approvalRequiredRole,
        margin: quote.margin,
        labor: quote.labor,
        materials: quote.materials,
        outsideServices: quote.outsideServices,
        setupOverhead: quote.setupOverhead,
        customerReference: quote.customerReference,
        revision: quote.revision,
        validUntil: quote.validUntil,
        lastUpdated: quote.lastUpdated,
        expiresSoon: quote.expiresSoon ?? false,
        customerFacingNotes: quote.customerFacingNotes,
        internalNotes: quote.internalNotes
      }
    });
  }

  for (let index = 0; index < quoteRoutingEstimateRows.length; index += 1) {
    const step = quoteRoutingEstimateRows[index];
    const stepNumber = (index + 1) * 10;
    await tx.quoteRoutingStep.upsert({
      where: { id: `Q-1003-${stepNumber}` },
      update: {
        quoteId: "Q-1003",
        stepNumber,
        operation: step.operation,
        workCenter: step.workCenter,
        estimatedHours: step.estimatedHours,
        machine: step.machine,
        notes: step.notes
      },
      create: {
        id: `Q-1003-${stepNumber}`,
        quoteId: "Q-1003",
        stepNumber,
        operation: step.operation,
        workCenter: step.workCenter,
        estimatedHours: step.estimatedHours,
        machine: step.machine,
        notes: step.notes
      }
    });
  }

  for (const materialLine of quoteMaterialEstimateRows) {
    await tx.quoteMaterialLine.upsert({
      where: { id: `Q-1003-${materialLine.sku}` },
      update: {
        quoteId: "Q-1003",
        sku: materialLine.sku,
        materialName: materialLine.materialName,
        quantity: materialLine.quantity,
        unitCost: materialLine.unitCost,
        extendedCost: materialLine.extendedCost,
        availabilityStatus: materialLine.availabilityStatus
      },
      create: {
        id: `Q-1003-${materialLine.sku}`,
        quoteId: "Q-1003",
        sku: materialLine.sku,
        materialName: materialLine.materialName,
        quantity: materialLine.quantity,
        unitCost: materialLine.unitCost,
        extendedCost: materialLine.extendedCost,
        availabilityStatus: materialLine.availabilityStatus
      }
    });
  }

  for (const historyEntry of q1003ApprovalHistory) {
    await tx.quoteApprovalHistory.upsert({
      where: { id: `Q-1003-${slugify(historyEntry.timestamp)}` },
      update: {
        quoteId: "Q-1003",
        timestamp: historyEntry.timestamp,
        title: historyEntry.title,
        detail: historyEntry.detail
      },
      create: {
        id: `Q-1003-${slugify(historyEntry.timestamp)}`,
        quoteId: "Q-1003",
        timestamp: historyEntry.timestamp,
        title: historyEntry.title,
        detail: historyEntry.detail
      }
    });
  }
}

async function seedJobs(tx: Prisma.TransactionClient) {
  for (const job of jobs) {
    await tx.job.upsert({
      where: { id: job.id },
      update: {
        slug: job.slug,
        customerSlug: job.customerSlug,
        customerName: job.customerName,
        customerPo: job.customerPo,
        part: job.part,
        quantity: job.quantity,
        completedQuantity: job.completedQuantity,
        scrapQuantity: job.scrapQuantity,
        scrapRate: job.scrapRate,
        allowedTolerance: job.allowedTolerance,
        status: mapJobStatus(job.status),
        currentStep: job.currentStep,
        blockedStep: job.blockedStep,
        workCenter: job.workCenter,
        risk: mapJobRisk(job.risk),
        dueDate: job.dueDate,
        workOrder: job.workOrder,
        reworkOrder: job.reworkOrder,
        purchaseRequestId: job.purchaseRequestId,
        reportGenerated: job.reportGenerated ?? false,
        requiredMaterial: job.requiredMaterial,
        shortageSheets: job.shortageSheets,
        sourceQuoteId: job.sourceQuoteId,
        progress: job.progress
      },
      create: {
        id: job.id,
        slug: job.slug,
        customerSlug: job.customerSlug,
        customerName: job.customerName,
        customerPo: job.customerPo,
        part: job.part,
        quantity: job.quantity,
        completedQuantity: job.completedQuantity,
        scrapQuantity: job.scrapQuantity,
        scrapRate: job.scrapRate,
        allowedTolerance: job.allowedTolerance,
        status: mapJobStatus(job.status),
        currentStep: job.currentStep,
        blockedStep: job.blockedStep,
        workCenter: job.workCenter,
        risk: mapJobRisk(job.risk),
        dueDate: job.dueDate,
        workOrder: job.workOrder,
        reworkOrder: job.reworkOrder,
        purchaseRequestId: job.purchaseRequestId,
        reportGenerated: job.reportGenerated ?? false,
        requiredMaterial: job.requiredMaterial,
        shortageSheets: job.shortageSheets,
        sourceQuoteId: job.sourceQuoteId,
        progress: job.progress
      }
    });
  }

  for (const step of j2035RoutingSteps) {
    await tx.jobRoutingStep.upsert({
      where: { id: `J-2035-${step.stepNumber}` },
      update: {
        jobId: "J-2035",
        stepNumber: step.stepNumber,
        operation: step.operation,
        workCenter: step.workCenter,
        plannedHours: step.plannedHours,
        actualHours: step.actualHours,
        assignedOperator: step.assignedOperator,
        machine: step.machine,
        status: step.status,
        timestamp: step.timestamp
      },
      create: {
        id: `J-2035-${step.stepNumber}`,
        jobId: "J-2035",
        stepNumber: step.stepNumber,
        operation: step.operation,
        workCenter: step.workCenter,
        plannedHours: step.plannedHours,
        actualHours: step.actualHours,
        assignedOperator: step.assignedOperator,
        machine: step.machine,
        status: step.status,
        timestamp: step.timestamp
      }
    });
  }

  const j2035TravelerMaterial = j2035TravelerMaterials[0];
  const j2035RequiredQuantity = parseCount(j2035TravelerMaterial?.requiredQuantity ?? "48 sheets");
  const j2035ReservedQuantity = parseCount(j2035TravelerMaterial?.reservedQuantity ?? "12 sheets");
  const j2035RequirementId = "J-2035-AL-6061-PLT-0.375";
  await tx.jobMaterialRequirement.upsert({
    where: { id: j2035RequirementId },
    update: {
      jobId: "J-2035",
      sku: "AL-6061-PLT-0.375",
      materialName: "Aluminum Plate 6061, 3/8 inch",
      requiredQuantity: j2035RequiredQuantity,
      status: "Reserved",
      notes: "Reserved for the current production run."
    },
    create: {
      id: j2035RequirementId,
      jobId: "J-2035",
      sku: "AL-6061-PLT-0.375",
      materialName: "Aluminum Plate 6061, 3/8 inch",
      requiredQuantity: j2035RequiredQuantity,
      status: "Reserved",
      notes: "Reserved for the current production run."
    }
  });

  await tx.jobMaterialReservation.upsert({
    where: { id: "J-2035-AL-6061-PLT-0.375-RESERVATION" },
    update: {
      jobId: "J-2035",
      sku: "AL-6061-PLT-0.375",
      reservedQuantity: j2035ReservedQuantity,
      lotNumber: j2035TravelerMaterial?.lotNumber ?? "LOT-AL-2402",
      signOff: j2035TravelerMaterial?.signOff ?? "Reserved"
    },
    create: {
      id: "J-2035-AL-6061-PLT-0.375-RESERVATION",
      jobId: "J-2035",
      sku: "AL-6061-PLT-0.375",
      reservedQuantity: j2035ReservedQuantity,
      lotNumber: j2035TravelerMaterial?.lotNumber ?? "LOT-AL-2402",
      signOff: j2035TravelerMaterial?.signOff ?? "Reserved"
    }
  });

  for (const update of j2035ProductionUpdates) {
    await tx.productionUpdate.upsert({
      where: { id: `J-2035-${slugify(update.label)}` },
      update: {
        jobId: "J-2035",
        label: update.label,
        detail: update.detail,
        status: mapProductionUpdateStatus(update.status)
      },
      create: {
        id: `J-2035-${slugify(update.label)}`,
        jobId: "J-2035",
        label: update.label,
        detail: update.detail,
        status: mapProductionUpdateStatus(update.status)
      }
    });
  }

  await tx.jobMaterialRequirement.upsert({
    where: { id: "J-2099-AL-6061-PLT-0.375" },
    update: {
      jobId: "J-2099",
      sku: "AL-6061-PLT-0.375",
      materialName: "Aluminum Plate 6061, 3/8 inch",
      requiredQuantity: 48,
      status: "Blocked",
      notes: "Shortage detected before CNC Mill can begin."
    },
    create: {
      id: "J-2099-AL-6061-PLT-0.375",
      jobId: "J-2099",
      sku: "AL-6061-PLT-0.375",
      materialName: "Aluminum Plate 6061, 3/8 inch",
      requiredQuantity: 48,
      status: "Blocked",
      notes: "Shortage detected before CNC Mill can begin."
    }
  });

  for (const step of q1003ConversionRecord.generatedRouting) {
    const stepNumber = (q1003ConversionRecord.generatedRouting.indexOf(step) + 1) * 10;
    const estimate = quoteRoutingEstimateRows[q1003ConversionRecord.generatedRouting.indexOf(step)];

    await tx.jobRoutingStep.upsert({
      where: { id: `J-2104-${stepNumber}` },
      update: {
        jobId: "J-2104",
        stepNumber,
        operation: step,
        workCenter: estimate?.workCenter ?? "Scheduling",
        plannedHours: estimate?.estimatedHours ?? 0,
        assignedOperator: step === "Cut" ? "A. Patel" : step === "Bend" ? "Marco Singh" : "Pending",
        machine: estimate?.machine ?? "Pending",
        status: step === "Cut" ? "Complete" : step === "Bend" ? "In Progress" : "Pending"
      },
      create: {
        id: `J-2104-${stepNumber}`,
        jobId: "J-2104",
        stepNumber,
        operation: step,
        workCenter: estimate?.workCenter ?? "Scheduling",
        plannedHours: estimate?.estimatedHours ?? 0,
        assignedOperator: step === "Cut" ? "A. Patel" : step === "Bend" ? "Marco Singh" : "Pending",
        machine: estimate?.machine ?? "Pending",
        status: step === "Cut" ? "Complete" : step === "Bend" ? "In Progress" : "Pending"
      }
    });
  }

  await tx.jobMaterialRequirement.upsert({
    where: { id: "J-2104-AL-6061-PLT-0.375" },
    update: {
      jobId: "J-2104",
      sku: "AL-6061-PLT-0.375",
      materialName: "Aluminum Plate 6061, 3/8 inch",
      requiredQuantity: 48,
      status: "Pending",
      notes: "Initial material reservation enabled from the converted quote."
    },
    create: {
      id: "J-2104-AL-6061-PLT-0.375",
      jobId: "J-2104",
      sku: "AL-6061-PLT-0.375",
      materialName: "Aluminum Plate 6061, 3/8 inch",
      requiredQuantity: 48,
      status: "Pending",
      notes: "Initial material reservation enabled from the converted quote."
    }
  });
}

async function seedQuality(tx: Prisma.TransactionClient) {
  for (const record of j2042QualityTimeline) {
    await tx.qualityEvent.upsert({
      where: { id: `J-2042-${slugify(record.title)}` },
      update: {
        jobId: "J-2042",
        eventType: mapQualityEventType(record.title),
        title: record.title,
        detail: record.detail,
        timestamp: record.timestamp,
        severity: record.severity === "Info" ? "INFO" : record.severity === "Warning" ? "WARNING" : record.severity === "Critical" ? "CRITICAL" : record.severity === "Blocked" ? "BLOCKED" : record.severity === "Approval" ? "APPROVAL" : record.severity === "Automation" ? "AUTOMATION" : "SUCCESS"
      },
      create: {
        id: `J-2042-${slugify(record.title)}`,
        jobId: "J-2042",
        eventType: mapQualityEventType(record.title),
        title: record.title,
        detail: record.detail,
        timestamp: record.timestamp,
        severity: record.severity === "Info" ? "INFO" : record.severity === "Warning" ? "WARNING" : record.severity === "Critical" ? "CRITICAL" : record.severity === "Blocked" ? "BLOCKED" : record.severity === "Approval" ? "APPROVAL" : record.severity === "Automation" ? "AUTOMATION" : "SUCCESS"
      }
    });
  }
}

async function seedReworkOrders(tx: Prisma.TransactionClient) {
  for (const reworkOrder of reworkOrders) {
    await tx.reworkOrder.upsert({
      where: { id: reworkOrder.id },
      update: {
        linkedJobId: reworkOrder.linkedJobId,
        reason: reworkOrder.reason,
        workCenter: reworkOrder.workCenter,
        estimatedHours: reworkOrder.estimatedHours,
        priority: "HIGH",
        status: "OPEN",
        supervisor: reworkOrder.supervisor,
        nextStep: reworkOrder.nextStep
      },
      create: {
        id: reworkOrder.id,
        linkedJobId: reworkOrder.linkedJobId,
        reason: reworkOrder.reason,
        workCenter: reworkOrder.workCenter,
        estimatedHours: reworkOrder.estimatedHours,
        priority: "HIGH",
        status: "OPEN",
        supervisor: reworkOrder.supervisor,
        nextStep: reworkOrder.nextStep
      }
    });
  }
}

async function seedQualityEvents(tx: Prisma.TransactionClient) {
  await tx.qualityEvent.upsert({
    where: { id: "J-2042-SCRAP-DETAIL" },
    update: {
      jobId: "J-2042",
      eventType: "SCRAP_LOGGED",
      title: "Scrap detail recorded",
      detail: "Operator and inspection notes captured for the weld porosity event.",
      timestamp: j2042ScrapEventDetail.reportedAt,
      reportedBy: j2042ScrapEventDetail.reportedBy,
      reportedAt: j2042ScrapEventDetail.reportedAt,
      reason: j2042ScrapEventDetail.reason,
      operatorNote: j2042ScrapEventDetail.operatorNote,
      inspectionNote: j2042ScrapEventDetail.inspectionNote,
      workCenter: "Welding",
      scrapQuantity: 18,
      completedQuantity: 180,
      scrapRate: 0.1,
      allowedTolerance: 0.05,
      metadata: {
        source: "seed-demo",
        inspectionStatus: qualityRecords[0]?.inspectionStatus,
        disposition: qualityRecords[0]?.disposition
      }
    },
    create: {
      id: "J-2042-SCRAP-DETAIL",
      jobId: "J-2042",
      eventType: "SCRAP_LOGGED",
      title: "Scrap detail recorded",
      detail: "Operator and inspection notes captured for the weld porosity event.",
      timestamp: j2042ScrapEventDetail.reportedAt,
      reportedBy: j2042ScrapEventDetail.reportedBy,
      reportedAt: j2042ScrapEventDetail.reportedAt,
      reason: j2042ScrapEventDetail.reason,
      operatorNote: j2042ScrapEventDetail.operatorNote,
      inspectionNote: j2042ScrapEventDetail.inspectionNote,
      workCenter: "Welding",
      scrapQuantity: 18,
      completedQuantity: 180,
      scrapRate: 0.1,
      allowedTolerance: 0.05,
      metadata: {
        source: "seed-demo",
        inspectionStatus: qualityRecords[0]?.inspectionStatus,
        disposition: qualityRecords[0]?.disposition
      }
    }
  });

  await tx.qualityEvent.upsert({
    where: { id: "RW-2042-01-CREATED" },
    update: {
      jobId: "J-2042",
      eventType: "REWORK_CREATED",
      title: "Rework order created",
      detail: "RW-2042-01 created and linked back to the original inspection.",
      timestamp: "Today 1:06 PM",
      severity: "AUTOMATION",
      reworkOrderId: "RW-2042-01"
    },
    create: {
      id: "RW-2042-01-CREATED",
      jobId: "J-2042",
      eventType: "REWORK_CREATED",
      title: "Rework order created",
      detail: "RW-2042-01 created and linked back to the original inspection.",
      timestamp: "Today 1:06 PM",
      severity: "AUTOMATION",
      reworkOrderId: "RW-2042-01"
    }
  });
}

async function seedPurchasing(tx: Prisma.TransactionClient) {
  for (const request of purchaseRequests) {
    await tx.purchaseRequest.upsert({
      where: { id: request.id },
      update: {
        materialSku: request.materialSku,
        linkedJobId: request.linkedJobId,
        supplier: request.supplier,
        quantity: request.quantity,
        unitCost: request.unitCost,
        estimatedTotal: request.estimatedTotal,
        buyer: request.buyer,
        status: mapPurchaseRequestStatus(request.status),
        priority: mapPurchaseRequestPriority(request.priority)
      },
      create: {
        id: request.id,
        materialSku: request.materialSku,
        linkedJobId: request.linkedJobId,
        supplier: request.supplier,
        quantity: request.quantity,
        unitCost: request.unitCost,
        estimatedTotal: request.estimatedTotal,
        buyer: request.buyer,
        status: mapPurchaseRequestStatus(request.status),
        priority: mapPurchaseRequestPriority(request.priority)
      }
    });
  }
}

async function seedReports(tx: Prisma.TransactionClient) {
  for (const report of reports) {
    const relatedJob = jobs.find((job) => job.id === report.jobId);
    const relatedCustomerSlug = relatedJob?.customerSlug ?? null;

    await tx.customerReport.upsert({
      where: { id: report.id },
      update: {
        jobId: report.jobId,
        customerSlug: relatedCustomerSlug,
        title: report.title,
        audience: mapReportAudience(report.audience),
        summary: report.summary,
        generatedAt: report.generatedAt,
        savedAs: report.savedAs ?? null,
        customerName: null,
        contact: null,
        customerPo: null,
        part: null,
        quantity: null,
        dueDate: null,
        currentStatus: null,
        customerFacingStatus: null,
        progress: null,
        nextMilestone: null,
        shipmentReadiness: null,
        preparedBy: null,
        preparedTimestamp: null,
        message: null,
        reportSavedTo: null
      },
      create: {
        id: report.id,
        jobId: report.jobId,
        customerSlug: relatedCustomerSlug,
        title: report.title,
        audience: mapReportAudience(report.audience),
        summary: report.summary,
        generatedAt: report.generatedAt,
        savedAs: report.savedAs ?? null,
        customerName: null,
        contact: null,
        customerPo: null,
        part: null,
        quantity: null,
        dueDate: null,
        currentStatus: null,
        customerFacingStatus: null,
        progress: null,
        nextMilestone: null,
        shipmentReadiness: null,
        preparedBy: null,
        preparedTimestamp: null,
        message: null,
        reportSavedTo: null
      }
    });
  }

  await tx.customerReport.upsert({
    where: { id: "RPT-J-2035-CUSTOMER" },
    update: {
      jobId: customerStatusReport.jobId,
      customerSlug: "metrofab-industries",
      title: "Customer Job Status Report",
      audience: "CUSTOMER",
      summary: "Customer-safe status report for J-2035.",
      generatedAt: customerStatusReport.preparedTimestamp,
      savedAs: "Customer PDF",
      customerName: customerStatusReport.customer,
      contact: customerStatusReport.contact,
      customerPo: customerStatusReport.customerPo,
      part: customerStatusReport.part,
      quantity: customerStatusReport.quantity,
      dueDate: customerStatusReport.dueDate,
      currentStatus: customerStatusReport.currentStatus,
      customerFacingStatus: customerStatusReport.customerFacingStatus,
      progress: customerStatusReport.progress,
      nextMilestone: customerStatusReport.nextMilestone,
      shipmentReadiness: customerStatusReport.shipmentReadiness,
      preparedBy: customerStatusReport.preparedBy,
      preparedTimestamp: customerStatusReport.preparedTimestamp,
      message: customerStatusReport.message,
      reportSavedTo: customerStatusReport.reportSavedTo
    },
    create: {
      id: "RPT-J-2035-CUSTOMER",
      jobId: customerStatusReport.jobId,
      customerSlug: "metrofab-industries",
      title: "Customer Job Status Report",
      audience: "CUSTOMER",
      summary: "Customer-safe status report for J-2035.",
      generatedAt: customerStatusReport.preparedTimestamp,
      savedAs: "Customer PDF",
      customerName: customerStatusReport.customer,
      contact: customerStatusReport.contact,
      customerPo: customerStatusReport.customerPo,
      part: customerStatusReport.part,
      quantity: customerStatusReport.quantity,
      dueDate: customerStatusReport.dueDate,
      currentStatus: customerStatusReport.currentStatus,
      customerFacingStatus: customerStatusReport.customerFacingStatus,
      progress: customerStatusReport.progress,
      nextMilestone: customerStatusReport.nextMilestone,
      shipmentReadiness: customerStatusReport.shipmentReadiness,
      preparedBy: customerStatusReport.preparedBy,
      preparedTimestamp: customerStatusReport.preparedTimestamp,
      message: customerStatusReport.message,
      reportSavedTo: customerStatusReport.reportSavedTo
    }
  });

  await tx.customerReport.upsert({
    where: { id: "RPT-J-2035-INTERNAL" },
    update: {
      jobId: "J-2035",
      customerSlug: "metrofab-industries",
      title: "Customer Status Report",
      audience: "INTERNAL",
      summary: "Internal report source used for customer-safe export.",
      generatedAt: "Today",
      savedAs: null
    },
    create: {
      id: "RPT-J-2035-INTERNAL",
      jobId: "J-2035",
      customerSlug: "metrofab-industries",
      title: "Customer Status Report",
      audience: "INTERNAL",
      summary: "Internal report source used for customer-safe export.",
      generatedAt: "Today",
      savedAs: null
    }
  });
}

async function seedAudit(tx: Prisma.TransactionClient) {
  for (const event of auditEvents) {
    await tx.auditEvent.upsert({
      where: { id: event.id },
      update: {
        timestamp: event.timestamp,
        actor: event.actor,
        role: event.actorRole,
        action: event.title,
        entityType: mapAuditEntityType(event.entityType),
        entityId: event.entityId,
        result: event.detail,
        notes: event.detail,
        severity: mapAuditSeverity(event.severity),
        eventType: event.eventType,
        title: event.title,
        detail: event.detail,
        metadata: {
          source: "seed-demo",
          eventType: event.eventType
        }
      },
      create: {
        id: event.id,
        timestamp: event.timestamp,
        actor: event.actor,
        role: event.actorRole,
        action: event.title,
        entityType: mapAuditEntityType(event.entityType),
        entityId: event.entityId,
        result: event.detail,
        notes: event.detail,
        severity: mapAuditSeverity(event.severity),
        eventType: event.eventType,
        title: event.title,
        detail: event.detail,
        metadata: {
          source: "seed-demo",
          eventType: event.eventType
        }
      }
    });
  }
}

async function main() {
  const prisma = getPrismaClient();

  await prisma.$transaction(async (tx) => {
    await seedCustomers(tx);
    await seedWorkCenters(tx);
    await seedMaterials(tx);
    await seedQuotes(tx);
    await seedJobs(tx);
    await seedReworkOrders(tx);
    await seedQuality(tx);
    await seedQualityEvents(tx);
    await seedPurchasing(tx);
    await seedReports(tx);
    await seedAudit(tx);
  });
}

main()
  .then(async () => {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    const prisma = getPrismaClient();
    await prisma.$disconnect();
    process.exit(1);
  });
