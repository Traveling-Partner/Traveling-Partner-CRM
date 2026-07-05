import { apiUrl } from "@/lib/api-base";
import { fetcher } from "@/lib/fetcher";
import type { NewsletterSubscribersListFilters } from "@/lib/api/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";

export interface SubscriberListRow {
  id: number;
  fullName: string | null;
  email: string;
  status: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  totalNewslettersReceived: number;
  lastNewsletterReceived: string | null;
}

export interface SubscriberNewsletterRow {
  newsletterId: number;
  message: string | null;
  attachedFile: string | null;
  userName: string | null;
  userRole: string | null;
  status: string | null;
  deliveryStatus: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  retryCount: number;
  failureReason: string | null;
}

export interface SubscriberNewslettersDetail {
  subscriberId: number;
  subscriberEmail: string;
  fullName: string | null;
  subscribedAt: string;
  status: string;
  totalNewslettersReceived: number;
  newsletters: SubscriberNewsletterRow[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

function parseSubscribersListResponse(res: unknown): PaginatedResponse<SubscriberListRow> {
  if (!res || typeof res !== "object") {
    return { content: [], totalPages: 1, totalElements: 0 };
  }
  const r = res as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  const content = Array.isArray(payload.content)
    ? (payload.content as SubscriberListRow[])
    : [];
  const totalPages = typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;

  return { content, totalPages, totalElements };
}

function parseSubscriberNewslettersResponse(res: unknown): SubscriberNewslettersDetail | null {
  if (!res || typeof res !== "object") return null;
  const r = res as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  if (typeof payload.subscriberId !== "number") return null;

  return {
    subscriberId: payload.subscriberId,
    subscriberEmail: String(payload.subscriberEmail ?? ""),
    fullName: typeof payload.fullName === "string" ? payload.fullName : null,
    subscribedAt: String(payload.subscribedAt ?? ""),
    status: String(payload.status ?? ""),
    totalNewslettersReceived:
      typeof payload.totalNewslettersReceived === "number"
        ? payload.totalNewslettersReceived
        : 0,
    newsletters: Array.isArray(payload.newsletters)
      ? (payload.newsletters as SubscriberNewsletterRow[])
      : [],
    currentPage: typeof payload.currentPage === "number" ? payload.currentPage : 0,
    pageSize: typeof payload.pageSize === "number" ? payload.pageSize : 10,
    totalElements: typeof payload.totalElements === "number" ? payload.totalElements : 0,
    totalPages: typeof payload.totalPages === "number" ? payload.totalPages : 1,
    first: Boolean(payload.first),
    last: Boolean(payload.last)
  };
}

export async function fetchNewsletterSubscribersList(
  filters: NewsletterSubscribersListFilters,
  opts: { token: string; signal?: AbortSignal }
): Promise<PaginatedResponse<SubscriberListRow>> {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.pageSize),
    status: filters.status === "all" ? "" : filters.status,
    search: filters.search.trim()
  });

  const url = `${apiUrl("/subscribers/getAll")}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "newsletter-subscribers:list"
  });
  return parseSubscribersListResponse(res);
}

export async function fetchSubscriberNewsletters(
  subscriberId: string | number,
  filters: { page: number; pageSize: number },
  opts: { token: string; signal?: AbortSignal }
): Promise<SubscriberNewslettersDetail | null> {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.pageSize)
  });

  const url = `${apiUrl(`/subscribers/${subscriberId}/newsletters`)}?${params.toString()}`;
  const res = await fetcher<unknown>(url, {
    token: opts.token,
    signal: opts.signal,
    dedupe: false,
    debugLabel: "newsletter-subscribers:detail"
  });
  return parseSubscriberNewslettersResponse(res);
}
