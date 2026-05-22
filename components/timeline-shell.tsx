import { cn } from "@/lib/utils";

export function TimelineShell({
  title,
  subtitle,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-slate-200 bg-white p-4 shadow-none",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
