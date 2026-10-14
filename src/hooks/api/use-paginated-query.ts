"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery, type UseApiQueryOptions } from "@/hooks/api/use-api-query";
import type { PaginatedResponse } from "@/lib/api/types";

export interface UsePaginatedQueryParams<
  TItem,
  TFilters,
  TPage extends PaginatedResponse<TItem> = PaginatedResponse<TItem>
> {
  queryKey: UseApiQueryOptions<TPage>["queryKey"];
  filters: TFilters;
  fetchPage: (ctx: {
    token: string;
    signal: AbortSignal;
    filters: TFilters;
  }) => Promise<TPage>;
  staleTime?: number;
  enabled?: boolean;
}

/**
 * Standard paginated list query — dedupes by full filter object in queryKey.
 * Uses `keepPreviousData` so page changes do not flash empty tables.
 */
export function usePaginatedQuery<
  TItem,
  TFilters,
  TPage extends PaginatedResponse<TItem> = PaginatedResponse<TItem>
>({
  queryKey,
  filters,
  fetchPage,
  staleTime,
  enabled
}: UsePaginatedQueryParams<TItem, TFilters, TPage>) {
  return useApiQuery({
    queryKey,
    staleTime,
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ token, signal }) => fetchPage({ token, signal, filters })
  });
}
