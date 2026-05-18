"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type PartnersListFilters } from "@/lib/api/query-keys";
import { fetchPartnersList } from "@/services/users";

export function usePartnersListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<PartnersListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.users.partners(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchPartnersList(f, { token, signal })
  });
}
