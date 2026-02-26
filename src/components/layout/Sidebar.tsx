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
        "flex h-full flex-col border-r bg-background/80 backdrop-blur-sm",
        "transition-all duration-200",
        collapsed ? "w-[4.25rem]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813]" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Traveling Partner
              </span>
              <span className="text-sm font-heading font-semibold">
                Partner Portal
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onToggleCollapsed}
        >
          <span className="sr-only">Toggle sidebar</span>
          <div
            className={cn(
              "h-3 w-3 border-b-2 border-l-2 border-muted-foreground transition-transform",
              collapsed ? "rotate-45" : "-rotate-[135deg]"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                "hover:bg-muted/70",
                isActive
                  ? "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 shadow-sm"
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
      {/* Desktop sidebar */}
      <div className="hidden h-full md:block">{sidebarContent}</div>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="p-0 sm:max-w-xs md:hidden">
          {sidebarContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

