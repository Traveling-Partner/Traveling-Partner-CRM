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

export interface VehicleModel extends VehicleEntity {
  vehicleTypeId: number | null;
  brandId: number | null;
}

export interface VehicleModelVariant extends VehicleEntity {
  vehicleTypeId: number | null;
  brandId: number | null;
  modelYearId: number | null;
  mileage: number | null;
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
  return fetchEnvelopePage<VehicleModel>("/modelYears/getAll", filters, opts, "vehicle:models");
}

export function fetchVehicleColors(
  filters: VehicleColorsListFilters,
  opts: RequestOpts
) {
  return fetchEnvelopePage<VehicleModelVariant>("/modelVariants/getAll", filters, opts, "vehicle:model-variants");
}

export function fetchVehicleBrands(
  filters: VehicleBrandsListFilters,
  opts: RequestOpts
) {
  return fetchEnvelopePage<VehicleBrand>("/brands/getAll", filters, opts, "vehicle:brands");
}

/** Walks every GET page so Add/Edit dropdowns are not stuck on the first page. */
async function fetchAllEnvelopePages<T>(
  path: string,
  opts: RequestOpts,
  label: string
): Promise<T[]> {
  const all: T[] = [];
  let page = 0;
  const pageSize = 10;

  for (let i = 0; i < 40; i += 1) {
    const res = await fetchEnvelopePage<T>(path, { page, pageSize, search: "" }, opts, label);
    all.push(...(res.content ?? []));
    const totalPages = Math.max(1, res.totalPages ?? 1);
    if (!res.content?.length || page + 1 >= totalPages) break;
    page += 1;
  }

  return all;
}

export function fetchAllVehicleTypes(opts: RequestOpts) {
  return fetchAllEnvelopePages<VehicleEntity>("/vehicleTypes/getAll", opts, "vehicle:types-all");
}

export function fetchAllVehicleBrands(opts: RequestOpts) {
  return fetchAllEnvelopePages<VehicleBrand>("/brands/getAll", opts, "vehicle:brands-all");
}

export function fetchAllVehicleModels(opts: RequestOpts) {
  return fetchAllEnvelopePages<VehicleModel>("/modelYears/getAll", opts, "vehicle:models-all");
}

export interface VehicleTypePayload {
  name: string;
  status: string;
  image: string;
}

export interface VehicleBrandPayload extends VehicleTypePayload {
  vehicleTypeId: number;
}

export interface VehicleModelPayload extends VehicleTypePayload {
  vehicleTypeId: number;
  brandId: number;
}

export interface VehicleModelVariantPayload extends VehicleTypePayload {
  vehicleTypeId?: number;
  brandId?: number;
  modelYearId?: number;
  mileage?: number;
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

export async function createVehicleModel(payload: VehicleModelPayload, opts: RequestOpts) {
  return fetcher(buildApiUrl("/modelYears/create"), {
    ...readOpts(opts, "vehicle:model-create"),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateVehicleModel(
  id: number | string,
  payload: VehicleModelPayload,
  opts: RequestOpts
) {
  return fetcher(buildApiUrl(`/modelYears/update/${id}`), {
    ...readOpts(opts, "vehicle:model-update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteVehicleModel(id: number | string, opts: RequestOpts) {
  return fetcher(buildApiUrl(`/modelYears/delete/${id}`), {
    ...readOpts(opts, "vehicle:model-delete"),
    method: "DELETE"
  });
}

export async function createVehicleColor(payload: VehicleModelVariantPayload, opts: RequestOpts) {
  return fetcher(buildApiUrl("/modelVariants/create"), {
    ...readOpts(opts, "vehicle:color-create"),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateVehicleColor(
  id: number | string,
  payload: VehicleModelVariantPayload,
  opts: RequestOpts
) {
  return fetcher(buildApiUrl(`/modelVariants/update/${id}`), {
    ...readOpts(opts, "vehicle:color-update"),
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteVehicleColor(id: number | string, opts: RequestOpts) {
  return fetcher(buildApiUrl(`/modelVariants/delete/${id}`), {
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
