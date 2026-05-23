import type {
  AuditEvent,
  AuditQuickFilter,
  AuditSummary,
  AuditTimelineRow,
  CapacitySummary,
  Customer,
  CustomerRiskQueueRow,
  CustomerSafeJobStatus,
  CustomerSafeTimelineItem,
  CustomerServiceSummary,
  CustomerStatusReport,
  DashboardMetrics,
  DashboardRiskItem,
  DefectReasonBreakdownRow,
  EntityTimelineEntry,
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
  QuoteApprovalQueueRow,
  QuoteDashboardRow,
  QuoteSummary,
  QuoteApprovalHistoryEntry,
  QuoteConversionRecord,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow,
  QualitySummary,
  Report,
  ReworkOrder,
  ScrapEventDetail,
  TravelerMaterialRow,
  TravelerRoutingRow,
  WorkCenter,
  WorkCenterCapacityRow,
  FinalValuePillar
} from "../demo-data/types";

export interface CustomerRepository {
  getCustomerBySlug(slug: string): Promise<Customer | undefined>;
  getCustomerByName(name: string): Promise<Customer | undefined>;
  getCustomerSafeJobStatus(jobId: string): Promise<CustomerSafeJobStatus | undefined>;
  getCustomerServiceSummary(): Promise<CustomerServiceSummary>;
  getCustomerRiskQueue(): Promise<CustomerRiskQueueRow[]>;
  getCustomerStatusReports(jobId: string): Promise<{ report: CustomerStatusReport; timeline: CustomerSafeTimelineItem[] } | undefined>;
}

export interface QuoteRepository {
  getQuoteById(id: string): Promise<Quote | undefined>;
  getQuoteSummary(): Promise<QuoteSummary>;
  getQuoteRows(): Promise<QuoteDashboardRow[]>;
  getApprovalQueueRows(): Promise<QuoteApprovalQueueRow[]>;
  getApprovalHistory(id: string): Promise<QuoteApprovalHistoryEntry[]>;
  getQuoteRoutingEstimate(id: string): Promise<QuoteRoutingEstimateRow[]>;
  getQuoteMaterialEstimate(id: string): Promise<QuoteMaterialEstimateRow[]>;
  getQuoteForm(id: string): Promise<QuoteFormSnapshot | undefined>;
  getConversionRecord(id: string): Promise<QuoteConversionRecord | undefined>;
  requiresOwnerApproval(amount: number, threshold?: number): Promise<boolean>;
}

export interface JobRepository {
  getJobById(id: string): Promise<Job | undefined>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getDashboardRiskItems(): Promise<DashboardRiskItem[]>;
  getProductionQueue(): Promise<ProductionQueueRow[]>;
  getJobTraceEvents(jobId: string): Promise<AuditEvent[]>;
  getJ2035EntityTimeline(): Promise<EntityTimelineEntry[]>;
  getCustomerSafeJobStatus(jobId: string): Promise<CustomerSafeJobStatus | undefined>;
}

export interface WorkCenterRepository {
  getCapacitySummary(): Promise<CapacitySummary>;
  getWorkCenterCapacityRows(): Promise<WorkCenterCapacityRow[]>;
  getCapacityRiskJobIds(): Promise<string[]>;
}

export interface MaterialRepository {
  getMaterialBySku(sku: string): Promise<Material | undefined>;
  getMaterialsSummary(): Promise<{
    materialsBelowReorderPoint: number;
    jobsBlockedByShortage: number;
    openPurchaseRequests: number;
    incomingPosThisWeek: number;
    reservedInventoryValue: number;
    criticalShortages: number;
  }>;
  getMaterialRows(): Promise<MaterialDashboardRow[]>;
  getBlockedJobsByMaterialShortage(): Promise<MaterialAffectedJobRow[]>;
  getMaterialReservationBreakdown(): Promise<MaterialReservationBreakdownRow[]>;
  getMaterialSupplierPanel(): Promise<{
    preferredSupplier: string;
    contact: string;
    leadTimeBusinessDays: number;
    lastPurchasePrice: number;
    minimumOrderQuantity: number;
    suggestedOrderQuantity: number;
  }>;
  getMaterialImpactTimeline(): Promise<MaterialTimelineEntry[]>;
}

export interface QualityRepository {
  getQualitySummary(): Promise<QualitySummary>;
  getInspectionQueue(): Promise<InspectionQueueRow[]>;
  getDefectReasonBreakdown(): Promise<DefectReasonBreakdownRow[]>;
  getReworkOrderById(id: string): Promise<ReworkOrder | undefined>;
  getScrapEventDetail(jobId: string): Promise<ScrapEventDetail | undefined>;
}

export interface PurchasingRepository {
  getPurchaseRequestById(id: string): Promise<PurchaseRequest | undefined>;
  getPurchaseRequestState(id: string): Promise<PurchaseRequestState | undefined>;
  getPurchaseRequestAuditEntries(id: string): Promise<PurchaseRequestAuditEntry[]>;
}

export interface ReportRepository {
  getReports(): Promise<Report[]>;
  getCustomerStatusReport(jobId: string): Promise<CustomerStatusReport | undefined>;
  getCustomerStatusTimeline(jobId: string): Promise<CustomerSafeTimelineItem[]>;
}

export interface AuditRepository {
  getAuditEvents(): Promise<AuditEvent[]>;
  getAuditEventsByEntity(entityType: AuditEvent["entityType"], entityId: string): Promise<AuditEvent[]>;
  getAuditSummary(): Promise<AuditSummary>;
  getAuditTimelineRows(): Promise<AuditTimelineRow[]>;
  getAuditEntityQuickFilters(): Promise<AuditQuickFilter[]>;
  getRecentAuditEvents(limit: number): Promise<AuditEvent[]>;
  getFinalValuePillars(): Promise<FinalValuePillar[]>;
}

export type RepositorySet = {
  customers: CustomerRepository;
  quotes: QuoteRepository;
  jobs: JobRepository;
  workCenters: WorkCenterRepository;
  materials: MaterialRepository;
  quality: QualityRepository;
  purchasing: PurchasingRepository;
  reports: ReportRepository;
  audit: AuditRepository;
};
