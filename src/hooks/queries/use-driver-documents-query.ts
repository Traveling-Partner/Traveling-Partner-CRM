"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  buildPreviewDocuments,
  buildRawDocumentStatuses,
  fetchDriverDocumentsPayload
} from "@/services/documents";

export function useDriverDocumentsQuery(driverId: number | undefined, enabled = true) {
  const query = useApiQuery({
    queryKey: queryKeys.users.driverDocuments(driverId ?? 0),
    enabled: enabled && !!driverId,
    queryFn: ({ token, signal }) => fetchDriverDocumentsPayload(driverId!, { token, signal })
  });

  const previewDocuments = useMemo(
    () => (query.data ? buildPreviewDocuments(query.data) : []),
    [query.data]
  );
  const rawStatuses = useMemo(
    () => (query.data ? buildRawDocumentStatuses(query.data) : null),
    [query.data]
  );

  return { ...query, previewDocuments, rawStatuses };
}
