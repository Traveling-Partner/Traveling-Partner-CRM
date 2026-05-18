"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type BlogListFilters } from "@/lib/api/query-keys";
import { fetchBlogList } from "@/services/blog-list";

export function useBlogListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<BlogListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.blog.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchBlogList(f, { token, signal })
  });
}
