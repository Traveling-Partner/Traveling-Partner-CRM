import {
  adminNav,
  agentNav,
  getNavForRole,
  isSidebarGroup,
  isSidebarSection,
  type SidebarEntry
} from "@/config/navigation";
import { normalizeRole } from "@/lib/rbac";
import { ROLES, stripRolePrefix } from "@/lib/roles";
import type { PermissionLevel, RolePermissionsData } from "@/services/permissions";

/** Longest path first so `/emergency-services-list` is not treated as `/sos`. */
const MODULE_PATHS: Array<{ path: string; modules: string[] }> = [
  { path: "/emergency-services-list", modules: ["EMERGENCY_LIST"] },
  { path: "/safety/services", modules: ["EMERGENCY_LIST"] },
  { path: "/newsletter-subscribers-list", modules: ["NEWSLETTER_SUBSCRIBER"] },
  { path: "/newsletter-subscribers", modules: ["NEWSLETTER_SUBSCRIBER"] },
  { path: "/vehicle-model-variants-list", modules: ["VEHICLE_MODEL_VARIANT"] },
  { path: "/vehicle-model-variants", modules: ["VEHICLE_MODEL_VARIANT"] },
  { path: "/access-management", modules: ["ACCESS_MANAGEMENT"] },
  { path: "/agent-performance", modules: ["AGENT_PERFORMANCE"] },
  { path: "/app-commission-list", modules: ["COMMISSION", "COMMISSION_MANAGEMENT"] },
  { path: "/commission-management", modules: ["COMMISSION", "COMMISSION_MANAGEMENT"] },
  { path: "/insurance-management-list", modules: ["INSURANCE"] },
  { path: "/insurance-management", modules: ["INSURANCE"] },
  { path: "/platform-fee-list", modules: ["PLATFORM_FEE"] },
  { path: "/platform-fee-management", modules: ["PLATFORM_FEE"] },
  { path: "/sales-tax-list", modules: ["TAX"] },
  { path: "/tax-management", modules: ["TAX"] },
  { path: "/vehicle-brands-list", modules: ["VEHICLE_BRANDS"] },
  { path: "/vehicle-brands", modules: ["VEHICLE_BRANDS"] },
  { path: "/vehicle-models-list", modules: ["VEHICLE_MODEL"] },
  { path: "/vehicle-models", modules: ["VEHICLE_MODEL"] },
  { path: "/vehicle-types-list", modules: ["VEHICLE_TYPE"] },
  { path: "/vehicle-types", modules: ["VEHICLE_TYPE"] },
  { path: "/newsletter-list", modules: ["NEWSLETTER_LIST"] },
  { path: "/newsletter", modules: ["NEWSLETTER_LIST"] },
  { path: "/documents", modules: ["DOCUMENT"] },
  { path: "/partners", modules: ["PARTNER"] },
  { path: "/drivers", modules: ["DRIVER"] },
  { path: "/employees-list", modules: ["MANAGERS_USERS"] },
  { path: "/agents", modules: ["MANAGERS_USERS"] },
  { path: "/app-banner-list", modules: ["BANNER"] },
  { path: "/carousel", modules: ["BANNER"] },
  { path: "/sos", modules: ["SOS_OVERVIEW", "SAFETY_CENTER"] },
  { path: "/safety", modules: ["SOS_OVERVIEW", "SAFETY_CENTER"] },
  { path: "/blog-list", modules: ["BLOGS"] },
  { path: "/blogs", modules: ["BLOGS"] },
  { path: "/admin/blog", modules: ["BLOGS"] },
  { path: "/rides", modules: ["RIDES"] },
  { path: "/dashboard", modules: ["DASHBOARD"] },
  { path: "/audit-logs-list", modules: ["AUDIT_LOGS"] },
  { path: "/audit-logs", modules: ["AUDIT_LOGS"] }
];

export type PagePermissionGate = {
  allowed: ReadonlySet<string>;
  levels: ReadonlyMap<string, PermissionLevel>;
};

export const EMPTY_PAGE_GATE: PagePermissionGate = {
  allowed: new Set(),
  levels: new Map()
};

