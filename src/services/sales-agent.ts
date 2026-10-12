import { format, parseISO } from "date-fns";
import { apiUrl } from "@/lib/api-base";
import type { PaginatedResponse } from "@/lib/api/types";
import { fetcher } from "@/lib/fetcher";
import type {
  SalesAgentCommissionFilters,
  SalesAgentListFilters
} from "@/lib/api/query-keys";

type RequestOpts = { token: string; signal?: AbortSignal };

export interface SalesAgentSignupPoint {
  label: string;
  value: number;
}

export interface SalesAgentSignupDay {
  day: string;
  drivers: number;
  partners: number;
}

export interface SalesAgentOverview {
  referredPartnerCount: number | null;
  referredDriverCount: number | null;
  verifiedDriverCount: number | null;
  aiVerifiedCount: number | null;
  systemVerifiedCount: number | null;
  pendingCommissionTotal: number | null;
  releasedCommissionTotal: number | null;
  totalCommissionAmount: number | null;
  signupGraph: SalesAgentSignupPoint[];
  signupDays: SalesAgentSignupDay[];
  paymentGraph: SalesAgentSignupPoint[];
  verificationGraph: SalesAgentSignupPoint[];
  totalDriverSignups: number | null;
  totalPartnerSignups: number | null;
  paidVerificationCount: number | null;
  unverifiedPaymentTotal: number | null;
  otherPaymentTotal: number | null;
  unsupportedMetrics: string[];
}

export interface SalesAgentProfile {
  name: string | null;
  mobileNumber: string | null;
  email: string | null;
  city: string | null;
  referralCode: string | null;
}

export interface SalesAgentReferral {
  userId: number | string;
  fullName: string | null;
  mobileNumber: string | null;
  city: string | null;
  status: string | null;
  cnicVerified: boolean | null;
  joinedAt: string | null;
}

export interface SalesAgentCommission {
  id: number | string;
  referredUserId: number | string | null;
  referredUserName: string | null;
  referredUserRole: string | null;
  referredUserMobileNumber: string | null;
  amount: number | null;
  status: string | null;
  createdAt: string | null;
  releasedAt: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrapData(res: unknown): unknown {
  const envelope = asRecord(res);
  if (envelope.data !== undefined && envelope.data !== null) return envelope.data;
  return res;
}

function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readId(value: unknown): number | string | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function toApiPage(page: number): number {
  return Math.max(0, page - 1);
}

function formatDay(value: string): string {
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return value;
  }
}

function parseDatedPoints(value: unknown, keys: string[]): SalesAgentSignupPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = asRecord(item);
      const date = readText(row.date ?? row.day ?? row.label);
      let amount: number | null = null;
      for (const key of keys) {
        amount = readNumber(row[key]);
        if (amount != null) break;
      }
      if (!date || amount == null) return null;
      return { label: formatDay(date), value: amount };
    })
    .filter((row): row is SalesAgentSignupPoint => row !== null);
}

function parseSignupDays(value: unknown): SalesAgentSignupDay[] {
  const payload = asRecord(value);
  const drivers = parseDatedPoints(payload.driverSignups, ["count", "value"]);
  const partners = parseDatedPoints(payload.partnerSignups, ["count", "value"]);
  const byDay = new Map<string, SalesAgentSignupDay>();
  for (const point of drivers) {
    byDay.set(point.label, { day: point.label, drivers: point.value, partners: 0 });
  }
  for (const point of partners) {
    const current = byDay.get(point.label);
    if (current) current.partners = point.value;
    else byDay.set(point.label, { day: point.label, drivers: 0, partners: point.value });
  }
  return [...byDay.values()];
}

function parseSignupGraph(value: unknown): SalesAgentSignupPoint[] {
  const days = parseSignupDays(value);
  if (days.length > 0) {
    return days.map((day) => ({
      label: day.day,
      value: day.drivers + day.partners
    }));
  }

  const payload = asRecord(value);
  const dates = Array.isArray(payload.dates)
    ? payload.dates
    : Array.isArray(payload.labels)
      ? payload.labels
      : [];
  const counts = Array.isArray(payload.counts)
    ? payload.counts
    : Array.isArray(payload.values)
      ? payload.values
      : [];
  if (dates.length > 0) {
    return dates.map((label, index) => ({
      label: formatDay(String(label)),
      value: readNumber(counts[index]) ?? 0
    }));
  }

  const rows = Array.isArray(value)
    ? value
    : Array.isArray(payload.points)
      ? payload.points
      : [];
  return parseDatedPoints(rows, ["count", "value", "amount"]);
}

function parseUnsupportedMetrics(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  return Object.keys(asRecord(value));
}

