import { format, parseISO } from "date-fns";
import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import { fetcher, isAbortError } from "@/lib/fetcher";
import {
  DEMO_DOCUMENTS_PENDING,
  DEMO_FARE_TREND,
  DEMO_OUTCOME_TREND,
  DEMO_RIDES_BY_CITY,
  DEMO_RIDE_FUNNEL,
  DEMO_COMMISSION,
  DEMO_TOP_AGENTS
} from "@/mock-data/dashboard-ops";
import { fetchAuditLogs } from "@/services/audit-logs";

export interface DashboardCounts {
  totalDrivers: number;
  totalPartners: number;
  totalSalesAgents: number;
  totalRidePlans: number;
}

export interface DashboardDriverStatusCounts {
  active: number;
  inactive: number;
  blocked: number;
  pending: number;
  approved: number;
}

export interface DashboardRidesTrendPoint {
  day: string;
  count: number;
}

export interface DashboardRideStatusBreakdown {
  status: "REQUESTED" | "ACCEPTED" | "STARTED" | "CANCELED" | "COMPLETED";
  count: number;
}

export interface DashboardAuditLogItem {
  id: number;
  userType: string | null;
  description: string | null;
  createdAt: string;
  mobileNumber: string | null;
}

export interface DashboardFunnelStage {
  status: string;
  count: number;
}

export interface DashboardRideFunnel {
  stages: DashboardFunnelStage[];
  canceled: number;
  expired: number;
}

export interface DashboardOutcomePoint {
  day: string;
  completed: number;
  canceled: number;
}

export interface DashboardCityCount {
  city: string;
  count: number;
}

export interface DashboardFarePoint {
  day: string;
  amount: number;
}

export interface DashboardDocumentsPending {
  driverCnic: number;
  driverLicense: number;
  vehicle: number;
  partnerCnic: number;
}

export interface DashboardCommission {
  pending: number;
  released: number;
  remaining: number;
}

export interface DashboardTopAgent {
  name: string;
  drivers: number;
  partners: number;
}

export interface AdminDashboardData {
  counts: DashboardCounts;
  driverStatusCounts: DashboardDriverStatusCounts;
  ridesTrend: DashboardRidesTrendPoint[];
  rideStatusBreakdown: DashboardRideStatusBreakdown[];
  recentActivity: DashboardAuditLogItem[];
  rideFunnel: DashboardRideFunnel;
  outcomeTrend: DashboardOutcomePoint[];
  ridesByCity: DashboardCityCount[];
  fareTrend: DashboardFarePoint[];
  documentsPending: DashboardDocumentsPending;
  commission: DashboardCommission;
  topAgents: DashboardTopAgent[];
  opsApi: {
    rideFunnel: boolean;
    outcomeTrend: boolean;
    ridesByCity: boolean;
    fareTrend: boolean;
    documentsPending: boolean;
    commission: boolean;
    topAgents: boolean;
  };
  opsDemo: {
    rideFunnel: boolean;
    outcomeTrend: boolean;
    ridesByCity: boolean;
    fareTrend: boolean;
    documentsPending: boolean;
    commission: boolean;
    topAgents: boolean;
  };
}

interface CountsResponse {
  totalDrivers: number;
  totalPartners: number;
  totalSalesAgents: number;
  totalRidePlans: number;
}

interface DriverStatusCountsResponse {
  active: number;
  inactive: number;
  blocked: number;
  pending: number;
  approved: number;
}

interface Last14DaysGraphResponse {
  dates: string[];
  counts: number[];
}

interface RideStatusCountResponse {
  requested: number;
  accepted: number;
  started: number;
  canceled: number;
  completed: number;
}

const EMPTY_COUNTS: DashboardCounts = {
  totalDrivers: 0,
  totalPartners: 0,
  totalSalesAgents: 0,
  totalRidePlans: 0
};

const EMPTY_DRIVER_STATUS: DashboardDriverStatusCounts = {
  active: 0,
  inactive: 0,
  blocked: 0,
  pending: 0,
  approved: 0
};

const EMPTY_RIDE_STATUS: DashboardRideStatusBreakdown[] = [
  { status: "REQUESTED", count: 0 },
  { status: "ACCEPTED", count: 0 },
  { status: "STARTED", count: 0 },
  { status: "CANCELED", count: 0 },
  { status: "COMPLETED", count: 0 }
];

const EMPTY_FUNNEL: DashboardRideFunnel = {
  stages: [
    { status: "REQUESTED", count: 0 },
    { status: "ACCEPTED", count: 0 },
    { status: "STARTED", count: 0 },
    { status: "COMPLETED", count: 0 }
  ],
  canceled: 0,
  expired: 0
};

