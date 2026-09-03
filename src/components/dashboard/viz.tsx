"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieTooltip } from "@/components/dashboard/AnalyticsTooltip";
import { cn } from "@/lib/utils";

export type VizItem = {
  label: string;
  value: number;
  color?: string;
};

const TRACK = "stroke-slate-100 dark:stroke-white/10";
const PALETTE = ["#fdb813", "#64748b", "#94a3b8", "#cbd5e1", "#fce001"];

function colorAt(item: VizItem, index: number) {
  return item.color ?? PALETTE[index % PALETTE.length];
}

/** Concentric progress rings — Apple Fitness-style part comparison. */
export function RadialRings({
  items,
  centerLabel,
  centerValue
}: {
  items: VizItem[];
  centerLabel?: string;
  centerValue?: number | string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 9;
  const gap = 5;
  const outer = 96;

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
      <div className="relative h-52 w-52 shrink-0 sm:h-56 sm:w-56">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          {items.map((item, index) => {
            const r = outer - index * (stroke + gap);
            const c = 2 * Math.PI * r;
            const pct = item.value / max;
            return (
              <g key={item.label}>
                <circle cx={cx} cy={cy} r={r} fill="none" className={TRACK} strokeWidth={stroke} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={colorAt(item, index)}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${c * pct} ${c}`}
                />
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex rotate-0 flex-col items-center justify-center">
          {centerValue != null ? (
            <p className="font-heading text-2xl font-semibold tabular-nums sm:text-3xl">
              {typeof centerValue === "number" ? centerValue.toLocaleString() : centerValue}
            </p>
          ) : null}
          {centerLabel ? <p className="text-xs text-muted-foreground">{centerLabel}</p> : null}
        </div>
      </div>
      <div className="w-full max-w-sm space-y-3">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorAt(item, index) }} />
              {item.label}
            </span>
            <span className="font-heading text-sm font-semibold tabular-nums">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 2026 lollipop — high data-ink ratio category ranking. */
export function Lollipop({ items, className }: { items: VizItem[]; className?: string }) {
  const ranked = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...ranked.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-5", className)}>
      {ranked.map((item) => {
        const pct = Math.max((item.value / max) * 100, item.value > 0 ? 6 : 0);
        return (
          <div key={item.label} className="grid grid-cols-[6.5rem_1fr_3.25rem] items-center gap-3 sm:grid-cols-[8rem_1fr_3.5rem]">
            <span className="truncate text-sm text-foreground">{item.label}</span>
            <div className="relative h-4">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-100 dark:bg-white/10" />
              <div
                className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-[#fce001] to-[#fdb813]"
                style={{ width: `calc(${pct}% - 7px)` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#fce001] to-[#fdb813] shadow-[0_0_0_3px_rgba(253,184,19,0.18)]"
                style={{ left: `calc(${pct}% - 7px)` }}
              />
            </div>
            <span className="text-right font-heading text-sm font-semibold tabular-nums">
              {item.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Butterfly / tornado — two-sided comparison. */
export function Butterfly({
  items,
  leftLabel = "Drivers",
  rightLabel = "Partners",
  className
}: {
  items: Array<{ name: string; drivers: number; partners: number }>;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}) {
  const max = Math.max(...items.map((item) => Math.max(item.drivers, item.partners)), 1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-[1fr_6.5rem_1fr] gap-2 text-xs text-muted-foreground sm:grid-cols-[1fr_8rem_1fr]">
        <p className="text-right">{leftLabel}</p>
        <p className="text-center">Agent</p>
        <p>{rightLabel}</p>
      </div>
      {items.map((item) => (
        <div
          key={item.name}
          className="grid grid-cols-[1fr_6.5rem_1fr] items-center gap-2 sm:grid-cols-[1fr_8rem_1fr]"
        >
          <div className="flex items-center justify-end gap-2">
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
              {item.drivers.toLocaleString()}
            </span>
            <div className="flex h-2.5 w-full justify-end overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#fce001] to-[#fdb813]"
                style={{ width: `${(item.drivers / max) * 100}%` }}
              />
            </div>
          </div>
          <p className="truncate text-center text-sm text-foreground">{item.name}</p>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-slate-900 dark:bg-white"
                style={{ width: `${(item.partners / max) * 100}%` }}
              />
            </div>
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
              {item.partners.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Donut — part-to-whole for 2–4 slices. */
export function DonutMix({
  items,
  centerLabel,
  centerValue
}: {
  items: VizItem[];
  centerLabel?: string;
  centerValue?: number | string;
}) {
  const data = items.map((item, index) => ({
    ...item,
    fill: colorAt(item, index)
  }));

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={3}
              stroke="transparent"
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue != null ? (
            <p className="font-heading text-2xl font-semibold tabular-nums sm:text-3xl">
              {typeof centerValue === "number" ? centerValue.toLocaleString() : centerValue}
            </p>
          ) : null}
          {centerLabel ? <p className="text-xs text-muted-foreground">{centerLabel}</p> : null}
        </div>
      </div>
      <div className="w-full max-w-sm space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
              {item.label}
            </span>
            <span className="font-heading text-sm font-semibold tabular-nums">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
