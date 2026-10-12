"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { getCarouselBanners, type BannerRecord } from "@/services/carousel";

export type BannerStatus = "Published" | "Draft";

export interface BannerRow extends BannerRecord {
  status: BannerStatus;
}

async function fetchCarouselRows(token: string, signal?: AbortSignal): Promise<BannerRow[]> {
  const banners = await getCarouselBanners(token, signal);
  return banners.map((item) => ({
    ...item,
    status: "Published"
  }));
}

export function useCarouselBannersQuery() {
  return useApiQuery({
    queryKey: queryKeys.carousel.banners(),
    queryFn: ({ token, signal }) => fetchCarouselRows(token, signal)
  });
}
