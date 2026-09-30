/** Mock access matrix until backend permission APIs exist. */

export type AccessPermission = "Read" | "Write" | "Read/Write" | "None";

export const ACCESS_PERMISSIONS: AccessPermission[] = ["Read", "Write", "Read/Write", "None"];

export type AccessRoleId =
  | "finance-manager"
  | "marketing-manager"
  | "sales-agent"
  | "compliance-officer"
  | "safety-officer";

export const ACCESS_ROLES: { id: AccessRoleId; label: string }[] = [
  { id: "finance-manager", label: "Finance Manager" },
  { id: "marketing-manager", label: "Marketing Manager" },
  { id: "sales-agent", label: "Sales Agent" },
  { id: "compliance-officer", label: "Compliance & Verification Officer" },
  { id: "safety-officer", label: "Safety & Incident Officer" }
];

export type AccessLeafModule = {
  id: string;
  label: string;
};

export type AccessModuleNode =
  | { id: string; label: string; children?: undefined }
  | { id: string; label: string; children: AccessLeafModule[] };

/** Modules from the ticket — groups nest their screens. */
export const ACCESS_MODULES: AccessModuleNode[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "user-management", label: "User Management" },
  { id: "driver", label: "Driver" },
  { id: "partner", label: "Partner" },
  { id: "employees-list", label: "Employees List" },
  { id: "document", label: "Document" },
  { id: "driver-partner-management", label: "Driver/Partner Management" },
  { id: "sos-management", label: "SOS Management" },
  {
    id: "ride-management",
    label: "Ride Management",
    children: [
      { id: "rides", label: "Rides" },
      { id: "safety-center", label: "Safety Center" },
      { id: "sos-overview", label: "SOS Overview" },
      { id: "emergency-list", label: "Emergency List" }
    ]
  },
  { id: "commission-management", label: "Commission Management" },
  { id: "agent-performance", label: "Agent Performance" },
  {
    id: "content-management",
    label: "Content Management",
    children: [
      { id: "blogs", label: "Blogs" },
      { id: "newsletter-list", label: "Newsletter List" },
      { id: "newsletter-subscribers", label: "Newsletter Subscribers" }
    ]
  },
  {
    id: "financial-management",
    label: "Financial Management",
    children: [
      { id: "tax", label: "Tax" },
      { id: "commission", label: "Commission" },
      { id: "insurance", label: "Insurance" },
      { id: "platform-fee", label: "Platform Fee" }
    ]
  },
  {
    id: "vehicle-management",
    label: "Vehicle Management",
    children: [
      { id: "vehicle-type", label: "Vehicle Type" },
      { id: "vehicle-brands", label: "Vehicle Brands" },
      { id: "vehicle-model", label: "Vehicle Model" },
      { id: "vehicle-model-variant", label: "Vehicle Model Variant" }
    ]
  },
  { id: "access-management", label: "Access Management" }
];

const LEAF_IDS = ACCESS_MODULES.flatMap((module) =>
  module.children ? module.children.map((child) => child.id) : [module.id]
);

function permissions(
  assigned: Partial<Record<string, AccessPermission>>
): Record<string, AccessPermission> {
  const next: Record<string, AccessPermission> = {};
  for (const id of LEAF_IDS) {
    next[id] = assigned[id] ?? "None";
  }
  return next;
}

/**
 * Ticket sample rows (Dashboard → Read, User Management → Write, …) are used
 * as the Sales Agent matrix. Other roles differ so the dropdown changes the view.
 */
export const ROLE_PERMISSIONS: Record<AccessRoleId, Record<string, AccessPermission>> = {
  "sales-agent": permissions({
    dashboard: "Read",
    "user-management": "Write",
    driver: "Read",
    partner: "Read",
    "employees-list": "None",
    document: "Write",
    "driver-partner-management": "Read/Write",
    "sos-management": "Read/Write",
    rides: "Read",
    "safety-center": "None",
    "sos-overview": "None",
    "emergency-list": "None",
    "commission-management": "Read",
    "agent-performance": "None",
    blogs: "None",
    "newsletter-list": "None",
    "newsletter-subscribers": "None",
    tax: "None",
    commission: "None",
    insurance: "None",
    "platform-fee": "None",
    "vehicle-type": "None",
    "vehicle-brands": "None",
    "vehicle-model": "None",
    "vehicle-model-variant": "None",
    "access-management": "None"
  }),
  "finance-manager": permissions({
    dashboard: "Read",
    "commission-management": "Read/Write",
    "agent-performance": "Read",
    tax: "Write",
    commission: "Write",
    insurance: "Write",
    "platform-fee": "Write"
  }),
  "marketing-manager": permissions({
    dashboard: "Read",
    blogs: "Write",
    "newsletter-list": "Write",
    "newsletter-subscribers": "Write"
  }),
  "compliance-officer": permissions({
    dashboard: "Read",
    "user-management": "Write",
    driver: "Read",
    partner: "Read",
    document: "Write",
    "driver-partner-management": "Read/Write",
    rides: "Read"
  }),
  "safety-officer": permissions({
    dashboard: "Read",
    "sos-management": "Read/Write",
    rides: "Read",
    "safety-center": "Read/Write",
    "sos-overview": "Read/Write",
    "emergency-list": "Read/Write"
  })
};

export function getPermissionsForRole(roleId: AccessRoleId): Record<string, AccessPermission> {
  return ROLE_PERMISSIONS[roleId];
}
