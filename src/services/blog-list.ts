import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { BlogListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";

export interface BlogRow {
  id: number;
  coverImage?: string | null;
  mainTitle: string | null;
  description1?: string | null;
  description2?: string | null;
  date?: string | null;
  author?: string | null;
  readTime?: string | null;
  tags?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: string | null;
  categoryId?: number | null;
  categoryName?: string | string[] | null;
  faqs?: Array<{ id?: number; question?: string; answer?: string; sortOrder?: number }> | null;
  isFeatured?: boolean | null;
  views?: number | string | null;
  viewCount?: number | string | null;
}

function parseBlogListResponse(res: unknown): PaginatedResponse<BlogRow> {
  if (!res || typeof res !== "object") {
    return { content: [], totalPages: 1, totalElements: 0 };
  }
  const r = res as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  const content = Array.isArray(payload.content) ? (payload.content as BlogRow[]) : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

export async function fetchBlogList(
  filters: BlogListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<BlogRow>> {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.pageSize),
    search: filters.search.trim()
  });
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  const url = `${apiUrl("/blog/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "blog:list"
  });
  return parseBlogListResponse(res);
}
