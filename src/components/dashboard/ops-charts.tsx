"use client";

import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import {
  FileText,
  CreditCard,
  Car,
  UserRound,
  UserCheck,
  BadgeCheck,
  UserMinus,
  Ban,
  Clock,
  Inbox,
  Play,
  CheckCircle2
} from "lucide-react";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import {
  CHART,
  CITY_COLORS,
  DOCUMENT_COLORS,
  FUNNEL_COLORS,
  onChartColor
} from "@/components/dashboard/chart-theme";
import { cn } from "@/lib/utils";
import type {
  DashboardCityCount,
  DashboardDocumentsPending,
  DashboardFarePoint,
  DashboardOutcomePoint,
  DashboardRideFunnel,
  DashboardCommission,
  DashboardTopAgent
} from "@/services/admin-dashboard";

const axisTick = { fontSize: 11, fill: "#9ca3af", fontFamily: "inherit" };

function prettyStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const FUNNEL_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  COUNTER_OFFERED: "Counter",
  ACCEPTED: "Accepted",
  DRIVER_ON_THE_WAY: "On the way",
  DRIVER_ARRIVED: "Arrived",
  PARTNER_COMING: "Coming",
  RIDE_STARTED: "Started",
  COMPLETED: "Completed"
};

const pkr = (n: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(n);

function compactPkr(n: number) {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export function RideFunnel({ data }: { data: DashboardRideFunnel }) {
  const first = data.stages[0]?.count ?? 0;
  const completed = data.stages.find((s) => s.status === "COMPLETED")?.count ?? 0;
  const completionRate = first > 0 ? Math.round((completed / first) * 100) : 0;
  const cancelRate = first > 0 ? Math.round((data.canceled / first) * 100) : 0;

  const stats = [
    {
      label: "Completion",
      value: `${completionRate}%`,
      hint: `${completed.toLocaleString()} of ${first.toLocaleString()}`,
      background: `linear-gradient(135deg, ${CHART.brandFrom}, ${CHART.brandTo})`,
      darkText: true
    },
    {
      label: "Completed",
      value: completed.toLocaleString(),
      hint: "Reached end",
      background: CHART.sage,
      darkText: false
    },
    {
      label: "Canceled",
      value: data.canceled.toLocaleString(),
      hint: `${cancelRate}% of requested`,
      background: CHART.terracotta,
      darkText: false
    },
    {
      label: "Expired",
      value: data.expired.toLocaleString(),
      hint: "Timed out",
      background: CHART.ink,
      darkText: false
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-[1.35rem] px-3.5 py-3",
              stat.darkText ? "text-slate-900" : "text-white"
            )}
            style={{ background: stat.background }}
          >
            <p className={cn("text-[11px]", stat.darkText ? "text-slate-900/65" : "text-white/70")}>
              {stat.label}
            </p>
            <p className="mt-1 font-heading text-xl font-semibold tabular-nums tracking-tight">
              {stat.value}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11px]",
                stat.darkText ? "text-slate-900/60" : "text-white/65"
              )}
            >
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-[40rem] items-end gap-2.5">
          {data.stages.map((stage, index) => {
            const share = first > 0 ? (stage.count / first) * 100 : 0;
            const label = FUNNEL_LABELS[stage.status] ?? prettyStatus(stage.status);
            const color = FUNNEL_COLORS[index % FUNNEL_COLORS.length];

            return (
              <div key={stage.status} className="flex min-w-0 flex-1 flex-col items-center">
                <p className="mb-2 font-heading text-sm font-semibold tabular-nums">
                  {stage.count.toLocaleString()}
                </p>
                <div className="flex h-44 w-full items-end overflow-hidden rounded-[1.25rem] bg-slate-100 dark:bg-white/10">
                  <div
                    className="bar-fill w-full rounded-[1.25rem]"
                    style={{
                      height: `${Math.max(share, stage.count > 0 ? 8 : 0)}%`,
                      background: color,
                      animationDelay: `${index * 60}ms`
                    }}
                    title={`${prettyStatus(stage.status)}: ${stage.count.toLocaleString()}`}
                  />
                </div>
                <p className="mt-2.5 w-full truncate text-center text-[11px] text-foreground">
                  {label}
                </p>
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  {Math.round(share)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function OutcomeTrend({ data }: { data: DashboardOutcomePoint[] }) {
  const completedId = useId().replace(/:/g, "");
  const canceledId = useId().replace(/:/g, "");
  const completedTotal = data.reduce((sum, point) => sum + point.completed, 0);
  const canceledTotal = data.reduce((sum, point) => sum + point.canceled, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-4 px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.brand }} />
          Completed {completedTotal.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.terracotta }} />
          Canceled {canceledTotal.toLocaleString()}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={completedId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={canceledId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.terracotta} stopOpacity={0.22} />
                <stop offset="100%" stopColor={CHART.terracotta} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={axisTick}
              minTickGap={28}
            />
            <Tooltip
              content={<AnalyticsTooltip />}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke={CHART.brand}
              strokeWidth={2}
              fill={`url(#${completedId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: CHART.brand }}
            />
            <Area
              type="monotone"
              dataKey="canceled"
              name="Canceled"
              stroke={CHART.terracotta}
              strokeWidth={2}
              fill={`url(#${canceledId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: CHART.terracotta }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FareTrend({ data }: { data: DashboardFarePoint[] }) {
  const total = data.reduce((sum, point) => sum + point.amount, 0);
  const max = Math.max(...data.map((point) => point.amount), 1);
  const average = data.length > 0 ? Math.round(total / data.length) : 0;
  const peak = data.reduce(
    (best, point) => (point.amount > best.amount ? point : best),
    data[0] ?? { day: "—", amount: 0 }
  );
  const low = data.reduce(
    (best, point) => (point.amount < best.amount ? point : best),
    data[0] ?? { day: "—", amount: 0 }
  );

  const stats = [
    {
      label: "Daily average",
      value: pkr(average),
      hint: `${data.length} day window`,
      background: CHART.sage,
      darkText: false
    },
    {
      label: "Peak day",
      value: pkr(peak.amount),
      hint: peak.day,
      background: `linear-gradient(135deg, ${CHART.brandFrom}, ${CHART.brandTo})`,
      darkText: true
    },
    {
      label: "Quietest day",
      value: pkr(low.amount),
      hint: low.day,
      background: CHART.terracotta,
      darkText: false
    }
  ];

  return (
    <div>
      <div className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-4 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">Gross fare</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums tracking-tight">
          {pkr(total)}
        </p>
        <p className="mt-1 text-xs text-slate-900/60">Collected across the last 14 days</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-[1.35rem] px-3.5 py-3.5",
              stat.darkText ? "text-slate-900" : "text-white"
            )}
            style={{ background: stat.background }}
          >
            <p className={cn("text-[11px]", stat.darkText ? "text-slate-900/65" : "text-white/70")}>
              {stat.label}
            </p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
              {stat.value}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11px]",
                stat.darkText ? "text-slate-900/60" : "text-white/65"
              )}
            >
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-[42rem] items-end gap-1.5 sm:gap-2">
          {data.map((point, index) => {
            const height = max > 0 ? (point.amount / max) * 100 : 0;
            const isPeak = point.day === peak.day && point.amount === peak.amount;

            return (
              <div key={`${point.day}-${index}`} className="flex min-w-0 flex-1 flex-col items-center">
                <p
                  className={cn(
                    "mb-1.5 font-heading text-[10px] font-semibold tabular-nums sm:text-[11px]",
                    isPeak ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {compactPkr(point.amount)}
                </p>
                <div className="flex h-40 w-full items-end overflow-hidden rounded-[1.1rem] bg-slate-100 dark:bg-white/10">
                  <div
                    className="bar-fill-y w-full rounded-[1.1rem]"
                    style={{
                      height: `${Math.max(height, point.amount > 0 ? 8 : 0)}%`,
                      background: isPeak
                        ? `linear-gradient(180deg, ${CHART.brandFrom}, ${CHART.brandTo})`
                        : CHART.sand,
                      animationDelay: `${index * 40}ms`
                    }}
                    title={`${point.day}: ${pkr(point.amount)}`}
                  />
                </div>
                <p className="mt-2 w-full truncate text-center text-[10px] text-muted-foreground sm:text-[11px]">
                  {point.day}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CityDemand({ data }: { data: DashboardCityCount[] }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const max = Math.max(...data.map((row) => row.count), 1);

  return (
    <div className="space-y-3">
      {data.map((row, index) => {
        const share = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const width = max > 0 ? (row.count / max) * 100 : 0;
        const color = CITY_COLORS[index % CITY_COLORS.length];

        return (
          <div key={row.city} className="flex items-center gap-3 sm:gap-4">
            <span className="w-7 shrink-0 font-heading text-xs font-semibold tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-foreground">{row.city}</span>
                <span className="shrink-0 font-heading text-sm font-semibold tabular-nums text-foreground">
                  {row.count.toLocaleString()}
                  <span className="ml-2 text-xs font-medium text-muted-foreground">{share}%</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="bar-fill h-full rounded-full"
                  style={{
                    width: `${Math.max(width, row.count > 0 ? 8 : 0)}%`,
                    background: color,
                    animationDelay: `${index * 50}ms`
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DocumentsPending({ data }: { data: DashboardDocumentsPending }) {
  const items = useMemo(
    () => [
      { label: "Driver CNIC", value: data.driverCnic, icon: CreditCard, color: DOCUMENT_COLORS.driverCnic },
      { label: "License", value: data.driverLicense, icon: FileText, color: DOCUMENT_COLORS.driverLicense },
      { label: "Vehicle", value: data.vehicle, icon: Car, color: DOCUMENT_COLORS.vehicle },
      { label: "Partner CNIC", value: data.partnerCnic, icon: UserRound, color: DOCUMENT_COLORS.partnerCnic }
    ],
    [data]
  );
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div>
      <div className="mb-6 rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-4 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">Waiting for review</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums tracking-tight">
          {total.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-slate-900/60">CNIC, license and vehicle documents</p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const width = Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0);
          const iconOnBrand = onChartColor(item.color) === "#111827";

          return (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: item.color,
                  color: iconOnBrand ? "#111827" : "#fff"
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-foreground">{item.label}</span>
                  <span className="shrink-0 font-heading text-sm font-semibold tabular-nums">
                    {item.value.toLocaleString()}
                    <span className="ml-2 text-xs font-medium text-muted-foreground">{share}%</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="bar-fill h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      background: item.color,
                      animationDelay: `${index * 60}ms`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DRIVER_STATUS_ICONS: Record<
  string,
  typeof UserCheck
> = {
  Active: UserCheck,
  Approved: BadgeCheck,
  Inactive: UserMinus,
  Blocked: Ban,
  Pending: Clock
};

export function DriverStatusMix({
  items
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...items.map((item) => item.value), 1);
  const lead = items.reduce(
    (best, item) => (item.value > best.value ? item : best),
    items[0] ?? { label: "—", value: 0, color: CHART.brand }
  );

  return (
    <div>
      <div className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-4 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">All drivers</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums tracking-tight">
          {total.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-slate-900/60">
          {lead.label} is the largest group
        </p>
      </div>

      <div className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        {items.map((item) => {
          const width = total > 0 ? (item.value / total) * 100 : 0;
          if (width <= 0) return null;
          return (
            <div
              key={item.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${width}%`, background: item.color }}
              title={`${item.label} ${item.value.toLocaleString()}`}
            />
          );
        })}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const Icon = DRIVER_STATUS_ICONS[item.label] ?? UserCheck;
          const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const width = max > 0 ? (item.value / max) * 100 : 0;
          const ink = onChartColor(item.color) === "#111827" ? "#111827" : "#fff";

          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-[1.25rem] bg-slate-100 dark:bg-white/5"
            >
              <div className="relative flex items-center gap-3 px-3.5 py-3.5 sm:gap-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: item.color, color: ink }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                    <p className="shrink-0 font-heading text-lg font-semibold tabular-nums tracking-tight text-foreground">
                      {item.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div
                      className="bar-fill h-full rounded-full"
                      style={{
                        width: `${Math.max(width, item.value > 0 ? 8 : 0)}%`,
                        background: item.color,
                        animationDelay: `${index * 50}ms`
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">{share}% of drivers</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RIDE_STATUS_META: Record<
  string,
  { color: string; icon: typeof Inbox; ink: "#111827" | "#ffffff" }
> = {
  Requested: { color: CHART.sand, icon: Inbox, ink: "#111827" },
  Accepted: { color: CHART.brand, icon: UserCheck, ink: "#111827" },
  Started: { color: CHART.sage, icon: Play, ink: "#ffffff" },
  Canceled: { color: CHART.terracotta, icon: Ban, ink: "#ffffff" },
  Completed: { color: CHART.brandTo, icon: CheckCircle2, ink: "#111827" }
};

function rideStatusMeta(label: string) {
  return (
    RIDE_STATUS_META[label] ?? {
      color: CHART.sand,
      icon: Inbox,
      ink: "#111827" as const
    }
  );
}

export function RideStatusBoard({
  items
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...items.map((item) => item.value), 1);
  const completed = items.find((item) => item.label === "Completed")?.value ?? 0;
  const completedRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-heading text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {total.toLocaleString()}
          </span>{" "}
          rides
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">{completedRate}% completed</p>
      </div>

      <div className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        {items.map((item) => {
          const width = total > 0 ? (item.value / total) * 100 : 0;
          if (width <= 0) return null;
          const fill = item.label === "Completed" ? CHART.brand : rideStatusMeta(item.label).color;
          return (
            <div
              key={item.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${width}%`, background: fill }}
              title={`${item.label} ${item.value.toLocaleString()}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {items.map((item, index) => {
          const meta = rideStatusMeta(item.label);
          const Icon = meta.icon;
          const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const width = max > 0 ? (item.value / max) * 100 : 0;
          const accent = item.label === "Completed" ? CHART.brand : meta.color;

          return (
            <div
              key={item.label}
              className="rounded-[1.35rem] bg-slate-100 px-4 py-4 dark:bg-white/5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: accent, color: meta.ink }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">{share}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-heading text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {item.value.toLocaleString()}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="bar-fill h-full rounded-full"
                  style={{
                    width: `${Math.max(width, item.value > 0 ? 8 : 0)}%`,
                    background: accent,
                    animationDelay: `${index * 50}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CommissionBoard({ data }: { data: DashboardCommission }) {
  const total = data.pending + data.released + data.remaining;
  const rows = [
    { label: "Pending", value: data.pending, color: CHART.brand, hint: "Awaiting payout" },
    { label: "Released", value: data.released, color: CHART.sage, hint: "Paid to agents" },
    { label: "Remaining", value: data.remaining, color: CHART.bronze, hint: "Still on books" }
  ];

  return (
    <div>
      <div className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-4 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">Total commission</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums tracking-tight">
          {pkr(total)}
        </p>
        <p className="mt-1 text-xs text-slate-900/60">Pending, released and remaining</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {rows.map((row) => {
          const ink = onChartColor(row.color);
          const share = total > 0 ? Math.round((row.value / total) * 100) : 0;
          const muted = ink === "#111827" ? "text-slate-900/65" : "text-white/70";

          return (
            <div
              key={row.label}
              className="rounded-[1.35rem] px-3.5 py-4"
              style={{ background: row.color, color: ink }}
            >
              <p className={cn("text-[11px]", muted)}>{row.label}</p>
              <p className="mt-1.5 font-heading text-xl font-semibold tabular-nums tracking-tight">
                {pkr(row.value)}
              </p>
              <p className={cn("mt-0.5 text-[11px]", muted)}>
                {share}% · {row.hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        {rows.map((row) => {
          const width = total > 0 ? (row.value / total) * 100 : 0;
          if (width <= 0) return null;
          return (
            <div
              key={row.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${width}%`, background: row.color }}
              title={`${row.label} ${pkr(row.value)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function agentInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return letters || "A";
}

export function TopAgentsBoard({ data }: { data: DashboardTopAgent[] }) {
  const drivers = data.reduce((sum, row) => sum + row.drivers, 0);
  const partners = data.reduce((sum, row) => sum + row.partners, 0);
  const maxTotal = Math.max(...data.map((row) => row.drivers + row.partners), 1);

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <div className="rounded-[1.35rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-3.5 py-4 text-slate-900">
          <p className="text-[11px] text-slate-900/65">New drivers</p>
          <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
            {drivers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[1.35rem] px-3.5 py-4 text-white" style={{ background: CHART.sage }}>
          <p className="text-[11px] text-white/70">New partners</p>
          <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
            {partners.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {data.map((agent, index) => {
          const total = agent.drivers + agent.partners;
          const rowWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          const driverShare = total > 0 ? (agent.drivers / total) * 100 : 0;
          const lead = index === 0;

          return (
            <div key={`${agent.name}-${index}`} className="rounded-[1.25rem] bg-[#f3f4f6] px-3.5 py-3 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 shrink-0 font-heading text-xs font-semibold tabular-nums",
                    lead ? "text-slate-900 dark:text-[#fdb813]" : "text-muted-foreground"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-xs font-semibold"
                  style={{
                    background: lead ? CHART.brand : CHART.sage,
                    color: lead ? "#111827" : "#fff"
                  }}
                >
                  {agentInitials(agent.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-foreground">{agent.name}</span>
                    <span className="shrink-0 font-heading text-sm font-semibold tabular-nums">
                      {total.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white dark:bg-white/10">
                    <div className="flex h-full overflow-hidden rounded-full" style={{ width: `${Math.max(rowWidth, 8)}%` }}>
                      {driverShare > 0 ? (
                        <div
                          className="h-full"
                          style={{
                            width: `${driverShare}%`,
                            background: `linear-gradient(90deg, ${CHART.brandFrom}, ${CHART.brandTo})`
                          }}
                        />
                      ) : null}
                      {agent.partners > 0 ? (
                        <div className="h-full" style={{ width: `${100 - driverShare}%`, background: CHART.sage }} />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.brand }} />
          Drivers
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.sage }} />
          Partners
        </span>
      </div>
    </div>
  );
}
