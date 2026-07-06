"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult
} from "@tanstack/react-query";
import { useAuthToken } from "@/hooks/api/use-auth-token";
import { useAppSelector } from "@/store/hooks";

type AuthenticatedQueryFn<T> = (ctx: {
  token: string;
  signal: AbortSignal;
}) => Promise<T>;

export type UseApiQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, QueryKey>,
  "queryFn" | "queryKey"
> & {
  queryKey: QueryKey;
  queryFn: AuthenticatedQueryFn<TData>;
  /** When false, query waits even if token exists. Default: true */
  requireAuth?: boolean;
};

/**
 * Authenticated GET (or read) query with automatic `enabled` when token is missing.
 * Passes AbortSignal from TanStack Query for cancellation on unmount / key change.
 */
export function useApiQuery<TData>(
  options: UseApiQueryOptions<TData>
): UseQueryResult<TData, Error> {
  const token = useAuthToken();
  const authInitialized = useAppSelector((state) => state.auth.authInitialized);
  const { queryFn, queryKey, requireAuth = true, enabled, ...rest } = options;

  return useQuery({
    ...rest,
    queryKey,
    enabled:
      (enabled ?? true) &&
      (!requireAuth || (authInitialized && !!token)),
    queryFn: ({ signal }) => {
      if (requireAuth && !token) {
        throw new Error("Authentication required.");
      }
      return queryFn({ token: token ?? "", signal });
    }
  });
}
