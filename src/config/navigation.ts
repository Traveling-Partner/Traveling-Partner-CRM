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
  Settings
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
    { label: "Drivers", href: "/admin/drivers", icon: Users },
    { label: "Partners", href: "/admin/partners", icon: Briefcase },
    { label: "Agents", href: "/admin/agents", icon: UserCircle2 },
    { label: "Documents", href: "/admin/documents", icon: FileText }
  ]
};

export const contentManagementGroup: SidebarGroup = {
  id: "content-management",
  label: "Content Management",
  icon: FolderOpen,
  items: [
    { label: "Blog", href: "/admin/blog", icon: Newspaper },
    { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { label: "Newsletter Subscribers", href: "/admin/newsletter-subscribers", icon: Contact },
    { label: "Carousel", href: "/admin/carousel", icon: Images }
  ]
};

export const financialManagementGroup: SidebarGroup = {
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
};

/** Admin “Comission Management” dropdown (Agent Performance). */
export const commissionManagementGroup: SidebarGroup = {
  id: "agent-management",
  label: "Comission Management",
  icon: TrendingUp,
  items: [
    { label: "Agent Performance", href: "/admin/agent-performance", icon: BadgeDollarSign }
  ]
};

export const rideManagementGroup: SidebarGroup = {
  id: "ride-management",
  label: "Ride Management",
  icon: Route,
  items: [{ label: "Rides", href: "/admin/pool-rides", icon: Share2 }]
};

export const vehicleManagementGroup: SidebarGroup = {
  id: "vehicle-management",
  label: "Vehicle Management",
  icon: Car,
  items: [
    { label: "Vehicle Types", href: "/admin/vehicle-types", icon: Car },
    { label: "Vehicle Models", href: "/admin/vehicle-models", icon: Layers },
    { label: "Vehicle Colors", href: "/admin/vehicle-colors", icon: Palette },
    { label: "Vehicle Brands", href: "/admin/vehicle-brands", icon: Tags }
  ]
};

/** Admin-only Safety Center (SOS) — mock module until APIs exist. */
export const safetyCenterGroup: SidebarGroup = {
  id: "safety-center",
  label: "Safety Center",
  icon: ShieldAlert,
  items: [
    { label: "Overview", href: "/admin/safety", icon: LayoutDashboard },
    { label: "SOS Incidents", href: "/admin/safety/incidents", icon: Siren },
    { label: "Emergency Services", href: "/admin/safety/services", icon: Phone },
    { label: "Safety Settings", href: "/admin/safety/settings", icon: Settings }
  ]
};

/** Existing Admin navigation — identical structure as before. */
export const adminNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  userManagementGroup,
  rideManagementGroup,
  safetyCenterGroup,
  commissionManagementGroup,
  contentManagementGroup,
  financialManagementGroup,
  vehicleManagementGroup
];

/**
 * Sales Agent nav — agent pages only (API-backed).
 * Other roles keep their own sidebars via salesManagerNav / marketingManagerNav / managerNav.
 */
export const agentNav: SidebarEntry[] = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/agent/listings", icon: Briefcase },
  { label: "My Commissions", href: "/agent/commissions", icon: BadgeDollarSign },
  { label: "Profile", href: "/agent/profile", icon: UserCircle2 }
];

/** Sales Manager — Agent Performance + full Financial Management (Commission once inside Financial). */
export const salesManagerNav: SidebarEntry[] = [
  roleSection("section-sales-manager", "Sales Manager"),
  { label: "Dashboard", href: "/sales-manager/dashboard", icon: LayoutDashboard },
  commissionManagementGroup,
  financialManagementGroup
];

/** Marketing Manager — exact same Content Management dropdown as Admin. */
export const marketingManagerNav: SidebarEntry[] = [
  roleSection("section-marketing-manager", "Marketing Manager"),
  { label: "Dashboard", href: "/marketing-manager/dashboard", icon: LayoutDashboard },
  contentManagementGroup
];

/** Manager — same Admin Financial, User, Ride, and Vehicle Management dropdowns. */
export const managerNav: SidebarEntry[] = [
  roleSection("section-manager", "Manager"),
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  financialManagementGroup,
  userManagementGroup,
  rideManagementGroup,
  vehicleManagementGroup
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
