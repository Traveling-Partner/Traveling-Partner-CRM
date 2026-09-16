"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import { axisTick, CHART, chartMargin, gridProps } from "@/components/dashboard/chart-theme";

/** Gold line + soft area fill — matches legacy “Rides trend” screenshot. */
export function TrendArea({
  data,
  xKey,
  yKey,
  name
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  name: string;
}) {
  const fillId = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={chartMargin}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.28} />
            <stop offset="55%" stopColor={CHART.brand} stopOpacity={0.08} />
            <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tickMargin={12}
          tick={axisTick}
          minTickGap={24}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          tick={axisTick}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          content={<AnalyticsTooltip />}
          cursor={{ stroke: CHART.grid, strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          name={name}
          stroke="none"
          fill={`url(#${fillId})`}
          isAnimationActive
        />
        <Line
          type="monotone"
          dataKey={yKey}
          name={name}
          stroke={CHART.brand}
          strokeWidth={2.5}
          dot={{
            r: 4,
            fill: CHART.brand,
            stroke: CHART.brand,
            strokeWidth: 0
          }}
          activeDot={{
            r: 6,
            fill: CHART.brand,
            stroke: "#fff",
            strokeWidth: 2
          }}
          legendType="none"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
