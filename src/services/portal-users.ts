import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { PaginatedResponse } from "@/lib/api/types";

/** Roles accepted by portal-users create/update. No extra roles API. */
export const PORTAL_USER_ROLES = [
  "SALES_AGENT",
  "FINANCE_MANAGER",
  "MARKETING_MANAGER",
  "MANAGER",
  "ADMIN"
] as const;

export type PortalUserRole = (typeof PORTAL_USER_ROLES)[number];

export interface PortalUser {
  id: number;
  email: string | null;
  name: string | null;
  mobileNumber: string | null;
  status: string | null;
  platform?: string | null;
  roles: string[];
  referralCode?: string | null;
  city: string | null;
  gender: string | null;
  cnicNumber: string | null;
  cnicFront: string | null;
  cnicBack: string | null;
}

export interface PortalUsersListFilters {
  page: number;
  pageSize: number;
  search: string;
  role: string;
}

export interface PortalUserCreatePayload {
  email: string;
  mobileNumber: string;
  password: string;
  name: string;
  role: string;
  city: string;
  gender: string;
  cnicNumber: string;
  cnicFront: string;
  cnicBack: string;
}

export interface PortalUserUpdatePayload {
  email?: string;
  mobileNumber?: string;
  name?: string;
  role?: string;
  city?: string;
  gender?: string;
  cnicNumber?: string;
  cnicFront?: string;
  cnicBack?: string;
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

export function formatPortalRole(role: string): string {
  return role
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function primaryRole(user: PortalUser): string {
  return user.roles[0] ?? "";
}

function parsePortalUser(value: unknown): PortalUser | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "number") return null;
  const roles = Array.isArray(row.roles)
    ? row.roles.filter((item): item is string => typeof item === "string")
    : typeof row.role === "string"
      ? [row.role]
      : [];
  return {
    id: row.id,
    email: typeof row.email === "string" ? row.email : null,
    name: typeof row.name === "string" ? row.name : null,
    mobileNumber: typeof row.mobileNumber === "string" ? row.mobileNumber : null,
    status: typeof row.status === "string" ? row.status : null,
    platform: typeof row.platform === "string" ? row.platform : null,
    roles,
    referralCode: typeof row.referralCode === "string" ? row.referralCode : null,
    city: typeof row.city === "string" ? row.city : null,
    gender: typeof row.gender === "string" ? row.gender : null,
    cnicNumber: typeof row.cnicNumber === "string" ? row.cnicNumber : null,
    cnicFront: typeof row.cnicFront === "string" ? row.cnicFront : null,
    cnicBack: typeof row.cnicBack === "string" ? row.cnicBack : null
  };
}

function parsePortalUserPage(res: unknown): PaginatedResponse<PortalUser> {
  const envelope = assertSuccess(res);
  const payload =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  const content = Array.isArray(payload.content)
    ? payload.content
        .map(parsePortalUser)
        .filter((row): row is PortalUser => row !== null)
    : [];
  return {
    content,
    totalPages: typeof payload.totalPages === "number" ? Math.max(1, payload.totalPages) : 1,
    totalElements: typeof payload.totalElements === "number" ? payload.totalElements : content.length,
    number: typeof payload.number === "number" ? payload.number : 1
  };
}

/** GET /api/admin/portal-users/getAll — omit empty role/search. */
export async function fetchPortalUsersList(
  filters: PortalUsersListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<PortalUser>> {
  const params = new URLSearchParams({
    page: String(Math.max(1, filters.page)),
    size: String(filters.pageSize)
  });
  const search = filters.search.trim();
  if (search) params.set("search", search);
  if (filters.role && filters.role !== "all") params.set("role", filters.role);

  const res = await fetcher<unknown>(
    `${apiUrl("/admin/portal-users/getAll")}?${params.toString()}`,
    {
      token: opts.token,
      signal: opts.signal,
      debugLabel: "portal-users:list"
    }
  );
  return parsePortalUserPage(res);
}

export async function fetchPortalUserById(
  id: string | number,
  opts: { token: string; signal?: AbortSignal }
): Promise<PortalUser> {
  const res = await fetcher<unknown>(apiUrl(`/admin/portal-users/getById/${id}`), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "portal-users:detail"
  });
  const user = parsePortalUser(assertSuccess(res).data);
  if (!user) throw new Error("Portal user not found");
  return user;
}

export async function createPortalUser(
  payload: PortalUserCreatePayload,
  token: string
): Promise<PortalUser> {
  const res = await fetcher<unknown>(apiUrl("/admin/portal-users/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "portal-users:create"
  });
  const user = parsePortalUser(assertSuccess(res).data);
  if (!user) throw new Error("Portal user created but response was empty.");
  return user;
}

export async function updatePortalUser(
  id: string | number,
  payload: PortalUserUpdatePayload,
  token: string
): Promise<PortalUser> {
  const res = await fetcher<unknown>(apiUrl(`/admin/portal-users/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "portal-users:update"
  });
  const user = parsePortalUser(assertSuccess(res).data);
  if (!user) throw new Error("Portal user updated but response was empty.");
  return user;
}

export async function deletePortalUser(id: string | number, token: string): Promise<void> {
  const res = await fetcher<unknown>(apiUrl(`/admin/portal-users/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "portal-users:delete"
  });
  assertSuccess(res);
}
