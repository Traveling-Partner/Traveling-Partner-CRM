import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import {
  mapRawStatus,
  normalizeApiDocStatus,
  normalizeDocumentStatus,
  pickVehicleStatus,
  summarizeDocumentVerificationStatus,
  type ApiDocStatus,
  type DriverDocumentsPayload
} from "@/lib/documents-utils";
import { fetcher } from "@/lib/fetcher";
import type { DriverRow } from "@/services/users";
import type { DocumentsQueueFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";

export type { ApiDocStatus, DriverDocumentsPayload };

export interface PreviewDocument {
  id: "driver-license" | "vehicle-registration" | "id-document";
  type: "DRIVER_LICENSE" | "VEHICLE_REGISTRATION" | "ID_DOCUMENT";
  fileName: string;
  frontUrl: string;
  backUrl: string;
  status: string;
}

export interface DocumentStatusPayload {
  cnicStatus: ApiDocStatus;
  licenseStatus: ApiDocStatus;
  vehicleStatus: ApiDocStatus;
  rejectionReason?: string;
}

export interface DocumentsQueuePage {
  drivers: PaginatedResponse<DriverRow>;
  documentStatusByDriverId: Record<number, ApiDocStatus>;
}

const FALLBACK_BY_TYPE = {
  DRIVER_LICENSE: "/mock-images/driver-license.svg",
  VEHICLE_REGISTRATION: "/mock-images/vehicle-registration.svg",
  ID_DOCUMENT: "/mock-images/id-document.svg"
} as const;

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

type RequestOpts = { token: string; signal?: AbortSignal };

export async function fetchDriverDocumentsPayload(
  driverId: number,
  opts: RequestOpts
): Promise<DriverDocumentsPayload> {
  const response = await fetcher<unknown>(buildApiUrl(`/users/documents/${driverId}`), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "documents:driver-payload"
  });
  return unwrapEnvelope<DriverDocumentsPayload>(response);
}

export async function fetchDriverDocumentSummaryStatus(
  driverId: number,
  opts: RequestOpts
): Promise<ApiDocStatus> {
  const payload = await fetchDriverDocumentsPayload(driverId, opts);
  return summarizeDocumentVerificationStatus(payload);
}

export async function fetchDocumentsQueueDrivers(
  filters: DocumentsQueueFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<DriverRow>> {
  const url = buildApiUrl("/users/drivers", {
    page: filters.page,
    size: filters.pageSize,
    name: filters.name.trim() || undefined,
    mobileNumber: filters.mobileNumber.trim() || undefined,
    city: filters.city.trim() || undefined,
    gender: filters.gender === "all" ? undefined : filters.gender,
    status: filters.status === "all" ? undefined : filters.status,
    documentType: filters.documentType === "all" ? undefined : filters.documentType
  });

  return fetcher<PaginatedResponse<DriverRow>>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "documents:drivers-list"
  });
}

export async function fetchDocumentsQueuePage(
  filters: DocumentsQueueFilters,
  opts: RequestOpts
): Promise<DocumentsQueuePage> {
  const drivers = await fetchDocumentsQueueDrivers(filters, opts);

  const statusEntries = await Promise.all(
    drivers.content.map(async (driver) => {
      try {
        const status = await fetchDriverDocumentSummaryStatus(driver.id, opts);
        return [driver.id, status] as const;
      } catch {
        return [driver.id, "PENDING" as ApiDocStatus] as const;
      }
    })
  );

  return {
    drivers,
    documentStatusByDriverId: Object.fromEntries(statusEntries)
  };
}

export function buildPreviewDocuments(payload: DriverDocumentsPayload): PreviewDocument[] {
  const payloadRecord = payload as unknown as Record<string, unknown>;
  const vehicleStatusRaw = pickVehicleStatus(payloadRecord);

  return [
    {
      id: "driver-license",
      type: "DRIVER_LICENSE",
      fileName: "driver-license.jpg",
      frontUrl: safeImageUrl(payload.licenseFront) || FALLBACK_BY_TYPE.DRIVER_LICENSE,
      backUrl: safeImageUrl(payload.licenseBack) || FALLBACK_BY_TYPE.DRIVER_LICENSE,
      status: normalizeDocumentStatus(payload.licenseStatus)
    },
    {
      id: "vehicle-registration",
      type: "VEHICLE_REGISTRATION",
      fileName: "vehicle-registration.jpg",
      frontUrl: safeImageUrl(payload.registrationFront) || FALLBACK_BY_TYPE.VEHICLE_REGISTRATION,
      backUrl: safeImageUrl(payload.registrationBack) || FALLBACK_BY_TYPE.VEHICLE_REGISTRATION,
      status: normalizeDocumentStatus(vehicleStatusRaw)
    },
    {
      id: "id-document",
      type: "ID_DOCUMENT",
      fileName: "id-document.jpg",
      frontUrl: safeImageUrl(payload.cnicFront) || FALLBACK_BY_TYPE.ID_DOCUMENT,
      backUrl: safeImageUrl(payload.cnicBack) || FALLBACK_BY_TYPE.ID_DOCUMENT,
      status: normalizeDocumentStatus(payload.cnicStatus)
    }
  ];
}

export function buildRawDocumentStatuses(payload: DriverDocumentsPayload): DocumentStatusPayload {
  const vehicleStatusRaw = pickVehicleStatus(payload as unknown as Record<string, unknown>);
  return {
    cnicStatus: mapRawStatus(payload.cnicStatus),
    licenseStatus: mapRawStatus(payload.licenseStatus),
    vehicleStatus: mapRawStatus(vehicleStatusRaw)
  };
}

export async function updateDriverDocumentStatus(
  driverId: number,
  payload: DocumentStatusPayload,
  opts: RequestOpts
): Promise<void> {
  await fetcher(buildApiUrl(`/users/documents/status/${driverId}`), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    method: "PUT",
    body: JSON.stringify(payload),
    debugLabel: "documents:status-update"
  });
}
