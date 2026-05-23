"use client";

import { RoleProvider } from "@/components/role-context";
import { AppSidebar } from "@/components/app-sidebar";
import { DemoStateProvider } from "@/components/demo-state-provider";
import { TopBar } from "@/components/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoStateProvider>
      <RoleProvider>
        <div className="flex min-h-screen bg-bg text-text">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="min-w-0 flex-1 p-3 lg:p-4">
              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3">
                {children}
              </div>
            </main>
          </div>
        </div>
      </RoleProvider>
    </DemoStateProvider>
  );
}
