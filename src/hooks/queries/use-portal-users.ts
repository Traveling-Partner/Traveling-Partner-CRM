"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation, useApiQuery, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type PortalUsersListFilters } from "@/lib/api/query-keys";
import {
  createPortalUser,
  deletePortalUser,
  fetchPortalUserById,
  fetchPortalUsersList,
  updatePortalUser,
  type PortalUser,
  type PortalUserCreatePayload,
  type PortalUserUpdatePayload
} from "@/services/portal-users";

export function usePortalUsersListQuery(params: {
  page: number;
  pageSize: number;
  search: string;
  role: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search);
  const filters = useMemo<PortalUsersListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: debouncedSearch,
      role: params.role
    }),
    [params.page, params.pageSize, debouncedSearch, params.role]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.portalUsers.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchPortalUsersList(f, { token, signal })
  });
}

export function usePortalUserDetailQuery(id: string | undefined) {
  return useApiQuery<PortalUser>({
    queryKey: queryKeys.portalUsers.detail(id ?? ""),
    enabled: Boolean(id),
    refetchOnMount: false,
    queryFn: ({ token, signal }) => fetchPortalUserById(id ?? "", { token, signal })
  });
}

export function useCreatePortalUserMutation() {
  return useApiMutation<PortalUser, PortalUserCreatePayload>({
    mutationFn: ({ token, variables }) => createPortalUser(variables, token),
    invalidateKeys: [queryKeys.portalUsers.lists()]
  });
}

export function useUpdatePortalUserMutation(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation<PortalUser, PortalUserUpdatePayload>({
    mutationFn: ({ token, variables }) => updatePortalUser(id, variables, token),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.portalUsers.detail(id), data);
    },
    invalidateKeys: [queryKeys.portalUsers.lists()]
  });
}

export function useDeletePortalUserMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<void, string | number>({
    mutationFn: ({ token, variables }) => deletePortalUser(variables, token),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.portalUsers.detail(id) });
    },
    invalidateKeys: [queryKeys.portalUsers.lists()]
  });
}
