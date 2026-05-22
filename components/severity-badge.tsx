import { cn } from "@/lib/utils";
import { getStatusClasses } from "@/lib/status";

export function SeverityBadge({
  severity,
  className
}: {
  severity: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold leading-none uppercase tracking-[0.06em]",
        getStatusClasses(severity),
        className
      )}
    >
      {severity}
    </span>
  );
}
