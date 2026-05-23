import {
  auditEvents,
  customerSafeTimeline,
  customerStatusReport,
  customers,
  getApprovalQueueRows,
  getAuditEntityQuickFilters,
  getAuditEventsByEntity,
  getAuditSummary,
  getAuditTimelineRows,
  getBlockedJobsByMaterialShortage,
  getCapacityRiskJobIds,
  getCapacitySummary,
  getCustomerByName,
  getCustomerBySlug,
  getCustomerRiskQueue,
  getCustomerSafeJobStatus,
  getCustomerServiceSummary,
  getCustomerStatusReports,
  getDashboardMetrics,
  getDashboardRiskItems,
  getDefectReasonBreakdown,
  getFinalValuePillars,
  getInspectionQueue,
  getJ2035EntityTimeline,
  getJobById,
  getJobTraceEvents,
  getMaterialBySku,
  getMaterialImpactTimeline,
  getMaterialReservationBreakdown,
  getMaterialRows,
  getMaterialSupplierPanel,
  getMaterialsSummary,
  getProductionQueue,
  getPurchaseRequestAuditEntries,
  getPurchaseRequestById,
  getPurchaseRequestState,
  getQualitySummary,
  getQuoteById,
  getQuoteRows,
  getQuoteSummary,
  getRecentAuditEvents,
  getReworkOrderById,
  getWorkCenterCapacityRows,
  jobs,
  materials,
  purchaseRequestState,
  purchaseRequests,
  q1003ApprovalHistory,
  q1003ConversionRecord,
  q1003QuoteForm,
  j2042ScrapEventDetail,
  quoteMaterialEstimateRows,
  quoteRoutingEstimateRows,
  quotes,
  pr3091AuditTrail,
  reworkOrders,
  reports,
  workCenters
} from "../../demo-data";
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
  PurchaseRequest,
  PurchaseRequestAuditEntry,
  PurchaseRequestState,
  ProductionQueueRow,
  QualitySummary,
  Quote,
  QuoteApprovalQueueRow,
  QuoteApprovalHistoryEntry,
  QuoteConversionRecord,
  QuoteDashboardRow,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow,
  QuoteSummary,
  Report,
  ReworkOrder,
  ScrapEventDetail,
  WorkCenter,
  WorkCenterCapacityRow
} from "../../demo-data/types";

