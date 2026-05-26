type PrismaTransaction = {
  auditEvent: {
    findFirst(args: {
      orderBy: { id: "desc" };
      select: { id: true };
    }): Promise<{ id: number } | null>;
    create(args: {
      data: {
        id: number;
        timestamp: string;
        actor: string;
        role: string;
        action: string;
        entityType: AuditEntityType;
        entityId: string;
        result: string;
        notes: string;
        severity: AuditSeverity;
        metadata?: unknown;
      };
    }): Promise<unknown>;
  };
};

export type AuditSeverity =
  | "INFO"
  | "WARNING"
  | "CRITICAL"
  | "BLOCKED"
  | "APPROVAL"
  | "AUTOMATION"
  | "SUCCESS";

export type AuditEntityType =
  | "QUOTE"
  | "JOB"
  | "WORK_ORDER"
  | "MATERIAL"
  | "PURCHASE_REQUEST"
  | "REPORT"
  | "QUALITY"
  | "REWORK_ORDER"
  | "CUSTOMER"
  | "WORK_CENTER"
  | "CAPACITY";

export type PreparedAuditEventInput = {
  actor: string;
  role: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  result: string;
  notes: string;
  severity: AuditSeverity;
  metadata?: unknown;
  timestamp?: string;
};

export function prepareAuditEventInput(input: PreparedAuditEventInput): PreparedAuditEventInput {
  return {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString()
  };
}

async function getNextAuditEventId(tx: PrismaTransaction) {
  const latest = await tx.auditEvent.findFirst({
    orderBy: { id: "desc" },
    select: { id: true }
  });

  return (latest?.id ?? 0) + 1;
}

export async function writeAuditEvents(tx: PrismaTransaction, events: PreparedAuditEventInput[]) {
  if (events.length === 0) {
    return [];
  }

  let nextId = await getNextAuditEventId(tx);

  return Promise.all(
    events.map((event) =>
      tx.auditEvent.create({
        data: {
          id: nextId++,
          timestamp: event.timestamp ?? new Date().toISOString(),
          actor: event.actor,
          role: event.role,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          result: event.result,
          notes: event.notes,
          severity: event.severity,
          metadata: event.metadata ?? undefined
        }
      })
    )
  );
}
