import { format, parseISO } from "date-fns";
import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import { fetcher } from "@/lib/fetcher";
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

export interface AdminDashboardData {
  counts: DashboardCounts;
  driverStatusCounts: DashboardDriverStatusCounts;
  ridesTrend: DashboardRidesTrendPoint[];
  rideStatusBreakdown: DashboardRideStatusBreakdown[];
  recentActivity: DashboardAuditLogItem[];
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

export const EMPTY_ADMIN_DASHBOARD_DATA: AdminDashboardData = {
  counts: EMPTY_COUNTS,
  driverStatusCounts: EMPTY_DRIVER_STATUS,
  ridesTrend: [],
  rideStatusBreakdown: EMPTY_RIDE_STATUS,
  recentActivity: []
};

function mapDashboardResponse(
  countsRes: unknown,
  driverStatusRes: unknown,
  ridesTrendRes: unknown,
  rideStatusRes: unknown,
  recentActivity: DashboardAuditLogItem[],
  recentActivityLimit: number
): AdminDashboardData {
  const counts = unwrapEnvelope<CountsResponse>(countsRes);
  const driverStatusCounts = unwrapEnvelope<DriverStatusCountsResponse>(driverStatusRes);
  const ridesTrendPayload = unwrapEnvelope<Last14DaysGraphResponse>(ridesTrendRes);
  const rideStatus = unwrapEnvelope<RideStatusCountResponse>(rideStatusRes);
  const activity = [...recentActivity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, recentActivityLimit);

  return {
    counts,
    driverStatusCounts,
    ridesTrend: (ridesTrendPayload.dates ?? []).map((date, idx) => ({
      day: format(parseISO(date), "MMM d"),
      count: ridesTrendPayload.counts?.[idx] ?? 0
    })),
    rideStatusBreakdown: [
      { status: "REQUESTED", count: rideStatus.requested ?? 0 },
      { status: "ACCEPTED", count: rideStatus.accepted ?? 0 },
      { status: "STARTED", count: rideStatus.started ?? 0 },
      { status: "CANCELED", count: rideStatus.canceled ?? 0 },
      { status: "COMPLETED", count: rideStatus.completed ?? 0 }
    ],
    recentActivity: activity
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

  const [countsRes, driverStatusRes, ridesTrendRes, rideStatusRes, auditLogsPage] =
    await Promise.all([
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
      )
    ]);

  return mapDashboardResponse(
    countsRes,
    driverStatusRes,
    ridesTrendRes,
    rideStatusRes,
    auditLogsPage.content ?? [],
    recentActivityLimit
  );
}
