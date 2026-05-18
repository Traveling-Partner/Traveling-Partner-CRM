"use client";

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

  const previewDocuments = query.data ? buildPreviewDocuments(query.data) : [];
  const rawStatuses = query.data ? buildRawDocumentStatuses(query.data) : null;

  return { ...query, previewDocuments, rawStatuses };
}
