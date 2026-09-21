import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { SosIncidentsListFilters } from "@/lib/api/query-keys";

export type SosIncidentStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "FALSE_ALARM";

export type SosIncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SosCaseNoteChannel = "RIDER" | "PARTNER" | "SAFETY_DESK";

export type SosAttachmentKind = "IMAGE" | "SCREENSHOT" | "DOCUMENT";

/** Status values an admin may set from the Safety Desk. */
export type SosIncidentStatusAction = Extract<
  SosIncidentStatus,
  "ACKNOWLEDGED" | "RESOLVED" | "FALSE_ALARM"
>;

export interface SosIncidentTripSummary {
  riderName: string | null;
  driverName: string | null;
}

/** Row shape shared by the incidents list and the overview live table. */
export interface SosIncidentRow {
  id: number;
  code: string;
  status: SosIncidentStatus;
  severity: SosIncidentSeverity;
  city: string | null;
  trigger: string;
  reportedAt: string;
  trip: SosIncidentTripSummary | null;
}

export interface SosIncidentsPage {
  content: SosIncidentRow[];
  totalPages: number;
  totalElements: number;
  /** Distinct cities for the city filter, supplied by the list endpoint. */
  cities: string[];
}

export interface SosOverviewStats {
  activeCount: number;
  criticalCount: number;
  resolvedToday: number;
  total: number;
}

export interface SosOverview {
  stats: SosOverviewStats;
  liveIncidents: SosIncidentRow[];
}

/** Point captured when SOS was triggered — null when no coordinate source existed. */
export interface SosGeoPoint {
  lat: number;
  lng: number;
  label: string | null;
  updatedAt: string | null;
}

/** Resolved live from the linked RidePlan on every read. */
export interface SosTripDetail {
  id: number | null;
  rideId: number | null;
  riderName: string | null;
  riderPhone: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehiclePlate: string | null;
  pickup: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  dropoff: string | null;
  dropoffLatitude: number | null;
  dropoffLongitude: number | null;
  status: string | null;
  startedAt: string | null;
  fareEstimate: number | null;
}

export interface SosTimelineEntry {
  at: string;
  label: string;
  note: string | null;
}

export interface SosAttachment {
  id: number;
  name: string;
  kind: SosAttachmentKind;
  url: string;
  sizeLabel: string;
}

export interface SosCaseNoteRecord {
  id: number;
  channel: SosCaseNoteChannel;
  body: string;
  author: string;
  createdAt: string;
  attachments: SosAttachment[];
}

/** Snapshot sent by the triggering app — not a live profile lookup. */
export interface SosIncidentContact {
  name: string;
  phone: string;
  relation: string | null;
  userRole: string | null;
}

/** Extensible on the backend, so `action` stays a plain string. */
export interface SosEmergencyActionRecord {
  action: string;
  triggeredAt: string;
}

export interface SosNearbyService {
  id: number;
  name: string;
  number: string;
  state: string | null;
}

export interface SosResolution {
  status: SosIncidentStatus;
  comment: string | null;
  resolvedAt: string | null;
  resolvedBy: { id: number; name: string } | null;
}

export interface SosIncidentDetail {
  id: number;
  ridePlanId: number | null;
  code: string;
  status: SosIncidentStatus;
  trigger: string;
  city: string | null;
  severity: SosIncidentSeverity;
  reportedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  notes: string | null;
  location: SosGeoPoint | null;
  trip: SosTripDetail | null;
  timeline: SosTimelineEntry[];
  caseNotes: SosCaseNoteRecord[];
  emergencyContacts: SosIncidentContact[];
  emergencyActions: SosEmergencyActionRecord[];
  nearbyServices: SosNearbyService[];
  resolution: SosResolution | null;
}

export interface SosStatusUpdatePayload {
  status: SosIncidentStatusAction;
  /** Persisted only for RESOLVED / FALSE_ALARM. */
  comment?: string;
}

export interface SosCaseNotePayload {
  channel: SosCaseNoteChannel;
  body: string;
  author: string;
  files: File[];
}

type RequestOpts = { token: string; signal?: AbortSignal };

const FALLBACK_ERROR = "Request failed. Please try again.";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function readEnvelopeMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return FALLBACK_ERROR;
  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message.trim() : FALLBACK_ERROR;
}

