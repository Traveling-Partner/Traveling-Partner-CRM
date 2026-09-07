"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiMutation, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type PlatformFeeListFilters } from "@/lib/api/query-keys";
import {
  buildPlatformFeePayload,
  createPlatformFee,
  deletePlatformFee,
  fetchPlatformFeeList,
  updatePlatformFee,
  type PlatformFeeApiRecord
} from "@/services/platform-fee";
import type {
  PercentageManagementFormValues,
  PercentageManagementItem
} from "@/types/percentage-management";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Real API-backed controller for PercentageManagementView (Platform Fee page).
 * Mirrors the return shape of useTaxManagement / usePercentageManagementMock.
 */
export function usePlatformFeeManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo<PlatformFeeListFilters>(
    () => ({ page, pageSize, search: debouncedSearch }),
    [page, pageSize, debouncedSearch]
  );

  const listQuery = usePaginatedQuery<PlatformFeeApiRecord, PlatformFeeListFilters>({
    queryKey: queryKeys.platformFee.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchPlatformFeeList(f, { token, signal })
  });

  const items = useMemo<PercentageManagementItem[]>(
    () =>
      (listQuery.data?.content ?? []).map((record) => ({
        id: String(record.id),
        name: record.name,
        percentage: record.percentage,
        status: record.status
      })),
    [listQuery.data]
  );

  const totalItems = listQuery.data?.totalElements ?? items.length;
  const totalPages = Math.max(1, listQuery.data?.totalPages ?? 1);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const createMutation = useApiMutation<
    PlatformFeeApiRecord | null,
    PercentageManagementFormValues
  >({
    mutationFn: ({ token, variables }) =>
      createPlatformFee(buildPlatformFeePayload(variables), token),
    invalidateKeys: [queryKeys.platformFee.all]
  });

  const updateMutation = useApiMutation<
    PlatformFeeApiRecord | null,
    { id: string; values: PercentageManagementFormValues }
  >({
    mutationFn: ({ token, variables }) =>
      updatePlatformFee(
        Number(variables.id),
        buildPlatformFeePayload(variables.values),
        token
      ),
    invalidateKeys: [queryKeys.platformFee.all]
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: ({ token, variables }) => deletePlatformFee(Number(variables), token),
    invalidateKeys: [queryKeys.platformFee.all]
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPage(1);
  }, []);

  const createItem = useCallback(
    async (values: PercentageManagementFormValues) => {
      await createMutation.mutateAsync(values);
      setPage(1);
    },
    [createMutation]
  );

  const updateItem = useCallback(
    async (id: string, values: PercentageManagementFormValues) => {
      await updateMutation.mutateAsync({ id, values });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  return {
    items,
    totalItems,
    isLoading: listQuery.isLoading,
    search,
    page,
    pageSize,
    totalPages,
    setPage,
    handleSearchChange,
    handlePageSizeChange,
    createItem,
    updateItem,
    deleteItem
  };
}
