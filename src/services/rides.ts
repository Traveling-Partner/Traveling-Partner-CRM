import { apiUrl } from "@/lib/api-base";
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

/** Values accepted by GET /rides/portal/getAll?rideType= */
export const RIDE_TYPES = ["TAXI_STAND", "POOL_RIDE", "DELIVERY", "LOGISTIC", "TRIP"] as const;

export type RideType = (typeof RIDE_TYPES)[number];

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

function unwrapData(res: unknown): unknown {
  if (!res || typeof res !== "object") return res;
  const record = res as Record<string, unknown>;
  if (record.data !== undefined && record.data !== null) return record.data;
  return res;
}

function parseRideListResponse(res: unknown): PaginatedResponse<RideRow> {
  const payload = unwrapData(res);

  if (Array.isArray(payload)) {
    return {
      content: payload as RideRow[],
      totalPages: 1,
      totalElements: payload.length
    };
  }

  const page =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const nested =
    !Array.isArray(page.content) && page.data && typeof page.data === "object"
      ? (page.data as Record<string, unknown>)
      : page;

  const content = Array.isArray(nested.content) ? (nested.content as RideRow[]) : [];
  const totalPages = typeof nested.totalPages === "number" ? nested.totalPages : 1;
  const totalElements =
    typeof nested.totalElements === "number" ? nested.totalElements : content.length;
  const number = typeof nested.number === "number" ? nested.number : undefined;

  return {
    content,
    totalPages: Math.max(1, totalPages),
    totalElements,
    number
  };
}

function parseRideDetailResponse(res: unknown): RideDetail {
  const payload = unwrapData(res);
  const ride =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as RideDetail)
      : null;

  if (!ride || (ride.id == null && !ride.bookingReference)) {
    throw new Error("Ride not found");
  }
  return ride;
}

/**
 * GET /api/rides/portal/getAll
 * Query keys match the live portal URL:
 * status, city, search, bookingReference, rideType, startedAt, page, size
 * First page is page=1.
 */
function buildRidesListUrl(filters: RidesListFilters): string {
  const params = new URLSearchParams();
  params.set("status", filters.status === "all" ? "" : filters.status);
  params.set("city", filters.city.trim());
  params.set("search", filters.search.trim());
  params.set("bookingReference", filters.bookingReference.trim());
  params.set("rideType", filters.rideType === "all" ? "" : filters.rideType.trim());
  params.set("startedAt", filters.startedAt.trim());
  params.set("page", String(Math.max(1, filters.page)));
  params.set("size", String(filters.pageSize));
  return `${apiUrl("/rides/portal/getAll")}?${params.toString()}`;
}

export async function fetchRidesList(
  filters: RidesListFilters,
  opts: RequestOpts
): Promise<PaginatedResponse<RideRow>> {
  const raw = await fetcher<unknown>(buildRidesListUrl(filters), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "rides:list"
  });
  return parseRideListResponse(raw);
}

/** GET /api/rides/portal/getById/{id} */
export async function fetchRideDetail(
  id: string | number,
  opts: RequestOpts
): Promise<RideDetail> {
  const raw = await fetcher<unknown>(apiUrl(`/rides/portal/getById/${id}`), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "rides:detail"
  });
  return parseRideDetailResponse(raw);
}
