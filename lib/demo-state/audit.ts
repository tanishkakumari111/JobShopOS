import type { AuditEvent } from "@/lib/demo-data";

export function getNextAuditEventId(events: AuditEvent[]) {
  return events.reduce((max, event) => Math.max(max, event.id), 0) + 1;
}

export function formatDemoTimestamp(date = new Date()) {
  return `Today ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export function createDemoAuditEvent({
  id,
  eventType,
  entityType,
  entityId,
  title,
  detail,
  actor,
  actorRole,
  timestamp,
  severity
}: AuditEvent): AuditEvent {
  return {
    id,
    eventType,
    entityType,
    entityId,
    title,
    detail,
    actor,
    actorRole,
    timestamp,
    severity
  };
}
