/**
 * Display grouping only. Row data and `module` keys come from the permission APIs.
 * Child `id` must match backend `module` (e.g. DASHBOARD, TAX).
 */

export type AccessLeafModule = {
  id: string;
  label: string;
};

export type AccessModuleNode = {
  id: string;
  label: string;
  children: AccessLeafModule[];
};

/** Every page sits under its section heading. */
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
      { id: "USER_MANAGEMENT", label: "User Management" },
      { id: "DRIVER", label: "Driver" },
      { id: "PARTNER", label: "Partner" },
      { id: "EMPLOYEES_LIST", label: "Employees List" },
      { id: "DOCUMENT", label: "Document" }
    ]
  },
  {
    id: "sos-management-section",
    label: "SOS Management",
    children: [{ id: "SOS_MANAGEMENT", label: "SOS Management" }]
  },
  {
    id: "ride-management",
    label: "Ride Management",
    children: [
      { id: "RIDES", label: "Rides" },
      { id: "SAFETY_CENTER", label: "Safety Center" },
      { id: "SOS_OVERVIEW", label: "SOS Overview" },
      { id: "EMERGENCY_LIST", label: "Emergency List" }
    ]
  },
  {
    id: "commission-management-section",
    label: "Commission Management",
    children: [
      { id: "COMMISSION_MANAGEMENT", label: "Commission Management" },
      { id: "AGENT_PERFORMANCE", label: "Agent Performance" }
    ]
  },
  {
    id: "content-management",
    label: "Content Management",
    children: [
      { id: "BLOGS", label: "Blogs" },
      { id: "NEWSLETTER_LIST", label: "Newsletter List" },
      { id: "NEWSLETTER_SUBSCRIBERS", label: "Newsletter Subscribers" },
      { id: "CAROUSEL", label: "Carousel" }
    ]
  },
  {
    id: "financial-management",
    label: "Financial Management",
    children: [
      { id: "TAX", label: "Tax" },
      { id: "COMMISSION", label: "Commission" },
      { id: "INSURANCE", label: "Insurance" },
      { id: "PLATFORM_FEE", label: "Platform Fee" }
    ]
  },
  {
    id: "vehicle-management",
    label: "Vehicle Management",
    children: [
      { id: "VEHICLE_TYPE", label: "Vehicle Type" },
      { id: "VEHICLE_BRANDS", label: "Vehicle Brands" },
      { id: "VEHICLE_MODEL", label: "Vehicle Model" },
      { id: "VEHICLE_MODEL_VARIANT", label: "Vehicle Model Variant" }
    ]
  },
  {
    id: "audit-logs-section",
    label: "Audit Logs",
    children: [{ id: "AUDIT_LOGS", label: "Audit Logs" }]
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
