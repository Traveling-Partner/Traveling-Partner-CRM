"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  getNavForRole,
  isSidebarGroup,
  type SidebarEntry,
  type SidebarGroup,
  type SidebarLink
} from "@/config/navigation";
import { getDefaultRouteForRole } from "@/lib/rbac";

function isLinkActive(pathname: string, href: string) {
  if (pathname === href) return true;

  if (
    href.endsWith("/dashboard") &&
    (href === "/admin/dashboard" ||
      href === "/agent/dashboard" ||
      href === "/sales-manager/dashboard" ||
      href === "/marketing-manager/dashboard" ||
      href === "/manager/dashboard")
  ) {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

function groupHasActiveChild(pathname: string, items: SidebarLink[]) {
  return items.some((item) => isLinkActive(pathname, item.href));
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

interface NavLinkProps {
  item: SidebarLink;
  pathname: string;
  collapsed: boolean;
  nested?: boolean;
  onNavigate: () => void;
}

function NavLink({ item, pathname, collapsed, nested, onNavigate }: NavLinkProps) {
  const isActive = isLinkActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
        nested ? "px-2" : "px-2.5",
        collapsed && !nested && "justify-center px-0",
        isActive
          ? "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 shadow-md shadow-yellow-500/20 ring-1 ring-yellow-300/60"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
      )}
      onClick={onNavigate}
    >
      <item.icon
        className={cn(
          "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
          nested && "h-4 w-4",
          isActive
            ? "text-slate-900"
            : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
        )}
      />
      {(!collapsed || nested) && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

interface NavGroupProps {
  group: SidebarGroup;
  pathname: string;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

function NavGroup({
  group,
  pathname,
  collapsed,
  isOpen,
  onToggle,
  onNavigate
}: NavGroupProps) {
  const hasActiveChild = groupHasActiveChild(pathname, group.items);

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center justify-center rounded-xl px-0 py-2.5 text-sm font-medium transition-all duration-200",
              hasActiveChild
                ? "bg-slate-100 text-slate-900 ring-1 ring-yellow-300/50 dark:bg-slate-800/90 dark:text-white dark:ring-yellow-300/40"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
            )}
            aria-label={group.label}
          >
            <group.icon
              className={cn(
                "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                hasActiveChild
                  ? "text-[#fdb813]"
                  : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="z-50 min-w-[12rem] border-border bg-popover text-popover-foreground"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.label}</div>
          {group.items.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm",
                  isLinkActive(pathname, item.href)
                    ? "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 focus:text-slate-900"
                    : "text-foreground focus:bg-accent focus:text-accent-foreground"
                )}
                onClick={onNavigate}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
          hasActiveChild
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800/90 dark:text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
        )}
        aria-expanded={isOpen}
      >
        <group.icon
          className={cn(
            "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
            hasActiveChild
              ? "text-[#fdb813]"
              : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
          )}
        />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="relative ml-3 space-y-0.5 py-0.5 pl-2">
          <div
            className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813]"
            aria-hidden
          />
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildOpenGroups(nav: SidebarEntry[], pathname: string) {
  const initial: Record<string, boolean> = {};
  nav.forEach((entry) => {
    if (isSidebarGroup(entry) && groupHasActiveChild(pathname, entry.items)) {
      initial[entry.id] = true;
    }
  });
  return initial;
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const homeHref = getDefaultRouteForRole(user?.role ?? "AGENT");
  const navItems = useMemo(() => getNavForRole(user?.role), [user?.role]);
  const effectiveCollapsed = collapsed && !mobileOpen;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    buildOpenGroups(navItems, pathname)
  );

  useEffect(() => {
    setOpenGroups((prev) => ({ ...prev, ...buildOpenGroups(navItems, pathname) }));
  }, [pathname, navItems]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleNavigate = () => onMobileOpenChange(false);

  const sidebarContent = (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900",
        "dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100",
        "transition-[width] duration-200 ease-out",
        mobileOpen ? "w-full" : collapsed ? "w-[4.25rem]" : "w-64"
      )}
    >
      <div className="relative z-10 flex h-16 shrink-0 items-center justify-center border-b border-border px-3 dark:border-slate-800/60">
        <Link
          href={homeHref}
          className="flex items-center justify-center bg-transparent"
          onClick={handleNavigate}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tp-logo.png?v=2"
            alt="Traveling Partner"
            className={cn(
              "bg-transparent object-contain transition-all duration-200",
              effectiveCollapsed ? "h-9 w-auto max-w-[40px]" : "h-12 w-auto max-w-[180px]"
            )}
          />
        </Link>
      </div>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute top-[3.15rem] right-0 z-40 hidden translate-x-1/2 items-center justify-center md:inline-flex",
          "h-7 w-7 rounded-full border border-border bg-card text-muted-foreground shadow-md",
          "transition-all duration-200 hover:scale-105 hover:border-[#fdb813]/60 hover:bg-gradient-to-b hover:from-[#fce001] hover:to-[#fdb813] hover:text-slate-900 hover:shadow-lg hover:shadow-yellow-500/20",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fdb813]/60"
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-3.5 w-3.5" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5" />
        )}
      </button>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-thin scrollbar-brand"
        role="navigation"
      >
        {navItems.map((entry) =>
          isSidebarGroup(entry) ? (
            <NavGroup
              key={entry.id}
              group={entry}
              pathname={pathname}
              collapsed={effectiveCollapsed}
              isOpen={Boolean(openGroups[entry.id])}
              onToggle={() => toggleGroup(entry.id)}
              onNavigate={handleNavigate}
            />
          ) : (
            <NavLink
              key={entry.href}
              item={entry}
              pathname={pathname}
              collapsed={effectiveCollapsed}
              onNavigate={handleNavigate}
            />
          )
        )}
      </nav>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">{sidebarContent}</div>

      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="left-0 top-0 z-50 h-[100dvh] w-[280px] max-h-[100dvh] max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full md:hidden">
          <div className="relative h-full w-full">{sidebarContent}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
