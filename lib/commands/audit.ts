import type { AuditSeverity as PrismaAuditSeverity, AuditEntityType as PrismaAuditEntityType, Prisma } from "@prisma/client";
import type { Prisma as PrismaNamespace } from "@prisma/client";

type PrismaTransaction = Prisma.TransactionClient;

export type PreparedAuditEventInput = {
  actor: string;
  role: string;
  action: string;
  entityType: PrismaAuditEntityType;
  entityId: string;
  result: string;
  notes: string;
  severity: PrismaAuditSeverity;
  metadata?: PrismaNamespace.InputJsonValue;
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
