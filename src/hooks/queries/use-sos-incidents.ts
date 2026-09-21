"use client";

import { useMemo } from "react";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useApiMutation, useApiQuery, useDebouncedValue } from "@/hooks/api";
import { queryKeys, type SosIncidentsListFilters } from "@/lib/api/query-keys";
import {
  addSosCaseNote,
  fetchSosIncidentDetail,
  fetchSosIncidents,
  fetchSosOverview,
  updateSosIncidentStatus,
  type SosCaseNotePayload,
  type SosIncidentDetail,
  type SosIncidentsPage,
  type SosOverview,
  type SosStatusUpdatePayload
} from "@/services/sos-incidents";

export function useSosOverviewQuery() {
  return useApiQuery<SosOverview>({
    queryKey: queryKeys.sos.overview(),
    queryFn: ({ token, signal }) => fetchSosOverview({ token, signal })
  });
}

export function useSosIncidentsQuery(params: {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  city: string;
  userId: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);
  const debouncedUserId = useDebouncedValue(params.userId);

  const filters = useMemo<SosIncidentsListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: debouncedSearch,
      status: params.status,
      city: params.city,
      userId: debouncedUserId
    }),
    [params.page, params.pageSize, debouncedSearch, params.status, params.city, debouncedUserId]
  );

  return useApiQuery<SosIncidentsPage>({
    queryKey: queryKeys.sos.incidentList(filters),
    placeholderData: keepPreviousData,
    queryFn: ({ token, signal }) => fetchSosIncidents(filters, { token, signal })
  });
}

export function useSosIncidentDetailQuery(id: string | undefined) {
  return useApiQuery<SosIncidentDetail>({
    queryKey: queryKeys.sos.incidentDetail(id ?? ""),
    enabled: !!id,
    queryFn: ({ token, signal }) => fetchSosIncidentDetail(id!, { token, signal })
  });
}

/**
 * Status and case-note endpoints both return the full detail DTO, so the
 * response seeds the detail cache instead of triggering a refetch. List and
 * overview keys are only marked stale — they are inactive on this screen.
 */
function useIncidentDetailWriter(id: string) {
  const queryClient = useQueryClient();
  return {
    invalidateKeys: [queryKeys.sos.incidentLists, queryKeys.sos.overview()],
    seedDetail: (data: SosIncidentDetail) => {
      queryClient.setQueryData(queryKeys.sos.incidentDetail(id), data);
    }
  };
}

export function useUpdateSosIncidentStatusMutation(id: string) {
  const { invalidateKeys, seedDetail } = useIncidentDetailWriter(id);

  return useApiMutation<SosIncidentDetail, SosStatusUpdatePayload>({
    mutationFn: ({ token, variables }) => updateSosIncidentStatus(id, variables, token),
    invalidateKeys,
    onSuccess: (data) => seedDetail(data)
  });
}

export function useAddSosCaseNoteMutation(id: string) {
  const { invalidateKeys, seedDetail } = useIncidentDetailWriter(id);

  return useApiMutation<SosIncidentDetail, SosCaseNotePayload>({
    mutationFn: ({ token, variables }) => addSosCaseNote(id, variables, token),
    invalidateKeys,
    onSuccess: (data) => seedDetail(data)
  });
}