export function createDemoRepositories() {
  return {
    customers: {
      getCustomerBySlug: async (slug: string): Promise<Customer | undefined> =>
        getCustomerBySlug(slug, customers),
      getCustomerByName: async (name: string): Promise<Customer | undefined> =>
        getCustomerByName(name, customers),
      getCustomerSafeJobStatus: async (jobId: string): Promise<CustomerSafeJobStatus | undefined> =>
        getCustomerSafeJobStatus(jobId, jobs),
      getCustomerServiceSummary: async (): Promise<CustomerServiceSummary> =>
        getCustomerServiceSummary(jobs, reports),
      getCustomerRiskQueue: async (): Promise<CustomerRiskQueueRow[]> =>
        getCustomerRiskQueue(jobs),
      getCustomerStatusReports: async (
        jobId: string
      ): Promise<{ report: CustomerStatusReport; timeline: CustomerSafeTimelineItem[] } | undefined> =>
        jobId === "J-2035"
          ? getCustomerStatusReports(customerStatusReport, customerSafeTimeline)
          : undefined
    },
    quotes: {
      getQuoteById: async (id: string): Promise<Quote | undefined> => getQuoteById(id, quotes),
      getQuoteSummary: async (): Promise<QuoteSummary> => getQuoteSummary(quotes, jobs),
      getQuoteRows: async (): Promise<QuoteDashboardRow[]> => getQuoteRows(quotes),
      getApprovalQueueRows: async (): Promise<QuoteApprovalQueueRow[]> => getApprovalQueueRows(quotes),
      getApprovalHistory: async (): Promise<QuoteApprovalHistoryEntry[]> => q1003ApprovalHistory,
      getQuoteRoutingEstimate: async (): Promise<QuoteRoutingEstimateRow[]> => quoteRoutingEstimateRows,
      getQuoteMaterialEstimate: async (): Promise<QuoteMaterialEstimateRow[]> => quoteMaterialEstimateRows,
      getQuoteForm: async (): Promise<QuoteFormSnapshot | undefined> => q1003QuoteForm,
      getConversionRecord: async (): Promise<QuoteConversionRecord | undefined> => q1003ConversionRecord,
      requiresOwnerApproval: async (amount: number, threshold = 50000): Promise<boolean> =>
        amount >= threshold
    },
    jobs: {
      getJobById: async (id: string): Promise<Job | undefined> => getJobById(id, jobs),
      getDashboardMetrics: async (): Promise<DashboardMetrics> =>
        getDashboardMetrics(jobs, workCenters, auditEvents, reworkOrders),
      getDashboardRiskItems: async (): Promise<DashboardRiskItem[]> =>
        getDashboardRiskItems(jobs, quotes, materials, workCenters),
      getProductionQueue: async (): Promise<ProductionQueueRow[]> => getProductionQueue(jobs),
      getJobTraceEvents: async (jobId: string): Promise<AuditEvent[]> => getJobTraceEvents(jobId, auditEvents),
      getJ2035EntityTimeline: async () => getJ2035EntityTimeline(),
      getCustomerSafeJobStatus: async (jobId: string): Promise<CustomerSafeJobStatus | undefined> =>
        getCustomerSafeJobStatus(jobId, jobs)
    },
    workCenters: {
      getCapacitySummary: async () => getCapacitySummary(workCenters),
      getWorkCenterCapacityRows: async (): Promise<WorkCenterCapacityRow[]> =>
        getWorkCenterCapacityRows(workCenters, jobs),
      getCapacityRiskJobIds: async () => getCapacityRiskJobIds(jobs, workCenters)
    },
    materials: {
      getMaterialBySku: async (sku: string): Promise<Material | undefined> => getMaterialBySku(sku, materials),
      getMaterialsSummary: async () => getMaterialsSummary(materials, jobs, purchaseRequests),
      getMaterialRows: async (): Promise<MaterialDashboardRow[]> => getMaterialRows(materials, jobs),
      getBlockedJobsByMaterialShortage: async (): Promise<MaterialAffectedJobRow[]> =>
        getBlockedJobsByMaterialShortage(jobs, materials),
      getMaterialReservationBreakdown: async () => getMaterialReservationBreakdown(materials, jobs),
      getMaterialSupplierPanel: async () => getMaterialSupplierPanel(materials),
      getMaterialImpactTimeline: async () => getMaterialImpactTimeline([
        { title: "Quote approved", detail: "Q-1003 approved and routed for production", timestamp: "Today 10:45 AM", severity: "Success" },
        { title: "Job created", detail: "J-2104 generated from the approved quote", timestamp: "Today 10:49 AM", severity: "Automation" }
      ] satisfies MaterialTimelineEntry[])
    },
    quality: {
      getQualitySummary: async () => getQualitySummary(jobs, reworkOrders, getInspectionQueue([
        {
          jobId: "J-2042",
          customerName: "Northline Fabrication",
          part: "Bracket Assembly Rev B",
          currentStep: "Weld",
          inspector: "Quality Inspector",
          result: "Failed",
          scrapRate: "10%",
          status: "Scrap Approval Required",
          dueDate: "Due in 2 business days",
          action: "Review scrap approval",
          href: "/quality/j-2042/scrap-approval"
        }
      ])),
      getInspectionQueue: async (): Promise<InspectionQueueRow[]> =>
        getInspectionQueue([
          {
            jobId: "J-2042",
            customerName: "Northline Fabrication",
            part: "Bracket Assembly Rev B",
            currentStep: "Weld",
            inspector: "Quality Inspector",
            result: "Failed",
            scrapRate: "10%",
            status: "Scrap Approval Required",
            dueDate: "Due in 2 business days",
            action: "Review scrap approval",
            href: "/quality/j-2042/scrap-approval"
          }
        ]),
      getDefectReasonBreakdown: async (): Promise<DefectReasonBreakdownRow[]> =>
        getDefectReasonBreakdown([
          { reason: "Weld Porosity", count: 12, percentage: 40 },
          { reason: "Dimensional Error", count: 7, percentage: 23 },
          { reason: "Material Defect", count: 5, percentage: 17 },
          { reason: "Paint / Finish Issue", count: 3, percentage: 10 },
          { reason: "Operator Setup Error", count: 3, percentage: 10 }
        ]),
      getReworkOrderById: async (id: string): Promise<ReworkOrder | undefined> =>
        getReworkOrderById(id, reworkOrders),
      getScrapEventDetail: async (): Promise<ScrapEventDetail | undefined> => j2042ScrapEventDetail
    },
    purchasing: {
      getPurchaseRequestById: async (id: string): Promise<PurchaseRequest | undefined> =>
        getPurchaseRequestById(id, purchaseRequests),
      getPurchaseRequestState: async () => getPurchaseRequestState(purchaseRequestState),
      getPurchaseRequestAuditEntries: async () => getPurchaseRequestAuditEntries(pr3091AuditTrail)
    },
    reports: {
      getReports: async (): Promise<Report[]> => reports,
      getCustomerStatusReport: async (jobId: string): Promise<CustomerStatusReport | undefined> =>
        jobId === "J-2035" ? customerStatusReport : undefined,
      getCustomerStatusTimeline: async (jobId: string): Promise<CustomerSafeTimelineItem[]> =>
        jobId === "J-2035" ? customerSafeTimeline : []
    },
    audit: {
      getAuditEvents: async (): Promise<AuditEvent[]> => auditEvents,
      getAuditEventsByEntity: async (entityType: AuditEvent["entityType"], entityId: string): Promise<AuditEvent[]> =>
        getAuditEventsByEntity(entityType, entityId, auditEvents),
      getAuditSummary: async (): Promise<AuditSummary> => getAuditSummary(auditEvents),
      getAuditTimelineRows: async (): Promise<AuditTimelineRow[]> => getAuditTimelineRows(auditEvents),
      getAuditEntityQuickFilters: async (): Promise<AuditQuickFilter[]> => getAuditEntityQuickFilters(),
      getRecentAuditEvents: async (limit: number): Promise<AuditEvent[]> =>
        getRecentAuditEvents(limit, auditEvents),
      getFinalValuePillars: async (): Promise<FinalValuePillar[]> => getFinalValuePillars()
    }
  };
}
