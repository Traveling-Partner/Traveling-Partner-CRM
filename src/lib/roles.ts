/**
 * Canonical frontend roles.
 * Backend may return variants (e.g. "Sales Manager"); normalizeRole() maps them here.
 * Do not rename ADMIN / AGENT — existing integrations depend on these values.
 */
export const ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  SALES_MANAGER: "SALES_MANAGER",
  MARKETING_MANAGER: "MARKETING_MANAGER",
  MANAGER: "MANAGER"
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "Admin",
  AGENT: "Sales Agent",
  SALES_MANAGER: "Sales Manager",
  MARKETING_MANAGER: "Marketing Manager",
  MANAGER: "Manager"
};

export const ROLE_DASHBOARDS: Record<AppRole, string> = {
  ADMIN: "/admin/dashboard",
  AGENT: "/agent/dashboard",
  SALES_MANAGER: "/sales-manager/dashboard",
  MARKETING_MANAGER: "/marketing-manager/dashboard",
  MANAGER: "/manager/dashboard"
};

export const ROLE_ROUTE_PREFIXES: Record<AppRole, string> = {
  ADMIN: "/admin",
  AGENT: "/agent",
  SALES_MANAGER: "/sales-manager",
  MARKETING_MANAGER: "/marketing-manager",
  MANAGER: "/manager"
};

/**
 * Existing Admin pages shared with other roles.
 *
 * IMPORTANT: These are the same /admin/* route modules Admin uses (same components,
 * same React Query hooks, same src/services calls). Do not duplicate pages or
 * change API services for role access — only route allow-lists live here.
 * AGENT is included so Sales Agent can preview from their sidebar.
 */
const SHARED_ADMIN_ROUTE_ACCESS: Array<{ prefixes: string[]; roles: AppRole[] }> = [
  {
    prefixes: ["/admin/commission-management", "/admin/agent-performance"],
    roles: [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.MANAGER, ROLES.AGENT]
  },
  {
    prefixes: [
      "/admin/blog",
      "/admin/newsletter",
      "/admin/newsletter-subscribers",
      "/admin/carousel"
    ],
    roles: [ROLES.ADMIN, ROLES.MARKETING_MANAGER, ROLES.AGENT]
  },
  {
    prefixes: [
      "/admin/tax-management",
      "/admin/insurance-management",
      "/admin/platform-fee-management"
    ],
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_MANAGER, ROLES.AGENT]
  },
  {
    prefixes: [
      "/admin/drivers",
      "/admin/partners",
      "/admin/agents",
      "/admin/documents"
    ],
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT]
  },
  {
    prefixes: ["/admin/pool-rides", "/admin/rides"],
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT]
  },
  {
    prefixes: [
      "/admin/vehicle-types",
      "/admin/vehicle-models",
      "/admin/vehicle-colors",
      "/admin/vehicle-brands"
    ],
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT]
  }
];

export function getSharedAdminRolesForPath(pathname: string): AppRole[] | undefined {
  const match = SHARED_ADMIN_ROUTE_ACCESS.find(({ prefixes }) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
  return match?.roles;
}

/** Longest prefixes first so /marketing-manager is not treated as /manager. */
export const ROUTE_PREFIX_CHECKS: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/admin", roles: [ROLES.ADMIN] },
  { prefix: "/agent", roles: [ROLES.AGENT, ROLES.ADMIN] },
  { prefix: "/sales-manager", roles: [ROLES.SALES_MANAGER, ROLES.AGENT, ROLES.ADMIN] },
  { prefix: "/marketing-manager", roles: [ROLES.MARKETING_MANAGER, ROLES.AGENT, ROLES.ADMIN] },
  { prefix: "/manager", roles: [ROLES.MANAGER, ROLES.AGENT, ROLES.ADMIN] }
];

export function isAppRole(value: string): value is AppRole {
  return (Object.values(ROLES) as string[]).includes(value);
}

export function getAllowedRolesForPath(pathname: string): AppRole[] | undefined {
  const shared = getSharedAdminRolesForPath(pathname);
  if (shared) return shared;

  const match = ROUTE_PREFIX_CHECKS.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.roles;
}

export function getRolePrefixForPath(pathname: string): string | null {
  const match = ROUTE_PREFIX_CHECKS.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.prefix ?? null;
}
