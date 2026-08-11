"use client";

import { useMemo } from "react";
import { useApiMutation, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type SosListFilters } from "@/lib/api/query-keys";
import {
  createSos,
  deleteSos,
  fetchSosList,
  updateSos,
  type SosApiRecord,
  type SosUpsertPayload
} from "@/services/sos";

export function useSosDirectoryQuery(params: {
  page: number;
  pageSize: number;
  search: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);

  const filters = useMemo<SosListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: debouncedSearch
    }),
    [params.page, params.pageSize, debouncedSearch]
  );

  return usePaginatedQuery<SosApiRecord, SosListFilters>({
    queryKey: queryKeys.sos.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchSosList(f, { token, signal })
  });
}

export function useCreateSosMutation() {
  return useApiMutation<SosApiRecord | null, SosUpsertPayload>({
    mutationFn: ({ token, variables }) => createSos(variables, token),
    invalidateKeys: [queryKeys.sos.all]
  });
}

export function useUpdateSosMutation() {
  return useApiMutation<SosApiRecord | null, { id: number; payload: SosUpsertPayload }>({
    mutationFn: ({ token, variables }) =>
      updateSos(variables.id, variables.payload, token),
    invalidateKeys: [queryKeys.sos.all]
  });
}

export function useDeleteSosMutation() {
  return useApiMutation<void, number>({
    mutationFn: ({ token, variables }) => deleteSos(variables, token),
    invalidateKeys: [queryKeys.sos.all]
  });
}
