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

/** Longest prefixes first so /marketing-manager is not treated as /manager. */
export const ROUTE_PREFIX_CHECKS: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/admin", roles: [ROLES.ADMIN] },
  { prefix: "/agent", roles: [ROLES.AGENT, ROLES.ADMIN] },
  { prefix: "/sales-manager", roles: [ROLES.SALES_MANAGER] },
  { prefix: "/marketing-manager", roles: [ROLES.MARKETING_MANAGER] },
  { prefix: "/manager", roles: [ROLES.MANAGER] }
];

export function isAppRole(value: string): value is AppRole {
  return (Object.values(ROLES) as string[]).includes(value);
}

export function getAllowedRolesForPath(pathname: string): AppRole[] | undefined {
  const match = ROUTE_PREFIX_CHECKS.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.roles;
}

export function getRolePrefixForPath(pathname: string): string | null {
  const match = ROUTE_PREFIX_CHECKS.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.prefix ?? null;
}
