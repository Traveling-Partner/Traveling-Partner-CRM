import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { CommissionListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  PercentageManagementFormValues,
  PercentageManagementStatus
} from "@/types/percentage-management";

/** Commission record as returned by the backend (`/commission/*`). */
export interface CommissionApiRecord {
  id: number;
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

export interface CommissionUpsertPayload {
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

interface CommissionApiEnvelope {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

function assertSuccess(res: unknown): CommissionApiEnvelope {
  const envelope = (res ?? {}) as CommissionApiEnvelope;
  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed. Please try again.");
  }
  return envelope;
}

function parseCommissionListResponse(res: unknown): PaginatedResponse<CommissionApiRecord> {
  const envelope = assertSuccess(res);
  const payload =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};

  const content = Array.isArray(payload.content)
    ? (payload.content as CommissionApiRecord[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchCommissionList(
  filters: CommissionListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<CommissionApiRecord>> {
  const params = new URLSearchParams({
    page: String(Math.max(0, filters.page - 1)),
    size: String(filters.pageSize),
    search: filters.search.trim()
  });

  const url = `${apiUrl("/commission/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "commission:list"
  });
  return parseCommissionListResponse(res);
}

export function buildCommissionPayload(
  values: PercentageManagementFormValues
): CommissionUpsertPayload {
  return {
    name: values.name.trim(),
    percentage: values.percentage,
    status: values.status
  };
}

export async function createCommission(
  payload: CommissionUpsertPayload,
  token: string
): Promise<CommissionApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl("/commission/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "commission:create"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as CommissionApiRecord | undefined) ?? null;
}

export async function updateCommission(
  id: number,
  payload: CommissionUpsertPayload,
  token: string
): Promise<CommissionApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/commission/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "commission:update"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as CommissionApiRecord | undefined) ?? null;
}

export async function deleteCommission(id: number, token: string): Promise<void> {
  const res = await fetcher<unknown>(apiUrl(`/commission/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "commission:delete"
  });
  assertSuccess(res);
}
