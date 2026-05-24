"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type NewsletterListFilters } from "@/lib/api/query-keys";
import { fetchNewsletterList } from "@/services/newsletter-list";

export function useNewsletterListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<NewsletterListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.newsletter.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchNewsletterList(f, { token, signal })
  });
}
