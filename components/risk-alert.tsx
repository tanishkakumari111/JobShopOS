import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { SeverityBadge } from "@/components/severity-badge";

export function RiskAlert({
  severity,
  title,
  description,
  href,
  actionLabel
}: {
  severity: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold text-rose-950">{title}</h3>
              <SeverityBadge severity={severity} />
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-rose-900/80">
              {description}
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-sm border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-400 hover:text-rose-800"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
