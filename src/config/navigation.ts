import type { ComponentType } from "react";
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
  Contact,
  Share2,
  Route,
  Settings,
  UserCircle2,
  Receipt,
  Shield,
  Coins,
  FolderOpen,
  Layers,
  Palette,
  Tags,
  TrendingUp,
  Bell,
  CreditCard,
  FileSpreadsheet,
  PieChart,
  Wallet,
  CalendarDays,
  BarChart3
} from "lucide-react";
import { ROLES, type AppRole } from "@/lib/roles";

export type SidebarLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export type SidebarGroup = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: SidebarLink[];
};

export type SidebarEntry = SidebarLink | SidebarGroup;

export function isSidebarGroup(entry: SidebarEntry): entry is SidebarGroup {
  return "items" in entry;
}

/** Existing Admin navigation — kept identical to previous Sidebar.tsx. */
export const adminNav: SidebarEntry[] = [
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
    id: "ride-management",
    label: "Ride Management",
    icon: Route,
    items: [{ label: "Rides", href: "/admin/pool-rides", icon: Share2 }]
  },
  {
    id: "agent-management",
    label: "Comission Management",
    icon: TrendingUp,
    items: [
      { label: "Agent Performance", href: "/admin/agent-performance", icon: BadgeDollarSign }
    ]
  },
  {
    id: "content-management",
    label: "Content Management",
    icon: FolderOpen,
    items: [
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Newsletter Subscribers", href: "/admin/newsletter-subscribers", icon: Contact },
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
  }
];

/** Existing Sales Agent navigation — unchanged. */
export const agentNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/agent/listings", icon: Briefcase },
  { label: "My Commissions", href: "/agent/commissions", icon: BadgeDollarSign },
  { label: "Profile", href: "/agent/profile", icon: UserCircle2 }
];

export const salesManagerNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/sales-manager/dashboard", icon: LayoutDashboard },
  {
    id: "sm-financial",
    label: "Financial Management",
    icon: Wallet,
    items: [
      { label: "Revenue Summary", href: "/sales-manager/financial", icon: PieChart },
      { label: "Payments", href: "/sales-manager/financial/payments", icon: CreditCard },
      { label: "Transactions", href: "/sales-manager/financial/transactions", icon: FileSpreadsheet },
      { label: "Invoices", href: "/sales-manager/financial/invoices", icon: Receipt },
      { label: "Reports", href: "/sales-manager/financial/reports", icon: BarChart3 }
    ]
  },
  {
    label: "Commission Management",
    href: "/sales-manager/commissions",
    icon: BadgeDollarSign
  },
  { label: "Profile", href: "/sales-manager/profile", icon: UserCircle2 },
  { label: "Settings", href: "/sales-manager/settings", icon: Settings },
  { label: "Notifications", href: "/sales-manager/notifications", icon: Bell }
];

export const marketingManagerNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/marketing-manager/dashboard", icon: LayoutDashboard },
  {
    id: "mm-content",
    label: "Content Management",
    icon: FolderOpen,
    items: [
      { label: "All Content", href: "/marketing-manager/content", icon: Newspaper },
      { label: "Create Content", href: "/marketing-manager/content/create", icon: FileText },
      { label: "Calendar", href: "/marketing-manager/content/calendar", icon: CalendarDays },
      { label: "Media Library", href: "/marketing-manager/content/media", icon: Images },
      { label: "Analytics", href: "/marketing-manager/content/analytics", icon: BarChart3 }
    ]
  },
  { label: "Profile", href: "/marketing-manager/profile", icon: UserCircle2 },
  { label: "Settings", href: "/marketing-manager/settings", icon: Settings },
  { label: "Notifications", href: "/marketing-manager/notifications", icon: Bell }
];

export const managerNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  {
    id: "mgr-financial",
    label: "Financial Management",
    icon: Wallet,
    items: [
      { label: "Overview", href: "/manager/financial", icon: PieChart },
      { label: "Transactions", href: "/manager/financial/transactions", icon: FileSpreadsheet },
      { label: "Invoices", href: "/manager/financial/invoices", icon: Receipt },
      { label: "Payments", href: "/manager/financial/payments", icon: CreditCard },
      { label: "Reports", href: "/manager/financial/reports", icon: BarChart3 }
    ]
  },
  {
    id: "mgr-users",
    label: "User Management",
    icon: Users,
    items: [
      { label: "All Users", href: "/manager/users", icon: Users },
      { label: "Create User", href: "/manager/users/create", icon: UserCircle2 }
    ]
  },
  { label: "Profile", href: "/manager/profile", icon: UserCircle2 },
  { label: "Settings", href: "/manager/settings", icon: Settings },
  { label: "Notifications", href: "/manager/notifications", icon: Bell }
];

export function getNavForRole(role: AppRole | string | null | undefined): SidebarEntry[] {
  switch (role) {
    case ROLES.ADMIN:
      return adminNav;
    case ROLES.AGENT:
      return agentNav;
    case ROLES.SALES_MANAGER:
      return salesManagerNav;
    case ROLES.MARKETING_MANAGER:
      return marketingManagerNav;
    case ROLES.MANAGER:
      return managerNav;
    default:
      return agentNav;
  }
}
