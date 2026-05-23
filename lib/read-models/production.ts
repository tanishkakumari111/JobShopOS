import "server-only";

import { getDataSourceMode } from "@/lib/data-source";
import { getRepositories } from "@/lib/repositories";
import {
  j2035QualityInspectionChecks,
  j2035QualityReadiness,
  j2035ScrapAndReworkFields,
  j2035TravelerMaterials,
  j2035TravelerRoutingRows,
  j2035TravelerSignOffFields,
  j2035TravelerShipping
} from "@/lib/demo-data";
import type {
  AuditEvent,
  CapacitySummary,
  CustomerSafeJobStatus,
  Job,
  JobRoutingStep,
  ProductionUpdate,
  TravelerMaterialRow,
  TravelerRoutingRow,
  WorkCenterCapacityRow
} from "@/lib/demo-data/types";

export type CapacityPlannerReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  summary: CapacitySummary;
  capacityRows: WorkCenterCapacityRow[];
  capacityRiskJobIds: string[];
};

export type JobDetailReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  jobId: string;
  job: Job | undefined;
  customerSafe: CustomerSafeJobStatus | undefined;
  capacitySummary: CapacitySummary;
  jobTrace: AuditEvent[];
  routingSteps: JobRoutingStep[];
  productionUpdates: ProductionUpdate[];
  qualityReadiness: typeof j2035QualityReadiness;
  travelerMaterials: TravelerMaterialRow[];
  qualityInspectionChecks: typeof j2035QualityInspectionChecks;
  scrapAndReworkFields: typeof j2035ScrapAndReworkFields;
};

export type WorkOrderTravelerReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  jobId: string;
  job: Job | undefined;
  travelerRoutingRows: TravelerRoutingRow[];
  travelerMaterials: TravelerMaterialRow[];
  travelerSignOffFields: typeof j2035TravelerSignOffFields;
  qualityInspectionChecks: typeof j2035QualityInspectionChecks;
  scrapAndReworkFields: typeof j2035ScrapAndReworkFields;
  travelerShipping: typeof j2035TravelerShipping;
};

export async function getCapacityPlannerReadModel(): Promise<CapacityPlannerReadModel> {
  const repositories = getRepositories();
  const [summary, capacityRows, capacityRiskJobIds] = await Promise.all([
    repositories.workCenters.getCapacitySummary(),
    repositories.workCenters.getWorkCenterCapacityRows(),
    repositories.workCenters.getCapacityRiskJobIds()
  ]);

  return {
    dataSourceMode: getDataSourceMode(),
    summary,
    capacityRows,
    capacityRiskJobIds
  };
}

export async function getJobDetailReadModel(jobId: string): Promise<JobDetailReadModel> {
  const repositories = getRepositories();
  const [job, customerSafe, capacitySummary, jobTrace, routingSteps, productionUpdates] = await Promise.all([
    repositories.jobs.getJobById(jobId),
    repositories.customers.getCustomerSafeJobStatus(jobId),
    repositories.workCenters.getCapacitySummary(),
    repositories.jobs.getJobTraceEvents(jobId),
    repositories.jobs.getJobRoutingSteps(jobId),
    repositories.jobs.getProductionUpdates(jobId)
  ]);

  return {
    dataSourceMode: getDataSourceMode(),
    jobId,
    job,
    customerSafe,
    capacitySummary,
    jobTrace,
    routingSteps,
    productionUpdates: jobId === "J-2035" ? productionUpdates : [],
    qualityReadiness: j2035QualityReadiness,
    travelerMaterials: j2035TravelerMaterials,
    qualityInspectionChecks: j2035QualityInspectionChecks,
    scrapAndReworkFields: j2035ScrapAndReworkFields
  };
}

export async function getWorkOrderTravelerReadModel(jobId: string): Promise<WorkOrderTravelerReadModel> {
  const repositories = getRepositories();
  const job = await repositories.jobs.getJobById(jobId);

  return {
    dataSourceMode: getDataSourceMode(),
    jobId,
    job,
    travelerRoutingRows: jobId === "J-2035" ? j2035TravelerRoutingRows : [],
    travelerMaterials: jobId === "J-2035" ? j2035TravelerMaterials : [],
    travelerSignOffFields: j2035TravelerSignOffFields,
    qualityInspectionChecks: j2035QualityInspectionChecks,
    scrapAndReworkFields: j2035ScrapAndReworkFields,
    travelerShipping: j2035TravelerShipping
  };
}
