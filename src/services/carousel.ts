import { fetcher } from "@/lib/fetcher";
import { apiUrl } from "@/lib/api-base";

export interface BannerPayload {
  bannerImage: string;
  bannerTitle: string;
  bannerDescription: string;
}

export interface BannerRecord extends BannerPayload {
  id: number;
}

interface CarouselPageData {
  content?: BannerRecord[];
  totalPages?: number;
  last?: boolean;
}

function readObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function readData(value: unknown): unknown {
  const obj = readObject(value);
  if (!obj) return value;
  return obj.data ?? value;
}

function normalizeBanner(value: unknown): BannerRecord | null {
  const obj = readObject(value);
  if (!obj) return null;
  const id = Number(obj.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    bannerImage: String(obj.bannerImage ?? ""),
    bannerTitle: String(obj.bannerTitle ?? ""),
    bannerDescription: String(obj.bannerDescription ?? "")
  };
}

/** Reads banner from API envelope `{ data: { id, ... } }` or plain object. */
export function extractBannerFromResponse(res: unknown): BannerRecord | null {
  const payload = readData(res);
  return normalizeBanner(payload);
}

function parseBannerList(res: unknown): BannerRecord[] {
  const payload = readData(res);
  if (Array.isArray(payload)) {
    return payload.map(normalizeBanner).filter((row): row is BannerRecord => row !== null);
  }

  const payloadObj = readObject(payload);
  if (!payloadObj) return [];
  const content = Array.isArray(payloadObj.content) ? payloadObj.content : [];
  return content.map(normalizeBanner).filter((row): row is BannerRecord => row !== null);
}

function parseCarouselPage(res: unknown): Required<CarouselPageData> {
  const payload = readData(res);
  const payloadObj = readObject(payload);
  const content = Array.isArray(payloadObj?.content) ? payloadObj.content : [];
  const normalized = content.map(normalizeBanner).filter((row): row is BannerRecord => row !== null);
  const totalPages =
    typeof payloadObj?.totalPages === "number" && payloadObj.totalPages > 0
      ? payloadObj.totalPages
      : 1;
  const last =
    typeof payloadObj?.last === "boolean"
      ? payloadObj.last
      : false;

  return {
    content: normalized,
    totalPages,
    last
  };
}

export async function getAllBanners(
  token: string | null,
  signal?: AbortSignal
): Promise<BannerRecord[]> {
  const res = await fetcher<unknown>(apiUrl("/banners/getAll"), {
    token,
    signal,
    dedupe: false
  });
  return parseBannerList(res);
}

export async function getBannerById(id: number, token: string | null): Promise<BannerRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/banners/getById/${id}`), { token });
  const payload = readData(res);
  return normalizeBanner(payload);
}

export async function createBanner(payload: BannerPayload, token: string | null) {
  return fetcher(apiUrl("/banners/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export async function updateBanner(id: number, payload: BannerPayload, token: string | null) {
  return fetcher(apiUrl(`/banners/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });
}

/** True if this banner id appears in paginated carousel feed (app home). */
export async function isBannerOnCarousel(id: number, token: string | null): Promise<boolean> {
  const published = await getCarouselPublishedIds(token);
  return published.has(id);
}

export async function deleteBanner(id: number, token: string | null) {
  return fetcher(apiUrl(`/banners/delete/${id}`), {
    method: "DELETE",
    token
  });
}

export async function getCarouselPublishedIds(
  token: string | null,
  signal?: AbortSignal
): Promise<Set<number>> {
  const publishedIds = new Set<number>();
  let page = 0;
  const size = 50;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await fetcher<unknown>(apiUrl(`/banners/carousel?page=${page}&size=${size}`), {
      token,
      signal,
      dedupe: false
    });
    const parsed = parseCarouselPage(res);
    parsed.content.forEach((item) => publishedIds.add(item.id));
    totalPages = parsed.totalPages;
    if (parsed.last) break;
    page += 1;
  }

  return publishedIds;
}
