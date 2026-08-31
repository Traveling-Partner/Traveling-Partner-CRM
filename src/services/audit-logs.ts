import { buildApiUrl } from "@/lib/api/endpoints";
import { fetcher } from "@/lib/fetcher";
import type { AuditLogsFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";

/** Audit log row from `GET /audit-logs/getAll`. */
export interface AuditLogRow {
  id: number;
  userType: string | null;
  description: string | null;
  createdAt: string;
  mobileNumber: string | null;
}

function toFromDateParam(dateOnly: string): string | undefined {
  const trimmed = dateOnly.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes("T")) return trimmed;
  return `${trimmed}T00:00:00`;
}

function parseAuditLogsResponse(res: unknown): PaginatedResponse<AuditLogRow> {
  if (!res || typeof res !== "object") {
    return { content: [], totalPages: 1, totalElements: 0 };
  }
  const r = res as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  const content = Array.isArray(payload.content)
    ? (payload.content as AuditLogRow[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchAuditLogs(
  filters: AuditLogsFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<AuditLogRow>> {
  const url = buildApiUrl("/audit-logs/getAll", {
    page: filters.page,
    size: filters.pageSize,
    userType: filters.userType !== "all" ? filters.userType : undefined,
    search: filters.search.trim() || undefined,
    fromDate: toFromDateParam(filters.fromDate)
  });

  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "audit-logs:list"
  });
  return parseAuditLogsResponse(res);
}
