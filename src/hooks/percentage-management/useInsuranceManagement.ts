"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiMutation, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type InsuranceListFilters } from "@/lib/api/query-keys";
import {
  buildInsurancePayload,
  createInsurance,
  deleteInsurance,
  fetchInsuranceList,
  updateInsurance,
  type InsuranceApiRecord
} from "@/services/insurance";
import type {
  PercentageManagementFormValues,
  PercentageManagementItem
} from "@/types/percentage-management";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Real API-backed controller for PercentageManagementView (Insurance Management page).
 */
export function useInsuranceManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo<InsuranceListFilters>(
    () => ({ page, pageSize, search: debouncedSearch }),
    [page, pageSize, debouncedSearch]
  );

  const listQuery = usePaginatedQuery<InsuranceApiRecord, InsuranceListFilters>({
    queryKey: queryKeys.insurance.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchInsuranceList(f, { token, signal })
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
    InsuranceApiRecord | null,
    PercentageManagementFormValues
  >({
    mutationFn: ({ token, variables }) =>
      createInsurance(buildInsurancePayload(variables), token),
    invalidateKeys: [queryKeys.insurance.all]
  });

  const updateMutation = useApiMutation<
    InsuranceApiRecord | null,
    { id: string; values: PercentageManagementFormValues }
  >({
    mutationFn: ({ token, variables }) =>
      updateInsurance(Number(variables.id), buildInsurancePayload(variables.values), token),
    invalidateKeys: [queryKeys.insurance.all]
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: ({ token, variables }) => deleteInsurance(Number(variables), token),
    invalidateKeys: [queryKeys.insurance.all]
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
