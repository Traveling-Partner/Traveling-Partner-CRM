import { Role } from "@/store/auth.store";

export const ADMIN_DASHBOARD_ROUTE = "/admin/dashboard";
export const AGENT_DASHBOARD_ROUTE = "/agent/dashboard";
export const LOGIN_ROUTE = "/login";

export function normalizeRole(role: string | null | undefined): Role {
  const r = String(role ?? "")
    .trim()
    .toUpperCase()
    .replace(/[-\s]/g, "_");

  if (r === "ADMIN") return "ADMIN";
  if (r === "AGENT" || r === "SALES_AGENT" || r === "SALESAGENT") return "AGENT";
  return r as Role;
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isAgentRoute(pathname: string): boolean {
  return pathname.startsWith("/agent");
}

export function getDefaultRouteForRole(role: Role): string {
  return normalizeRole(role) === "ADMIN"
    ? ADMIN_DASHBOARD_ROUTE
    : AGENT_DASHBOARD_ROUTE;
}

export function getRedirectForRoleOnProtectedRoute(
  role: Role,
  pathname: string
): string | null {
  const normalizedRole = normalizeRole(role);
  if (isAdminRoute(pathname) && normalizedRole === "AGENT") {
    return AGENT_DASHBOARD_ROUTE;
  }

  if (isAgentRoute(pathname) && normalizedRole === "ADMIN") {
    return ADMIN_DASHBOARD_ROUTE;
  }

  return null;
}

