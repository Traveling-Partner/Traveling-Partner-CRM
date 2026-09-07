"use client";

import { cn } from "@/lib/utils";

export type BarListItem = {
  label: string;
  value: number;
  color?: string;
};

const TRACK = "bg-slate-100 dark:bg-white/10";

function formatNumber(value: number) {
  return value.toLocaleString();
}

export function BarList({
  items,
  className,
  formatValue = formatNumber,
  sort = true
}: {
  items: BarListItem[];
  className?: string;
  formatValue?: (value: number) => string;
  sort?: boolean;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const ranked = sort ? [...items].sort((a, b) => b.value - a.value) : items;

  return (
    <div className={cn("space-y-4", className)}>
      {ranked.map((item) => {
        const width = Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0);
        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-foreground">{item.label}</span>
              <span className="shrink-0 font-heading text-sm font-semibold tabular-nums">
                {formatValue(item.value)}
              </span>
            </div>
            <div className={cn("h-2 overflow-hidden rounded-full", TRACK)}>
              <div
                className="bar-fill h-full rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813]"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ShareTrack({
  items,
  className
}: {
  items: BarListItem[];
  className?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const palette = ["#fdb813", "#64748b", "#94a3b8", "#cbd5e1", "#fce001"];

  return (
    <div className={className}>
      <div className={cn("flex h-3 overflow-hidden rounded-full", TRACK)}>
        {items.map((item, index) => {
          const pct = (item.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={item.label}
              className="bar-fill h-full first:rounded-l-full last:rounded-r-full"
              title={`${item.label} ${Math.round(pct)}%`}
              style={{
                width: `${pct}%`,
                background: item.color ?? palette[index % palette.length],
                animationDelay: `${index * 60}ms`
              }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((item, index) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: item.color ?? palette[index % palette.length] }}
              />
              <span>{item.label}</span>
              <span className="tabular-nums text-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StackedBarList({
  items,
  className
}: {
  items: Array<{ name: string; drivers: number; partners: number }>;
  className?: string;
}) {
  const max = Math.max(...items.map((item) => item.drivers + item.partners), 1);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813]" />
          Drivers
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white" />
          Partners
        </span>
      </div>
      {items.map((item) => {
        const total = item.drivers + item.partners;
        const rowWidth = total > 0 ? Math.max((total / max) * 100, 8) : 0;
        const driverShare = total > 0 ? (item.drivers / total) * 100 : 0;
        const partnerShare = total > 0 ? (item.partners / total) * 100 : 0;
        return (
          <div key={item.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-foreground">{item.name}</span>
              <span className="shrink-0 font-heading text-sm font-semibold tabular-nums">
                {total.toLocaleString()}
              </span>
            </div>
            <div className={cn("h-2.5 overflow-hidden rounded-full", TRACK)}>
              <div className="flex h-full overflow-hidden rounded-full" style={{ width: `${rowWidth}%` }}>
                {driverShare > 0 ? (
                  <div
                    className="bar-fill h-full bg-gradient-to-r from-[#fce001] to-[#fdb813]"
                    style={{ width: `${driverShare}%` }}
                    title={`Drivers ${item.drivers}`}
                  />
                ) : null}
                {partnerShare > 0 ? (
                  <div
                    className="bar-fill h-full bg-slate-900 dark:bg-white"
                    style={{ width: `${partnerShare}%`, animationDelay: "80ms" }}
                    title={`Partners ${item.partners}`}
                  />
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
