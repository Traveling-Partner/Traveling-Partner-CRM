"use client";

import { useAppSelector } from "@/store/hooks";

/** Stable access to the current JWT for query `enabled` gates. */
export function useAuthToken(): string | null {
  return useAppSelector((state) => state.auth.token);
}

export function useIsAuthenticated(): boolean {
  return useAppSelector((state) => state.auth.isAuthenticated && !!state.auth.token);
}
