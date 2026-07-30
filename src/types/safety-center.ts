/** Safety Center (SOS) types — Admin mock module until APIs exist. */

export type SosIncidentStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "FALSE_ALARM";

export type SosTriggerType =
  | "PANIC_BUTTON"
  | "AUTO_CRASH"
  | "ROUTE_DEVIATION"
  | "LONG_STOP"
  | "MANUAL_REPORT";

export type EmergencyServiceType = "POLICE" | "AMBULANCE" | "FIRE" | "ROADSIDE";

export type SafetyContactRelation = "FAMILY" | "FRIEND" | "SPOUSE" | "OTHER";

export interface GeoLocation {
  lat: number;
  lng: number;
  label: string;
  updatedAt: string;
}

export interface SafetyTripSnapshot {
  id: string;
  rideId: string;
  riderName: string;
  riderPhone: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  pickup: string;
  dropoff: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startedAt: string;
  fareEstimate: number;
}

export interface SosTimelineEvent {
  id: string;
  at: string;
  label: string;
  note?: string;
}

/** Manual case notes on an SOS — rider / partner / call-boy channels. */
export type SosNoteChannel = "RIDER" | "PARTNER" | "SAFETY_DESK";

export type SosNoteAttachmentKind = "IMAGE" | "SCREENSHOT" | "DOCUMENT";

export interface SosNoteAttachment {
  id: string;
  name: string;
  kind: SosNoteAttachmentKind;
  /** Local object URL or placeholder path (mock). */
  url: string;
  sizeLabel: string;
}

export interface SosCaseNote {
  id: string;
  channel: SosNoteChannel;
  body: string;
  author: string;
  createdAt: string;
  attachments: SosNoteAttachment[];
}

export interface SosIncident {
  id: string;
  code: string;
  status: SosIncidentStatus;
  trigger: SosTriggerType;
  city: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reportedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  location: GeoLocation;
  trip: SafetyTripSnapshot;
  /** Short system summary (legacy/display). */
  notes: string;
  /** Manual multi-channel comments with optional attachments. */
  caseNotes: SosCaseNote[];
  timeline: SosTimelineEvent[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: SafetyContactRelation;
  userName: string;
  userRole: "RIDER" | "DRIVER";
  isPrimary: boolean;
  createdAt: string;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: EmergencyServiceType;
  phone: string;
  city: string;
  available24h: boolean;
  notes?: string;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  incidentCode: string;
  title: string;
  summary: string;
  reportedBy: string;
  city: string;
  status: "OPEN" | "UNDER_REVIEW" | "CLOSED";
  createdAt: string;
  closedAt?: string;
}

export interface SafetySettings {
  autoShareLocation: boolean;
  panicButtonEnabled: boolean;
  shareTripWithContacts: boolean;
  notifyEmergencyContacts: boolean;
  autoAlertOnRouteDeviation: boolean;
  longStopMinutes: number;
  sosCooldownSeconds: number;
}
