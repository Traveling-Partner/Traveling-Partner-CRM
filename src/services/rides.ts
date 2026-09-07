import { buildApiUrl } from "@/lib/api/endpoints";
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

export async function fetchRidesList(
  filters: RidesListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<RideRow>> {
  const url = buildApiUrl("/rides", {
    page: filters.page,
    size: filters.pageSize,
    status: filters.status === "all" ? undefined : filters.status,
    city: filters.city.trim() || undefined,
    search: filters.search.trim() || undefined,
    bookingReference: filters.bookingReference.trim() || undefined
  });
  return fetcher<PaginatedResponse<RideRow>>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "rides:list"
  });
}

export async function fetchRideDetail(
  id: string | number,
  opts: RequestOpts
): Promise<RideDetail> {
  return fetcher<RideDetail>(buildApiUrl(`/rides/${id}`), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "rides:detail"
  });
}
