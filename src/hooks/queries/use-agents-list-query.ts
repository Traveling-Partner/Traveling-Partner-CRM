"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type AgentsListFilters } from "@/lib/api/query-keys";
import { fetchAgentsList } from "@/services/users";

export function useAgentsListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
}) {
  const debouncedName = useDebouncedValue(params.name);
  const debouncedMobileNumber = useDebouncedValue(params.mobileNumber);
  const debouncedCity = useDebouncedValue(params.city);

  const filters = useMemo<AgentsListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      name: debouncedName,
      mobileNumber: debouncedMobileNumber,
      city: debouncedCity,
      gender: params.gender
    }),
    [
      params.page,
      params.pageSize,
      params.status,
      params.gender,
      debouncedName,
      debouncedMobileNumber,
      debouncedCity
    ]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.users.agents(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchAgentsList(f, { token, signal })
  });
}
