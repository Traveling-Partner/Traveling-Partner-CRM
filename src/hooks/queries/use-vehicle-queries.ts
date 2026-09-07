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
  fetchAllVehicleBrands,
  fetchAllVehicleModels,
  fetchAllVehicleTypes,
  fetchVehicleBrands,
  fetchVehicleColors,
  fetchVehicleModels,
  fetchVehicleTypes
} from "@/services/vehicle";

/** UI uses 1-based page; API uses 0-based — convert here. */
function toApiFilters(page: number, pageSize: number, search: string) {
  return { page: Math.max(0, page - 1), pageSize, search };
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

export function useVehicleModelsQuery(page: number, pageSize: number, search: string) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleModelsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch),
    [page, pageSize, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.models(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleModels(f, { token, signal })
  });
}

export function useVehicleColorsQuery(page: number, pageSize: number, search: string) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleColorsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch),
    [page, pageSize, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.colors(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleColors(f, { token, signal })
  });
}

export function useVehicleBrandsQuery(page: number, pageSize: number, search: string) {
  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<VehicleBrandsListFilters>(
    () => toApiFilters(page, pageSize, debouncedSearch),
    [page, pageSize, debouncedSearch]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.vehicle.brands(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchVehicleBrands(f, { token, signal })
  });
}

/** Every vehicle type across API pages — for Add/Edit dropdowns. */
export function useVehicleTypeOptionsQuery() {
  return useApiQuery({
    queryKey: queryKeys.vehicle.typeOptions(),
    queryFn: ({ token, signal }) => fetchAllVehicleTypes({ token, signal })
  });
}

/** Every brand across API pages — for Add/Edit dropdowns. */
export function useVehicleBrandOptionsQuery() {
  return useApiQuery({
    queryKey: queryKeys.vehicle.brandOptions(),
    queryFn: ({ token, signal }) => fetchAllVehicleBrands({ token, signal })
  });
}

/** Every model across API pages — for Add/Edit dropdowns. */
export function useVehicleModelOptionsQuery() {
  return useApiQuery({
    queryKey: queryKeys.vehicle.modelOptions(),
    queryFn: ({ token, signal }) => fetchAllVehicleModels({ token, signal })
  });
}
