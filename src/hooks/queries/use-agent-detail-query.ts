"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchAgentDetail } from "@/services/users";

export function useAgentDetailQuery(agentId: string | undefined) {
  return useApiQuery({
    queryKey: queryKeys.users.agentDetail(agentId ?? ""),
    enabled: !!agentId,
    queryFn: ({ token, signal }) => fetchAgentDetail(agentId!, { token, signal })
  });
}
