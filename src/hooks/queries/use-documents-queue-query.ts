"use client";

import { useMemo } from "react";
import { useDebouncedValue, useApiQuery } from "@/hooks/api";
import { queryKeys, type DocumentsQueueFilters } from "@/lib/api/query-keys";
import { fetchDocumentsQueuePage } from "@/services/documents";

export function useDocumentsQueueQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<DocumentsQueueFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, params.status, debouncedSearch]
  );

  return useApiQuery({
    queryKey: queryKeys.users.documentsQueue(filters),
    queryFn: ({ token, signal }) => fetchDocumentsQueuePage(filters, { token, signal })
  });
}
