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
        "flex h-screen flex-col border-r border-border/80 bg-card shadow-lg",
        "overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out",
        collapsed ? "w-[4.25rem]" : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between gap-1 border-b border-border/60 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813] shadow-sm" />
          {!collapsed && (
            <span className="truncate text-sm font-heading font-semibold">
              Traveling Partner Portal
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden shrink-0 md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label="Collapse sidebar"
        >
          <div
            className={cn(
              "h-3 w-3 border-b-2 border-l-2 border-muted-foreground transition-transform",
              collapsed ? "rotate-45" : "-rotate-[135deg]"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3" role="navigation">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/agent/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-muted/80",
                isActive
                  ? "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 shadow-md"
                  : "text-muted-foreground"
              )}
              onClick={() => onMobileOpenChange(false)}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-slate-900" : "text-muted-foreground"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed vertical sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile: drawer overlay */}
      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="max-h-[90dvh] w-[min(18rem,100vw-2rem)] overflow-hidden p-0 md:hidden [&>div]:max-h-[90dvh]">
          {sidebarContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

