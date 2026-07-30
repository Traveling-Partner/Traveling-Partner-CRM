"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { getAllowedRolesForPath } from "@/lib/roles";
import {
  getSuppressHoverUntilLeave,
  readSidebarCollapsed,
  setSuppressHoverUntilLeave,
  writeSidebarCollapsed
} from "@/lib/sidebar-ui";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  allowedRoles?: string[];
  /** When true, content spans the full main column instead of max-w-6xl. */
  wideContent?: boolean;
}

export function AppShell({ children, title, allowedRoles, wideContent }: AppShellProps) {
  /** Pinned closed by hamburger — persisted across page navigations. */
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const skipNextPathSuppress = useRef(true);
  const routeRoles = allowedRoles ?? getAllowedRolesForPath(pathname ?? "");

  // Restore pinned state after remount (new page = new AppShell)
  useEffect(() => {
    setCollapsed(readSidebarCollapsed());
    // Only keep suppress across in-app nav remounts (after clicking a link while hover-open).
    // Full page refresh resets the module flag to false, so first hover works.
    setSuppressHover(getSuppressHoverUntilLeave());
    setHovered(false);
    setHydrated(true);
  }, []);

  // Close hover-open only when the route actually changes — not on refresh / first hydrate
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPathSuppress.current) {
      skipNextPathSuppress.current = false;
      return;
    }
    setHovered(false);
    if (readSidebarCollapsed()) {
      setSuppressHoverUntilLeave(true);
      setSuppressHover(true);
    }
  }, [pathname, hydrated]);

  const isCollapsed = collapsed && (!hovered || suppressHover);

  const closeHoverOpen = () => {
    setHovered(false);
    setSuppressHover(true);
    setSuppressHoverUntilLeave(true);
    writeSidebarCollapsed(true);
    setCollapsed(true);
  };

  return (
    <ProtectedRoute allowedRoles={routeRoles}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden h-screen overflow-hidden transition-[width] duration-200 ease-out md:block",
            isCollapsed ? "w-[4.25rem]" : "w-64"
          )}
          aria-label="Main navigation"
          onMouseLeave={() => {
            setHovered(false);
            setSuppressHover(false);
            setSuppressHoverUntilLeave(false);
          }}
        >
          <Sidebar
            collapsed={isCollapsed}
            pinnedCollapsed={collapsed}
            onHoverOpen={() => {
              if (!getSuppressHoverUntilLeave() && !suppressHover) {
                setHovered(true);
              }
            }}
            onHoverClose={closeHoverOpen}
            onToggleCollapsed={() => {
              setCollapsed((prev) => {
                const next = !prev;
                writeSidebarCollapsed(next);
                return next;
              });
              setHovered(false);
              setSuppressHover(false);
              setSuppressHoverUntilLeave(false);
            }}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
          />
        </aside>

        <div
          className={cn(
            "flex min-h-screen flex-col transition-[margin] duration-200 ease-out",
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
