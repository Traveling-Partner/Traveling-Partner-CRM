"use client";

export function AnalyticsTooltip({
  active,
  payload,
  label,
  valuePrefix = ""
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string; color?: string; payload?: { fill?: string } }>;
  label?: string;
  valuePrefix?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[9rem] rounded-2xl bg-white px-3 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:bg-slate-900">
      {label ? (
        <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const color = item.color || item.payload?.fill || "#fdb813";
          const raw = item.value;
          const display =
            typeof raw === "number" ? `${valuePrefix}${raw.toLocaleString()}` : String(raw ?? "—");
          return (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                {item.name}
              </span>
              <span className="text-xs font-semibold tabular-nums text-foreground">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PieTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { fill?: string; percent?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const color = item.payload?.fill || "#fdb813";
  const value = typeof item.value === "number" ? item.value : 0;

  return (
    <div className="min-w-[8rem] rounded-2xl bg-white px-3 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-foreground">{item.name}</span>
      </div>
      <p className="mt-1 font-heading text-lg font-semibold tabular-nums tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}
