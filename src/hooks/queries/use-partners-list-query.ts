"use client";

import { useMemo } from "react";
import { useDebouncedValue, usePaginatedQuery } from "@/hooks/api";
import { queryKeys, type PartnersListFilters } from "@/lib/api/query-keys";
import { fetchPartnersList } from "@/services/users";

export function usePartnersListQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
}) {
  const debouncedName = useDebouncedValue(params.name);
  const debouncedMobileNumber = useDebouncedValue(params.mobileNumber);
  const debouncedCity = useDebouncedValue(params.city);

  const filters = useMemo<PartnersListFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      name: debouncedName,
      mobileNumber: debouncedMobileNumber,
      city: debouncedCity,
      gender: params.gender
    }),
    [
      params.page,
      params.pageSize,
      params.status,
      params.gender,
      debouncedName,
      debouncedMobileNumber,
      debouncedCity
    ]
  );

  return usePaginatedQuery({
    queryKey: queryKeys.users.partners(filters),
    filters,
    fetchPage: ({ token, signal, filters: f }) =>
      fetchPartnersList(f, { token, signal })
  });
}
