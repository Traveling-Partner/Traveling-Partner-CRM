"use client";

import { useApiQuery } from "@/hooks/api";
import {
  DASHBOARD_REFETCH_INTERVAL_MS,
  DASHBOARD_STALE_TIME_MS
} from "@/lib/api/query-config";
import { queryKeys } from "@/lib/api/query-keys";
import {
  EMPTY_ADMIN_DASHBOARD_DATA,
  fetchAdminDashboardData,
  type AdminDashboardData
} from "@/services/admin-dashboard";

export function useAdminDashboardQuery() {
  const query = useApiQuery({
    queryKey: queryKeys.dashboard.admin(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    queryFn: ({ token, signal }) =>
      fetchAdminDashboardData(token, { signal, debugSource: "query" })
  });

  return {
    data: query.data ?? EMPTY_ADMIN_DASHBOARD_DATA,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refetch: query.refetch
  };
}

export type { AdminDashboardData };
