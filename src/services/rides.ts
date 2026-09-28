import { buildApiUrl } from "@/lib/api/endpoints";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import type { PaginatedResponse } from "@/lib/api/types";
import { fetcher } from "@/lib/fetcher";
import type { RidesListFilters } from "@/lib/api/query-keys";

export const RIDE_STATUSES = [
  "REQUESTED",
  "COUNTER_OFFERED",
  "ACCEPTED",
  "DRIVER_ON_THE_WAY",
  "DRIVER_ARRIVED",
  "PARTNER_COMING",
  "RIDE_STARTED",
  "COMPLETED",
  "CANCELED",
  "EXPIRED"
] as const;

export type RideStatus = (typeof RIDE_STATUSES)[number];

export interface RideRow {
  id: number;
  bookingReference: string | null;
  city: string | null;
  status: string;
  distanceKm: number | null;
  fare: number | null;
  startedAt: string | null;
  rideType?: string | null;
}

export interface RideDetail extends RideRow {
  pickupAddress: string | null;
  dropoffAddress: string | null;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
  durationMinutes: number | null;
  requestedAt: string | null;
  completedAt: string | null;
  passengerName: string | null;
  passengerPhone: string | null;
  paymentMethod: string | null;
  rideType: string | null;
  driverId: number | null;
  driverName: string | null;
  driverPhone: string | null;
  partnerId: number | null;
  partnerName: string | null;
  commissionAmount: number | null;
  tipAmount: number | null;
  cancellationReason: string | null;
}

type RequestOpts = { token: string; signal?: AbortSignal };

function asRidePage(raw: unknown): PaginatedResponse<RideRow> {
  const page = unwrapEnvelope<unknown>(raw);
  if (page && typeof page === "object" && Array.isArray((page as PaginatedResponse<RideRow>).content)) {
    const p = page as PaginatedResponse<RideRow>;
    return {
      content: p.content ?? [],
      totalPages: Math.max(1, p.totalPages ?? 1),
      totalElements: p.totalElements,
      number: p.number
    };
  }
  return { content: [], totalPages: 1, totalElements: 0 };
}

export async function fetchRidesList(
  filters: RidesListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<RideRow>> {
  const url = buildApiUrl("/rides/portal/getAll", {
    status: filters.status === "all" ? undefined : filters.status,
    city: filters.city.trim() || undefined,
    search: filters.search.trim() || undefined,
    bookingReference: filters.bookingReference.trim() || undefined,
    rideType: filters.rideType.trim() || undefined,
    startedAt: filters.startedAt.trim() || undefined,
    page: filters.page + 1,
    size: filters.pageSize
  });
  const raw = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "rides:list"
  });
  return asRidePage(raw);
}

export async function fetchRideDetail(
  id: string | number,
  opts: RequestOpts
): Promise<RideDetail> {
  const raw = await fetcher<unknown>(buildApiUrl(`/rides/portal/getById/${id}`), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "rides:detail"
  });
  return unwrapEnvelope<RideDetail>(raw);
}
