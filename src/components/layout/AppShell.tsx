"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950">
        {/* Fixed sidebar: always left, never reflows */}
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

        {/* Main content: offset by sidebar width so it never overlaps */}
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

          <main className="min-w-0 flex-1 px-3 py-4 md:px-6 md:py-6">
            <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

