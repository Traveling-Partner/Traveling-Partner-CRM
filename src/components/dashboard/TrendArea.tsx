"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import { axisTick, CHART, chartMargin, gridProps } from "@/components/dashboard/chart-theme";

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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={chartMargin}>
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey={xKey}
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
          dataKey={yKey}
          name={name}
          stroke={CHART.brand}
          strokeWidth={2.5}
          dot={{
            r: 4,
            fill: CHART.brand,
            stroke: "#fff",
            strokeWidth: 2
          }}
          activeDot={{
            r: 6,
            fill: CHART.brand,
            stroke: "#fff",
            strokeWidth: 2
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
