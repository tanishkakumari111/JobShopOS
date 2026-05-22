import { AuditEventRow } from "@/components/audit-event-row";
import { cn } from "@/lib/utils";

export function AuditPanel({
  title,
  subtitle,
  items,
  className
}: {
  title: string;
  subtitle?: string;
  items: Array<{
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
  }>;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border border-slate-200 bg-white shadow-none",
        className
      )}
    >
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div>
        {items.map((item) => (
          <AuditEventRow key={`${item.time}-${item.event}`} {...item} />
        ))}
      </div>
    </section>
  );
}
