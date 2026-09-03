"use client";

import { useMemo, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminDashboardQuery } from "@/hooks/queries/use-admin-dashboard-query";
import { useAgentsListQuery } from "@/hooks/queries/use-agents-list-query";
import {
  buildAgentPerformanceRow,
  getAgentCommissions
} from "@/lib/agent-onboarding";
import { AuditLogsSection } from "@/components/audit-logs/AuditLogsSection";
import {
  Users,
  Briefcase,
  UserCircle2,
  Car,
  TrendingUp,
  BadgeDollarSign
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, parseISO } from "date-fns";

const PIE_COLORS = ["#3b82f6", "#fdb813", "#f97316", "#ef4444", "#22c55e"];
const BAR_COLORS = ["#3b82f6", "#fdb813", "#22c55e", "#ef4444", "#f97316"];
const DRIVER_STATUS_COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#f97316", "#fdb813"];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
      <p className="text-[11px] font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-xs font-semibold text-foreground tabular-nums">{p.value.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.payload.fill }} />
        <span className="text-xs font-semibold text-foreground">{d.name}</span>
      </div>
      <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{d.value.toLocaleString()}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, loading: isLoading, error } = useAdminDashboardQuery();
  const {
    data: agentsData,
    isLoading: agentsLoading,
    isFetching: agentsFetching
  } = useAgentsListQuery({
    page: 0,
    pageSize: 100,
    status: "all",
    name: "",
    mobileNumber: "",
    city: "",
    gender: "all"
  });
  const {
    counts,
    driverStatusCounts,
    ridesTrend,
    rideStatusBreakdown
  } = data;

  const statusRows = useMemo(
    () => [
      { label: "Active", badge: "ACTIVE", count: driverStatusCounts.active, color: "text-emerald-600 dark:text-emerald-400" },
      { label: "Approved", badge: "APPROVED", count: driverStatusCounts.approved, color: "text-emerald-600 dark:text-emerald-400" },
      { label: "Inactive", badge: "INACTIVE", count: driverStatusCounts.inactive, color: "text-red-500" },
      { label: "Blocked", badge: "BLOCKED", count: driverStatusCounts.blocked, color: "text-red-500" },
      { label: "Pending", badge: "PENDING", count: driverStatusCounts.pending, color: "text-amber-500" }
    ],
    [driverStatusCounts]
  );
  const driverStatusTotal = statusRows.reduce((sum, row) => sum + row.count, 0);

  const rideTotal = rideStatusBreakdown.reduce((sum, r) => sum + r.count, 0);
  const isAgentPerfLoading = agentsLoading || agentsFetching;
  const agentRows = useMemo(
    () => (agentsData?.content ?? []).map(buildAgentPerformanceRow),
    [agentsData?.content]
  );
  const registeredByAgents = useMemo(
    () => ({
      drivers: agentRows.reduce((sum, row) => sum + row.driverCount, 0),
      partners: agentRows.reduce((sum, row) => sum + row.passengerCount, 0)
    }),
    [agentRows]
  );
  const topAgentRegistrations = useMemo(
    () =>
      [...agentRows]
        .map((row) => ({
          name: row.name?.trim() || `Agent ${row.id}`,
          drivers: row.driverCount,
          partners: row.passengerCount
        }))
        .sort((a, b) => b.drivers + b.partners - (a.drivers + a.partners))
        .slice(0, 6),
    [agentRows]
  );
  const commissionTotals = useMemo(() => {
    let pending = 0;
    let total = 0;
    let released = 0;
    for (const row of agentRows) {
      total += row.totalCommission;
      released += row.paidAmount;
      const commissions = getAgentCommissions(row.id);
      pending += commissions
        .filter((item) => item.status === "PENDING")
        .reduce((sum, item) => sum + item.amount, 0);
    }
    const remaining = Math.max(total - released, 0);
    return { pending, released, remaining, total };
  }, [agentRows]);
  const commissionBreakdownData = useMemo(
    () => [
      { label: "Pending", value: commissionTotals.pending },
      { label: "Released", value: commissionTotals.released },
      { label: "Remaining", value: commissionTotals.remaining },
      { label: "Total", value: commissionTotals.total }
    ],
    [commissionTotals]
  );

  const statCards = [
    {
      label: "Total Drivers",
      value: counts.totalDrivers,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Total Partners",
      value: counts.totalPartners,
      icon: Briefcase,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      label: "Total Agents",
      value: counts.totalSalesAgents,
      icon: UserCircle2,
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400"
    },
    {
      label: "Total Rides",
      value: counts.totalRidePlans,
      icon: Car,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <AppShell title="Admin Dashboard">
      <PageContainer>
        {error ? (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {/* ── Stat Cards ── */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="group">
              <div className="flex items-center gap-3 p-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105", stat.iconBg)}>
                  <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    {stat.label}
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                      {stat.value.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Driver Status Overview ── */}
        <Card>
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Driver status overview</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active vs suspended breakdown</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
              Live
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {statusRows.map((row, idx) => (
              <div
                key={row.label}
                className={cn(
                  "flex flex-col items-center gap-2 py-5 px-3 text-center transition-colors hover:bg-muted/20",
                  idx < statusRows.length - 1 && "border-r border-border/30"
                )}
              >
                {isLoading ? (
                  <Skeleton className="h-7 w-10 mx-auto" />
                ) : (
                  <span className={cn("text-2xl font-bold tabular-nums", row.color)}>
                    {row.count}
                  </span>
                )}
                <StatusBadge status={row.badge} />
              </div>
            ))}
          </div>
          <div className="border-t border-border/40">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="h-52 w-full max-w-[260px]">
                {isLoading ? (
                  <Skeleton className="mx-auto h-full w-full max-w-[200px] rounded-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusRows}
                        dataKey="count"
                        nameKey="label"
                        innerRadius="55%"
                        outerRadius="85%"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {statusRows.map((entry, idx) => (
                          <Cell key={entry.label} fill={DRIVER_STATUS_COLORS[idx % DRIVER_STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {!isLoading ? (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {statusRows.map((entry, idx) => {
                    const pct = driverStatusTotal > 0 ? Math.round((entry.count / driverStatusTotal) * 100) : 0;
                    return (
                      <div key={entry.label} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: DRIVER_STATUS_COLORS[idx % DRIVER_STATUS_COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground">{entry.label}</span>
                        <span className="text-xs font-semibold text-foreground tabular-nums">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ── Rides Trend (Area chart) ── */}
        <Card>
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Rides trend</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Daily ride volume over the last 14 days</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              14 days
            </div>
          </div>
          <div className="px-2 pb-2 pt-4 sm:px-4 sm:pb-4">
            <div className="h-60 sm:h-72">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ridesTrend} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rideGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fdb813" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#fdb813" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Rides"
                    stroke="#fdb813"
                    strokeWidth={2.5}
                    fill="url(#rideGradient)"
                    dot={{ r: 3, strokeWidth: 2, fill: "hsl(var(--card))" }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: "#fdb813" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        </Card>

        {/* ── Ride Status Breakdown ── */}
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Bar Chart */}
          <Card>
            <div className="px-4 py-3 sm:px-5 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">Ride status breakdown</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Requested, Accepted, Started, Cancelled &amp; Completed</p>
            </div>
            <div className="p-2 sm:p-4">
              <div className="h-60 sm:h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rideStatusBreakdown} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} vertical={false} />
                    <XAxis
                      dataKey="status"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      width={36}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3, radius: 6 }} />
                    <Bar dataKey="count" name="Trips" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {rideStatusBreakdown.map((entry, idx) => (
                        <Cell key={entry.status} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>

          {/* Donut Chart */}
          <Card>
            <div className="px-4 py-3 sm:px-5 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">Distribution</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Proportional ride breakdown</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="h-52 w-full max-w-[260px]">
                {isLoading ? (
                  <Skeleton className="mx-auto h-full w-full max-w-[200px] rounded-full" />
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rideStatusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {rideStatusBreakdown.map((entry, idx) => (
                        <Cell key={entry.status} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                )}
              </div>
              {/* Legend */}
              {!isLoading ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {rideStatusBreakdown.map((entry, idx) => {
                  const pct = rideTotal > 0 ? Math.round((entry.count / rideTotal) * 100) : 0;
                  return (
                    <div key={entry.status} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{entry.status}</span>
                      <span className="text-xs font-semibold text-foreground tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Agent Performance ── */}
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <div className="px-4 py-3 sm:px-5 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">Agent performance</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                New registered drivers and partners by agents
              </p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">New Drivers</p>
                  {isAgentPerfLoading ? (
                    <Skeleton className="mt-2 h-7 w-16" />
                  ) : (
                    <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {registeredByAgents.drivers.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">New Partners</p>
                  {isAgentPerfLoading ? (
                    <Skeleton className="mt-2 h-7 w-16" />
                  ) : (
                    <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {registeredByAgents.partners.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 h-56">
                {isAgentPerfLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topAgentRegistrations} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        width={36}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="drivers" name="Drivers" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={42} />
                      <Bar dataKey="partners" name="Partners" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 border-b border-border/40">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Agent commission graph</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pending, released, remaining and total commission
                </p>
              </div>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-3 sm:p-4">
              <div className="h-64">
                {isAgentPerfLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commissionBreakdownData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        width={56}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" name="Commission" radius={[8, 8, 0, 0]} maxBarSize={62}>
                        {commissionBreakdownData.map((entry, idx) => (
                          <Cell key={entry.label} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Audit logs (GET /audit-logs/getAll — same filters as the ticket) ── */}
        <Suspense fallback={null}>
          <AuditLogsSection variant="dashboard" />
        </Suspense>
      </PageContainer>
    </AppShell>
  );
}
