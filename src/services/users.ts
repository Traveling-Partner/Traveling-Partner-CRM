import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import type { PaginatedResponse } from "@/lib/api/types";
import {
  deriveDocStatuses,
  type DriverDocumentsPayload
} from "@/lib/documents-utils";
import { fetcher } from "@/lib/fetcher";
import type {
  AgentsListFilters,
  DriversListFilters,
  PartnersListFilters
} from "@/lib/api/query-keys";

export interface DriverRow {
  id: number;
  email: string | null;
  name: string | null;
  username: string | null;
  mobileNumber: string;
  status: string;
  cnicNumber?: string | null;
  createdAt: string | null;
}

export interface PartnerRow {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  status: string;
  profilePicture?: string | null;
  createdAt?: string | null;
}

export interface AgentRow {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  cnicNumber?: string | null;
  status: string;
}

type RequestOpts = { token: string; signal?: AbortSignal; debugLabel?: string };

function readOpts({ token, signal, debugLabel }: RequestOpts) {
  return { token, signal, dedupe: false as const, debugLabel };
}

export async function fetchDriversList(
  filters: DriversListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<DriverRow>> {
  const url = buildApiUrl("/users/drivers", {
    page: filters.page,
    size: filters.pageSize,
    status: filters.status === "all" ? undefined : filters.status,
    search: filters.search.trim() || undefined
  });
  return fetcher<PaginatedResponse<DriverRow>>(url, readOpts({ ...opts, debugLabel: "users:drivers" }));
}

export async function fetchPartnersList(
  filters: PartnersListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<PartnerRow>> {
  const url = buildApiUrl("/users/partners", {
    page: filters.page,
    size: filters.pageSize,
    status: filters.status === "all" ? "" : filters.status,
    city: "",
    search: filters.search.trim()
  });
  return fetcher<PaginatedResponse<PartnerRow>>(url, readOpts({ ...opts, debugLabel: "users:partners" }));
}

export async function fetchAgentsList(
  filters: AgentsListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<AgentRow>> {
  const url = buildApiUrl("/users/sale-agents", {
    page: filters.page,
    size: filters.pageSize,
    status: filters.status === "all" ? "" : filters.status,
    search: filters.search.trim()
  });
  return fetcher<PaginatedResponse<AgentRow>>(url, readOpts({ ...opts, debugLabel: "users:agents" }));
}

// ——— Detail types ———

export interface DriverDetail {
  id: number;
  email: string | null;
  username: string | null;
  mobileNumber: string | null;
  status: string;
  platform: string | null;
  roles: string[];
  otp: string | null;
  token: string | null;
  referralCode: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  basicInformation?: {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    whatsApp: string | null;
    email: string | null;
    cnicNumber: string | null;
    cnicFront: string | null;
    cnicBack: string | null;
    profilePicture: string | null;
    referralCode: string | null;
    acceptTerm: boolean | null;
    city: string | null;
    filterDeleted: boolean | null;
  } | null;
  license?: {
    userId: number;
    licenseNo: string | null;
    licenseFront: string | null;
    licenseBack: string | null;
    licenseVerified: boolean | null;
    filterVerified: boolean | null;
  } | null;
  vehicle?: {
    id: number;
    modelNumberId: number | null;
    modelNumberName?: string | null;
    colorId: number | null;
    colorName?: string | null;
    registrationNo: string | null;
    registrationFront: string | null;
    registrationBack: string | null;
    outdoorImages: string | null;
    indoorImages: string | null;
    ac: boolean | null;
    petsAllowed: boolean | null;
    smokingAllowed: boolean | null;
    vehicleVerified: boolean | null;
    brandId: number | null;
    userId: number;
  } | null;
}

export interface PartnerDetail {
  id: number;
  email: string | null;
  username: string | null;
  mobileNumber: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  basicInformation?: {
    firstName: string | null;
    lastName: string | null;
    gender?: string | null;
    email?: string | null;
    city: string | null;
    cnicFront: string | null;
    cnicBack: string | null;
  } | null;
  vehicle?: {
    modelNumberId: number | null;
    colorId: number | null;
  } | null;
}

export interface AgentDetail {
  id: number;
  email: string | null;
  username: string | null;
  mobileNumber: string | null;
  name: string | null;
  status: string;
  cnicNumber?: string | null;
  cnicFront?: string | null;
  cnicBack?: string | null;
}

export interface DriverDetailBundle {
  driver: DriverDetail;
  docStatuses: { cnic: string; license: string; vehicle: string };
}

export async function fetchDriverDetail(
  id: string | number,
  opts: RequestOpts
): Promise<DriverDetailBundle> {
  const [driverRes, documentsRes] = await Promise.all([
    fetcher<DriverDetail>(buildApiUrl(`/users/drivers/${id}`), readOpts({ ...opts, debugLabel: "users:driver-detail" })),
    fetcher<unknown>(buildApiUrl(`/users/documents/${id}`), readOpts({ ...opts, debugLabel: "users:driver-documents" }))
  ]);
  const documentsPayload = unwrapEnvelope<DriverDocumentsPayload>(documentsRes);
  return {
    driver: driverRes,
    docStatuses: deriveDocStatuses(documentsPayload)
  };
}

export async function fetchPartnerDetail(
  id: string | number,
  opts: RequestOpts
): Promise<PartnerDetail> {
  const response = await fetcher<unknown>(
    buildApiUrl(`/users/partners/${id}`),
    readOpts({ ...opts, debugLabel: "users:partner-detail" })
  );
  return unwrapEnvelope<PartnerDetail>(response);
}

export async function fetchAgentDetail(id: string | number, opts: RequestOpts): Promise<AgentDetail> {
  const response = await fetcher<unknown>(
    buildApiUrl(`/users/sale-agents/${id}`),
    readOpts({ ...opts, debugLabel: "users:agent-detail" })
  );
  return unwrapEnvelope<AgentDetail>(response);
}

export async function updateUserStatus(
  userId: number,
  status: string,
  opts: RequestOpts & { method?: "PUT" }
): Promise<void> {
  await fetcher(buildApiUrl(`/users/status/${userId}`), {
    ...readOpts({ ...opts, debugLabel: "users:status-update" }),
    method: opts.method ?? "PUT",
    body: JSON.stringify({ status })
  });
}
