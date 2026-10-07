import {
  adminNav,
  getNavForRole,
  isSidebarGroup,
  isSidebarSection,
  type SidebarEntry
} from "@/config/navigation";
import { normalizeRole } from "@/lib/rbac";
import type { PermissionLevel, RolePermissionsData } from "@/services/permissions";

/** Longest path first so `/admin/safety/services` is not treated as `/admin/safety`. */
const MODULE_PATHS: Array<{ path: string; modules: string[] }> = [
  { path: "/admin/safety/services", modules: ["EMERGENCY_LIST"] },
  { path: "/admin/newsletter-subscribers", modules: ["NEWSLETTER_SUBSCRIBERS"] },
  { path: "/admin/vehicle-model-variants", modules: ["VEHICLE_MODEL_VARIANT"] },
  { path: "/admin/access-management", modules: ["ACCESS_MANAGEMENT"] },
  { path: "/admin/audit-logs", modules: ["AUDIT_LOGS"] },
  { path: "/admin/agent-performance", modules: ["AGENT_PERFORMANCE"] },
  { path: "/admin/commission-management", modules: ["COMMISSION", "COMMISSION_MANAGEMENT"] },
  { path: "/admin/insurance-management", modules: ["INSURANCE"] },
  { path: "/admin/platform-fee-management", modules: ["PLATFORM_FEE"] },
  { path: "/admin/tax-management", modules: ["TAX"] },
  { path: "/admin/vehicle-brands", modules: ["VEHICLE_BRANDS"] },
  { path: "/admin/vehicle-models", modules: ["VEHICLE_MODEL"] },
  { path: "/admin/vehicle-types", modules: ["VEHICLE_TYPE"] },
  { path: "/admin/newsletter", modules: ["NEWSLETTER_LIST"] },
  { path: "/admin/documents", modules: ["DOCUMENT"] },
  { path: "/admin/partners", modules: ["PARTNER"] },
  { path: "/admin/drivers", modules: ["DRIVER"] },
  { path: "/admin/agents", modules: ["EMPLOYEES_LIST"] },
  { path: "/admin/carousel", modules: ["CAROUSEL"] },
  { path: "/admin/safety", modules: ["SOS_OVERVIEW", "SAFETY_CENTER"] },
  { path: "/admin/blog", modules: ["BLOGS"] },
  { path: "/admin/rides", modules: ["RIDES"] },
  { path: "/admin/dashboard", modules: ["DASHBOARD"] }
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

function modulesForPath(pathname: string): string[] {
  const match = MODULE_PATHS.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`)
  );
  return match?.modules ?? [];
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
  return gate ? adminNav : getNavForRole(normalizeRole(role));
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
