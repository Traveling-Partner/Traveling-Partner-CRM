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
    .replace(/^ROLE_/, "")
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
  if (r === "FINANCE_MANAGER" || r === "FINANCEMANAGER" || r === "FINANCE") {
    return ROLES.FINANCE_MANAGER;
  }
  if (r === "SAFETY_INCIDENT_OFFICER" || r === "SAFETYINCIDENTOFFICER") {
    return ROLES.SAFETY_INCIDENT_OFFICER;
  }
  if (
    r === "COMPLIANCE_VERIFICATION_OFFICER" ||
    r === "COMPLIANCEVERIFICATIONOFFICER"
  ) {
    return ROLES.COMPLIANCE_VERIFICATION_OFFICER;
  }

  return r as Role;
}

/** Prefer the assigned employee role over a generic AGENT/SALES_AGENT claim. */
const SPECIFIC_PORTAL_ROLES: AppRole[] = [
  ROLES.MANAGER,
  ROLES.FINANCE_MANAGER,
  ROLES.MARKETING_MANAGER,
  ROLES.SALES_MANAGER,
  ROLES.SAFETY_INCIDENT_OFFICER,
  ROLES.COMPLIANCE_VERIFICATION_OFFICER
];

const APP_USER_ROLES = new Set(["DRIVER", "PARTNER", "USER"]);

export function pickResolvedRole(
  candidates: Array<string | null | undefined>
): Role {
  const unique = [
    ...new Set(candidates.map((value) => normalizeRole(value)).filter(Boolean))
  ];
  const portal = unique.filter((role) => !APP_USER_ROLES.has(role));
  const pool = portal.length ? portal : unique;
  if (!pool.length) return "";
  for (const role of SPECIFIC_PORTAL_ROLES) {
    if (pool.includes(role)) return role;
  }
  if (pool.includes(ROLES.ADMIN)) return ROLES.ADMIN;
  if (pool.includes(ROLES.AGENT)) return ROLES.AGENT;
  return pool[0];
}

export function rolesFromUnknown(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  const roles: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      roles.push(item.trim());
      continue;
    }
    if (item && typeof item === "object") {
      const authority = (item as { authority?: unknown }).authority;
      if (typeof authority === "string" && authority.trim()) {
        roles.push(authority.trim());
      }
    }
  }
  return roles;
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
  if (appRole === ROLES.AGENT) return AGENT_DASHBOARD_ROUTE;
  if (appRole) return ROLE_DASHBOARDS[appRole];
  // New portal employee roles use assigned admin pages, not the agent workspace.
  return ADMIN_DASHBOARD_ROUTE;
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

  // Portal employees use assigned /admin pages — not the old role workspaces.
  if (
    (normalizedRole === ROLES.FINANCE_MANAGER ||
      normalizedRole === ROLES.MARKETING_MANAGER ||
      normalizedRole === ROLES.MANAGER ||
      normalizedRole === ROLES.SAFETY_INCIDENT_OFFICER ||
      normalizedRole === ROLES.COMPLIANCE_VERIFICATION_OFFICER) &&
    isAdminRoute(pathname)
  ) {
    return null;
  }

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
