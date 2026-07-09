"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminDashboardQuery } from "@/hooks/queries/use-admin-dashboard-query";
import {
  Users,
  Briefcase,
  UserCircle2,
  Car,
  TrendingUp,
  Clock
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
    counts,
    driverStatusCounts,
    ridesTrend,
    rideStatusBreakdown,
    recentActivity
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

  const rideTotal = rideStatusBreakdown.reduce((sum, r) => sum + r.count, 0);

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

        {/* ── Recent Activity ── */}
        <Card>
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Key events across drivers, partners &amp; agents</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              Latest
            </div>
          </div>

          <div className="px-4 py-2 sm:px-5">
            {isLoading ? (
              <div className="space-y-4 py-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-3 w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="rounded-lg bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                No recent activity found.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border/40" />
                {recentActivity.map((log, idx) => (
                  <div
                    key={log.id}
                    className="group relative flex gap-4 py-2.5"
                  >
                    <div className="relative z-10 mt-1.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-[#fdb813]" />
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">
                          {log.description?.trim() || "—"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          {log.userType && (
                            <span className="rounded bg-muted/60 px-1.5 py-0.5 font-medium">
                              {log.userType}
                            </span>
                          )}
                          {log.mobileNumber && <span>{log.mobileNumber}</span>}
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground/60 tabular-nums">
                        {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
