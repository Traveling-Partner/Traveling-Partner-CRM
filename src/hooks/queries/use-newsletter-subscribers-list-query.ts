"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type NewsletterSubscribersListFilters } from "@/lib/api/query-keys";
import { fetchNewsletterSubscribersList } from "@/services/newsletter-subscribers";

export function useNewsletterSubscribersListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<NewsletterSubscribersListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.newsletter.subscribers(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchNewsletterSubscribersList(f, { token, signal })
  });
}
