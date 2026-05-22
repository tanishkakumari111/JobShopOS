"use client";

import { ChevronDown } from "lucide-react";
import { roles, useRole } from "@/components/role-context";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        Role:
      </span>
      <label className="sr-only" htmlFor="role-switcher">
        Role switcher
      </label>
      <div className="relative">
        <select
          id="role-switcher"
          value={role}
          onChange={(event) => setRole(event.target.value as (typeof roles)[number])}
          className={cn(
            "appearance-none rounded-sm border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-medium text-text outline-none transition",
            "focus:border-accent focus:ring-2 focus:ring-accent/20"
          )}
        >
          {roles.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}
