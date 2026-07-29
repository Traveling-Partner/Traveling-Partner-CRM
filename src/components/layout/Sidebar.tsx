"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
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
  isSidebarSection,
  type SidebarEntry,
  type SidebarGroup,
  type SidebarLink,
  type SidebarSection
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
  /** True when user pinned the sidebar closed (icon rail). */
  pinnedCollapsed?: boolean;
  /** Called when pointer enters the nav while the rail is pinned closed. */
  onHoverOpen?: () => void;
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
      title={collapsed && !nested ? item.label : undefined}
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
            title={group.label}
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

function RoleSectionHeading({
  section,
  collapsed
}: {
  section: SidebarSection;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <div
        className="mx-auto my-2 h-px w-6 rounded-full bg-border dark:bg-slate-700"
        title={section.label}
        aria-hidden
      />
    );
  }

  return (
    <div className="px-2.5 pb-1 pt-4 first:pt-1">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {section.label}
      </p>
    </div>
  );
}

export function Sidebar({
  collapsed,
  pinnedCollapsed = false,
  onHoverOpen,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const homeHref = getDefaultRouteForRole(user?.role ?? "AGENT");
  const navItems = useMemo(() => getNavForRole(user?.role), [user?.role]);
  const effectiveCollapsed = collapsed && !mobileOpen;
  const showLogo = !effectiveCollapsed;

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
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-border bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900",
        "dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
      )}
    >
      <div
        className={cn(
          "relative z-10 flex h-16 shrink-0 items-center border-b border-border dark:border-slate-800/60",
          effectiveCollapsed ? "justify-center px-2" : "gap-2 px-3"
        )}
      >
        {showLogo && (
          <Link
            href={homeHref}
            className="flex min-w-0 flex-1 items-center justify-start bg-transparent"
            onClick={handleNavigate}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tp-logo.png?v=2"
              alt="Traveling Partner"
              className="h-11 w-auto max-w-[150px] bg-transparent object-contain"
            />
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm",
            "transition-all duration-200 hover:border-[#fdb813]/60 hover:bg-gradient-to-b hover:from-[#fce001] hover:to-[#fdb813] hover:text-slate-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fdb813]/60",
            "hidden md:inline-flex"
          )}
        >
          {effectiveCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <nav
        className={cn(
          "min-h-0 flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2 py-3",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
        role="navigation"
        onMouseEnter={() => {
          // Hover-open only on the sidebar nav when it is pinned closed — not on the hamburger
          if (pinnedCollapsed) onHoverOpen?.();
        }}
      >
        {navItems.map((entry) => {
          if (isSidebarSection(entry)) {
            return (
              <RoleSectionHeading
                key={entry.id}
                section={entry}
                collapsed={effectiveCollapsed}
              />
            );
          }

          if (isSidebarGroup(entry)) {
            return (
              <NavGroup
                key={entry.id}
                group={entry}
                pathname={pathname}
                collapsed={effectiveCollapsed}
                isOpen={Boolean(openGroups[entry.id])}
                onToggle={() => toggleGroup(entry.id)}
                onNavigate={handleNavigate}
              />
            );
          }

          return (
            <NavLink
              key={`${entry.href}-${entry.label}`}
              item={entry}
              pathname={pathname}
              collapsed={effectiveCollapsed}
              onNavigate={handleNavigate}
            />
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <div className="hidden h-full md:block">{sidebarContent}</div>

      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="left-0 top-0 z-50 h-[100dvh] w-[280px] max-h-[100dvh] max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full md:hidden">
          <div className="relative h-full w-full">{sidebarContent}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
