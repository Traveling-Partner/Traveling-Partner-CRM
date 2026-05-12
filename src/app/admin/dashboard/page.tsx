"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import {
  Users,
  Briefcase,
  UserCircle2,
  Car,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";
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

const DASHBOARD_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const RECENT_ACTIVITY_LIMIT = 10;

export default function AdminDashboardPage() {
  const token = useAppSelector((state) => state.auth.token);
  const [isLoading, setIsLoading] = useState(true);
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
          `${process.env.NEXT_PUBLIC_API_URL}/audit-logs/getAll?page=0&size=${RECENT_ACTIVITY_LIMIT}`,
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
      const sortedActivity = [...(auditLogsRes.content ?? [])]
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, RECENT_ACTIVITY_LIMIT);
      setRecentActivity(sortedActivity);
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
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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

  const statCards = [
    { label: "Total Drivers", value: counts.totalDrivers, icon: Users, accent: "from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5" },
    { label: "Total Partners", value: counts.totalPartners, icon: Briefcase, accent: "from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5" },
    { label: "Total Agents", value: counts.totalSalesAgents, icon: UserCircle2, accent: "from-violet-500/10 to-violet-600/10 dark:from-violet-500/5 dark:to-violet-600/5" },
    { label: "Total Rides", value: counts.totalRidePlans, icon: Car, accent: "from-amber-500/10 to-amber-600/10 dark:from-amber-500/5 dark:to-amber-600/5" }
  ];

  return (
    <AppShell title="Admin Dashboard">
      <PageContainer>
        {/* Stat Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
              <CardContent className="relative flex items-center gap-3 p-3.5 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#fce001] to-[#fdb813]">
                  <stat.icon className="h-4 w-4 text-slate-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-6 w-14" />
                  ) : (
                    <p className="text-xl font-heading font-bold text-foreground">
                      {stat.value.toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Driver Status Overview */}
        <Card>
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 border-b border-border/50">
            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground sm:text-base">Driver status overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Active vs suspended breakdown</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>Live</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {statusRows.map((row, idx) => (
              <div
                key={row.label}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-4 px-3 text-center",
                  idx < statusRows.length - 1 && "border-r border-border/40",
                  "last:border-r-0"
                )}
              >
                <span className="text-xl font-heading font-bold text-foreground tabular-nums">
                  {isLoading ? <Skeleton className="h-6 w-8 mx-auto" /> : row.count}
                </span>
                <StatusBadge status={row.badge} />
                <span className="text-[11px] text-muted-foreground">{row.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Rides Trend Chart */}
        <SectionCard
          title="Rides trend"
          description="Daily ride volume across your active markets over the last 14 days."
          headerAction={
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>14 days</span>
            </div>
          }
        >
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ridesTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="day" tickMargin={8} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={40} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "var(--shadow-lg)",
                    fontSize: 13
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Rides"
                  stroke="#fdb813"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Ride Status Breakdown */}
        <SectionCard
          title="Ride status breakdown"
          description="Distribution of accepted, canceled, and completed rides."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rideStatusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="status" tickMargin={8} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={40} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "var(--shadow-lg)",
                      fontSize: 13
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Trips" radius={[8, 8, 0, 0]}>
                    {rideStatusBreakdown.map((entry, idx) => (
                      <Cell key={entry.status} fill={statusColors[idx % statusColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rideStatusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
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

        {/* Recent Activity */}
        <SectionCard
          title="Recent activity"
          description="Key administrative events across drivers, partners, and agents."
          headerAction={
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Latest</span>
            </div>
          }
        >
          <div className="divide-y divide-border/40">
            {recentActivity.length === 0 ? (
              <div className="rounded-lg bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No recent activity found.
              </div>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-2.5 px-1 transition-colors duration-150 hover:bg-[var(--brand-light)] first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {log.description?.trim() || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {log.userType || "—"} &middot; {log.mobileNumber || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
