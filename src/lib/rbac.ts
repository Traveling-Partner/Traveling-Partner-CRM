import {
  ROLES,
  ROLE_DASHBOARDS,
  ROLE_ROUTE_PREFIXES,
  isAppRole,
  getSharedAdminRolesForPath,
  type AppRole
} from "@/lib/roles";
import type { Role } from "@/store/slices/authSlice";

export const ADMIN_DASHBOARD_ROUTE = ROLE_DASHBOARDS.ADMIN;
export const AGENT_DASHBOARD_ROUTE = ROLE_DASHBOARDS.AGENT;
export const SALES_MANAGER_DASHBOARD_ROUTE = ROLE_DASHBOARDS.SALES_MANAGER;
export const MARKETING_MANAGER_DASHBOARD_ROUTE = ROLE_DASHBOARDS.MARKETING_MANAGER;
export const MANAGER_DASHBOARD_ROUTE = ROLE_DASHBOARDS.MANAGER;
export const LOGIN_ROUTE = "/login";

/**
 * Maps backend role strings to canonical frontend roles.
 * Existing ADMIN / AGENT aliases are preserved exactly.
 */
export function normalizeRole(role: string | null | undefined): Role {
  const r = String(role ?? "")
    .trim()
    .toUpperCase()
    .replace(/[-\s]/g, "_");

  if (r === "ADMIN") return ROLES.ADMIN;
  if (r === "AGENT" || r === "SALES_AGENT" || r === "SALESAGENT") return ROLES.AGENT;
  if (r === "SALES_MANAGER" || r === "SALESMANAGER") return ROLES.SALES_MANAGER;
  if (
    r === "MARKETING_MANAGER" ||
    r === "MARKETINGMANAGER" ||
    r === "MARKETING"
  ) {
    return ROLES.MARKETING_MANAGER;
  }
  if (r === "MANAGER" || r === "GENERAL_MANAGER") return ROLES.MANAGER;

  return r as Role;
}

export function toAppRole(role: Role | string | null | undefined): AppRole | null {
  const normalized = normalizeRole(role);
  return isAppRole(normalized) ? normalized : null;
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ROLE_ROUTE_PREFIXES.ADMIN);
}

export function isAgentRoute(pathname: string): boolean {
  return pathname.startsWith(ROLE_ROUTE_PREFIXES.AGENT);
}

export function isSalesManagerRoute(pathname: string): boolean {
  return pathname.startsWith(ROLE_ROUTE_PREFIXES.SALES_MANAGER);
}

export function isMarketingManagerRoute(pathname: string): boolean {
  return pathname.startsWith(ROLE_ROUTE_PREFIXES.MARKETING_MANAGER);
}

export function isManagerRoute(pathname: string): boolean {
  return (
    pathname.startsWith(ROLE_ROUTE_PREFIXES.MANAGER) &&
    !pathname.startsWith(ROLE_ROUTE_PREFIXES.MARKETING_MANAGER)
  );
}

export function getDefaultRouteForRole(role: Role): string {
  const appRole = toAppRole(role);
  if (appRole) return ROLE_DASHBOARDS[appRole];
  return AGENT_DASHBOARD_ROUTE;
}

function getRouteOwnerRole(pathname: string): AppRole | null {
  if (isAdminRoute(pathname)) return ROLES.ADMIN;
  if (isAgentRoute(pathname)) return ROLES.AGENT;
  if (isSalesManagerRoute(pathname)) return ROLES.SALES_MANAGER;
  if (isMarketingManagerRoute(pathname)) return ROLES.MARKETING_MANAGER;
  if (isManagerRoute(pathname)) return ROLES.MANAGER;
  return null;
}

/**
 * If the signed-in role does not own this route prefix, send them to their dashboard.
 * Admin may still open /agent routes (existing behavior).
 * Shared Admin pages (content / financial / users / commissions) are allowed for the roles that reuse them.
 */
export function getRedirectForRoleOnProtectedRoute(
  role: Role,
  pathname: string
): string | null {
  const normalizedRole = toAppRole(role);
  if (!normalizedRole) return null;

  // Shared existing Admin pages reused by other roles
  const sharedRoles = getSharedAdminRolesForPath(pathname);
  if (sharedRoles?.includes(normalizedRole)) {
    return null;
  }

  const owner = getRouteOwnerRole(pathname);
  if (!owner) return null;

  // Preserve existing Admin ↔ Agent exception
  if (owner === ROLES.ADMIN && normalizedRole === ROLES.AGENT) {
    return AGENT_DASHBOARD_ROUTE;
  }
  if (owner === ROLES.AGENT && normalizedRole === ROLES.ADMIN) {
    return null; // Admin allowed on agent routes (existing AppShell allows ADMIN)
  }

  if (owner === ROLES.AGENT && normalizedRole !== ROLES.AGENT && normalizedRole !== ROLES.ADMIN) {
    return ROLE_DASHBOARDS[normalizedRole];
  }

  if (owner !== normalizedRole && !(owner === ROLES.AGENT && normalizedRole === ROLES.ADMIN)) {
    return ROLE_DASHBOARDS[normalizedRole];
  }

  return null;
}
