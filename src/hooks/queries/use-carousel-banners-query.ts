"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  getAllBanners,
  getCarouselPublishedIds,
  type BannerRecord
} from "@/services/carousel";

export type BannerStatus = "Published" | "Draft";

export interface BannerRow extends BannerRecord {
  status: BannerStatus;
}

async function fetchCarouselRows(token: string, signal?: AbortSignal): Promise<BannerRow[]> {
  const [allBanners, publishedIds] = await Promise.all([
    getAllBanners(token, signal),
    getCarouselPublishedIds(token, signal)
  ]);

  return allBanners.map((item) => ({
    ...item,
    status: publishedIds.has(item.id) ? "Published" : "Draft"
  }));
}

export function useCarouselBannersQuery() {
  return useApiQuery({
    queryKey: queryKeys.carousel.banners(),
    queryFn: ({ token, signal }) => fetchCarouselRows(token, signal)
  });
}
