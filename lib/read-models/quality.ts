import "server-only";

import { getDataSourceMode } from "@/lib/data-source";
import { getRepositories } from "@/lib/repositories";
import {
  auditEvents,
  defectReasonBreakdownRows,
  inspectionQueueRows,
  j2042QualityTimeline,
  j2042ScrapEventDetail,
  jobs,
  reworkOrders
} from "@/lib/demo-data";
import type {
  AuditEvent,
  DefectReasonBreakdownRow,
  InspectionQueueRow,
  Job,
  QualityTimelineEntry,
  ReworkOrder,
  ScrapEventDetail
} from "@/lib/demo-data/types";

export type QualityDashboardReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  baseJobs: Job[];
  baseReworkOrders: ReworkOrder[];
  baseAuditEvents: AuditEvent[];
  baseInspectionQueueRows: InspectionQueueRow[];
  baseDefectReasonBreakdownRows: DefectReasonBreakdownRow[];
  baseQualityTimeline: QualityTimelineEntry[];
};

export type ScrapApprovalReadModel = QualityDashboardReadModel & {
  baseScrapEventDetail: ScrapEventDetail;
};

export type ReworkCreatedReadModel = QualityDashboardReadModel;

function isFallbackError(error: unknown) {
  return error instanceof Error && error.message.includes("not implemented yet");
}

async function readWithFallback<T>(reader: Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await reader;
  } catch (error) {
    if (isFallbackError(error)) {
      return fallback();
    }

    throw error;
  }
}

async function buildQualityReadModel(): Promise<QualityDashboardReadModel> {
  const repositories = getRepositories();
  const [baseJobs, baseReworkOrders, baseAuditEvents, baseInspectionQueueRows, baseDefectReasonBreakdownRows, baseQualityTimeline] =
    await Promise.all([
      readWithFallback(repositories.jobs.getJobs(), () => jobs),
      readWithFallback(repositories.quality.getReworkOrders(), () => reworkOrders),
    readWithFallback(repositories.audit.getAuditEvents(), () => auditEvents),
      readWithFallback(repositories.quality.getInspectionQueue(), () => inspectionQueueRows),
      readWithFallback(repositories.quality.getDefectReasonBreakdown(), () => defectReasonBreakdownRows),
      readWithFallback(repositories.quality.getQualityTimeline("J-2042"), () => j2042QualityTimeline)
    ]);

  return {
    dataSourceMode: getDataSourceMode(),
    baseJobs: baseJobs.length > 0 ? baseJobs : jobs,
    baseReworkOrders: baseReworkOrders.length > 0 ? baseReworkOrders : reworkOrders,
    baseAuditEvents: baseAuditEvents.length > 0 ? baseAuditEvents : auditEvents,
    baseInspectionQueueRows: baseInspectionQueueRows.length > 0 ? baseInspectionQueueRows : inspectionQueueRows,
    baseDefectReasonBreakdownRows:
      baseDefectReasonBreakdownRows.length > 0 ? baseDefectReasonBreakdownRows : defectReasonBreakdownRows,
    baseQualityTimeline: baseQualityTimeline.length > 0 ? baseQualityTimeline : j2042QualityTimeline
  };
}

export async function getQualityDashboardReadModel(): Promise<QualityDashboardReadModel> {
  return buildQualityReadModel();
}

export async function getScrapApprovalReadModel(jobId: string): Promise<ScrapApprovalReadModel> {
  const repositories = getRepositories();
  const [base, baseScrapEventDetail] = await Promise.all([
    buildQualityReadModel(),
    readWithFallback(repositories.quality.getScrapEventDetail(jobId), () => j2042ScrapEventDetail)
  ]);

  return {
    ...base,
    baseScrapEventDetail: baseScrapEventDetail ?? j2042ScrapEventDetail
  };
}

export async function getReworkCreatedReadModel(jobId: string): Promise<ReworkCreatedReadModel> {
  void jobId;
  return buildQualityReadModel();
}
