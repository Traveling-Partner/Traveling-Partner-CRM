"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { FileText, CreditCard, Car, UserRound } from "lucide-react";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import {
  axisTick,
  BAR_TOP_RADIUS,
  CHART,
  chartMargin,
  CITY_COLORS,
  DOCUMENT_COLORS,
  FUNNEL_COLORS,
  gridProps,
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

  const barData = data.stages.map((stage, index) => ({
    label: FUNNEL_LABELS[stage.status] ?? prettyStatus(stage.status),
    count: stage.count,
    fill: FUNNEL_COLORS[index % FUNNEL_COLORS.length]
  }));

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

      <div className="mt-6 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={axisTick}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={axisTick}
              width={32}
              allowDecimals={false}
            />
            <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
            <Bar dataKey="count" name="Rides" radius={BAR_TOP_RADIUS} maxBarSize={48}>
              {barData.map((row) => (
                <Cell key={row.label} fill={row.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OutcomeTrend({ data }: { data: DashboardOutcomePoint[] }) {
  const completedTotal = data.reduce((sum, point) => sum + point.completed, 0);
  const canceledTotal = data.reduce((sum, point) => sum + point.canceled, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-4 px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.completed }} />
          Completed {completedTotal.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.canceled }} />
          Canceled {canceledTotal.toLocaleString()}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={axisTick}
              minTickGap={28}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={axisTick}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              content={<AnalyticsTooltip />}
              cursor={{ stroke: CHART.grid, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke={CHART.completed}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: CHART.completed, stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: CHART.completed, stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="canceled"
              name="Canceled"
              stroke={CHART.canceled}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: CHART.canceled, stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: CHART.canceled, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FareTrend({ data }: { data: DashboardFarePoint[] }) {
  const total = data.reduce((sum, point) => sum + point.amount, 0);

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 px-1 text-xs text-muted-foreground">
        Period total{" "}
        <span className="font-heading text-sm font-semibold text-foreground">{pkr(total)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={axisTick}
              minTickGap={28}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={axisTick}
              width={44}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip
              content={<AnalyticsTooltip formatValue={pkr} />}
              cursor={{ stroke: CHART.grid, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              name="Fare"
              stroke={CHART.brand}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: CHART.brand, stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: CHART.brand, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CityDemand({ data }: { data: DashboardCityCount[] }) {
  const chartData = data.map((row, index) => ({
    city: row.city,
    count: row.count,
    fill: CITY_COLORS[index % CITY_COLORS.length]
  }));

  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid {...gridProps} horizontal={false} vertical />
          <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="city"
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            width={88}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
          <Bar dataKey="count" name="Rides" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((row) => (
              <Cell key={row.city} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
  const barData = items.map((item) => ({
    label: item.label,
    value: item.value,
    fill: item.color
  }));

  return (
    <div>
      <div className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-4 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">Waiting for review</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums tracking-tight">
          {total.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-slate-900/60">CNIC, license and vehicle documents</p>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} tickMargin={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisTick}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
            <Bar dataKey="value" name="Pending" radius={BAR_TOP_RADIUS} maxBarSize={44}>
              {barData.map((row) => (
                <Cell key={row.label} fill={row.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const ink = onChartColor(item.color);
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
              style={{ background: item.color, color: ink }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <div className="min-w-0">
                <p className="truncate text-[10px] opacity-75">{item.label}</p>
                <p className="font-heading text-sm font-semibold tabular-nums">
                  {item.value.toLocaleString()}
                </p>
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
  const barData = items.map((item) => ({
    label: item.label.toUpperCase(),
    value: item.value,
    fill: item.color
  }));

  return (
    <div className="h-56 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={chartMargin}>
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickMargin={10}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={44}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            width={28}
            allowDecimals={false}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
          <Bar dataKey="value" name="Rides" radius={BAR_TOP_RADIUS} maxBarSize={48}>
            {barData.map((row) => (
              <Cell key={row.label} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommissionBoard({ data }: { data: DashboardCommission }) {
  const total = data.pending + data.released + data.remaining;
  const rows = [
    { label: "Pending", value: data.pending, color: CHART.brand },
    { label: "Released", value: data.released, color: CHART.sage },
    { label: "Remaining", value: data.remaining, color: CHART.bronze }
  ];
  const barData = rows.map((row) => ({
    label: row.label,
    value: row.value,
    fill: row.color
  }));

  return (
    <div>
      <div className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-5 py-4 text-slate-900">
        <p className="text-xs font-medium text-slate-900/65">Total commission</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums tracking-tight">
          {pkr(total)}
        </p>
        <p className="mt-1 text-xs text-slate-900/60">Pending, released and remaining</p>
      </div>

      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisTick}
              width={40}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip
              content={<AnalyticsTooltip formatValue={pkr} />}
              cursor={{ fill: "rgba(148,163,184,0.12)" }}
            />
            <Bar dataKey="value" name="Amount" radius={BAR_TOP_RADIUS} maxBarSize={56}>
              {barData.map((row) => (
                <Cell key={row.label} fill={row.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
  const chartData = data.map((agent) => ({
    name: agent.name.split(" ")[0] ?? agent.name,
    fullName: agent.name,
    drivers: agent.drivers,
    partners: agent.partners
  }));

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

      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} tickMargin={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisTick}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
            <Bar
              dataKey="drivers"
              name="Drivers"
              fill={CHART.brand}
              radius={BAR_TOP_RADIUS}
              maxBarSize={28}
            />
            <Bar
              dataKey="partners"
              name="Partners"
              fill={CHART.sage}
              radius={BAR_TOP_RADIUS}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {data.map((agent, index) => (
          <div
            key={`${agent.name}-${index}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-white/5"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full font-heading text-[10px] font-semibold"
              style={{
                background: index === 0 ? CHART.brand : CHART.sage,
                color: index === 0 ? "#111827" : "#fff"
              }}
            >
              {agentInitials(agent.name)}
            </span>
            <span className="font-medium text-foreground">{agent.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {(agent.drivers + agent.partners).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
