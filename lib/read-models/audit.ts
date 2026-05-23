import "server-only";

import { getDataSourceMode } from "@/lib/data-source";
import { getRepositories } from "@/lib/repositories";
import { getAuditSummary, getAuditTimelineRows, getJ2035EntityTimeline } from "@/lib/demo-data";
import type {
  AuditEvent,
  AuditQuickFilter,
  AuditSummary,
  AuditTimelineRow,
  EntityTimelineEntry
} from "@/lib/demo-data/types";

const FOUNDERS_AUDIT_EVENT_ID_TO_HIDE = 16;

function excludeHiddenFounderEvents(events: AuditEvent[]) {
  return events.filter((event) => event.id !== FOUNDERS_AUDIT_EVENT_ID_TO_HIDE);
}

export type AuditTrailReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  auditEvents: AuditEvent[];
  summary: AuditSummary;
  timelineRows: AuditTimelineRow[];
  quickFilters: AuditQuickFilter[];
};

export type EntityTimelineReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  entityType: AuditEvent["entityType"];
  entityId: string;
  entityTimeline: EntityTimelineEntry[];
  auditEvents: AuditEvent[];
};

export async function getAuditTrailReadModel(): Promise<AuditTrailReadModel> {
  const repositories = getRepositories();
  const [events, quickFilters] = await Promise.all([
    repositories.audit.getAuditEvents(),
    repositories.audit.getAuditEntityQuickFilters()
  ]);

  const founderAuditEvents = excludeHiddenFounderEvents(events);

  return {
    dataSourceMode: getDataSourceMode(),
    auditEvents: founderAuditEvents,
    summary: getAuditSummary(founderAuditEvents),
    timelineRows: getAuditTimelineRows(founderAuditEvents),
    quickFilters
  };
}

export async function getEntityTimelineReadModel(
  entityType: AuditEvent["entityType"],
  entityId: string
): Promise<EntityTimelineReadModel> {
  const repositories = getRepositories();
  const auditEvents = await repositories.audit.getAuditEventsByEntity(entityType, entityId);

  return {
    dataSourceMode: getDataSourceMode(),
    entityType,
    entityId,
    entityTimeline: entityType === "job" && entityId === "J-2035" ? getJ2035EntityTimeline() : [],
    auditEvents
  };
}
