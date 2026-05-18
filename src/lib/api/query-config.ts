import type { DefaultOptions } from "@tanstack/react-query";

/** Default stale window — list/detail reads stay fresh without refetch spam. */
export const DEFAULT_STALE_TIME_MS = 60 * 1000;

/** Dashboard metrics refresh on an interval while the page is open. */
export const DASHBOARD_STALE_TIME_MS = 30 * 1000;
export const DASHBOARD_REFETCH_INTERVAL_MS = 15 * 60 * 1000;

/** Search inputs debounce before hitting the network. */
export const DEFAULT_SEARCH_DEBOUNCE_MS = 400;

export const defaultQueryClientOptions: DefaultOptions = {
  queries: {
    staleTime: DEFAULT_STALE_TIME_MS,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true
  },
  mutations: {
    retry: 0
  }
};
