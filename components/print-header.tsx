export function PrintHeader({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            JobShop OS
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="text-right text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Printable
          <div className="mt-1 text-xs normal-case tracking-normal text-slate-600">
            Phase 1 seeded layout
          </div>
        </div>
      </div>
    </header>
  );
}
