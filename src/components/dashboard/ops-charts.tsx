"use client";

import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import { FileText, CreditCard, Car, UserRound } from "lucide-react";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import { cn } from "@/lib/utils";
import type {
  DashboardCityCount,
  DashboardDocumentsPending,
  DashboardFarePoint,
  DashboardOutcomePoint,
  DashboardRideFunnel
} from "@/services/admin-dashboard";

const BRAND = "#fdb813";
const CHARCOAL = "#111827";
const axisTick = { fontSize: 11, fill: "#9ca3af", fontFamily: "inherit" };

function ShareTrack({
  items,
  className
}: {
  items: Array<{ label: string; value: number; color: string }>;
  className?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        {items.map((item) => {
          const pct = (item.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={item.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${pct}%`, background: item.color }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span>{item.label}</span>
            <span className="tabular-nums text-foreground">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function prettyStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const pkr = (n: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(n);

export function RideFunnel({ data }: { data: DashboardRideFunnel }) {
  const first = data.stages[0]?.count ?? 0;
  const completed = data.stages.find((s) => s.status === "COMPLETED")?.count ?? 0;
  const completionRate = first > 0 ? Math.round((completed / first) * 100) : 0;
  const cancelRate = first > 0 ? Math.round((data.canceled / first) * 100) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[13.5rem_1fr] lg:items-center">
      <div className="rounded-[1.75rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-6 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">Completion</p>
        <p className="mt-2 font-heading text-4xl font-semibold tabular-nums tracking-tight">
          {completionRate}%
        </p>
        <p className="mt-2 text-xs text-slate-900/70">
          {completed.toLocaleString()} of {first.toLocaleString()} requested
        </p>
        <div className="mt-5 rounded-2xl bg-slate-900/10 px-3 py-2.5">
          <p className="text-[11px] font-medium text-slate-900/60">Canceled</p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {data.canceled.toLocaleString()}
            <span className="ml-1 text-xs font-medium text-slate-900/55">{cancelRate}%</span>
          </p>
          {data.expired > 0 ? (
            <p className="mt-1 text-[11px] text-slate-900/60">
              Expired {data.expired.toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {data.stages.map((stage, index) => {
          const prev = index === 0 ? stage.count : data.stages[index - 1]?.count ?? 0;
          const width = first > 0 ? Math.max((stage.count / first) * 100, stage.count > 0 ? 8 : 0) : 0;
          const conversion = index === 0 ? 100 : prev > 0 ? Math.round((stage.count / prev) * 100) : 0;
          return (
            <div key={stage.status}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground">{prettyStatus(stage.status)}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  <span className="font-heading text-sm font-semibold text-foreground">
                    {stage.count.toLocaleString()}
                  </span>
                  {index > 0 ? <span className="ml-2">{conversion}% from last</span> : null}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="bar-fill h-full rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813]"
                  style={{ width: `${width}%`, animationDelay: `${index * 70}ms` }}
                />
              </div>
            </div>
          );
        })}
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
          <span className="h-2 w-2 rounded-full bg-[#fdb813]" />
          Completed {completedTotal.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white" />
          Canceled {canceledTotal.toLocaleString()}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={completedId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={canceledId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHARCOAL} stopOpacity={0.16} />
                <stop offset="100%" stopColor={CHARCOAL} stopOpacity={0} />
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
              stroke={BRAND}
              strokeWidth={2}
              fill={`url(#${completedId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: BRAND }}
            />
            <Area
              type="monotone"
              dataKey="canceled"
              name="Canceled"
              stroke={CHARCOAL}
              strokeWidth={2}
              fill={`url(#${canceledId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: CHARCOAL }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FareTrend({ data }: { data: DashboardFarePoint[] }) {
  const fillId = useId().replace(/:/g, "");
  const total = data.reduce((sum, point) => sum + point.amount, 0);

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 px-1 text-xs text-muted-foreground">
        Period total{" "}
        <span className="font-heading text-sm font-semibold text-foreground">{pkr(total)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.24} />
                <stop offset="70%" stopColor={BRAND} stopOpacity={0.05} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
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
              content={<AnalyticsTooltip formatValue={pkr} />}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              name="Fare"
              stroke={BRAND}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: BRAND }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CityDemand({ data }: { data: DashboardCityCount[] }) {
  const max = Math.max(...data.map((row) => row.count), 1);

  return (
    <div className="space-y-4">
      {data.map((row, index) => {
        const width = Math.max((row.count / max) * 100, row.count > 0 ? 6 : 0);
        return (
          <div key={row.city} className="flex items-center gap-3">
            <span
              className={cn(
                "w-7 shrink-0 font-heading text-xs font-semibold tabular-nums",
                index === 0 ? "text-slate-900 dark:text-[#fdb813]" : "text-muted-foreground"
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-foreground">{row.city}</span>
                <span className="shrink-0 font-heading text-sm font-semibold tabular-nums">
                  {row.count.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={cn(
                    "bar-fill h-full rounded-full",
                    index === 0
                      ? "bg-gradient-to-r from-[#fce001] to-[#fdb813]"
                      : "bg-slate-900 dark:bg-white"
                  )}
                  style={{ width: `${width}%`, animationDelay: `${index * 60}ms` }}
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
      {
        label: "Driver CNIC",
        value: data.driverCnic,
        color: "#fdb813",
        icon: CreditCard
      },
      {
        label: "License",
        value: data.driverLicense,
        color: "#111827",
        icon: FileText
      },
      {
        label: "Vehicle",
        value: data.vehicle,
        color: "#64748b",
        icon: Car
      },
      {
        label: "Partner CNIC",
        value: data.partnerCnic,
        color: "#94a3b8",
        icon: UserRound
      }
    ],
    [data]
  );
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Waiting for review</p>
          <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
            {total.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-[1.35rem] bg-[#f3f4f6] px-3.5 py-3 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-1.5 font-heading text-xl font-semibold tabular-nums">
                {item.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
      <ShareTrack className="mt-5" items={items} />
    </div>
  );
}
