"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  EMPTY_PARTNER_STATUS_COUNTS,
  fetchPartnerStatusCounts,
  type PartnerStatusCounts
} from "@/services/users";

export function usePartnerStatusCountsQuery() {
  const query = useApiQuery({
    queryKey: queryKeys.users.partnerStatusCounts(),
    queryFn: ({ token, signal }) => fetchPartnerStatusCounts({ token, signal })
  });

  return {
    data: query.data ?? EMPTY_PARTNER_STATUS_COUNTS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null
  };
}

export type { PartnerStatusCounts };
