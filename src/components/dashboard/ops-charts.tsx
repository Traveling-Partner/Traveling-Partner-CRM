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
                <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.24} />
                <stop offset="70%" stopColor={CHART.brand} stopOpacity={0.05} />
                <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
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
              stroke={CHART.brand}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: CHART.brand }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CityDemand({ data }: { data: DashboardCityCount[] }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const max = Math.max(...data.map((row) => row.count), 1);

  return (
    <div className="space-y-2">
      {data.map((row, index) => {
        const share = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const width = max > 0 ? (row.count / max) * 100 : 0;

        return (
          <div
            key={row.city}
            className="relative overflow-hidden rounded-[1.25rem] bg-slate-100 dark:bg-white/10"
          >
            <div
              className="bar-fill absolute inset-y-0 left-0"
              style={{
                width: `${Math.max(width, row.count > 0 ? 10 : 0)}%`,
                background: CITY_COLORS[index % CITY_COLORS.length],
                animationDelay: `${index * 50}ms`
              }}
            />
            <div className="relative flex items-center gap-3 px-4 py-3.5 text-slate-900 sm:gap-4">
              <span className="w-7 shrink-0 font-heading text-xs font-semibold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.city}</span>
              <span className="hidden shrink-0 text-xs tabular-nums text-slate-900/70 sm:inline">
                {share}%
              </span>
              <span className="shrink-0 font-heading text-sm font-semibold tabular-nums">
                {row.count.toLocaleString()}
              </span>
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

export function RideStatusBoard({
  items
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="grid min-w-[36rem] grid-cols-5 gap-2">
          {items.map((item) => {
            const ink = onChartColor(item.color);
            const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const muted = ink === "#111827" ? "text-slate-900/65" : "text-white/70";

            return (
              <div
                key={item.label}
                className="rounded-[1.35rem] px-3.5 py-4"
                style={{ background: item.color, color: ink }}
              >
                <p className={cn("text-[11px]", muted)}>{item.label}</p>
                <p className="mt-1.5 font-heading text-2xl font-semibold tabular-nums tracking-tight">
                  {item.value.toLocaleString()}
                </p>
                <p className={cn("mt-0.5 text-[11px]", muted)}>{share}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
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
