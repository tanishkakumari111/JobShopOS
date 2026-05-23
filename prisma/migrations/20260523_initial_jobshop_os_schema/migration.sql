-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'AT_RISK', 'PROSPECT');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NEEDS_OWNER_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED_TO_JOB');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('APPROVED', 'WAITING_ON_MATERIAL', 'PURCHASE_REQUESTED', 'MATERIALS_RESERVED', 'IN_PRODUCTION', 'IN_QUALITY', 'REWORK', 'READY_TO_SHIP', 'SHIPPED', 'CLOSED', 'SCRAP_APPROVAL_REQUIRED');

-- CreateEnum
CREATE TYPE "JobRisk" AS ENUM ('LOW', 'WATCH', 'HIGH', 'CRITICAL', 'NONE');

-- CreateEnum
CREATE TYPE "WorkCenterStatus" AS ENUM ('AVAILABLE', 'NEAR_CAPACITY', 'BOTTLENECK', 'OVER_CAPACITY', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ORDERED');

-- CreateEnum
CREATE TYPE "PurchaseRequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ReportAudience" AS ENUM ('CUSTOMER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "QualityEventType" AS ENUM ('INSPECTION_FAILED', 'SCRAP_LOGGED', 'SCRAP_APPROVED', 'REWORK_CREATED', 'QUALITY_SIGNOFF');

-- CreateEnum
CREATE TYPE "ProductionUpdateStatus" AS ENUM ('COMPLETE', 'PENDING', 'WATCH', 'INFO');

-- CreateEnum
CREATE TYPE "ReworkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ReworkOrderStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETE', 'CLOSED');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'BLOCKED', 'APPROVAL', 'AUTOMATION', 'SUCCESS');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('QUOTE', 'JOB', 'WORK_ORDER', 'MATERIAL', 'PURCHASE_REQUEST', 'REPORT', 'QUALITY', 'REWORK_ORDER', 'CUSTOMER', 'WORK_CENTER', 'CAPACITY');

-- CreateEnum
CREATE TYPE "WorkflowCommandStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "status" "CustomerStatus" NOT NULL,
    "primaryContact" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "accountContact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "openJobs" INTEGER,
    "openQuotes" INTEGER,
    "onTimeDeliveryRate" INTEGER,
    "lastUpdated" TEXT,
    "tabs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "WorkCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityHoursPerWeek" INTEGER NOT NULL,
    "queuedHoursPerWeek" INTEGER NOT NULL,
    "utilization" INTEGER NOT NULL,
    "status" "WorkCenterStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requiredForJobId" TEXT NOT NULL,
    "requiredSheets" INTEGER NOT NULL,
    "onHand" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL,
    "available" INTEGER NOT NULL,
    "shortage" INTEGER NOT NULL,
    "supplier" TEXT NOT NULL,
    "leadTimeBusinessDays" INTEGER NOT NULL,
    "lastPurchasePrice" INTEGER NOT NULL,
    "suggestedOrderQuantity" INTEGER NOT NULL,
    "reorderPoint" INTEGER,
    "contactEmail" TEXT,
    "lastUpdated" TEXT,
    "minimumOrderQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "customerSlug" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "QuoteStatus" NOT NULL,
    "estimator" TEXT NOT NULL,
    "approvalThreshold" INTEGER NOT NULL,
    "approvalRequiredRole" TEXT NOT NULL,
    "margin" INTEGER NOT NULL,
    "labor" INTEGER NOT NULL,
    "materials" INTEGER NOT NULL,
    "outsideServices" INTEGER NOT NULL,
    "setupOverhead" INTEGER NOT NULL,
    "customerReference" TEXT,
    "revision" TEXT,
    "validUntil" TEXT,
    "lastUpdated" TEXT,
    "expiresSoon" BOOLEAN NOT NULL DEFAULT false,
    "customerFacingNotes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRoutingStep" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "operation" TEXT NOT NULL,
    "workCenter" TEXT NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "machine" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRoutingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteMaterialLine" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "unitCost" INTEGER NOT NULL,
    "extendedCost" INTEGER NOT NULL,
    "availabilityStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteMaterialLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteApprovalHistory" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "customerSlug" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPo" TEXT,
    "part" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "completedQuantity" INTEGER,
    "scrapQuantity" INTEGER,
    "scrapRate" DOUBLE PRECISION,
    "allowedTolerance" DOUBLE PRECISION,
    "status" "JobStatus" NOT NULL,
    "currentStep" TEXT,
    "blockedStep" TEXT,
    "workCenter" TEXT NOT NULL,
    "risk" "JobRisk" NOT NULL,
    "dueDate" TEXT NOT NULL,
    "workOrder" TEXT,
    "reworkOrder" TEXT,
    "purchaseRequestId" TEXT,
    "reportGenerated" BOOLEAN NOT NULL DEFAULT false,
    "requiredMaterial" TEXT,
    "shortageSheets" INTEGER,
    "sourceQuoteId" TEXT,
    "progress" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRoutingStep" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "operation" TEXT NOT NULL,
    "workCenter" TEXT NOT NULL,
    "plannedHours" INTEGER NOT NULL,
    "actualHours" DOUBLE PRECISION,
    "assignedOperator" TEXT NOT NULL,
    "machine" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRoutingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMaterialRequirement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "materialName" TEXT,
    "requiredQuantity" INTEGER NOT NULL,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMaterialRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMaterialReservation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "reservedQuantity" INTEGER NOT NULL,
    "lotNumber" TEXT,
    "signOff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMaterialReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionUpdate" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "status" "ProductionUpdateStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityEvent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "eventType" "QualityEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "severity" "AuditSeverity",
    "reportedBy" TEXT,
    "reportedAt" TEXT,
    "reason" TEXT,
    "operatorNote" TEXT,
    "inspectionNote" TEXT,
    "workCenter" TEXT,
    "scrapQuantity" INTEGER,
    "completedQuantity" INTEGER,
    "scrapRate" DOUBLE PRECISION,
    "allowedTolerance" DOUBLE PRECISION,
    "reworkOrderId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReworkOrder" (
    "id" TEXT NOT NULL,
    "linkedJobId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "workCenter" TEXT NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "priority" "ReworkOrderPriority" NOT NULL,
    "status" "ReworkOrderStatus" NOT NULL,
    "supervisor" TEXT NOT NULL,
    "nextStep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReworkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "materialSku" TEXT NOT NULL,
    "linkedJobId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" INTEGER NOT NULL,
    "estimatedTotal" INTEGER NOT NULL,
    "buyer" TEXT NOT NULL,
    "status" "PurchaseRequestStatus" NOT NULL,
    "priority" "PurchaseRequestPriority" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerReport" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "customerSlug" TEXT,
    "title" TEXT NOT NULL,
    "audience" "ReportAudience" NOT NULL,
    "summary" TEXT NOT NULL,
    "generatedAt" TEXT NOT NULL,
    "savedAs" TEXT,
    "customerName" TEXT,
    "contact" TEXT,
    "customerPo" TEXT,
    "part" TEXT,
    "quantity" INTEGER,
    "dueDate" TEXT,
    "currentStatus" TEXT,
    "customerFacingStatus" TEXT,
    "progress" INTEGER,
    "nextMilestone" TEXT,
    "shipmentReadiness" TEXT,
    "preparedBy" TEXT,
    "preparedTimestamp" TEXT,
    "message" TEXT,
    "reportSavedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" INTEGER NOT NULL,
    "timestamp" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "severity" "AuditSeverity" NOT NULL,
    "eventType" TEXT,
    "title" TEXT,
    "detail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowCommand" (
    "id" TEXT NOT NULL,
    "commandType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "WorkflowCommandStatus" NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowCommand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_slug_key" ON "Quote"("slug");

-- CreateIndex
CREATE INDEX "QuoteRoutingStep_quoteId_idx" ON "QuoteRoutingStep"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteMaterialLine_quoteId_idx" ON "QuoteMaterialLine"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteApprovalHistory_quoteId_idx" ON "QuoteApprovalHistory"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "JobRoutingStep_jobId_idx" ON "JobRoutingStep"("jobId");

-- CreateIndex
CREATE INDEX "JobMaterialRequirement_jobId_idx" ON "JobMaterialRequirement"("jobId");

-- CreateIndex
CREATE INDEX "JobMaterialReservation_jobId_idx" ON "JobMaterialReservation"("jobId");

-- CreateIndex
CREATE INDEX "ProductionUpdate_jobId_idx" ON "ProductionUpdate"("jobId");

-- CreateIndex
CREATE INDEX "QualityEvent_jobId_idx" ON "QualityEvent"("jobId");

-- CreateIndex
CREATE INDEX "CustomerReport_jobId_idx" ON "CustomerReport"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowCommand_idempotencyKey_key" ON "WorkflowCommand"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerSlug_fkey" FOREIGN KEY ("customerSlug") REFERENCES "Customer"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRoutingStep" ADD CONSTRAINT "QuoteRoutingStep_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteMaterialLine" ADD CONSTRAINT "QuoteMaterialLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteApprovalHistory" ADD CONSTRAINT "QuoteApprovalHistory_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerSlug_fkey" FOREIGN KEY ("customerSlug") REFERENCES "Customer"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRoutingStep" ADD CONSTRAINT "JobRoutingStep_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMaterialRequirement" ADD CONSTRAINT "JobMaterialRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMaterialReservation" ADD CONSTRAINT "JobMaterialReservation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionUpdate" ADD CONSTRAINT "ProductionUpdate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityEvent" ADD CONSTRAINT "QualityEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityEvent" ADD CONSTRAINT "QualityEvent_reworkOrderId_fkey" FOREIGN KEY ("reworkOrderId") REFERENCES "ReworkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkOrder" ADD CONSTRAINT "ReworkOrder_linkedJobId_fkey" FOREIGN KEY ("linkedJobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_materialSku_fkey" FOREIGN KEY ("materialSku") REFERENCES "Material"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_linkedJobId_fkey" FOREIGN KEY ("linkedJobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReport" ADD CONSTRAINT "CustomerReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReport" ADD CONSTRAINT "CustomerReport_customerSlug_fkey" FOREIGN KEY ("customerSlug") REFERENCES "Customer"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
