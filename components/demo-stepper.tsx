"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { demoPath, getDemoStepByRoute } from "@/lib/demo-path";
import { cn } from "@/lib/utils";

export function DemoStepper() {
  const pathname = usePathname();
  const activeStep = getDemoStepByRoute(pathname);

  if (!activeStep) {
    return null;
  }

  const index = demoPath.findIndex((step) => step.route === activeStep.route);
  const previous = index > 0 ? demoPath[index - 1] : undefined;
  const next = index < demoPath.length - 1 ? demoPath[index + 1] : undefined;

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            Founder demo path
          </div>
          <h2 className="mt-2 text-[15px] font-semibold tracking-tight text-text">
            {activeStep.stepNumber}. {activeStep.title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            {activeStep.presenterNote}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previous ? (
            <Link
              href={previous.route}
              className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-text transition hover:border-accent/30 hover:text-accent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : null}
          {next ? (
            <Link
              href={next.route}
              className="inline-flex items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-3">
        <div className="flex min-w-max items-center gap-2">
          {demoPath.map((step) => {
            const active = step.route === activeStep.route;
            return (
              <Link
                key={step.route}
                href={step.route}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-sm border px-3 py-2 text-sm transition",
                  active
                    ? "border-blue-300 bg-blue-50 text-blue-800 shadow-[inset_0_-2px_0_0_rgb(37_99_235_/_0.45)]"
                    : "border-slate-200 bg-slate-50 text-muted hover:border-slate-300 hover:text-text"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current/20 font-mono text-[11px] font-semibold">
                  {step.stepNumber}
                </span>
                <span className="whitespace-nowrap">{step.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
