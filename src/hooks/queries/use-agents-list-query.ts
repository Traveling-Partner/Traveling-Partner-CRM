"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type AgentsListFilters } from "@/lib/api/query-keys";
import { fetchAgentsList } from "@/services/users";

export function useAgentsListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<AgentsListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.users.agents(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchAgentsList(f, { token, signal })
  });
}
