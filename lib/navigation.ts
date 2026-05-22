import {
  BarChart3,
  Boxes,
  ClipboardList,
  Gauge,
  GaugeCircle,
  History,
  ShieldCheck,
  Settings2,
  Users,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const sidebarItems: SidebarItem[] = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/quotes", label: "Quotes", icon: ClipboardList },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/capacity", label: "Capacity", icon: GaugeCircle },
  { href: "/quality", label: "Quality", icon: ShieldCheck },
  { href: "/materials", label: "Materials", icon: Boxes },
  { href: "/customers/metrofab-industries", label: "Customers", icon: Users },
  { href: "/reports/customer-status/j-2035", label: "Reports", icon: BarChart3 },
  { href: "/audit", label: "Audit Trail", icon: History },
  { href: "/approvals", label: "Admin Settings", icon: Settings2 }
];

export const sidebarFooterNote = "Industrial Professional Shell";