const EMPTY_DOCUMENTS: DashboardDocumentsPending = {
  driverCnic: 0,
  driverLicense: 0,
  vehicle: 0,
  partnerCnic: 0
};

const EMPTY_COMMISSION: DashboardCommission = {
  pending: 0,
  released: 0,
  remaining: 0
};

export const EMPTY_ADMIN_DASHBOARD_DATA: AdminDashboardData = {
  counts: EMPTY_COUNTS,
  driverStatusCounts: EMPTY_DRIVER_STATUS,
  ridesTrend: [],
  rideStatusBreakdown: EMPTY_RIDE_STATUS,
  recentActivity: [],
  rideFunnel: EMPTY_FUNNEL,
  outcomeTrend: [],
  ridesByCity: [],
  fareTrend: [],
  documentsPending: EMPTY_DOCUMENTS,
  commission: EMPTY_COMMISSION,
  topAgents: [],
  opsApi: {
    rideFunnel: false,
    outcomeTrend: false,
    ridesByCity: false,
    fareTrend: false,
    documentsPending: false,
    commission: false,
    topAgents: false
  },
  opsDemo: {
    rideFunnel: false,
    outcomeTrend: false,
    ridesByCity: false,
    fareTrend: false,
    documentsPending: false,
    commission: false,
    topAgents: false
  }
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDayLabel(date: string) {
  try {
    return format(parseISO(date), "MMM d");
  } catch {
    return date;
  }
}

async function fetchOptionalJson(
  path: string,
  requestInit: { token: string; signal?: AbortSignal; dedupe: false; debugLabel: string },
  searchParams?: Record<string, string | number | undefined>
): Promise<unknown | null> {
  try {
    return await fetcher<unknown | null>(buildApiUrl(path, searchParams), {
      ...requestInit,
      ignoreHttpError: true
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    return null;
  }
}

function funnelFromRideStatus(rideStatus: RideStatusCountResponse): DashboardRideFunnel {
  return {
    stages: [
      { status: "REQUESTED", count: rideStatus.requested ?? 0 },
      { status: "ACCEPTED", count: rideStatus.accepted ?? 0 },
      { status: "STARTED", count: rideStatus.started ?? 0 },
      { status: "COMPLETED", count: rideStatus.completed ?? 0 }
    ],
    canceled: rideStatus.canceled ?? 0,
    expired: 0
  };
}

function mapRideFunnel(payload: unknown, fallback: DashboardRideFunnel): DashboardRideFunnel {
  if (!payload) return fallback;
  const data = asRecord(unwrapEnvelope(payload));
  const rawStages = Array.isArray(data.stages) ? data.stages : [];
  const stages = rawStages
    .map((item) => {
      const row = asRecord(item);
      const status = typeof row.status === "string" ? row.status : "";
      return { status, count: num(row.count) };
    })
    .filter((row) => row.status);
  if (stages.length === 0) return fallback;
  return {
    stages,
    canceled: num(data.canceled ?? data.canceledCount),
    expired: num(data.expired ?? data.expiredCount)
  };
}

function mapOutcomeTrend(payload: unknown): DashboardOutcomePoint[] {
  if (!payload) return [];
  const data = asRecord(unwrapEnvelope(payload));
  const dates = Array.isArray(data.dates) ? data.dates.map(String) : [];
  const completed = Array.isArray(data.completed) ? data.completed : [];
  const canceled = Array.isArray(data.canceled) ? data.canceled : [];
  if (dates.length > 0) {
    return dates.map((date, idx) => ({
      day: formatDayLabel(date),
      completed: num(completed[idx]),
      canceled: num(canceled[idx])
    }));
  }
  const points = Array.isArray(data.points) ? data.points : [];
  return points.map((item) => {
    const row = asRecord(item);
    return {
      day: formatDayLabel(String(row.day ?? row.date ?? "")),
      completed: num(row.completed),
      canceled: num(row.canceled)
    };
  });
}

function mapRidesByCity(payload: unknown): DashboardCityCount[] {
  if (!payload) return [];
  const data = unwrapEnvelope(payload);
  const rows = Array.isArray(asRecord(data).cities)
    ? (asRecord(data).cities as unknown[])
    : Array.isArray(data)
      ? (data as unknown[])
      : [];
  return rows
    .map((item) => {
      const row = asRecord(item);
      const city = String(row.city ?? row.name ?? "").trim();
      return { city, count: num(row.count ?? row.rides) };
    })
    .filter((row) => row.city)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function mapFareTrend(payload: unknown): DashboardFarePoint[] {
  if (!payload) return [];
  const data = asRecord(unwrapEnvelope(payload));
  const dates = Array.isArray(data.dates) ? data.dates.map(String) : [];
  const amounts = Array.isArray(data.amounts)
    ? data.amounts
    : Array.isArray(data.fares)
      ? data.fares
      : [];
  if (dates.length > 0) {
    return dates.map((date, idx) => ({
      day: formatDayLabel(date),
      amount: num(amounts[idx])
    }));
  }
  const points = Array.isArray(data.points) ? data.points : [];
  return points.map((item) => {
    const row = asRecord(item);
    return {
      day: formatDayLabel(String(row.day ?? row.date ?? "")),
      amount: num(row.amount ?? row.fare ?? row.total)
    };
  });
}

function mapDocumentsPending(payload: unknown): DashboardDocumentsPending {
  if (!payload) return EMPTY_DOCUMENTS;
  const data = asRecord(unwrapEnvelope(payload));
  return {
    driverCnic: num(data.driverCnic ?? data.cnicPending ?? data.driverCnicPending),
    driverLicense: num(data.driverLicense ?? data.licensePending ?? data.driverLicensePending),
    vehicle: num(data.vehicle ?? data.vehiclePending ?? data.vehicleDocPending),
    partnerCnic: num(data.partnerCnic ?? data.partnerCnicPending)
  };
}

function mapCommission(payload: unknown): DashboardCommission {
  if (!payload) return EMPTY_COMMISSION;
  const data = asRecord(unwrapEnvelope(payload));
  const pending = num(data.pending ?? data.pendingAmount);
  const released = num(data.released ?? data.paid ?? data.releasedAmount);
  const total = num(data.total);
  const remainingRaw = data.remaining ?? data.remainingAmount;
  const remaining =
    remainingRaw != null && remainingRaw !== ""
      ? num(remainingRaw)
      : total > 0
        ? Math.max(total - pending - released, 0)
        : 0;
  return {
    pending,
    released,
    remaining
  };
}

function mapTopAgents(payload: unknown): DashboardTopAgent[] {
  if (!payload) return [];
  const data = unwrapEnvelope(payload);
  const rows = Array.isArray(asRecord(data).agents)
    ? (asRecord(data).agents as unknown[])
    : Array.isArray(data)
      ? (data as unknown[])
      : [];
  return rows
    .map((item) => {
      const row = asRecord(item);
      const name = String(row.name ?? row.agentName ?? "").trim();
      return {
        name,
        drivers: num(row.drivers ?? row.driverCount),
        partners: num(row.partners ?? row.partnerCount ?? row.passengerCount)
      };
    })
    .filter((row) => row.name)
    .sort((a, b) => b.drivers + b.partners - (a.drivers + a.partners))
    .slice(0, 6);
}

function mapDashboardResponse(
  countsRes: unknown,
  driverStatusRes: unknown,
  ridesTrendRes: unknown,
  rideStatusRes: unknown,
  recentActivity: DashboardAuditLogItem[],
  recentActivityLimit: number,
  ops: {
    funnel: unknown | null;
    outcome: unknown | null;
    city: unknown | null;
    fare: unknown | null;
    documents: unknown | null;
    commission: unknown | null;
    topAgents: unknown | null;
  }
): AdminDashboardData {
  const counts = unwrapEnvelope<CountsResponse>(countsRes);
  const driverStatusCounts = unwrapEnvelope<DriverStatusCountsResponse>(driverStatusRes);
  const ridesTrendPayload = unwrapEnvelope<Last14DaysGraphResponse>(ridesTrendRes);
  const rideStatus = unwrapEnvelope<RideStatusCountResponse>(rideStatusRes);
  const activity = [...recentActivity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, recentActivityLimit);
  const fallbackFunnel = funnelFromRideStatus(rideStatus);
  const rideFunnel = ops.funnel != null ? mapRideFunnel(ops.funnel, fallbackFunnel) : DEMO_RIDE_FUNNEL;
  const outcomeTrend = ops.outcome != null ? mapOutcomeTrend(ops.outcome) : DEMO_OUTCOME_TREND;
  const ridesByCity = ops.city != null ? mapRidesByCity(ops.city) : DEMO_RIDES_BY_CITY;
  const fareTrend = ops.fare != null ? mapFareTrend(ops.fare) : DEMO_FARE_TREND;
  const documentsPending =
    ops.documents != null ? mapDocumentsPending(ops.documents) : DEMO_DOCUMENTS_PENDING;
  const commission = ops.commission != null ? mapCommission(ops.commission) : DEMO_COMMISSION;
  const topAgents = ops.topAgents != null ? mapTopAgents(ops.topAgents) : DEMO_TOP_AGENTS;

  return {
    counts,
    driverStatusCounts,
    ridesTrend: (ridesTrendPayload.dates ?? []).map((date, idx) => ({
      day: formatDayLabel(date),
      count: ridesTrendPayload.counts?.[idx] ?? 0
    })),
    rideStatusBreakdown: [
      { status: "REQUESTED", count: rideStatus.requested ?? 0 },
      { status: "ACCEPTED", count: rideStatus.accepted ?? 0 },
      { status: "STARTED", count: rideStatus.started ?? 0 },
      { status: "CANCELED", count: rideStatus.canceled ?? 0 },
      { status: "COMPLETED", count: rideStatus.completed ?? 0 }
    ],
    recentActivity: activity,
    rideFunnel,
    outcomeTrend,
    ridesByCity,
    fareTrend,
    documentsPending,
    commission,
    topAgents,
    opsApi: {
      rideFunnel: ops.funnel != null,
      outcomeTrend: ops.outcome != null,
      ridesByCity: ops.city != null,
      fareTrend: ops.fare != null,
      documentsPending: ops.documents != null,
      commission: ops.commission != null,
      topAgents: ops.topAgents != null
    },
    opsDemo: {
      rideFunnel: ops.funnel == null,
      outcomeTrend: ops.outcome == null,
      ridesByCity: ops.city == null,
      fareTrend: ops.fare == null,
      documentsPending: ops.documents == null,
      commission: ops.commission == null,
      topAgents: ops.topAgents == null
    }
  };
}

/** Fetches all admin dashboard metrics in one parallel batch. */
export async function fetchAdminDashboardData(
  token: string,
  options: {
    signal?: AbortSignal;
    recentActivityLimit?: number;
    debugSource?: string;
  } = {}
): Promise<AdminDashboardData> {
  const { signal, recentActivityLimit = 10, debugSource } = options;
  const label = debugSource ? `admin-dashboard:${debugSource}` : "admin-dashboard";
  const requestInit = { token, signal, dedupe: false as const, debugLabel: label };

  const [
    countsRes,
    driverStatusRes,
    ridesTrendRes,
    rideStatusRes,
    auditLogsPage,
    funnelRes,
    outcomeRes,
    cityRes,
    fareRes,
    documentsRes,
    commissionRes,
    topAgentsRes
  ] = await Promise.all([
    fetcher<unknown>(buildApiUrl("/users/counts"), requestInit),
    fetcher<unknown>(buildApiUrl("/users/driver-status-counts"), requestInit),
    fetcher<unknown>(buildApiUrl("/users/graph/last-14-days"), requestInit),
    fetcher<unknown>(buildApiUrl("/users/ride-status-count"), requestInit),
    fetchAuditLogs(
      {
        page: 0,
        pageSize: recentActivityLimit,
        userType: "all",
        search: "",
        fromDate: "",
        toDate: "",
        module: "",
        action: "",
        userId: ""
      },
      { token, signal }
    ),
    fetchOptionalJson("/users/ride-funnel", { ...requestInit, debugLabel: `${label}:funnel` }),
    fetchOptionalJson(
      "/users/graph/completed-vs-canceled",
      { ...requestInit, debugLabel: `${label}:outcome` },
      { days: 14 }
    ),
    fetchOptionalJson("/users/rides-by-city", { ...requestInit, debugLabel: `${label}:city` }),
    fetchOptionalJson("/users/graph/fare-last-14-days", { ...requestInit, debugLabel: `${label}:fare` }),
    fetchOptionalJson("/users/documents/pending-counts", { ...requestInit, debugLabel: `${label}:docs` }),
    fetchOptionalJson("/users/commission-summary", { ...requestInit, debugLabel: `${label}:commission` }),
    fetchOptionalJson("/users/top-agents", { ...requestInit, debugLabel: `${label}:top-agents` })
  ]);

  return mapDashboardResponse(
    countsRes,
    driverStatusRes,
    ridesTrendRes,
    rideStatusRes,
    auditLogsPage.content ?? [],
    recentActivityLimit,
    {
      funnel: funnelRes,
      outcome: outcomeRes,
      city: cityRes,
      fare: fareRes,
      documents: documentsRes,
      commission: commissionRes,
      topAgents: topAgentsRes
    }
  );
}
