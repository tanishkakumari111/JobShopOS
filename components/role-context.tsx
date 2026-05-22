"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const roles = [
  "Owner / GM",
  "Scheduler",
  "Shop Supervisor",
  "Operator",
  "Estimator",
  "Purchasing",
  "Quality Inspector",
  "Customer Service"
] as const;

export type Role = (typeof roles)[number];

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const STORAGE_KEY = "jobshopos-role";

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("Owner / GM");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (saved && roles.includes(saved)) {
      setRoleState(saved);
    }
  }, []);

  const setRole = (next: Role) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const value = useContext(RoleContext);
  if (!value) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return value;
}
