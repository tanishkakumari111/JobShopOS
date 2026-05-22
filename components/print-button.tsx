"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent/30 hover:text-accent no-print"
    >
      <Printer className="h-4 w-4" />
      Print
    </button>
  );
}
