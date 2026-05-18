"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type DriversListFilters } from "@/lib/api/query-keys";
import { fetchDriversList } from "@/services/users";

export function useDriversListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<DriversListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.users.drivers(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchDriversList(f, { token, signal })
  });
}
