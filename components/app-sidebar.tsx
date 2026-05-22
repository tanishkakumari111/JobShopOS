"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sidebarFooterNote, sidebarItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const COLLAPSED_KEY = "jobshopos-sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(COLLAPSED_KEY);
    if (saved === "1" || saved === "0") {
      setCollapsed(saved === "1");
      return;
    }

    setCollapsed(window.innerWidth < 1024);
  }, []);

  const setCollapsedState = (next: boolean) => {
    setCollapsed(next);
    window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  };

  const widthClass = collapsed ? "w-[4.75rem]" : "w-[16.75rem]";

  const nav = useMemo(() => sidebarItems, []);

  return (
    <aside
      className={cn(
        "no-print sticky top-0 flex h-screen flex-col border-r border-slate-800/90 bg-slate-950 text-slate-100",
        widthClass
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white">
            <Shield className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.02em] text-white">
                JOBSHOP OS
              </div>
              <div className="text-[12px] text-slate-400">Industrial OS</div>
            </div>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsedState(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 border-l-4 px-3 py-2 text-sm transition",
                active
                  ? "border-l-indigo-500 bg-slate-800/70 text-white"
                  : "border-l-transparent text-slate-300 hover:bg-white/5 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-cyan-300")} />
              {!collapsed ? <span className="font-medium">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Demo shell
            </div>
            <div className="mt-1 text-sm font-medium text-white">
              {sidebarFooterNote}
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-400">
              Phase 1 focuses on shell, navigation, and seeded views only.
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