function parseOverview(res: unknown): SalesAgentOverview {
  const data = asRecord(unwrapData(res));
  const signup = asRecord(data.signupGraph);
  const signupGraph = parseSignupGraph(data.signupGraph);
  const unsupportedMetrics = parseUnsupportedMetrics(data.unsupportedMetrics);
  const blocked = new Set(unsupportedMetrics);
  return {
    referredPartnerCount: readNumber(data.referredPartnerCount),
    referredDriverCount: readNumber(data.referredDriverCount),
    verifiedDriverCount: readNumber(data.verifiedDriverCount),
    aiVerifiedCount: readNumber(data.aiVerifiedCount),
    systemVerifiedCount: readNumber(data.systemVerifiedCount),
    pendingCommissionTotal: readNumber(data.pendingCommissionTotal),
    releasedCommissionTotal: readNumber(data.releasedCommissionTotal),
    totalCommissionAmount: readNumber(data.totalCommissionAmount),
    signupGraph,
    signupDays: parseSignupDays(data.signupGraph),
    paymentGraph: parseDatedPoints(data.paymentGraph, ["amount", "value", "count"]),
    verificationGraph: parseDatedPoints(data.verificationGraph, ["count", "value"]),
    totalDriverSignups: readNumber(signup.totalDriverSignups),
    totalPartnerSignups: readNumber(signup.totalPartnerSignups),
    paidVerificationCount: blocked.has("paidVerificationCount")
      ? null
      : readNumber(data.paidVerificationCount),
    unverifiedPaymentTotal: blocked.has("unverifiedPaymentTotal")
      ? null
      : readNumber(data.unverifiedPaymentTotal),
    otherPaymentTotal: blocked.has("otherPaymentTotal")
      ? null
      : readNumber(data.otherPaymentTotal),
    unsupportedMetrics
  };
}

function parseProfile(res: unknown): SalesAgentProfile {
  const data = asRecord(unwrapData(res));
  return {
    name: readText(data.name),
    mobileNumber: readText(data.mobileNumber),
    email: readText(data.email),
    city: readText(data.city),
    referralCode: readText(data.referralCode)
  };
}

function parseReferral(value: unknown): SalesAgentReferral | null {
  const row = asRecord(value);
  const userId = readId(row.userId ?? row.id);
  if (userId == null) return null;
  return {
    userId,
    fullName: readText(row.fullName ?? row.name),
    mobileNumber: readText(row.mobileNumber ?? row.phone),
    city: readText(row.city),
    status: readText(row.status),
    cnicVerified: readBoolean(row.cnicVerified),
    joinedAt: readText(row.joinedAt ?? row.createdAt)
  };
}

function parseCommission(value: unknown): SalesAgentCommission | null {
  const row = asRecord(value);
  const id = readId(row.id);
  if (id == null) return null;
  return {
    id,
    referredUserId: readId(row.referredUserId),
    referredUserName: readText(row.referredUserName),
    referredUserRole: readText(row.referredUserRole),
    referredUserMobileNumber: readText(row.referredUserMobileNumber),
    amount: readNumber(row.amount),
    status: readText(row.status),
    createdAt: readText(row.createdAt),
    releasedAt: readText(row.releasedAt)
  };
}

function parsePage<T>(
  res: unknown,
  parseRow: (value: unknown) => T | null
): PaginatedResponse<T> {
  const payload = unwrapData(res);
  if (Array.isArray(payload)) {
    const content = payload.map(parseRow).filter((row): row is T => row !== null);
    return { content, totalPages: 1, totalElements: content.length, number: 0 };
  }

  const page = asRecord(payload);
  const nested =
    !Array.isArray(page.content) && page.data && typeof page.data === "object"
      ? asRecord(page.data)
      : page;
  const rawRows = Array.isArray(nested.content)
    ? nested.content
    : Array.isArray(nested.items)
      ? nested.items
      : [];
  const content = rawRows.map(parseRow).filter((row): row is T => row !== null);
  const totalPages =
    typeof nested.totalPages === "number" ? Math.max(1, nested.totalPages) : 1;
  const totalElements =
    typeof nested.totalElements === "number" ? nested.totalElements : content.length;
  const number = typeof nested.number === "number" ? nested.number : undefined;

  return { content, totalPages, totalElements, number };
}

function listUrl(path: string, filters: SalesAgentListFilters): string {
  const params = new URLSearchParams({
    page: String(toApiPage(filters.page)),
    size: String(filters.pageSize)
  });
  const search = filters.search.trim();
  if (search) params.set("search", search);
  return `${apiUrl(path)}?${params.toString()}`;
}

export async function fetchSalesAgentOverview(
  opts: RequestOpts
): Promise<SalesAgentOverview> {
  const res = await fetcher<unknown>(apiUrl("/sales-agent/dashboard/overview"), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "sales-agent:overview"
  });
  return parseOverview(res);
}

export async function fetchSalesAgentProfile(
  opts: RequestOpts
): Promise<SalesAgentProfile> {
  const res = await fetcher<unknown>(apiUrl("/sales-agent/dashboard/profile"), {
    token: opts.token,
    signal: opts.signal,
    debugLabel: "sales-agent:profile"
  });
  return parseProfile(res);
}

export async function fetchSalesAgentDrivers(
  filters: SalesAgentListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<SalesAgentReferral>> {
  const res = await fetcher<unknown>(listUrl("/sales-agent/dashboard/drivers", filters), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "sales-agent:drivers"
  });
  return parsePage(res, parseReferral);
}

export async function fetchSalesAgentPartners(
  filters: SalesAgentListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<SalesAgentReferral>> {
  const res = await fetcher<unknown>(listUrl("/sales-agent/dashboard/partners", filters), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "sales-agent:partners"
  });
  return parsePage(res, parseReferral);
}

export async function fetchSalesAgentCommissions(
  filters: SalesAgentCommissionFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<SalesAgentCommission>> {
  const params = new URLSearchParams({
    page: String(toApiPage(filters.page)),
    size: String(filters.pageSize)
  });
  if (filters.filter && filters.filter !== "all") params.set("filter", filters.filter);
  const res = await fetcher<unknown>(
    `${apiUrl("/sales-agent/dashboard/commissions")}?${params.toString()}`,
    {
      token: opts.token,
      signal: opts.signal,
      dedupe: false,
      debugLabel: "sales-agent:commissions"
    }
  );
  return parsePage(res, parseCommission);
}
