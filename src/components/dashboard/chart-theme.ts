export const CHART = {
  brandFrom: "#fce001",
  brandTo: "#fdb813",
  brand: "#fdb813",
  charcoal: "#111827",
  slate: "#d1d5db",
  track: "#eef0f3",
  indigo: "#111827",
  emerald: "#111827",
  amber: "#fdb813",
  rose: "#9ca3af",
  muted: "#9ca3af"
} as const;

export const SERIES_COLORS = [CHART.brand, CHART.charcoal, CHART.slate, "#fce001"] as const;

export const DRIVER_STATUS_COLORS = [
  CHART.brand,
  CHART.charcoal,
  CHART.slate,
  "#9ca3af",
  "#fce001"
] as const;

export const RIDE_STATUS_COLORS = [
  CHART.charcoal,
  CHART.brand,
  "#fce001",
  CHART.slate,
  "#9ca3af"
] as const;

export const axisTick = {
  fontSize: 11,
  fill: "#9ca3af",
  fontFamily: "inherit"
};

export const chartMargin = { top: 10, right: 6, left: 6, bottom: 0 };

export const PILL_RADIUS: [number, number, number, number] = [40, 40, 40, 40];
