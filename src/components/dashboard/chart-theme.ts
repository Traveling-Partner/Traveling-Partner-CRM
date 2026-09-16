/**
 * Dashboard chart theme — matched to legacy admin chart screenshot
 * (dark panel, gold trend line, blue/yellow/orange/red/green status).
 */
export const CHART = {
  brandFrom: "#fce001",
  brandTo: "#f5c518",
  brand: "#f5c518",
  bronze: "#c9952a",
  sage: "#4a9b8c",
  terracotta: "#c67b4e",
  sand: "#c4b896",
  stone: "#8f8a82",
  ink: "#2c3a42",
  charcoal: "#111827",
  slate: "#8f8a82",
  track: "#eef0f3",
  teal: "#4a9b8c",
  amber: "#f5c518",
  muted: "#9ca3af",
  /** Soft dotted grid like the old screenshot */
  grid: "rgba(148, 163, 184, 0.22)",
  axis: "#8b93a7",
  /** Ride status palette (screenshot) */
  requested: "#4a8fe7",
  accepted: "#f5c518",
  started: "#f97316",
  canceled: "#f07178",
  completed: "#22c55e"
} as const;

/** Sequential gold → bronze → sage. Use for ranked series (funnel, cities). */
export const PALETTE = [
  CHART.brand,
  "#e8b423",
  CHART.bronze,
  CHART.sand,
  "#7eae9a",
  CHART.sage,
  CHART.terracotta,
  CHART.stone
] as const;

export const SERIES_COLORS = PALETTE;

export const DRIVER_STATUS_COLORS = [
  CHART.brand,
  CHART.sage,
  CHART.stone,
  CHART.terracotta,
  CHART.bronze
] as const;

/** Ride status colors — match bar + donut distribution charts */
export const RIDE_STATUS_COLORS = [
  CHART.requested,
  CHART.accepted,
  CHART.started,
  CHART.canceled,
  CHART.completed
] as const;

/** Lighter steps so row fills keep dark text readable. */
export const CITY_COLORS = [
  CHART.brand,
  "#e8c44a",
  "#d4b56a",
  "#c4b896",
  "#8eb8ab",
  "#d4a07a",
  "#b8a890",
  "#9aa8b0"
] as const;

export const FUNNEL_COLORS = [
  CHART.requested,
  "#60a5fa",
  CHART.accepted,
  "#fbbf24",
  CHART.started,
  "#fb923c",
  CHART.completed,
  CHART.sage
] as const;

export const DOCUMENT_COLORS = {
  driverCnic: CHART.brand,
  driverLicense: CHART.bronze,
  vehicle: CHART.sage,
  partnerCnic: CHART.terracotta
} as const;

export function chartColor(index: number) {
  return PALETTE[index % PALETTE.length];
}

/** Dark ink on gold/sand; white on sage, terracotta, ink. */
export function onChartColor(hex: string): "#111827" | "#ffffff" {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma > 155 ? "#111827" : "#ffffff";
}

export const axisTick = {
  fontSize: 11,
  fill: CHART.axis,
  fontFamily: "inherit"
};

export const chartMargin = { top: 16, right: 16, left: 4, bottom: 8 };

/** Rounded top corners for vertical bars */
export const BAR_TOP_RADIUS: [number, number, number, number] = [8, 8, 0, 0];

export const PILL_RADIUS: [number, number, number, number] = [40, 40, 40, 40];

export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: "3 6",
  vertical: false
} as const;
