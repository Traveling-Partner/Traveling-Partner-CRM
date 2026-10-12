"use client";

import { useMemo } from "react";
import { useApiQuery, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import {
  queryKeys,
  type SalesAgentCommissionFilters,
  type SalesAgentListFilters
} from "@/lib/api/query-keys";
import {
  fetchSalesAgentCommissions,
  fetchSalesAgentDrivers,
  fetchSalesAgentOverview,
  fetchSalesAgentPartners,
  fetchSalesAgentProfile,
  type SalesAgentOverview,
  type SalesAgentProfile
} from "@/services/sales-agent";

export function useSalesAgentOverviewQuery() {
  return useApiQuery<SalesAgentOverview>({
    queryKey: queryKeys.salesAgent.overview(),
    queryFn: ({ token, signal }) => fetchSalesAgentOverview({ token, signal })
  });
}

export function useSalesAgentProfileQuery() {
  return useApiQuery<SalesAgentProfile>({
    queryKey: queryKeys.salesAgent.profile(),
    queryFn: ({ token, signal }) => fetchSalesAgentProfile({ token, signal })
  });
}

export function useSalesAgentDriversQuery(params: {
  page: number;
  pageSize: number;
  search: string;
  enabled?: boolean;
}) {
  const search = useDebouncedValue(params.search);
  const filters = useMemo<SalesAgentListFilters>(
    () => ({ page: params.page, pageSize: params.pageSize, search }),
    [params.page, params.pageSize, search]
  );
  return usePaginatedQuery({
    queryKey: queryKeys.salesAgent.drivers(filters),
    filters,
    enabled: params.enabled,
    fetchPage: ({ token, signal, filters: next }) =>
      fetchSalesAgentDrivers(next, { token, signal })
  });
}

export function useSalesAgentPartnersQuery(params: {
  page: number;
  pageSize: number;
  search: string;
  enabled?: boolean;
}) {
  const search = useDebouncedValue(params.search);
  const filters = useMemo<SalesAgentListFilters>(
    () => ({ page: params.page, pageSize: params.pageSize, search }),
    [params.page, params.pageSize, search]
  );
  return usePaginatedQuery({
    queryKey: queryKeys.salesAgent.partners(filters),
    filters,
    enabled: params.enabled,
    fetchPage: ({ token, signal, filters: next }) =>
      fetchSalesAgentPartners(next, { token, signal })
  });
}

export function useSalesAgentCommissionsQuery(params: {
  page: number;
  pageSize: number;
  filter: string;
}) {
  const filters = useMemo<SalesAgentCommissionFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      filter: params.filter
    }),
    [params.page, params.pageSize, params.filter]
  );
  return usePaginatedQuery({
    queryKey: queryKeys.salesAgent.commissions(filters),
    filters,
    fetchPage: ({ token, signal, filters: next }) =>
      fetchSalesAgentCommissions(next, { token, signal })
  });
}
