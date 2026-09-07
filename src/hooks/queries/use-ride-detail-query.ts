"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchRideDetail } from "@/services/rides";

export function useRideDetailQuery(rideId: string | undefined) {
  return useApiQuery({
    queryKey: queryKeys.rides.detail(rideId ?? ""),
    enabled: !!rideId,
    queryFn: ({ token, signal }) => fetchRideDetail(rideId!, { token, signal })
  });
}
