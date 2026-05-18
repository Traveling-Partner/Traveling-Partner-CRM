"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchDriverDetail } from "@/services/users";

export function useDriverDetailQuery(driverId: string | undefined) {
  return useApiQuery({
    queryKey: queryKeys.users.driverDetail(driverId ?? ""),
    enabled: !!driverId,
    queryFn: ({ token, signal }) => fetchDriverDetail(driverId!, { token, signal })
  });
}
