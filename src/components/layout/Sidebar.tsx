"use client";

import { type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  BadgeDollarSign,
  Car,
  ListChecks,
  Bell,
  Newspaper,
  Settings,
  UserCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type SidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const adminItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Drivers", href: "/admin/drivers", icon: Users },
  { label: "Documents", href: "/admin/documents", icon: FileText },
  { label: "Partners", href: "/admin/partners", icon: Briefcase },
  { label: "Agents", href: "/admin/agents", icon: UserCircle2 },
  { label: "Commissions", href: "/admin/commissions", icon: BadgeDollarSign },
  { label: "Rides", href: "/admin/rides", icon: Car },
  { label: "Vehicle types", href: "/admin/vehicle-types", icon: Car },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ListChecks },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

const agentItems: SidebarItem[] = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/agent/listings", icon: Briefcase },
  { label: "My Commissions", href: "/agent/commissions", icon: BadgeDollarSign },
  { label: "Profile", href: "/agent/profile", icon: UserCircle2 }
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const items = user?.role === "ADMIN" ? adminItems : agentItems;

  const sidebarContent = (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 shadow-2xl",
        "overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out",
        "[scrollbar-color:#fdb813_#0f172a] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#fdb813] [&::-webkit-scrollbar-thumb]:hover:bg-[#fce001]",
        mobileOpen ? "w-full" : collapsed ? "w-[4.25rem]" : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-1 border-b border-slate-800/90 px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fce001] to-[#f59e0b] shadow-md ring-1 ring-yellow-300/70">
            <span className="text-xs font-bold text-slate-900">TP</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-heading font-semibold text-slate-100">
                Traveling Partner
              </p>
              <p className="truncate text-[0.68rem] text-slate-400">Admin command center</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3" role="navigation">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/agent/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                "text-slate-300 hover:bg-slate-800/90 hover:text-slate-100",
                isActive
                  ? "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 shadow-md ring-1 ring-yellow-300/60"
                  : ""
              )}
              onClick={() => onMobileOpenChange(false)}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-100"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden w-full justify-center rounded-lg border border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-slate-100 md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label="Collapse sidebar"
        >
          <div
            className={cn(
              "h-3 w-3 border-b-2 border-l-2 border-slate-400 transition-transform",
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
        <DialogContent className="left-0 top-0 h-[100dvh] w-screen max-h-[100dvh] max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full md:hidden">
          <div className="relative h-full w-full">
            {sidebarContent}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

