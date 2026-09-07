/**
 * Dashboard color system — built around the brand gold gradient
 * (#fce001 → #fdb813, hue ~42°).
 *
 * Companions are analogous (bronze, terracotta) and one cool complement
 * (sage). Same chroma range, no neon purple / lime / electric pink.
 */
export const CHART = {
  brandFrom: "#fce001",
  brandTo: "#fdb813",
  brand: "#fdb813",
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
  amber: "#fdb813",
  muted: "#9ca3af"
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

export const RIDE_STATUS_COLORS = [
  CHART.sand,
  CHART.brand,
  CHART.sage,
  CHART.terracotta,
  CHART.bronze
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
  "#fce001",
  "#f5c40e",
  "#fdb813",
  "#e0a82a",
  "#c4a04a",
  "#9aaa68",
  "#6ba87c",
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
  fill: "#9ca3af",
  fontFamily: "inherit"
};

export const chartMargin = { top: 10, right: 6, left: 6, bottom: 0 };

export const PILL_RADIUS: [number, number, number, number] = [40, 40, 40, 40];
