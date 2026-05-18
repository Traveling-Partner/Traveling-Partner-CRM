import { buildApiUrl } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import { fetcher } from "@/lib/fetcher";
import type {
  VehicleBrandsListFilters,
  VehicleColorsListFilters,
  VehicleModelsListFilters,
  VehicleTypesListFilters
} from "@/lib/api/query-keys";

export interface VehicleEntity {
  id: number | string;
  name: string;
  status: string | null;
  image: string | null;
}

export interface VehicleBrand extends VehicleEntity {
  vehicleTypeId: number | null;
}

interface EnvelopePage<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

type RequestOpts = { token: string; signal?: AbortSignal };

function readOpts(opts: RequestOpts, label: string) {
  return { ...opts, dedupe: false as const, debugLabel: label };
}

async function fetchEnvelopePage<T>(
  path: string,
  filters: { page: number; pageSize: number; search: string },
  opts: RequestOpts,
  label: string
): Promise<PaginatedResponse<T>> {
  const res = await fetcher<EnvelopePage<T>>(
    buildApiUrl(path, {
      page: filters.page,
      size: filters.pageSize,
      search: filters.search.trim()
    }),
    readOpts(opts, label)
  );
  return {
    content: res.data.content,
    totalPages: Math.max(1, res.data.totalPages),
    totalElements: res.data.totalElements,
    number: res.data.number
  };
}

export function fetchVehicleTypes(
  filters: VehicleTypesListFilters,
  opts: RequestOpts
) {
  return fetchEnvelopePage<VehicleEntity>("/vehicleTypes/getAll", filters, opts, "vehicle:types");
}

export function fetchVehicleModels(
  filters: VehicleModelsListFilters,
  opts: RequestOpts
) {
  return fetchEnvelopePage<VehicleEntity>("/modelNumbers/getAll", filters, opts, "vehicle:models");
}

export function fetchVehicleColors(
  filters: VehicleColorsListFilters,
  opts: RequestOpts
) {
  return fetchEnvelopePage<VehicleEntity>("/colors/getAll", filters, opts, "vehicle:colors");
}

export function fetchVehicleBrands(
  filters: VehicleBrandsListFilters,
  opts: RequestOpts
) {
  return fetchEnvelopePage<VehicleBrand>("/brands/getAll", filters, opts, "vehicle:brands");
}

export interface VehicleTypePayload {
  name: string;
  status: string;
  image: string;
}

export interface VehicleBrandPayload extends VehicleTypePayload {
  vehicleTypeId: number;
}

export async function createVehicleType(payload: VehicleTypePayload, opts: RequestOpts) {
  return fetcher(buildApiUrl("/vehicleTypes/create"), {
    ...readOpts(opts, "vehicle:type-create"),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateVehicleType(
  id: number | string,
  payload: VehicleTypePayload,
  opts: RequestOpts
) {
  return fetcher(buildApiUrl(`/vehicleTypes/update/${id}`), {
    ...readOpts(opts, "vehicle:type-update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteVehicleType(id: number | string, opts: RequestOpts) {
  return fetcher(buildApiUrl(`/vehicleTypes/delete/${id}`), {
    ...readOpts(opts, "vehicle:type-delete"),
    method: "DELETE"
  });
}

export async function createVehicleModel(payload: VehicleTypePayload, opts: RequestOpts) {
  return fetcher(buildApiUrl("/modelNumbers/create"), {
    ...readOpts(opts, "vehicle:model-create"),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateVehicleModel(
  id: number | string,
  payload: VehicleTypePayload,
  opts: RequestOpts
) {
  return fetcher(buildApiUrl(`/modelNumbers/update/${id}`), {
    ...readOpts(opts, "vehicle:model-update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteVehicleModel(id: number | string, opts: RequestOpts) {
  return fetcher(buildApiUrl(`/modelNumbers/delete/${id}`), {
    ...readOpts(opts, "vehicle:model-delete"),
    method: "DELETE"
  });
}

export async function createVehicleColor(payload: VehicleTypePayload, opts: RequestOpts) {
  return fetcher(buildApiUrl("/colors/create"), {
    ...readOpts(opts, "vehicle:color-create"),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateVehicleColor(
  id: number | string,
  payload: VehicleTypePayload,
  opts: RequestOpts
) {
  return fetcher(buildApiUrl(`/colors/update/${id}`), {
    ...readOpts(opts, "vehicle:color-update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteVehicleColor(id: number | string, opts: RequestOpts) {
  return fetcher(buildApiUrl(`/colors/delete/${id}`), {
    ...readOpts(opts, "vehicle:color-delete"),
    method: "DELETE"
  });
}

export async function createVehicleBrand(payload: VehicleBrandPayload, opts: RequestOpts) {
  return fetcher(buildApiUrl("/brands/create"), {
    ...readOpts(opts, "vehicle:brand-create"),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateVehicleBrand(
  id: number | string,
  payload: VehicleBrandPayload,
  opts: RequestOpts
) {
  return fetcher(buildApiUrl(`/brands/update/${id}`), {
    ...readOpts(opts, "vehicle:brand-update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteVehicleBrand(id: number | string, opts: RequestOpts) {
  return fetcher(buildApiUrl(`/brands/delete/${id}`), {
    ...readOpts(opts, "vehicle:brand-delete"),
    method: "DELETE"
  });
}
