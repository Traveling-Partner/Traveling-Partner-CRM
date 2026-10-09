import type { PermissionModule } from "@/lib/permission-modules";

/**
 * Display grouping only. Row `id` must be a backend permission module.
 */

export type AccessLeafModule = {
  id: PermissionModule;
  label: string;
  /** Saved with the role, not shown. The section heading already names this module. */
  hidden?: boolean;
};

export type AccessModuleNode = {
  id: string;
  label: string;
  children: AccessLeafModule[];
};

/** Sidebar order. Hidden rows are parent modules, not pages under the heading. */
export const ACCESS_MODULES: AccessModuleNode[] = [
  {
    id: "dashboard-section",
    label: "Dashboard",
    children: [{ id: "DASHBOARD", label: "Dashboard" }]
  },
  {
    id: "user-management-section",
    label: "User Management",
    children: [
      { id: "USER_MANAGEMENT", label: "User Management", hidden: true },
      { id: "DRIVER", label: "Drivers" },
      { id: "PARTNER", label: "Partners" },
      { id: "MANAGERS_USERS", label: "Employees List" },
      { id: "DOCUMENT", label: "Documents" }
    ]
  },
  {
    id: "ride-management",
    label: "Ride Management",
    children: [{ id: "RIDES", label: "Rides" }]
  },
  {
    id: "safety-center",
    label: "Safety Center",
    children: [
      { id: "SOS_MANAGEMENT", label: "SOS Management", hidden: true },
      { id: "SAFETY_CENTER", label: "Safety Center", hidden: true },
      { id: "SOS_OVERVIEW", label: "SOS Overview" },
      { id: "EMERGENCY_LIST", label: "Emergency Services" }
    ]
  },
  {
    id: "commission-management-section",
    label: "Commission Management",
    children: [
      { id: "COMMISSION_MANAGEMENT", label: "Commission Management", hidden: true },
      { id: "AGENT_PERFORMANCE", label: "Agent Performance" }
    ]
  },
  {
    id: "content-management",
    label: "Content Management",
    children: [
      { id: "BLOGS", label: "Blog" },
      { id: "NEWSLETTER_LIST", label: "Newsletter" },
      { id: "NEWSLETTER_SUBSCRIBER", label: "Newsletter Subscribers" },
      { id: "BANNER", label: "Carousel" }
    ]
  },
  {
    id: "financial-management",
    label: "Financial Management",
    children: [
      { id: "TAX", label: "Tax Management" },
      { id: "COMMISSION", label: "Commission Management" },
      { id: "INSURANCE", label: "Insurance Management" },
      { id: "PLATFORM_FEE", label: "Platform Fee Management" }
    ]
  },
  {
    id: "vehicle-management",
    label: "Vehicle Management",
    children: [
      { id: "VEHICLE_TYPE", label: "Vehicle Types" },
      { id: "VEHICLE_BRANDS", label: "Vehicle Brands" },
      { id: "VEHICLE_MODEL", label: "Vehicle Models" },
      { id: "VEHICLE_MODEL_VARIANT", label: "Vehicle Model Variants" }
    ]
  },
  {
    id: "access-management-section",
    label: "Access Management",
    children: [{ id: "ACCESS_MANAGEMENT", label: "Access Management" }]
  }
];

export function formatPermissionModule(module: string): string {
  return module
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatPermissionRoleName(name: string): string {
  return formatPermissionModule(name);
}