export function toPagePermissionGate(
  data: RolePermissionsData | undefined
): PagePermissionGate {
  const levels = new Map<string, PermissionLevel>();
  const allowed = new Set<string>();
  for (const entry of data?.permissions ?? []) {
    levels.set(entry.module, entry.level);
    if (entry.level !== "NONE") allowed.add(entry.module);
  }
  return { allowed, levels };
}

/**
 * Paths with no corresponding permission module - visible to admin only
 * (admin has no permission gate). /audit-logs used to live here, but the
 * backend now enforces @RequirePermission(AUDIT_LOGS, READ) on it, so it
 * is mapped through MODULE_PATHS above instead.
 */
const ADMIN_ONLY_PATHS: string[] = [];

function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function modulesForPath(pathname: string): string[] {
  const path = stripRolePrefix(pathname);
  const match = MODULE_PATHS.find(({ path: prefix }) => matchesPath(path, prefix) || matchesPath(pathname, prefix));
  return match?.modules ?? [];
}

function isAdminOnlyPath(pathname: string): boolean {
  const path = stripRolePrefix(pathname);
  return ADMIN_ONLY_PATHS.some((prefix) => matchesPath(path, prefix) || matchesPath(pathname, prefix));
}

export function getLevelForPath(
  pathname: string,
  gate: PagePermissionGate | null
): PermissionLevel | null {
  if (!gate) return null;
  const modules = modulesForPath(pathname);
  if (!modules.length) return null;
  let best: PermissionLevel = "NONE";
  for (const module of modules) {
    const level = gate.levels.get(module) ?? "NONE";
    if (level === "WRITE") return "WRITE";
    if (level === "READ") best = "READ";
  }
  return best;
}

/** Mapped admin pages must be READ or WRITE. Unmentioned modules are hidden. */
export function isHrefAllowed(href: string, gate: PagePermissionGate | null): boolean {
  if (!gate) return true;
  if (isAdminOnlyPath(href)) return false;
  const modules = modulesForPath(href);
  if (!modules.length) return true;
  return modules.some((module) => gate.allowed.has(module));
}

export function isMutationPath(pathname: string): boolean {
  return /\/(create|edit)(\/|$)/.test(pathname);
}

export function navForPermissions(
  role: string | null | undefined,
  gate: PagePermissionGate | null
): SidebarEntry[] {
  const appRole = normalizeRole(role);
  if (appRole === ROLES.AGENT) {
    if (!gate) return agentNav;
    const extras = filterNavByPermissions(adminNav, gate).filter((entry) => {
      if (isSidebarGroup(entry) || isSidebarSection(entry)) return true;
      return entry.href !== "/dashboard";
    });
    return extras.length ? [...agentNav, ...extras] : agentNav;
  }
  return gate ? adminNav : getNavForRole(appRole);
}

export function filterNavByPermissions(
  entries: SidebarEntry[],
  gate: PagePermissionGate | null
): SidebarEntry[] {
  if (!gate) return entries;
  const next: SidebarEntry[] = [];
  for (const entry of entries) {
    if (isSidebarSection(entry)) {
      next.push(entry);
      continue;
    }
    if (isSidebarGroup(entry)) {
      const items = entry.items.filter((item) => isHrefAllowed(item.href, gate));
      if (items.length) next.push({ ...entry, items });
      continue;
    }
    if (isHrefAllowed(entry.href, gate)) next.push(entry);
  }
  return next.filter((entry, index, list) => {
    if (!isSidebarSection(entry)) return true;
    return list.slice(index + 1).some((item) => !isSidebarSection(item));
  });
}

export function firstAllowedHref(
  role: string | null | undefined,
  gate: PagePermissionGate | null
): string | null {
  if (normalizeRole(role) === ROLES.AGENT) return "/dashboard";
  const walk = (entries: SidebarEntry[]): string | null => {
    for (const entry of entries) {
      if (isSidebarSection(entry)) continue;
      if (isSidebarGroup(entry)) {
        const href = entry.items.find((item) => isHrefAllowed(item.href, gate))?.href;
        if (href) return href;
        continue;
      }
      if (isHrefAllowed(entry.href, gate)) return entry.href;
    }
    return null;
  };
  return walk(filterNavByPermissions(navForPermissions(role, gate), gate));
}
