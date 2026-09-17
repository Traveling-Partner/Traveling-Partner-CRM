import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import {
  mapRawStatus,
  normalizeApiDocStatus,
  normalizeDocumentStatus,
  pickVehicleStatus,
  summarizeDocumentVerificationStatus,
  type ApiDocStatus,
  type DriverDocumentsPayload,
  isPartnerDocumentsPayload
} from "@/lib/documents-utils";
import { fetcher } from "@/lib/fetcher";
import type { DriverRow, PartnerRow } from "@/services/users";
import { fetchPartnersList } from "@/services/users";
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

/** Body the documents status PUT actually accepts (GET uses vehicleDocStatus, not vehicleStatus). */
export function toDriverDocumentStatusBody(payload: DocumentStatusPayload): Record<string, string> {
  const body: Record<string, string> = {
    cnicStatus: normalizeApiDocStatus(payload.cnicStatus),
    licenseStatus: normalizeApiDocStatus(payload.licenseStatus),
    vehicleDocStatus: normalizeApiDocStatus(payload.vehicleStatus)
  };
  const reason = payload.rejectionReason?.trim();
  if (reason) body.rejectionReason = reason;
  return body;
}

export interface DocumentsQueuePage {
  drivers: PaginatedResponse<DriverRow>;
  partners: PaginatedResponse<PartnerRow>;
  documentStatusByDriverId: Record<number, ApiDocStatus>;
  documentStatusesByDriverId: Record<number, DocumentStatusPayload>;
  documentStatusesByPartnerId: Record<number, Pick<DocumentStatusPayload, "cnicStatus">>;
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

/** Read document statuses from list-row fields (or nested `documents`) when the API embeds them. */
export function documentStatusesFromListRow(row: object): DocumentStatusPayload {
  const record = row as Record<string, unknown>;
  const nested =
    record.documents && typeof record.documents === "object"
      ? (record.documents as Record<string, unknown>)
      : null;
  const source = nested ?? record;
  return {
    cnicStatus: mapRawStatus(source.cnicStatus),
    licenseStatus: mapRawStatus(source.licenseStatus ?? source.drivingLicenseStatus),
    vehicleStatus: mapRawStatus(pickVehicleStatus(source))
  };
}

export function partnerCnicStatusFromListRow(row: object): ApiDocStatus {
  const record = row as Record<string, unknown>;
  const nested =
    record.documents && typeof record.documents === "object"
      ? (record.documents as Record<string, unknown>)
      : null;
  const source = nested ?? record;
  return mapRawStatus(source.cnicStatus);
}

export async function fetchDriverDocumentsPayload(
  driverId: number,
  opts: RequestOpts
): Promise<DriverDocumentsPayload> {
  const response = await fetcher<unknown>(buildApiUrl(`/users/documents/${driverId}`), {
    token: opts.token,
    signal: opts.signal,
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
    debugLabel: "documents:drivers-list"
  });
}

/**
 * Documents queue uses drivers + partners list only.
 * Status badges come from list-embedded fields (`cnicStatus`, `licenseStatus`,
 * `vehicleDocStatus`). Null status fields map to PENDING.
 * Full image payloads still load only on preview/detail via GET /users/documents/{id}.
 */
export async function fetchDocumentsQueuePage(
  filters: DocumentsQueueFilters,
  opts: RequestOpts
): Promise<DocumentsQueuePage> {
  const includePartners = filters.documentType === "all" || filters.documentType === "CNIC";
  const [drivers, partners] = await Promise.all([
    fetchDocumentsQueueDrivers(filters, opts),
    includePartners
      ? fetchPartnersList(
          {
            page: filters.page,
            pageSize: filters.pageSize,
            status: filters.status,
            name: filters.name,
            mobileNumber: filters.mobileNumber,
            city: filters.city,
            gender: filters.gender
          },
          opts
        )
      : Promise.resolve({
          content: [] as PartnerRow[],
          totalPages: 0,
          totalElements: 0,
          number: filters.page
        } as PaginatedResponse<PartnerRow>)
  ]);

  const documentStatusesByDriverId: Record<number, DocumentStatusPayload> = {};
  const documentStatusByDriverId: Record<number, ApiDocStatus> = {};
  for (const driver of drivers.content) {
    const raw = documentStatusesFromListRow(driver);
    documentStatusesByDriverId[driver.id] = raw;
    documentStatusByDriverId[driver.id] = summarizeDocumentVerificationStatus(raw);
  }

  const documentStatusesByPartnerId: Record<
    number,
    Pick<DocumentStatusPayload, "cnicStatus">
  > = {};
  for (const partner of partners.content) {
    documentStatusesByPartnerId[partner.id] = {
      cnicStatus: partnerCnicStatusFromListRow(partner)
    };
  }

  return {
    drivers,
    partners,
    documentStatusByDriverId,
    documentStatusesByDriverId,
    documentStatusesByPartnerId
  };
}

export function buildPreviewDocuments(payload: DriverDocumentsPayload): PreviewDocument[] {
  const payloadRecord = payload as unknown as Record<string, unknown>;
  const vehicleStatusRaw = pickVehicleStatus(payloadRecord);

  const cnic: PreviewDocument = {
    id: "id-document",
    type: "ID_DOCUMENT",
    fileName: "id-document.jpg",
    frontUrl: safeImageUrl(payload.cnicFront) || FALLBACK_BY_TYPE.ID_DOCUMENT,
    backUrl: safeImageUrl(payload.cnicBack) || FALLBACK_BY_TYPE.ID_DOCUMENT,
    status: normalizeDocumentStatus(payload.cnicStatus)
  };

  if (isPartnerDocumentsPayload(payload)) {
    return [cnic];
  }

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
    cnic
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
    method: "PUT",
    body: JSON.stringify(toDriverDocumentStatusBody(payload)),
    debugLabel: "documents:status-update"
  });
}

export async function updatePartnerCnicStatus(
  partnerId: number,
  payload: { cnicStatus: ApiDocStatus; rejectionReason?: string },
  opts: RequestOpts
): Promise<void> {
  await fetcher(buildApiUrl(`/users/documents/status/${partnerId}`), {
    token: opts.token,
    signal: opts.signal,
    method: "PUT",
    body: JSON.stringify(payload),
    debugLabel: "documents:partner-cnic-status"
  });
}
