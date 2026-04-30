"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { fetcher } from "@/lib/fetcher";
import { useAppSelector } from "@/store/hooks";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, parseISO } from "date-fns";

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

interface AuditLogItem {
  id: number;
  userType: string | null;
  description: string | null;
  createdAt: string;
  mobileNumber: string | null;
}

interface AuditLogsResponse {
  content: AuditLogItem[];
  totalPages: number;
}

const DASHBOARD_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const RECENT_ACTIVITY_PAGE_SIZE = 8;

export default function AdminDashboardPage() {
  const token = useAppSelector((state) => state.auth.token);
  const [counts, setCounts] = useState<CountsResponse>({
    totalDrivers: 0,
    totalPartners: 0,
    totalSalesAgents: 0,
    totalRidePlans: 0
  });
  const [driverStatusCounts, setDriverStatusCounts] = useState<DriverStatusCountsResponse>({
    active: 0,
    inactive: 0,
    blocked: 0,
    pending: 0,
    approved: 0
  });
  const [ridesTrend, setRidesTrend] = useState<Array<{ day: string; count: number }>>([]);
  const [rideStatusBreakdown, setRideStatusBreakdown] = useState<
    Array<{ status: "ACCEPTED" | "CANCELED" | "COMPLETED"; count: number }>
  >([
    { status: "ACCEPTED", count: 0 },
    { status: "CANCELED", count: 0 },
    { status: "COMPLETED", count: 0 }
  ]);
  const [recentActivity, setRecentActivity] = useState<AuditLogItem[]>([]);
  const [recentActivityPage, setRecentActivityPage] = useState(0);
  const [recentActivityTotalPages, setRecentActivityTotalPages] = useState(1);

  const loadDashboard = useCallback(async () => {
    try {
      const [countsRes, driverStatusRes, ridesTrendRes, rideStatusRes, auditLogsRes] =
        await Promise.all([
        fetcher<CountsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/users/counts`, { token }),
        fetcher<DriverStatusCountsResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/driver-status-counts`,
          { token }
        ),
        fetcher<Last14DaysGraphResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/graph/last-14-days`,
          { token }
        ),
        fetcher<RideStatusCountResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/ride-status-count`,
          { token }
        ),
        fetcher<AuditLogsResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/audit-logs/getAll?page=${recentActivityPage}&size=${RECENT_ACTIVITY_PAGE_SIZE}`,
          { token }
        )
        ]);

      setCounts(countsRes);
      setDriverStatusCounts(driverStatusRes);
      setRidesTrend(
        (ridesTrendRes.dates ?? []).map((date, idx) => ({
          day: format(parseISO(date), "MMM d"),
          count: ridesTrendRes.counts?.[idx] ?? 0
        }))
      );
      setRideStatusBreakdown([
        { status: "ACCEPTED", count: rideStatusRes.accepted ?? 0 },
        { status: "CANCELED", count: rideStatusRes.canceled ?? 0 },
        { status: "COMPLETED", count: rideStatusRes.completed ?? 0 }
      ]);
      const sortedActivity = [...(auditLogsRes.content ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentActivity(sortedActivity);
      setRecentActivityTotalPages(Math.max(1, auditLogsRes.totalPages || 1));
    } catch {
      setCounts({
        totalDrivers: 0,
        totalPartners: 0,
        totalSalesAgents: 0,
        totalRidePlans: 0
      });
      setDriverStatusCounts({
        active: 0,
        inactive: 0,
        blocked: 0,
        pending: 0,
        approved: 0
      });
      setRidesTrend([]);
      setRideStatusBreakdown([
        { status: "ACCEPTED", count: 0 },
        { status: "CANCELED", count: 0 },
        { status: "COMPLETED", count: 0 }
      ]);
      setRecentActivity([]);
      setRecentActivityTotalPages(1);
    }
  }, [token, recentActivityPage]);

  useEffect(() => {
    let mounted = true;
    const runRefresh = async () => {
      if (!mounted) return;
      await loadDashboard();
    };

    void runRefresh();
    const intervalId = window.setInterval(() => {
      void runRefresh();
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [loadDashboard]);

  const statusRows = useMemo(
    () => [
      { label: "Active drivers", badge: "ACTIVE", count: driverStatusCounts.active },
      { label: "Approved drivers", badge: "APPROVED", count: driverStatusCounts.approved },
      { label: "Inactive drivers", badge: "INACTIVE", count: driverStatusCounts.inactive },
      { label: "Blocked drivers", badge: "BLOCKED", count: driverStatusCounts.blocked },
      { label: "Pending drivers", badge: "PENDING", count: driverStatusCounts.pending }
    ],
    [driverStatusCounts]
  );

  const statusColors = ["#fdb813", "#ef4444", "#22c55e", "#3b82f6"];

  return (
    <AppShell title="Admin Dashboard">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Drivers
              </p>
              <p className="text-2xl font-heading font-semibold">
                {counts.totalDrivers}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Partners
              </p>
              <p className="text-2xl font-heading font-semibold">
                {counts.totalPartners}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Agents
              </p>
              <p className="text-2xl font-heading font-semibold">
                {counts.totalSalesAgents}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Rides
              </p>
              <p className="text-2xl font-heading font-semibold">
                {counts.totalRidePlans}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-3">
            <CardContent className="space-y-3 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active vs Suspended
              </p>
              {statusRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span>{row.label}</span>
                  <StatusBadge status={row.badge} />
                  <span className="font-semibold">{row.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <SectionCard
          title="Rides trend"
          description="Daily ride volume across your active markets."
          className="mt-6"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ridesTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="day" tickMargin={8} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid hsl(var(--border))"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Rides"
                  stroke="#fdb813"
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Ride status breakdown"
          description="Distribution of accepted, canceled, and completed rides."
          className="mt-6"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rideStatusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="status" tickMargin={8} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Trips" radius={[6, 6, 0, 0]}>
                    {rideStatusBreakdown.map((entry, idx) => (
                      <Cell key={entry.status} fill={statusColors[idx % statusColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rideStatusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {rideStatusBreakdown.map((entry, idx) => (
                      <Cell key={entry.status} fill={statusColors[idx % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Key administrative events across drivers, partners, and agents."
          className="mt-6"
        >
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-4 text-xs text-muted-foreground">
                No recent activity found.
              </p>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium">{log.description?.trim() || "—"}</p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      {log.userType || "—"} • {log.mobileNumber || "—"}
                    </p>
                  </div>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              ))
            )}
          </div>
          <PaginationControls
            currentPage={recentActivityPage + 1}
            totalPages={recentActivityTotalPages}
            onPageChange={(p) => setRecentActivityPage(p - 1)}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}

