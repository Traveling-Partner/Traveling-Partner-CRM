"use client";

import { useMemo } from "react";
import { useApiQuery, useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import {
  queryKeys,
  type VehicleBrandsListFilters,
  type VehicleColorsListFilters,
  type VehicleModelsListFilters,
  type VehicleTypesListFilters
} from "@/lib/api/query-keys";
import {
  fetchVehicleBrands,
  fetchVehicleColors,
  fetchVehicleModels,
  fetchVehicleTypes
} from "@/services/vehicle";

/** One getAll page for dropdowns — same APIs, no multi-page walk. */
const OPTIONS_PAGE_SIZE = 100;
const OPTIONS_STALE_TIME_MS = 30 * 60 * 1000;
const OPTIONS_GC_TIME_MS = 60 * 60 * 1000;

function toApiFilters(
  page: number,
  pageSize: number,
  search: string,
  extra?: { vehicleTypeId?: number; brandId?: number; modelYearId?: number }
) {
  return {
    page: Math.max(1, page),
    pageSize,
    search,
    vehicleTypeId: extra?.vehicleTypeId,
    brandId: extra?.brandId,
    modelYearId: extra?.modelYearId
  };
}

export function useVehicleTypesQuery(page: number, pageSize: number, search: string) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleTypesListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch),
    [page, pageSize, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.types(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleTypes(f, { token, signal })
  });
}

export function useVehicleModelsQuery(
  page: number,
  pageSize: number,
  search: string,
  vehicleTypeId?: number,
  brandId?: number
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleModelsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch, { vehicleTypeId, brandId }),
    [page, pageSize, debouncedSearch, vehicleTypeId, brandId]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.models(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleModels(f, { token, signal })
  });
}

export function useVehicleColorsQuery(
  page: number,
  pageSize: number,
  search: string,
  vehicleTypeId?: number,
  brandId?: number,
  modelYearId?: number
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleColorsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch, { vehicleTypeId, brandId, modelYearId }),
    [page, pageSize, debouncedSearch, vehicleTypeId, brandId, modelYearId]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.colors(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleColors(f, { token, signal })
  });
}

export function useVehicleBrandsQuery(
  page: number,
  pageSize: number,
  search: string,
  vehicleTypeId?: number
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleBrandsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch, { vehicleTypeId }),
    [page, pageSize, debouncedSearch, vehicleTypeId]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.brands(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleBrands(f, { token, signal })
  });
}

/** Types dropdown — one GET /vehicleTypes/portal/getAll. */
export function useVehicleTypeOptionsQuery(enabled = true) {
  return useApiQuery({
    queryKey: queryKeys.vehicle.typeOptions(),
    staleTime: OPTIONS_STALE_TIME_MS,
    gcTime: OPTIONS_GC_TIME_MS,
    refetchOnMount: false,
    enabled,
    queryFn: async ({ token, signal }) => {
      const page = await fetchVehicleTypes(
        { page: 1, pageSize: OPTIONS_PAGE_SIZE, search: "" },
        { token, signal }
      );
      return page.content ?? [];
    }
  });
}

/** Brands dropdown — one GET /brands/portal/getAll. */
export function useVehicleBrandOptionsQuery(vehicleTypeId?: number, enabled = true) {
  return useApiQuery({
    queryKey: queryKeys.vehicle.brandOptions(vehicleTypeId),
    staleTime: OPTIONS_STALE_TIME_MS,
    gcTime: OPTIONS_GC_TIME_MS,
    refetchOnMount: false,
    enabled,
    queryFn: async ({ token, signal }) => {
      const page = await fetchVehicleBrands(
        { page: 1, pageSize: OPTIONS_PAGE_SIZE, search: "", vehicleTypeId },
        { token, signal }
      );
      return page.content ?? [];
    }
  });
}

/** Models dropdown — one GET /modelYears/portal/getAll. */
export function useVehicleModelOptionsQuery(
  vehicleTypeId?: number,
  brandId?: number,
  enabled = true
) {
  return useApiQuery({
    queryKey: queryKeys.vehicle.modelOptions(vehicleTypeId, brandId),
    staleTime: OPTIONS_STALE_TIME_MS,
    gcTime: OPTIONS_GC_TIME_MS,
    refetchOnMount: false,
    enabled,
    queryFn: async ({ token, signal }) => {
      const page = await fetchVehicleModels(
        { page: 1, pageSize: OPTIONS_PAGE_SIZE, search: "", vehicleTypeId, brandId },
        { token, signal }
      );
      return page.content ?? [];
    }
  });
}
