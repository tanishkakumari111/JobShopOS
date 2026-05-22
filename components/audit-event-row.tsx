import { Activity, Clock3 } from "lucide-react";
import { EntityLink } from "@/components/entity-link";
import { SeverityBadge } from "@/components/severity-badge";

export function AuditEventRow({
  actor,
  actorRole,
  event,
  time,
  detail,
  severity = "Info",
  entityHref,
  entityLabel,
  result,
  notes,
  entityType
}: {
  actor: string;
  actorRole?: string;
  event: string;
  time: string;
  detail: string;
  severity?: string;
  entityHref: string;
  entityLabel: string;
  result?: string;
  notes?: string;
  entityType?: string;
}) {
  return (
    <div className="flex gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <div className="mt-0.5 rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-600">
        <Activity className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-950">{event}</span>
          <SeverityBadge severity={severity} />
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
        <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4">
          <span>{actor}</span>
          {actorRole ? <span>Role: {actorRole}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {time}
          </span>
          <EntityLink href={entityHref}>{entityLabel}</EntityLink>
          {entityType ? <span>Entity: {entityType}</span> : null}
          {result ? <span>Result: {result}</span> : null}
        </div>
        {notes ? <p className="mt-2 text-sm leading-6 text-slate-500">{notes}</p> : null}
      </div>
    </div>
  );
}
