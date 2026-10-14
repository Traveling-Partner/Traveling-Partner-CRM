"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  EMPTY_DRIVER_STATUS_COUNTS,
  fetchDriverStatusCounts,
  type DriverStatusCounts
} from "@/services/users";

export function useDriverStatusCountsQuery() {
  const query = useApiQuery({
    queryKey: queryKeys.users.driverStatusCounts(),
    queryFn: ({ token, signal }) => fetchDriverStatusCounts({ token, signal })
  });

  return {
    data: query.data ?? EMPTY_DRIVER_STATUS_COUNTS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null
  };
}

export type { DriverStatusCounts };
