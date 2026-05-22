import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  tone = "slate"
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "slate" | "emerald" | "amber" | "rose" | "blue";
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white p-4",
        "shadow-none"
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-3 text-[34px] font-semibold tracking-tight tabular text-slate-950",
          tone === "rose" && "text-rose-700",
          tone === "amber" && "text-amber-700",
          tone === "emerald" && "text-emerald-700",
          tone === "blue" && "text-blue-700"
        )}
      >
        {value}
      </div>
      {detail ? <div className="mt-1 text-sm text-slate-500">{detail}</div> : null}
    </div>
  );
}
