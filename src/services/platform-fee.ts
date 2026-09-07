import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { PlatformFeeListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  PercentageManagementFormValues,
  PercentageManagementStatus
} from "@/types/percentage-management";

/** Platform fee record as returned by the backend (`/platform-fee/*`). */
export interface PlatformFeeApiRecord {
  id: number;
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

export interface PlatformFeeUpsertPayload {
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

interface PlatformFeeApiEnvelope {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

/** Backend may return HTTP 200 with `success: false` — surface its message. */
function assertSuccess(res: unknown): PlatformFeeApiEnvelope {
  const envelope = (res ?? {}) as PlatformFeeApiEnvelope;
  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed. Please try again.");
  }
  return envelope;
}

function parsePlatformFeeListResponse(res: unknown): PaginatedResponse<PlatformFeeApiRecord> {
  const envelope = assertSuccess(res);
  const payload =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};

  const content = Array.isArray(payload.content)
    ? (payload.content as PlatformFeeApiRecord[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchPlatformFeeList(
  filters: PlatformFeeListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<PlatformFeeApiRecord>> {
  const params = new URLSearchParams({
    // UI is 1-based, API is 0-based
    page: String(Math.max(0, filters.page - 1)),
    size: String(filters.pageSize),
    search: filters.search.trim()
  });

  const url = `${apiUrl("/platform-fee/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "platform-fee:list"
  });
  return parsePlatformFeeListResponse(res);
}

export function buildPlatformFeePayload(
  values: PercentageManagementFormValues
): PlatformFeeUpsertPayload {
  return {
    name: values.name.trim(),
    percentage: values.percentage,
    status: values.status
  };
}

export async function createPlatformFee(
  payload: PlatformFeeUpsertPayload,
  token: string
): Promise<PlatformFeeApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl("/platform-fee/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "platform-fee:create"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as PlatformFeeApiRecord | undefined) ?? null;
}

export async function updatePlatformFee(
  id: number,
  payload: PlatformFeeUpsertPayload,
  token: string
): Promise<PlatformFeeApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/platform-fee/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "platform-fee:update"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as PlatformFeeApiRecord | undefined) ?? null;
}

export async function deletePlatformFee(id: number, token: string): Promise<void> {
  const res = await fetcher<unknown>(apiUrl(`/platform-fee/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "platform-fee:delete"
  });
  assertSuccess(res);
}
