"use client";

import { Bell, Search, Sparkles, SquareArrowOutUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { DemoResetButton } from "@/components/demo-reset-button";
import { routeMetaByPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "@/components/role-switcher";

export function TopBar() {
  const pathname = usePathname();
  const routeMeta =
    routeMetaByPath[pathname] ?? routeMetaByPath["/"] ?? routeMetaByPath[pathname.split("?")[0]];
  const action = routeMeta?.action ?? "Open placeholder";

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            aria-label="Global search"
            placeholder="Search jobs, quotes, customers, POs, materials"
            className={cn(
              "h-10 w-full rounded-sm border border-slate-300 bg-white pl-9 pr-4 text-sm text-text outline-none transition",
              "placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
            )}
          />
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Demo Data
          </div>
          <DemoResetButton />
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-slate-300 bg-white transition hover:border-accent/30 hover:text-accent"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <RoleSwitcher />
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
            {action}
          </button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <div className="rounded-sm border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
            Demo
          </div>
        </div>
      </div>
    </header>
  );
}
