"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { getAllowedRolesForPath } from "@/lib/roles";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  allowedRoles?: string[];
  /** When true, content spans the full main column instead of max-w-6xl. */
  wideContent?: boolean;
}

export function AppShell({ children, title, allowedRoles, wideContent }: AppShellProps) {
  /** Pinned closed by hamburger click (true = icon rail). */
  const [collapsed, setCollapsed] = useState(false);
  /** Temporary expand while hovering the closed sidebar nav. */
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const routeRoles = allowedRoles ?? getAllowedRolesForPath(pathname ?? "");

  const isCollapsed = collapsed && !hovered;

  return (
    <ProtectedRoute allowedRoles={routeRoles}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden h-screen overflow-hidden transition-[width] duration-200 ease-out md:block",
            isCollapsed ? "w-[4.25rem]" : "w-64"
          )}
          aria-label="Main navigation"
          onMouseLeave={() => setHovered(false)}
        >
          <Sidebar
            collapsed={isCollapsed}
            pinnedCollapsed={collapsed}
            onHoverOpen={() => setHovered(true)}
            onToggleCollapsed={() => {
              setCollapsed((prev) => !prev);
              setHovered(false);
            }}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
          />
        </aside>

        <div
          className={cn(
            "flex min-h-screen flex-col transition-[margin] duration-200 ease-out",
            // Same layout as pinned open/closed — hover expand must look identical
            isCollapsed ? "md:ml-[4.25rem]" : "md:ml-64"
          )}
        >
          <Header
            title={title}
            onToggleSidebarMobile={() => setMobileOpen((prev) => !prev)}
          />

          <main className="min-w-0 flex-1 px-3 py-4 md:px-6 md:py-6">
            <div
              className={cn(
                "mx-auto flex h-full flex-col gap-4",
                wideContent ? "max-w-none" : "max-w-6xl"
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
