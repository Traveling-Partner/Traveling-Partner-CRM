"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  allowedRoles?: string[];
}

export function AppShell({ children, title, allowedRoles }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const routeRoles =
    allowedRoles ??
    (pathname?.startsWith("/admin")
      ? ["ADMIN"]
      : pathname?.startsWith("/agent")
        ? ["AGENT", "ADMIN"]
        : undefined);

  return (
    <ProtectedRoute allowedRoles={routeRoles}>
      <div className="min-h-screen bg-[hsl(220,20%,97%)] dark:bg-slate-950">
        {/* Fixed sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 ease-out md:block",
            collapsed ? "w-[4.25rem]" : "w-64"
          )}
          aria-label="Main navigation"
        >
          <Sidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((prev) => !prev)}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
          />
        </aside>

        {/* Main content area */}
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[margin] duration-200 ease-out",
            collapsed ? "md:ml-[4.25rem]" : "md:ml-64"
          )}
        >
          <Header
            title={title}
            onToggleSidebarMobile={() => setMobileOpen((prev) => !prev)}
          />

          <main className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
