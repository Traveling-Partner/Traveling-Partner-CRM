export type ApiDocStatus = "APPROVED" | "REJECTED" | "REJECT" | "PENDING";

export interface DriverDocumentsPayload {
  id?: number;
  roles?: string[] | null;
  cnicStatus?: string | null;
  licenseStatus?: string | null;
  vehicleStatus?: string | null;
  vehicleDocStatus?: string | null;
  registrationStatus?: string | null;
  cnicFront?: string | null;
  cnicBack?: string | null;
  licenseFront?: string | null;
  licenseBack?: string | null;
  registrationFront?: string | null;
  registrationBack?: string | null;
}

export function isPartnerDocumentsPayload(payload: DriverDocumentsPayload): boolean {
  return (payload.roles ?? []).some((role) => String(role).toUpperCase() === "PARTNER");
}

export function pickVehicleStatus(payload: Record<string, unknown>): unknown {
  const keys = [
    "vehicleDocStatus",
    "vehicleStatus",
    "registrationStatus",
    "vehicleRegistrationStatus",
    "registrationDocumentsStatus"
  ] as const;
  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
}

export function normalizeDocumentStatus(value: unknown): string {
  if (typeof value !== "string") return "PENDING";
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "PENDING";
  if (normalized === "REJECT") return "REJECTED";
  if (normalized === "VERIFIED") return "APPROVED";
  return normalized;
}

export function mapRawStatus(value: unknown): ApiDocStatus {
  if (value === null || value === undefined) return "PENDING";
  const s = String(value).trim().toUpperCase();
  if (s === "APPROVED" || s === "REJECTED" || s === "REJECT" || s === "PENDING") return s;
  return "PENDING";
}

export function normalizeApiDocStatus(value: unknown): ApiDocStatus {
  const mapped = mapRawStatus(value);
  return mapped === "REJECT" ? "REJECTED" : mapped;
}

export function summarizeDocumentVerificationStatus(payload: DriverDocumentsPayload): ApiDocStatus {
  const vehicleStatusRaw = pickVehicleStatus(payload as unknown as Record<string, unknown>);
  const statuses: ApiDocStatus[] = [
    normalizeApiDocStatus(payload.cnicStatus),
    normalizeApiDocStatus(payload.licenseStatus),
    normalizeApiDocStatus(vehicleStatusRaw)
  ];
  if (statuses.some((s) => s === "REJECTED")) return "REJECTED";
  if (statuses.every((s) => s === "APPROVED")) return "APPROVED";
  return "PENDING";
}

export function deriveDocStatuses(payload: DriverDocumentsPayload) {
  const vehicleStatusRaw = pickVehicleStatus(payload as unknown as Record<string, unknown>);
  return {
    cnic: normalizeDocumentStatus(payload.cnicStatus),
    license: normalizeDocumentStatus(payload.licenseStatus),
    vehicle: normalizeDocumentStatus(vehicleStatusRaw)
  };
}
