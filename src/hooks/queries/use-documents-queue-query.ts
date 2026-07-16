"use client";

import { useMemo } from "react";
import { useDebouncedValue, useApiQuery } from "@/hooks/api";
import { queryKeys, type DocumentsQueueFilters } from "@/lib/api/query-keys";
import { fetchDocumentsQueuePage } from "@/services/documents";

export function useDocumentsQueueQuery(params: {
  page: number;
  pageSize: number;
  status: string;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
  documentType: string;
}) {
  const debouncedName = useDebouncedValue(params.name);
  const debouncedMobileNumber = useDebouncedValue(params.mobileNumber);
  const debouncedCity = useDebouncedValue(params.city);

  const filters = useMemo<DocumentsQueueFilters>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      name: debouncedName,
      mobileNumber: debouncedMobileNumber,
      city: debouncedCity,
      gender: params.gender,
      documentType: params.documentType
    }),
    [
      params.page,
      params.pageSize,
      params.status,
      params.gender,
      params.documentType,
      debouncedName,
      debouncedMobileNumber,
      debouncedCity
    ]
  );

  return useApiQuery({
    queryKey: queryKeys.users.documentsQueue(filters),
    queryFn: ({ token, signal }) => fetchDocumentsQueuePage(filters, { token, signal })
  });
}
