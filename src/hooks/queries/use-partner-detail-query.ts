"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchPartnerDetail } from "@/services/users";

export function usePartnerDetailQuery(partnerId: string | undefined) {
  return useApiQuery({
    queryKey: queryKeys.users.partnerDetail(partnerId ?? ""),
    enabled: !!partnerId,
    queryFn: ({ token, signal }) => fetchPartnerDetail(partnerId!, { token, signal })
  });
}
