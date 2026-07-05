"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchSubscriberNewsletters } from "@/services/newsletter-subscribers";

export function useNewsletterSubscriberDetailQuery(params: {
  id: string;
  page: number;
  pageSize: number;
}) {
  return useApiQuery({
    queryKey: queryKeys.newsletter.subscriberDetail(params.id, params.page, params.pageSize),
    enabled: Boolean(params.id),
    placeholderData: keepPreviousData,
    queryFn: ({ token, signal }) =>
      fetchSubscriberNewsletters(
        params.id,
        { page: params.page, pageSize: params.pageSize },
        { token, signal }
      )
  });
}
