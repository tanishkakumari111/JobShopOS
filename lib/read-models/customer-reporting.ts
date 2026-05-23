import "server-only";

import { getDataSourceMode, type DataSourceMode } from "@/lib/data-source";
import { getRepositories } from "@/lib/repositories";
import {
  auditEvents as seedAuditEvents,
  customerSafeTimeline as seedCustomerSafeTimeline,
  customerStatusReport as seedCustomerStatusReport,
  customers as seedCustomers,
  jobs as seedJobs,
  metrofabCustomerProfile as seedMetrofabCustomerProfile,
  reports as seedReports
} from "@/lib/demo-data";
import {
  getCustomerRiskQueue as getSeedCustomerRiskQueue,
  getCustomerSafeJobStatus as getSeedCustomerSafeJobStatus,
  getCustomerServiceSummary as getSeedCustomerServiceSummary
} from "@/lib/demo-data/helpers";
import type {
  AuditEvent,
  Customer,
  CustomerProfile,
  CustomerRiskQueueRow,
  CustomerSafeJobStatus,
  CustomerSafeTimelineItem,
  CustomerServiceSummary,
  CustomerStatusReport,
  Job,
  Report
} from "@/lib/demo-data/types";

export type CustomerReportingReadModel = {
  dataSourceMode: DataSourceMode;
  baseJobs: Job[];
  baseCustomers: Customer[];
  baseReports: Report[];
  baseAuditEvents: AuditEvent[];
  baseCustomerProfile?: CustomerProfile;
  baseCustomerServiceSummary?: CustomerServiceSummary;
  baseCustomerRiskQueue?: CustomerRiskQueueRow[];
  baseCustomerSafeJobStatus?: CustomerSafeJobStatus;
  baseCustomerStatusReport?: CustomerStatusReport;
  baseCustomerSafeTimeline?: CustomerSafeTimelineItem[];
};

function fallbackCustomers(customers: Customer[]) {
  return customers.length > 0 ? customers : seedCustomers;
}

function fallbackReports(reports: Report[]) {
  return reports.length > 0 ? reports : seedReports;
}

function buildMetrofabProfile(
  customer: Customer | undefined,
  jobs: Job[],
  quotes: Array<{ customerSlug: string; customerName: string }>,
  report: CustomerStatusReport | undefined
): CustomerProfile {
  const baseProfile = seedMetrofabCustomerProfile;
  const metrofabSlug = customer?.slug ?? baseProfile.slug;
  const metrofabName = customer?.name ?? baseProfile.name;

  return {
    ...baseProfile,
    slug: metrofabSlug,
    name: metrofabName,
    status: customer?.status ?? baseProfile.status,
    openJobs:
      jobs.filter((job) => job.customerSlug === metrofabSlug || job.customerName === metrofabName || job.id === "J-2035")
        .length || baseProfile.openJobs,
    openQuotes:
      quotes.filter((quote) => quote.customerSlug === metrofabSlug || quote.customerName === metrofabName).length ||
      baseProfile.openQuotes,
    lastUpdated: report?.preparedTimestamp ?? baseProfile.lastUpdated
  };
}

async function getBaseCustomerReportingData(customerSlug = "metrofab-industries", jobId = "J-2035") {
  const repositories = getRepositories();
  const [baseCustomers, baseJobs, baseReports, baseAuditEvents, customer, quotes, summary, riskQueue, safeJobStatus, statusReport, safeTimeline] =
    await Promise.all([
      repositories.customers.getCustomers(),
      repositories.jobs.getJobs(),
      repositories.reports.getReports(),
      repositories.audit.getAuditEvents(),
      repositories.customers.getCustomerBySlug(customerSlug),
      repositories.quotes.getQuotes(),
      repositories.customers.getCustomerServiceSummary(),
      repositories.customers.getCustomerRiskQueue(),
      repositories.customers.getCustomerSafeJobStatus(jobId),
      repositories.reports.getCustomerStatusReport(jobId),
      repositories.reports.getCustomerStatusTimeline(jobId)
    ]);

  const resolvedJobs = baseJobs.length > 0 ? baseJobs : seedJobs;
  const resolvedCustomers = fallbackCustomers(baseCustomers);
  const resolvedReports = fallbackReports(baseReports);
  const resolvedStatusReport = statusReport ?? seedCustomerStatusReport;
  const resolvedSafeTimeline = safeTimeline.length > 0 ? safeTimeline : seedCustomerSafeTimeline;

  return {
    dataSourceMode: getDataSourceMode(),
    baseJobs: resolvedJobs,
    baseCustomers: resolvedCustomers,
    baseReports: resolvedReports,
    baseAuditEvents: baseAuditEvents.length > 0 ? baseAuditEvents : seedAuditEvents,
    baseCustomerProfile: buildMetrofabProfile(customer, resolvedJobs, quotes, resolvedStatusReport),
    baseCustomerServiceSummary: summary ?? getSeedCustomerServiceSummary(resolvedJobs, resolvedReports),
    baseCustomerRiskQueue: riskQueue.length > 0 ? riskQueue : getSeedCustomerRiskQueue(resolvedJobs),
    baseCustomerSafeJobStatus: safeJobStatus ?? getSeedCustomerSafeJobStatus(jobId, resolvedJobs),
    baseCustomerStatusReport: resolvedStatusReport,
    baseCustomerSafeTimeline: resolvedSafeTimeline
  };
}

export async function getCustomerServiceReadModel(): Promise<CustomerReportingReadModel> {
  const repositories = getRepositories();
  const [baseCustomers, baseJobs, baseReports, baseAuditEvents, baseCustomerServiceSummary, baseCustomerRiskQueue] = await Promise.all([
    repositories.customers.getCustomers(),
    repositories.jobs.getJobs(),
    repositories.reports.getReports(),
    repositories.audit.getAuditEvents(),
    repositories.customers.getCustomerServiceSummary(),
    repositories.customers.getCustomerRiskQueue()
  ]);

  return {
    dataSourceMode: getDataSourceMode(),
    baseJobs: baseJobs.length > 0 ? baseJobs : seedJobs,
    baseCustomers: fallbackCustomers(baseCustomers),
    baseReports: fallbackReports(baseReports),
    baseAuditEvents: baseAuditEvents.length > 0 ? baseAuditEvents : seedAuditEvents,
    baseCustomerServiceSummary: baseCustomerServiceSummary ?? getSeedCustomerServiceSummary(baseJobs.length > 0 ? baseJobs : seedJobs, fallbackReports(baseReports)),
    baseCustomerRiskQueue: baseCustomerRiskQueue.length > 0 ? baseCustomerRiskQueue : getSeedCustomerRiskQueue(baseJobs.length > 0 ? baseJobs : seedJobs)
  };
}

export async function getCustomerDetailReadModel(customerSlug: string): Promise<CustomerReportingReadModel> {
  return getBaseCustomerReportingData(customerSlug);
}

export async function getCustomerSafeJobStatusReadModel(jobId: string): Promise<CustomerReportingReadModel> {
  return getBaseCustomerReportingData("metrofab-industries", jobId);
}

export async function getCustomerStatusReportReadModel(jobId: string): Promise<CustomerReportingReadModel> {
  return getBaseCustomerReportingData("metrofab-industries", jobId);
}

export async function getPrintableCustomerReportReadModel(jobId: string): Promise<CustomerReportingReadModel> {
  return getBaseCustomerReportingData("metrofab-industries", jobId);
}
