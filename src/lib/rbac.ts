import { Role } from "@/store/auth.store";

export const ADMIN_DASHBOARD_ROUTE = "/admin/dashboard";
export const AGENT_DASHBOARD_ROUTE = "/agent/dashboard";
export const LOGIN_ROUTE = "/login";

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isAgentRoute(pathname: string): boolean {
  return pathname.startsWith("/agent");
}

export function getDefaultRouteForRole(role: Role): string {
  return role === "ADMIN" ? ADMIN_DASHBOARD_ROUTE : AGENT_DASHBOARD_ROUTE;
}

export function getRedirectForRoleOnProtectedRoute(
  role: Role,
  pathname: string
): string | null {
  if (isAdminRoute(pathname) && role === "AGENT") {
    return AGENT_DASHBOARD_ROUTE;
  }

  if (isAgentRoute(pathname) && role === "ADMIN") {
    return ADMIN_DASHBOARD_ROUTE;
  }

  return null;
}

