"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { getNewsletterById } from "@/services/newsletter";

export function useNewsletterDetailQuery(id: number | undefined) {
  return useApiQuery({
    queryKey: queryKeys.newsletter.detail(id ?? 0),
    enabled: !!id && Number.isFinite(id),
    queryFn: async ({ token }) => {
      const row = await getNewsletterById(id!, token);
      if (!row) throw new Error("Newsletter not found.");
      return row;
    }
  });
}
