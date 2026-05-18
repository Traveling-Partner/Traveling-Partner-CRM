import { format, parseISO } from "date-fns";
import { buildApiUrl } from "@/lib/api/endpoints";
import { fetcher } from "@/lib/fetcher";

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
  status: "ACCEPTED" | "CANCELED" | "COMPLETED";
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
  completed: number;
  canceled: number;
}

interface AuditLogsResponse {
  content: DashboardAuditLogItem[];
  totalPages: number;
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
  { status: "ACCEPTED", count: 0 },
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
  countsRes: CountsResponse,
  driverStatusRes: DriverStatusCountsResponse,
  ridesTrendRes: Last14DaysGraphResponse,
  rideStatusRes: RideStatusCountResponse,
  auditLogsRes: AuditLogsResponse,
  recentActivityLimit: number
): AdminDashboardData {
  const recentActivity = [...(auditLogsRes.content ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, recentActivityLimit);

  return {
    counts: countsRes,
    driverStatusCounts: driverStatusRes,
    ridesTrend: (ridesTrendRes.dates ?? []).map((date, idx) => ({
      day: format(parseISO(date), "MMM d"),
      count: ridesTrendRes.counts?.[idx] ?? 0
    })),
    rideStatusBreakdown: [
      { status: "ACCEPTED", count: rideStatusRes.accepted ?? 0 },
      { status: "CANCELED", count: rideStatusRes.canceled ?? 0 },
      { status: "COMPLETED", count: rideStatusRes.completed ?? 0 }
    ],
    recentActivity
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

  const [countsRes, driverStatusRes, ridesTrendRes, rideStatusRes, auditLogsRes] =
    await Promise.all([
      fetcher<CountsResponse>(buildApiUrl("/users/counts"), requestInit),
      fetcher<DriverStatusCountsResponse>(buildApiUrl("/users/driver-status-counts"), requestInit),
      fetcher<Last14DaysGraphResponse>(buildApiUrl("/users/graph/last-14-days"), requestInit),
      fetcher<RideStatusCountResponse>(buildApiUrl("/users/ride-status-count"), requestInit),
      fetcher<AuditLogsResponse>(
        buildApiUrl("/audit-logs/getAll", { page: 0, size: recentActivityLimit }),
        requestInit
      )
    ]);

  return mapDashboardResponse(
    countsRes,
    driverStatusRes,
    ridesTrendRes,
    rideStatusRes,
    auditLogsRes,
    recentActivityLimit
  );
}
