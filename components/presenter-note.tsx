import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function PresenterNote({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-md border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-slate-700",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600">
          <Lightbulb className="h-3 w-3" />
        </span>
        Presenter note
      </div>
      <p className="leading-6 text-slate-700">{children}</p>
    </aside>
  );
}
