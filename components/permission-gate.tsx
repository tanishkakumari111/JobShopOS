import { useRole } from "@/components/role-context";
import type { Role } from "@/components/role-context";

export function PermissionGate({
  allowedRoles,
  fallback = null,
  children
}: {
  allowedRoles: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { role } = useRole();
  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
