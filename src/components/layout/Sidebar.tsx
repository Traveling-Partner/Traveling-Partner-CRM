"use client";

import { type ComponentType, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  BadgeDollarSign,
  Car,
  Newspaper,
  Mail,
  Images,
  Settings,
  UserCircle2,
  Receipt,
  Shield,
  Coins,
  ChevronDown,
  FolderOpen,
  Layers,
  Palette,
  Tags
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type SidebarLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type SidebarGroup = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: SidebarLink[];
};

type SidebarEntry = SidebarLink | SidebarGroup;

const adminNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    id: "user-management",
    label: "User Management",
    icon: Users,
    items: [
      { label: "Drivers", href: "/admin/drivers", icon: Users },
      { label: "Partners", href: "/admin/partners", icon: Briefcase },
      { label: "Agents", href: "/admin/agents", icon: UserCircle2 },
      { label: "Documents", href: "/admin/documents", icon: FileText }
    ]
  },
  {
    id: "content-management",
    label: "Content Management",
    icon: FolderOpen,
    items: [
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Carousel", href: "/admin/carousel", icon: Images }
    ]
  },
  {
    id: "financial-management",
    label: "Financial Management",
    icon: BadgeDollarSign,
    items: [
      { label: "Tax Management", href: "/admin/tax-management", icon: Receipt },
      {
        label: "Commission Management",
        href: "/admin/commission-management",
        icon: BadgeDollarSign
      },
      { label: "Insurance Management", href: "/admin/insurance-management", icon: Shield },
      {
        label: "Platform Fee Management",
        href: "/admin/platform-fee-management",
        icon: Coins
      }
    ]
  },
  {
    id: "vehicle-management",
    label: "Vehicle Management",
    icon: Car,
    items: [
      { label: "Vehicle Types", href: "/admin/vehicle-types", icon: Car },
      { label: "Vehicle Models", href: "/admin/vehicle-models", icon: Layers },
      { label: "Vehicle Colors", href: "/admin/vehicle-colors", icon: Palette },
      { label: "Vehicle Brands", href: "/admin/vehicle-brands", icon: Tags }
    ]
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }]
  }
];

const agentItems: SidebarLink[] = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/agent/listings", icon: Briefcase },
  { label: "My Commissions", href: "/agent/commissions", icon: BadgeDollarSign },
  { label: "Profile", href: "/agent/profile", icon: UserCircle2 }
];

function isSidebarGroup(entry: SidebarEntry): entry is SidebarGroup {
  return "items" in entry;
}

function isLinkActive(pathname: string, href: string) {
  if (pathname === href) return true;

  if (href === "/admin/dashboard" || href === "/agent/dashboard") {
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
          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
      )}
      onClick={onNavigate}
    >
      <item.icon
        className={cn(
          "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
          nested && "h-4 w-4",
          isActive ? "text-slate-900" : "text-slate-400 group-hover:text-white"
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
                ? "bg-slate-800/90 text-white ring-1 ring-yellow-300/40"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            )}
            aria-label={group.label}
          >
            <group.icon
              className={cn(
                "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                hasActiveChild ? "text-[#fdb813]" : "text-slate-400 group-hover:text-white"
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="min-w-[12rem] border-slate-800 bg-slate-900 text-slate-100"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">{group.label}</div>
          {group.items.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm",
                  isLinkActive(pathname, item.href)
                    ? "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 focus:text-slate-900"
                    : "text-slate-300 focus:bg-slate-800 focus:text-white"
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
            ? "bg-slate-800/90 text-white"
            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
        )}
        aria-expanded={isOpen}
      >
        <group.icon
          className={cn(
            "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
            hasActiveChild ? "text-[#fdb813]" : "text-slate-400 group-hover:text-white"
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

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-3 space-y-0.5 border-l border-slate-700/80 py-0.5 pl-2">
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
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    adminNav.forEach((entry) => {
      if (isSidebarGroup(entry) && groupHasActiveChild(pathname, entry.items)) {
        initial[entry.id] = true;
      }
    });
    return initial;
  });

  useEffect(() => {
    adminNav.forEach((entry) => {
      if (isSidebarGroup(entry) && groupHasActiveChild(pathname, entry.items)) {
        setOpenGroups((prev) => ({ ...prev, [entry.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleNavigate = () => onMobileOpenChange(false);
  const effectiveCollapsed = collapsed && !mobileOpen;

  const sidebarContent = (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100",
        "overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out",
        "scrollbar-thin scrollbar-brand",
        mobileOpen ? "w-full" : collapsed ? "w-[4.25rem]" : "w-64"
      )}
    >
      {/* Brand header */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-800/60 px-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fce001] to-[#f59e0b] shadow-md shadow-yellow-500/20">
          <span className="text-xs font-bold text-slate-900">TP</span>
        </div>
        {!effectiveCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-heading font-semibold text-white">
              Traveling Partner
            </p>
            <p className="truncate text-[0.68rem] text-slate-400">Admin command center</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3" role="navigation">
        {isAdmin
          ? adminNav.map((entry) =>
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
            )
          : agentItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={effectiveCollapsed}
                onNavigate={handleNavigate}
              />
            ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-800/60 px-3 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="hidden w-full justify-center rounded-xl border border-slate-700/60 bg-slate-800/30 text-slate-400 hover:bg-slate-800/60 hover:text-white md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label="Collapse sidebar"
        >
          <div
            className={cn(
              "h-3 w-3 border-b-2 border-l-2 border-slate-400 transition-transform duration-200",
              collapsed ? "rotate-45" : "-rotate-[135deg]"
            )}
          />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed vertical sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile: drawer overlay */}
      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="left-0 top-0 h-[100dvh] w-[280px] max-h-[100dvh] max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full md:hidden">
          <div className="relative h-full w-full">{sidebarContent}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
