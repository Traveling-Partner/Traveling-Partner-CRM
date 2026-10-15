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
  UserCircle2,
  Receipt,
  Shield,
  Coins,
  FolderOpen,
  Layers,
  Palette,
  Tags,
  TrendingUp,
  ShieldAlert,
  Siren,
  Phone,
  KeyRound,
  ScrollText
} from "lucide-react";
import { ROLES, type AppRole } from "@/lib/roles";
import { normalizeRole } from "@/lib/rbac";

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

/** Non-clickable section label (e.g. role name) in the sidebar. */
export type SidebarSection = {
  type: "section";
  id: string;
  label: string;
};

export type SidebarEntry = SidebarLink | SidebarGroup | SidebarSection;

export function isSidebarGroup(entry: SidebarEntry): entry is SidebarGroup {
  return "items" in entry;
}

export function isSidebarSection(entry: SidebarEntry): entry is SidebarSection {
  return "type" in entry && entry.type === "section";
}

export function roleSection(id: string, label: string): SidebarSection {
  return { type: "section", id, label };
}

/** Shared Admin groups — same hrefs as Admin (same pages, hooks, and API services). */
export const userManagementGroup: SidebarGroup = {
  id: "user-management",
  label: "User Management",
  icon: Users,
  items: [
    { label: "Drivers", href: "/drivers", icon: Users },
    { label: "Partners", href: "/partners", icon: Briefcase },
    { label: "Employees List", href: "/agents", icon: UserCircle2 },
    { label: "Documents", href: "/documents", icon: FileText }
  ]
};

export const contentManagementGroup: SidebarGroup = {
  id: "content-management",
  label: "Content Management",
  icon: FolderOpen,
  items: [
    { label: "Blog", href: "/blog-list", icon: Newspaper },
    { label: "Newsletter", href: "/newsletter-list", icon: Mail },
    { label: "Newsletter Subscribers", href: "/newsletter-subscribers-list", icon: Contact },
    { label: "App Banner", href: "/app-banner-list", icon: Images }
  ]
};

export const financialManagementGroup: SidebarGroup = {
  id: "financial-management",
  label: "Financial Management",
  icon: BadgeDollarSign,
  items: [
    { label: "Sales Tax", href: "/sales-tax-list", icon: Receipt },
    {
      label: "App Commission",
      href: "/app-commission-list",
      icon: BadgeDollarSign
    },
    { label: "Insurance Management", href: "/insurance-management-list", icon: Shield },
    {
      label: "Platform Fee",
      href: "/platform-fee-list",
      icon: Coins
    }
  ]
};

/** Admin “Comission Management” dropdown (Agent Performance). */
export const commissionManagementGroup: SidebarGroup = {
  id: "agent-management",
  label: "Comission Management",
  icon: TrendingUp,
  items: [
    { label: "Agent Performance", href: "/agent-performance", icon: BadgeDollarSign }
  ]
};

export const rideManagementGroup: SidebarGroup = {
  id: "ride-management",
  label: "Ride Management",
  icon: Route,
  items: [{ label: "Rides", href: "/rides", icon: Share2 }]
};

export const vehicleManagementGroup: SidebarGroup = {
  id: "vehicle-management",
  label: "Vehicle Management",
  icon: Car,
  items: [
    { label: "Vehicle Types", href: "/vehicle-types-list", icon: Car },
    { label: "Vehicle Brands", href: "/vehicle-brands-list", icon: Tags },
    { label: "Vehicle Models", href: "/vehicle-models-list", icon: Layers },
    { label: "Vehicle Model Variants", href: "/vehicle-model-variants-list", icon: Palette },
  ]
};

/** Admin SOS (incidents + emergency directory). */
export const safetyCenterGroup: SidebarGroup = {
  id: "safety-center",
  label: "SOS",
  icon: ShieldAlert,
  items: [
    { label: "SOS", href: "/sos", icon: Siren },
    { label: "Emergency Services", href: "/emergency-services-list", icon: Phone }
  ]
};

/** Existing Admin navigation — identical structure as before. */
export const adminNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  userManagementGroup,
  rideManagementGroup,
  safetyCenterGroup,
  commissionManagementGroup,
  contentManagementGroup,
  financialManagementGroup,
  vehicleManagementGroup,
  { label: "Audit Logs", href: "/audit-logs-list", icon: ScrollText },
  { label: "Access Management", href: "/access-management", icon: KeyRound }
];

/**
 * Sales Agent nav — agent pages only (API-backed).
 * Other roles keep their own sidebars via salesManagerNav / marketingManagerNav / managerNav.
 */
export const agentNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/listings", icon: Briefcase },
  { label: "My Commissions", href: "/commissions", icon: BadgeDollarSign },
  { label: "Profile", href: "/profile", icon: UserCircle2 }
];

/** Sales Manager — Agent Performance + full Financial Management (Commission once inside Financial). */
export const salesManagerNav: SidebarEntry[] = [
  roleSection("section-sales-manager", "Sales Manager"),
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  commissionManagementGroup,
  financialManagementGroup
];

/** Marketing Manager — exact same Content Management dropdown as Admin. */
export const marketingManagerNav: SidebarEntry[] = [
  roleSection("section-marketing-manager", "Marketing Manager"),
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  contentManagementGroup
];

/** Manager — same Admin Financial, User, Ride, and Vehicle Management dropdowns. */
export const managerNav: SidebarEntry[] = [
  roleSection("section-manager", "Manager"),
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  financialManagementGroup,
  userManagementGroup,
  rideManagementGroup,
  vehicleManagementGroup
];

export function getNavForRole(role: AppRole | string | null | undefined): SidebarEntry[] {
  switch (normalizeRole(role)) {
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
    case ROLES.FINANCE_MANAGER:
      return adminNav;
    default:
      return adminNav;
  }
}
