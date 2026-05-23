"use client";

import { RotateCcw } from "lucide-react";
import { useDemoState } from "@/components/demo-state-provider";
import { cn } from "@/lib/utils";

export function DemoResetButton() {
  const { resetDemoState } = useDemoState();

  return (
    <button
      type="button"
      onClick={resetDemoState}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition",
        "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
      )}
      title="Reset demo state"
    >
      <RotateCcw className="h-4 w-4" />
      <span>Reset demo state</span>
    </button>
  );
}
