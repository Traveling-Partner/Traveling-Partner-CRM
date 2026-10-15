import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import { fetcher } from "@/lib/fetcher";

/**
 * Mirrors backend `com.travelpartner.permission.enums.PermissionModule`
 * exactly (32 values) - every section header and child in the Ops Portal
 * sidebar is independently permissionable. Keep in sync with the backend
 * enum; do not add/remove values here without confirming the backend side.
 */
export const PERMISSION_MODULES = [
  "DASHBOARD",
  "USER_MANAGEMENT",
  "DRIVER",
  "PARTNER",
  "SALES_AGENT",
  "MANAGERS_USERS",
  "DOCUMENT",
  "RIDE_MANAGEMENT",
  "RIDES",
  "SOS_MANAGEMENT",
  "SAFETY_CENTER",
  "SOS_OVERVIEW",
  "EMERGENCY_LIST",
  "COMMISSION_MANAGEMENT",
  "AGENT_PERFORMANCE",
  "CONTENT_MANAGEMENT",
  "BLOGS",
  "NEWSLETTER_LIST",
  "NEWSLETTER_SUBSCRIBER",
  "BANNER",
  "FINANCIAL_MANAGEMENT",
  "TAX",
  "COMMISSION",
  "INSURANCE",
  "PLATFORM_FEE",
  "VEHICLE_MANAGEMENT",
  "VEHICLE_TYPE",
  "VEHICLE_BRANDS",
  "VEHICLE_MODEL",
  "VEHICLE_MODEL_VARIANT",
  "ACCESS_MANAGEMENT",
  "AUDIT_LOGS"
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

/**
 * Mirrors backend `PermissionLevel` exactly, in the same declared order.
 * The backend's `PermissionAspect` compares levels by enum ordinal
 * (WRITE implies READ) - preserve this order if it's ever used for
 * comparison on this side too.
 */
export const PERMISSION_LEVELS = ["NONE", "READ", "WRITE"] as const;

export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export interface PermissionDto {
  module: string;
  level: string;
}

export interface RolePermissionsDto {
  role: string;
  permissions: PermissionDto[];
}

export interface RoleDto {
  id: number;
  name: string;
  slug: string;
}

export interface UpdateRolePermissionsRequest {
  role: string;
  permissions: PermissionDto[];
}

interface Envelope<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: T;
}

type RequestOpts = { token: string; signal?: AbortSignal };

function readOpts(opts: RequestOpts, label: string) {
  return { ...opts, dedupe: false as const, debugLabel: label };
}

/** GET /api/admin/permissions/roles - roles assignable via Access Management (admin only). */
export async function fetchAssignableRoles(opts: RequestOpts): Promise<RoleDto[]> {
  const response = await fetcher<Envelope<RoleDto[]>>(
    buildApiUrl("/admin/permissions/roles"),
    readOpts(opts, "permissions:roles")
  );
  return unwrapEnvelope<RoleDto[]>(response);
}

/** GET /api/admin/permissions/{role} - full permission matrix for one role (admin only). */
export async function fetchRolePermissions(
  role: string,
  opts: RequestOpts
): Promise<RolePermissionsDto> {
  const response = await fetcher<Envelope<RolePermissionsDto>>(
    buildApiUrl(`/admin/permissions/${encodeURIComponent(role)}`),
    readOpts(opts, "permissions:role-detail")
  );
  return unwrapEnvelope<RolePermissionsDto>(response);
}

/**
 * PUT /api/permission/role - saves a role's permission matrix (admin only).
 *
 * The backend only upserts the modules present in `payload.permissions`;
 * any module left out of the request keeps whatever level it already had
 * (it is not reset to NONE). Callers must always submit the complete
 * matrix - every `PERMISSION_MODULES` entry - to avoid silently losing
 * existing configuration for modules the UI didn't render a change for.
 */
export async function updateRolePermissions(
  payload: UpdateRolePermissionsRequest,
  opts: RequestOpts
): Promise<RolePermissionsDto> {
  const response = await fetcher<Envelope<RolePermissionsDto>>(buildApiUrl("/permission/role"), {
    ...readOpts(opts, "permissions:update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
  return unwrapEnvelope<RolePermissionsDto>(response);
}

/** GET /api/user/permission - the authenticated caller's own permissions (any authenticated role). */
export async function fetchMyPermissions(opts: RequestOpts): Promise<RolePermissionsDto> {
  const response = await fetcher<Envelope<RolePermissionsDto>>(
    buildApiUrl("/user/permission"),
    readOpts(opts, "permissions:mine")
  );
  return unwrapEnvelope<RolePermissionsDto>(response);
}
