/**
 * Module names accepted by PUT /api/permission/role.
 * Audit Logs is admin-only and is not a permission module.
 */
export const PERMISSION_MODULES = [
  "DASHBOARD",
  "USER_MANAGEMENT",
  "DRIVER",
  "PARTNER",
  "MANAGERS_USERS",
  "DOCUMENT",
  "SOS_MANAGEMENT",
  "RIDES",
  "SAFETY_CENTER",
  "SOS_OVERVIEW",
  "EMERGENCY_LIST",
  "COMMISSION_MANAGEMENT",
  "AGENT_PERFORMANCE",
  "BLOGS",
  "NEWSLETTER_LIST",
  "NEWSLETTER_SUBSCRIBER",
  "BANNER",
  "TAX",
  "COMMISSION",
  "INSURANCE",
  "PLATFORM_FEE",
  "VEHICLE_TYPE",
  "VEHICLE_BRANDS",
  "VEHICLE_MODEL",
  "VEHICLE_MODEL_VARIANT",
  "ACCESS_MANAGEMENT"
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

const CANONICAL_MODULES = new Set<string>(PERMISSION_MODULES);

/** Older portal names. Rewritten on read so they are never sent back. */
const LEGACY_MODULE_ALIASES: Record<string, PermissionModule> = {
  EMPLOYEES_LIST: "MANAGERS_USERS",
  NEWSLETTER_SUBSCRIBERS: "NEWSLETTER_SUBSCRIBER",
  CAROUSEL: "BANNER"
};

function levelRank(level: string): number {
  if (level === "WRITE") return 2;
  if (level === "READ") return 1;
  return 0;
}

export function canonicalPermissionModule(module: string): PermissionModule | null {
  const raw = module.trim();
  if (!raw || raw === "AUDIT_LOGS") return null;
  const name = LEGACY_MODULE_ALIASES[raw] ?? raw;
  return CANONICAL_MODULES.has(name) ? (name as PermissionModule) : null;
}

export function canonicalPermissionList<T extends { module: string; level: string }>(
  entries: T[]
): Array<{ module: PermissionModule; level: T["level"] }> {
  const byModule = new Map<PermissionModule, T["level"]>();
  for (const entry of entries) {
    const module = canonicalPermissionModule(entry.module);
    if (!module) continue;
    const current = byModule.get(module);
    if (current === undefined || levelRank(entry.level) > levelRank(current)) {
      byModule.set(module, entry.level);
    }
  }
  return [...byModule.entries()].map(([module, level]) => ({ module, level }));
}
