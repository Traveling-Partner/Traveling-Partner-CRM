"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type RidesListFilters } from "@/lib/api/query-keys";
import { fetchRidesList } from "@/services/rides";

export function useRidesListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  city: string;
  search: string;
  bookingReference: string;
  rideType: string;
  startedAt: string;
}) {
  const debouncedCity = useDebouncedValue(params.city);
  const debouncedSearch = useDebouncedValue(params.search);
  const debouncedBookingReference = useDebouncedValue(params.bookingReference);
  const debouncedRideType = useDebouncedValue(params.rideType);

  const filters = useMemo<RidesListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      city: debouncedCity,
      search: debouncedSearch,
      bookingReference: debouncedBookingReference,
      rideType: debouncedRideType,
      startedAt: params.startedAt
    }),
    [
      params.page,
      params.pageSize,
      params.status,
      debouncedCity,
      debouncedSearch,
      debouncedBookingReference,
      debouncedRideType,
      params.startedAt
    ]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.rides.list(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) => fetchRidesList(f, { token, signal })
  });
}
