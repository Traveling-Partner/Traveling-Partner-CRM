"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import { axisTick, CHART } from "@/components/dashboard/chart-theme";

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
  const { peak, last } = useMemo(() => {
    if (data.length === 0) return { peak: null, last: null };
    let peakPoint = data[0];
    for (const point of data) {
      if (Number(point[yKey] ?? 0) > Number(peakPoint[yKey] ?? 0)) peakPoint = point;
    }
    return { peak: peakPoint, last: data[data.length - 1] };
  }, [data, yKey]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 18, right: 18, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.22} />
            <stop offset="70%" stopColor={CHART.brand} stopOpacity={0.04} />
            <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey={xKey}
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
          dataKey={yKey}
          name={name}
          stroke={CHART.brand}
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: CHART.brand }}
        />
        {last ? (
          <ReferenceDot
            x={last[xKey]}
            y={last[yKey]}
            r={5}
            fill={CHART.brand}
            stroke="#fff"
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        ) : null}
        {peak && last && peak[xKey] !== last[xKey] ? (
          <ReferenceDot
            x={peak[xKey]}
            y={peak[yKey]}
            r={3.5}
            fill="#111827"
            stroke="#fff"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
          />
        ) : null}
      </AreaChart>
    </ResponsiveContainer>
  );
}
