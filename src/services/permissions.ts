import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";

/** Levels from GET/PUT permission APIs — not Read/Write. */
export type PermissionLevel = "READ" | "WRITE" | "NONE";

export interface PermissionRole {
  id: number;
  name: string;
  slug: string;
}

export interface PermissionEntry {
  module: string;
  level: PermissionLevel;
}

export interface RolePermissionsData {
  role: string;
  permissions: PermissionEntry[];
}

/** PUT /api/permission/role body — field names match the backend contract. */
export interface RolePermissionsUpdatePayload {
  role: string;
  permissions: PermissionEntry[];
}

interface ApiEnvelope {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

function assertSuccess(res: unknown): ApiEnvelope {
  const envelope = (res ?? {}) as ApiEnvelope;
  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed. Please try again.");
  }
  return envelope;
}

function parseLevel(value: unknown): PermissionLevel {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (raw === "READ" || raw === "WRITE" || raw === "NONE") return raw;
  return "NONE";
}

function parsePermissionEntry(value: unknown): PermissionEntry | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const module = typeof row.module === "string" ? row.module.trim() : "";
  if (!module) return null;
  return { module, level: parseLevel(row.level) };
}

function parseRole(value: unknown): PermissionRole | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "number" || typeof row.name !== "string" || !row.name.trim()) {
    return null;
  }
  return {
    id: row.id,
    name: row.name.trim(),
    slug: typeof row.slug === "string" && row.slug.trim() ? row.slug.trim() : row.name.trim()
  };
}

function parseRolePermissions(value: unknown): RolePermissionsData {
  const payload =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions
        .map(parsePermissionEntry)
        .filter((entry): entry is PermissionEntry => entry !== null)
    : [];
  return {
    role: typeof payload.role === "string" ? payload.role : "",
    permissions
  };
}

/** GET /api/admin/permissions/roles — `data` is the roles array. */
export async function fetchPermissionRoles(opts: {
  token: string;
  signal?: AbortSignal;
}): Promise<PermissionRole[]> {
  const res = await fetcher<unknown>(apiUrl("/admin/permissions/roles"), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "permissions:roles"
  });
  const envelope = assertSuccess(res);
  if (!Array.isArray(envelope.data)) return [];
  return envelope.data
    .map(parseRole)
    .filter((role): role is PermissionRole => role !== null);
}

/**
 * GET /api/admin/permissions/{role}
 * Path param is the role name string (e.g. MANAGER), not a numeric id.
 */
export async function fetchRolePermissions(
  role: string,
  opts: { token: string; signal?: AbortSignal }
): Promise<RolePermissionsData> {
  const path = `/admin/permissions/${encodeURIComponent(role)}`;
  const res = await fetcher<unknown>(apiUrl(path), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "permissions:by-role"
  });
  const envelope = assertSuccess(res);
  return parseRolePermissions(envelope.data);
}

/**
 * PUT /api/permission/role
 * Body: `{ role, permissions: [{ module, level }] }`
 * `data` is `{ role, permissions }` (full module list).
 */
export async function updateRolePermissions(
  payload: RolePermissionsUpdatePayload,
  token: string
): Promise<RolePermissionsData> {
  const res = await fetcher<unknown>(apiUrl("/permission/role"), {
    method: "PUT",
    token,
    body: JSON.stringify({
      role: payload.role,
      permissions: payload.permissions.map((entry) => ({
        module: entry.module,
        level: entry.level
      }))
    }),
    debugLabel: "permissions:update"
  });
  const envelope = assertSuccess(res);
  return parseRolePermissions(envelope.data);
}
