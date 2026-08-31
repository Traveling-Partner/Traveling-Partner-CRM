"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type AuditLogsFilters } from "@/lib/api/query-keys";
import { fetchAuditLogs } from "@/services/audit-logs";

export function useAuditLogsQuery(params: {
  page: number;
  pageSize: number;
  userType: string;
  search: string;
  fromDate: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<AuditLogsFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      userType: params.userType,
      search: debouncedSearch,
      fromDate: params.fromDate
    }),
    [params.page, params.pageSize, params.userType, debouncedSearch, params.fromDate]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.audit.logs(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchAuditLogs(f, { token, signal })
  });
}
