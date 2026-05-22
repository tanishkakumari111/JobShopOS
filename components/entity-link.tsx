import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function EntityLink({
  href,
  children,
  className
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[13px] font-semibold tracking-[0.01em] text-blue-700 transition hover:text-blue-800 hover:underline underline-offset-2",
        className
      )}
    >
      <span>{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
