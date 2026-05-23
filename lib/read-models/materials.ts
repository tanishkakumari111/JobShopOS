import "server-only";

import { getDataSourceMode } from "@/lib/data-source";
import { getRepositories } from "@/lib/repositories";
import {
  auditEvents,
  getBlockedJobsByMaterialShortage,
  getMaterialBySku,
  getMaterialReservationBreakdown,
  getMaterialRows,
  getMaterialSupplierPanel,
  getPurchaseRequestById,
  materialImpactTimeline,
  materials,
  purchaseRequestState,
  purchaseRequests,
  pr3091AuditTrail,
  jobs
} from "@/lib/demo-data";
import type {
  AuditEvent,
  Job,
  Material,
  MaterialAffectedJobRow,
  MaterialDashboardRow,
  MaterialReservationBreakdownRow,
  MaterialTimelineEntry,
  PurchaseRequest,
  PurchaseRequestAuditEntry,
  PurchaseRequestState
} from "@/lib/demo-data/types";

export type MaterialsDashboardReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  baseJobs: Job[];
  baseMaterials: Material[];
  basePurchaseRequests: PurchaseRequest[];
  baseAuditEvents: AuditEvent[];
  baseMaterialRows: MaterialDashboardRow[];
  baseBlockedJobs: MaterialAffectedJobRow[];
  baseReservationBreakdown: MaterialReservationBreakdownRow[];
  baseSupplierPanel: ReturnType<typeof getMaterialSupplierPanel>;
  baseMaterialImpactTimeline: MaterialTimelineEntry[];
  basePurchaseRequestState: PurchaseRequestState;
  basePurchaseRequestAuditTrail: PurchaseRequestAuditEntry[];
};

export type MaterialDetailReadModel = MaterialsDashboardReadModel & {
  materialSku: string;
  material: Material | undefined;
};

export type MaterialImpactReadModel = MaterialsDashboardReadModel & {
  jobId: string;
  job: Job | undefined;
  material: Material | undefined;
};

export type PurchaseRequestReadModel = MaterialsDashboardReadModel & {
  purchaseRequestId: string;
  purchaseRequest: PurchaseRequest | undefined;
};

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

async function buildMaterialsReadModel(): Promise<MaterialsDashboardReadModel> {
  const repositories = getRepositories();

  const [
    baseJobs,
    baseMaterials,
    basePurchaseRequests,
    baseAuditEvents,
    baseMaterialRows,
    baseBlockedJobs,
    baseReservationBreakdown,
    baseSupplierPanel,
    baseMaterialImpactTimeline,
    basePurchaseRequestState,
    basePurchaseRequestAuditTrail
  ] = await Promise.all([
    readWithFallback(repositories.jobs.getJobs(), () => jobs),
    readWithFallback(repositories.materials.getMaterials(), () => materials),
    readWithFallback(repositories.purchasing.getPurchaseRequests(), () => purchaseRequests),
    readWithFallback(repositories.audit.getAuditEvents(), () => auditEvents),
    readWithFallback(repositories.materials.getMaterialRows(), () => getMaterialRows(materials, jobs)),
    readWithFallback(repositories.materials.getBlockedJobsByMaterialShortage(), () =>
      getBlockedJobsByMaterialShortage(jobs, materials)
    ),
    readWithFallback(repositories.materials.getMaterialReservationBreakdown(), () =>
      getMaterialReservationBreakdown(materials, jobs)
    ),
    readWithFallback(repositories.materials.getMaterialSupplierPanel(), () => getMaterialSupplierPanel(materials)),
    readWithFallback(repositories.materials.getMaterialImpactTimeline(), () => materialImpactTimeline),
    readWithFallback(repositories.purchasing.getPurchaseRequestState("PR-3091"), () => purchaseRequestState),
    readWithFallback(repositories.purchasing.getPurchaseRequestAuditEntries("PR-3091"), () => pr3091AuditTrail)
  ]);

  return {
    dataSourceMode: getDataSourceMode(),
    baseJobs: baseJobs.length > 0 ? baseJobs : jobs,
    baseMaterials: baseMaterials.length > 0 ? baseMaterials : materials,
    basePurchaseRequests: basePurchaseRequests.length > 0 ? basePurchaseRequests : purchaseRequests,
    baseAuditEvents: baseAuditEvents.length > 0 ? baseAuditEvents : auditEvents,
    baseMaterialRows: baseMaterialRows.length > 0 ? baseMaterialRows : getMaterialRows(materials, jobs),
    baseBlockedJobs: baseBlockedJobs.length > 0 ? baseBlockedJobs : getBlockedJobsByMaterialShortage(jobs, materials),
    baseReservationBreakdown:
      baseReservationBreakdown.length > 0 ? baseReservationBreakdown : getMaterialReservationBreakdown(materials, jobs),
    baseSupplierPanel: baseSupplierPanel ?? getMaterialSupplierPanel(materials),
    baseMaterialImpactTimeline: baseMaterialImpactTimeline.length > 0 ? baseMaterialImpactTimeline : materialImpactTimeline,
    basePurchaseRequestState: basePurchaseRequestState ?? purchaseRequestState,
    basePurchaseRequestAuditTrail:
      basePurchaseRequestAuditTrail.length > 0 ? basePurchaseRequestAuditTrail : pr3091AuditTrail
  };
}

export async function getMaterialsDashboardReadModel(): Promise<MaterialsDashboardReadModel> {
  return buildMaterialsReadModel();
}

export async function getMaterialDetailReadModel(sku: string): Promise<MaterialDetailReadModel> {
  const base = await buildMaterialsReadModel();
  const material = getMaterialBySku(sku, base.baseMaterials) ?? base.baseMaterials[0];

  return {
    ...base,
    materialSku: sku,
    material
  };
}

export async function getMaterialImpactReadModel(jobId: string): Promise<MaterialImpactReadModel> {
  const base = await buildMaterialsReadModel();
  const job = base.baseJobs.find((entry) => entry.id === jobId);
  const material = getMaterialBySku("AL-6061-PLT-0.375", base.baseMaterials) ?? base.baseMaterials[0];

  return {
    ...base,
    jobId,
    job,
    material
  };
}

export async function getPurchaseRequestReadModel(purchaseRequestId: string): Promise<PurchaseRequestReadModel> {
  const base = await buildMaterialsReadModel();
  const purchaseRequest = getPurchaseRequestById(purchaseRequestId, base.basePurchaseRequests) ?? base.basePurchaseRequests[0];

  return {
    ...base,
    purchaseRequestId,
    purchaseRequest
  };
}
