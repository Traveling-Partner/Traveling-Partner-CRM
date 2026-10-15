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
  extra?: { status?: string; vehicleTypeId?: number; brandId?: number; modelYearId?: number }
) {
  const status = extra?.status?.trim();
  return {
    page: Math.max(1, page),
    pageSize,
    search,
    status: status && status !== "all" ? status : undefined,
    vehicleTypeId: extra?.vehicleTypeId,
    brandId: extra?.brandId,
    modelYearId: extra?.modelYearId
  };
}

export function useVehicleTypesQuery(
  page: number,
  pageSize: number,
  search: string,
  status?: string
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleTypesListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch, { status }),
    [page, pageSize, debouncedSearch, status]
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
  brandId?: number,
  status?: string
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleModelsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch, { vehicleTypeId, brandId, status }),
    [page, pageSize, debouncedSearch, vehicleTypeId, brandId, status]
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
  modelYearId?: number,
  status?: string
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleColorsListFilters>(
    () =>
      toApiFilters(page, pageSize, debouncedSearch, {
        vehicleTypeId,
        brandId,
        modelYearId,
        status
      }),
    [page, pageSize, debouncedSearch, vehicleTypeId, brandId, modelYearId, status]
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
  vehicleTypeId?: number,
  status?: string
) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleBrandsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch, { vehicleTypeId, status }),
    [page, pageSize, debouncedSearch, vehicleTypeId, status]
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
