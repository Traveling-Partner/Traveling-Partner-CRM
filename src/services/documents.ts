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

export type DocumentQueueRole = "DRIVER" | "PARTNER";

/** One row per document, as returned by GET /users/documents. */
export interface DocumentQueueApiRow {
  userId: number;
  role: DocumentQueueRole;
  name: string | null;
  mobileNumber: string | null;
  gender: string | null;
  city: string | null;
  email: string | null;
  cnicNumber: string | null;
  documentType: string;
  status: string;
  rejectionReason: string | null;
  vehicleType: string | null;
  frontUrl?: string | null;
  backUrl?: string | null;
  cnicFront?: string | null;
  cnicBack?: string | null;
  licenseFront?: string | null;
  licenseBack?: string | null;
  registrationFront?: string | null;
  registrationBack?: string | null;
}

export type DocumentsQueuePage = PaginatedResponse<DocumentQueueApiRow>;

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

/**
 * Single source for the verification queue: one row per document, already
 * covering both drivers and partners. List rows include front/back image URLs.
 */
export async function fetchDocumentsQueuePage(
  filters: DocumentsQueueFilters,
  opts: RequestOpts
): Promise<DocumentsQueuePage> {
  const url = buildApiUrl("/users/documents", {
    page: filters.page,
    size: filters.pageSize,
    name: filters.name.trim() || undefined,
    phonenumber: filters.mobileNumber.trim() || undefined,
    city: filters.city.trim() || undefined,
    gender: filters.gender === "all" ? undefined : filters.gender,
    status: filters.status === "all" ? undefined : filters.status,
    type: filters.documentType === "all" ? undefined : filters.documentType
  });

  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "documents:queue"
  });

  const data = unwrapEnvelope<PaginatedResponse<DocumentQueueApiRow>>(res);
  const content = Array.isArray(data?.content) ? data.content : [];

  return {
    content,
    totalPages: data?.totalPages ?? 1,
    totalElements: data?.totalElements ?? content.length,
    number: data?.number ?? filters.page
  };
}

const QUEUE_TYPE_TO_PREVIEW: Record<
  string,
  { id: PreviewDocument["id"]; type: PreviewDocument["type"]; fileName: string; fallback: string }
> = {
  CNIC: {
    id: "id-document",
    type: "ID_DOCUMENT",
    fileName: "id-document.jpg",
    fallback: FALLBACK_BY_TYPE.ID_DOCUMENT
  },
  LICENSE: {
    id: "driver-license",
    type: "DRIVER_LICENSE",
    fileName: "driver-license.jpg",
    fallback: FALLBACK_BY_TYPE.DRIVER_LICENSE
  },
  VEHICLE: {
    id: "vehicle-registration",
    type: "VEHICLE_REGISTRATION",
    fileName: "vehicle-registration.jpg",
    fallback: FALLBACK_BY_TYPE.VEHICLE_REGISTRATION
  }
};

function pickQueueImageUrl(
  row: DocumentQueueApiRow,
  side: "front" | "back"
): string | null {
  const record = row as unknown as Record<string, unknown>;
  const keys =
    side === "front"
      ? ["frontUrl", "cnicFront", "licenseFront", "registrationFront"]
      : ["backUrl", "cnicBack", "licenseBack", "registrationBack"];
  for (const key of keys) {
    const url = safeImageUrl(record[key]);
    if (url) return url;
  }
  return null;
}

/** Build a preview card from a GET /users/documents list row. */
export function previewDocumentFromQueueRow(row: DocumentQueueApiRow): PreviewDocument {
  const type = (row.documentType ?? "").toUpperCase();
  const mapping = QUEUE_TYPE_TO_PREVIEW[type] ?? QUEUE_TYPE_TO_PREVIEW.CNIC;
  return {
    id: mapping.id,
    type: mapping.type,
    fileName: mapping.fileName,
    frontUrl: pickQueueImageUrl(row, "front") || mapping.fallback,
    backUrl: pickQueueImageUrl(row, "back") || mapping.fallback,
    status: normalizeDocumentStatus(row.status)
  };
}

/** All list-row statuses for one user — used so approve/reject does not GET by id. */
export function documentStatusesFromQueueRows(
  rows: DocumentQueueApiRow[],
  userId: number,
  role: DocumentQueueRole
): DocumentStatusPayload {
  const payload: DocumentStatusPayload = {
    cnicStatus: "PENDING",
    licenseStatus: "PENDING",
    vehicleStatus: "PENDING"
  };
  for (const row of rows) {
    if (row.userId !== userId) continue;
    const rowRole = row.role === "PARTNER" ? "PARTNER" : "DRIVER";
    if (rowRole !== role) continue;
    const type = (row.documentType ?? "").toUpperCase();
    const status = mapRawStatus(row.status);
    if (type === "LICENSE") payload.licenseStatus = status;
    else if (type === "VEHICLE") payload.vehicleStatus = status;
    else payload.cnicStatus = status;
  }
  return payload;
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
