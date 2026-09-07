import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { InsuranceListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  PercentageManagementFormValues,
  PercentageManagementStatus
} from "@/types/percentage-management";

/** Insurance record as returned by the backend (`/insurance/*`). */
export interface InsuranceApiRecord {
  id: number;
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

export interface InsuranceUpsertPayload {
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

interface InsuranceApiEnvelope {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

function assertSuccess(res: unknown): InsuranceApiEnvelope {
  const envelope = (res ?? {}) as InsuranceApiEnvelope;
  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed. Please try again.");
  }
  return envelope;
}

function parseInsuranceListResponse(res: unknown): PaginatedResponse<InsuranceApiRecord> {
  const envelope = assertSuccess(res);
  const payload =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};

  const content = Array.isArray(payload.content)
    ? (payload.content as InsuranceApiRecord[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchInsuranceList(
  filters: InsuranceListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<InsuranceApiRecord>> {
  const params = new URLSearchParams({
    page: String(Math.max(0, filters.page - 1)),
    size: String(filters.pageSize),
    search: filters.search.trim()
  });

  const url = `${apiUrl("/insurance/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "insurance:list"
  });
  return parseInsuranceListResponse(res);
}

export function buildInsurancePayload(
  values: PercentageManagementFormValues
): InsuranceUpsertPayload {
  return {
    name: values.name.trim(),
    percentage: values.percentage,
    status: values.status
  };
}

export async function createInsurance(
  payload: InsuranceUpsertPayload,
  token: string
): Promise<InsuranceApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl("/insurance/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "insurance:create"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as InsuranceApiRecord | undefined) ?? null;
}

export async function updateInsurance(
  id: number,
  payload: InsuranceUpsertPayload,
  token: string
): Promise<InsuranceApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/insurance/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "insurance:update"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as InsuranceApiRecord | undefined) ?? null;
}

export async function deleteInsurance(id: number, token: string): Promise<void> {
  const res = await fetcher<unknown>(apiUrl(`/insurance/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "insurance:delete"
  });
  assertSuccess(res);
}
