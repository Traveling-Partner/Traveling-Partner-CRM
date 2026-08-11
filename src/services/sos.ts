import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { SosListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";

export type SosStatus = "ACTIVE" | "INACTIVE";

/** SOS helpline record as returned by the backend (`/sos/*`). */
export interface SosApiRecord {
  id: number;
  name: string;
  number: string;
  state: string;
  status: SosStatus;
}

export interface SosUpsertPayload {
  name: string;
  number: string;
  state: string;
  status: SosStatus;
}

interface SosApiEnvelope {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

/** Backend can return `success: false` with a message (e.g. "SOS not found"). */
function assertSuccess(res: unknown): SosApiEnvelope {
  const envelope = (res ?? {}) as SosApiEnvelope;
  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed. Please try again.");
  }
  return envelope;
}

function parseSosListResponse(res: unknown): PaginatedResponse<SosApiRecord> {
  const envelope = assertSuccess(res);
  const payload =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};

  const content = Array.isArray(payload.content)
    ? (payload.content as SosApiRecord[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchSosList(
  filters: SosListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<SosApiRecord>> {
  const params = new URLSearchParams({
    // UI is 1-based, API is 0-based
    page: String(Math.max(0, filters.page - 1)),
    size: String(filters.pageSize),
    search: filters.search.trim()
  });

  const url = `${apiUrl("/sos/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "sos:list"
  });
  return parseSosListResponse(res);
}

export async function createSos(
  payload: SosUpsertPayload,
  token: string
): Promise<SosApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl("/sos/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "sos:create"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as SosApiRecord | undefined) ?? null;
}

export async function updateSos(
  id: number,
  payload: SosUpsertPayload,
  token: string
): Promise<SosApiRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/sos/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "sos:update"
  });
  const envelope = assertSuccess(res);
  return (envelope.data as SosApiRecord | undefined) ?? null;
}

export async function deleteSos(id: number, token: string): Promise<void> {
  const res = await fetcher<unknown>(apiUrl(`/sos/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "sos:delete"
  });
  assertSuccess(res);
}
