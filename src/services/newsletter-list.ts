import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { NewsletterListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";

export interface NewsletterRow {
  id: number;
  message: string | null;
  attachedFile: string | null;
  userId: number | null;
  userName: string | null;
  userRole: string | null;
  status: string | null;
}

function parseNewsletterListResponse(res: unknown): PaginatedResponse<NewsletterRow> {
  if (!res || typeof res !== "object") {
    return { content: [], totalPages: 1, totalElements: 0 };
  }
  const r = res as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  const content = Array.isArray(payload.content)
    ? (payload.content as NewsletterRow[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchNewsletterList(
  filters: NewsletterListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<NewsletterRow>> {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.pageSize)
  });
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  const url = `${apiUrl("/newsletter/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "newsletter:list"
  });
  return parseNewsletterListResponse(res);
}