function unwrap<T>(res: unknown): T | null {
  const envelope = (res ?? {}) as ApiEnvelope<T>;
  if (envelope.success === false) {
    throw new Error(readEnvelopeMessage(envelope));
  }
  return envelope.data ?? null;
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeDetail(data: SosIncidentDetail | null): SosIncidentDetail {
  if (!data) {
    throw new Error("SOS incident not found");
  }
  return {
    ...data,
    timeline: toArray<SosTimelineEntry>(data.timeline),
    caseNotes: toArray<SosCaseNoteRecord>(data.caseNotes),
    emergencyContacts: toArray<SosIncidentContact>(data.emergencyContacts),
    emergencyActions: toArray<SosEmergencyActionRecord>(data.emergencyActions),
    nearbyServices: toArray<SosNearbyService>(data.nearbyServices)
  };
}

export async function fetchSosOverview(opts: RequestOpts): Promise<SosOverview> {
  const res = await fetcher<unknown>(apiUrl("/sos/overview"), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "sos:overview"
  });
  const data = unwrap<SosOverview>(res);

  return {
    stats: {
      activeCount: data?.stats?.activeCount ?? 0,
      criticalCount: data?.stats?.criticalCount ?? 0,
      resolvedToday: data?.stats?.resolvedToday ?? 0,
      total: data?.stats?.total ?? 0
    },
    liveIncidents: toArray<SosIncidentRow>(data?.liveIncidents)
  };
}

export async function fetchSosIncidents(
  filters: SosIncidentsListFilters,
  opts: RequestOpts
): Promise<SosIncidentsPage> {
  const params = new URLSearchParams({
    // UI is 1-based, API is 0-based
    page: String(Math.max(0, filters.page - 1)),
    size: String(filters.pageSize)
  });

  const search = filters.search.trim();
  if (search) params.set("search", search);
  if (filters.status) params.set("status", filters.status);
  const city = filters.city.trim();
  if (city) params.set("city", city);
  const userId = filters.userId.trim();
  if (userId) params.set("userId", userId);

  const res = await fetcher<unknown>(
    `${apiUrl("/sos/incidents/getAll")}?${params.toString()}`,
    { token: opts.token, signal: opts.signal, debugLabel: "sos:incidents:list" }
  );
  const data = unwrap<SosIncidentsPage>(res);
  const content = toArray<SosIncidentRow>(data?.content);

  return {
    content,
    totalPages: data?.totalPages ?? 1,
    totalElements: data?.totalElements ?? content.length,
    cities: toArray<string>(data?.cities)
  };
}

export async function fetchSosIncidentDetail(
  id: string | number,
  opts: RequestOpts
): Promise<SosIncidentDetail> {
  const res = await fetcher<unknown>(apiUrl(`/sos/incidents/${id}`), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "sos:incidents:detail"
  });
  return normalizeDetail(unwrap<SosIncidentDetail>(res));
}

export async function updateSosIncidentStatus(
  id: string | number,
  payload: SosStatusUpdatePayload,
  token: string
): Promise<SosIncidentDetail> {
  const comment = payload.comment?.trim();
  const res = await fetcher<unknown>(apiUrl(`/sos/incidents/${id}/status`), {
    method: "PUT",
    token,
    body: JSON.stringify(comment ? { status: payload.status, comment } : payload),
    debugLabel: "sos:incidents:status"
  });
  return normalizeDetail(unwrap<SosIncidentDetail>(res));
}

/**
 * Case notes are multipart, so this bypasses `fetcher` (which always sets a
 * JSON content type) and lets the browser build the boundary itself.
 */
export async function addSosCaseNote(
  id: string | number,
  payload: SosCaseNotePayload,
  token: string
): Promise<SosIncidentDetail> {
  const form = new FormData();
  form.append("channel", payload.channel);
  form.append("author", payload.author);
  const body = payload.body.trim();
  if (body) form.append("body", body);
  payload.files.forEach((file) => form.append("files", file));

  let response: Response;
  try {
    response = await fetch(apiUrl(`/sos/incidents/${id}/notes`), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readEnvelopeMessage(json));
  }
  return normalizeDetail(unwrap<SosIncidentDetail>(json));
}
