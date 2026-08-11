"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiMutation, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type TaxListFilters } from "@/lib/api/query-keys";
import {
  buildTaxPayload,
  createTax,
  deleteTax,
  fetchTaxList,
  updateTax,
  type TaxApiRecord
} from "@/services/tax";
import type {
  PercentageManagementFormValues,
  PercentageManagementItem
} from "@/types/percentage-management";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Real API-backed controller for PercentageManagementView (Tax page).
 * Mirrors the return shape of usePercentageManagementMock.
 */
export function useTaxManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo<TaxListFilters>(
    () => ({ page, pageSize, search: debouncedSearch }),
    [page, pageSize, debouncedSearch]
  );

  const listQuery = usePaginatedQuery<TaxApiRecord, TaxListFilters>({
    queryKey: queryKeys.tax.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchTaxList(f, { token, signal })
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

  // Clamp page if data shrinks (e.g. last item on last page deleted)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const createMutation = useApiMutation<TaxApiRecord | null, PercentageManagementFormValues>({
    mutationFn: ({ token, variables }) => createTax(buildTaxPayload(variables), token),
    invalidateKeys: [queryKeys.tax.all]
  });

  const updateMutation = useApiMutation<
    TaxApiRecord | null,
    { id: string; values: PercentageManagementFormValues }
  >({
    mutationFn: ({ token, variables }) =>
      updateTax(Number(variables.id), buildTaxPayload(variables.values), token),
    invalidateKeys: [queryKeys.tax.all]
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: ({ token, variables }) => deleteTax(Number(variables), token),
    invalidateKeys: [queryKeys.tax.all]
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
