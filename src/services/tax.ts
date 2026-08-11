import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { TaxListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  PercentageManagementFormValues,
  PercentageManagementStatus
} from "@/types/percentage-management";

/** Tax record as returned by the backend (`/tax/*`). */
export interface TaxApiRecord {
  id: number;
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

export interface TaxUpsertPayload {
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

interface TaxApiEnvelope {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

/** Backend may return HTTP 200 with `success: false` — surface its message. */
function assertSuccess(res: unknown): TaxApiEnvelope {
  const envelope = (res ?? {}) as TaxApiEnvelope;
  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed. Please try again.");
  }
  return envelope;
}

function parseTaxListResponse(res: unknown): PaginatedResponse<TaxApiRecord> {
  const envelope = assertSuccess(res);
  const payload =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};

  const content = Array.isArray(payload.content)
    ? (payload.content as TaxApiRecord[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchTaxList(
  filters: TaxListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<TaxApiRecord>> {
  const params = new URLSearchParams({
    // UI is 1-based, API is 0-based
    page: String(Math.max(0, filters.page - 1)),
    size: String(filters.pageSize),
    search: filters.search.trim()
  });

  const url = `${apiUrl("/tax/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "tax:list"
  });
  return parseTaxListResponse(res);
}

export function buildTaxPayload(values: PercentageManagementFormValues): TaxUpsertPayload {
  return {
    name: values.name.trim(),
    percentage: values.percentage,
    status: values.status
  };
}

export async function createTax(
  payload: TaxUpsertPayload,
  token: string
): Promise<TaxApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl("/tax/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "tax:create"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as TaxApiRecord | undefined) ?? null;
}

export async function updateTax(
  id: number,
  payload: TaxUpsertPayload,
  token: string
): Promise<TaxApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/tax/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "tax:update"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as TaxApiRecord | undefined) ?? null;
}

export async function deleteTax(id: number, token: string): Promise<void> {
  const res = await fetcher<unknown>(apiUrl(`/tax/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "tax:delete"
  });
  assertSuccess(res);
}
