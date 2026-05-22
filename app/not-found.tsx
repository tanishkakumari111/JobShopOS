import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-border bg-panel p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        This placeholder shell does not have a route at this address yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-xl border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white"
      >
        Go back to dashboard
      </Link>
    </div>
  );
}
