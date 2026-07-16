"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  EMPTY_AGENT_STATUS_COUNTS,
  fetchAgentStatusCounts,
  type AgentStatusCounts
} from "@/services/users";

export function useAgentStatusCountsQuery() {
  const query = useApiQuery({
    queryKey: queryKeys.users.agentStatusCounts(),
    queryFn: ({ token, signal }) => fetchAgentStatusCounts({ token, signal })
  });

  return {
    data: query.data ?? EMPTY_AGENT_STATUS_COUNTS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null
  };
}

export type { AgentStatusCounts };
