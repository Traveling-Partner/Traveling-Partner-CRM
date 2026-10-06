"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_SEARCH_DEBOUNCE_MS } from "@/lib/api/query-config";

type FilterDefaults = Record<string, string>;

function readFilters<T extends FilterDefaults>(params: URLSearchParams, defaults: T): T {
  const next = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = params.get(key);
    if (value != null && value.trim() !== "") next[key as keyof T] = value as T[keyof T];
  }
  return next;
}

function toQuery(values: FilterDefaults, defaults: FilterDefaults): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(defaults)) {
    const value = values[key]?.trim() ?? "";
    if (!value || value === defaults[key]) continue;
    params.set(key, value);
  }
  return params.toString();
}

function sameFilters(left: FilterDefaults, right: FilterDefaults): boolean {
  return Object.keys(left).every((key) => left[key] === right[key]);
}

/**
 * List filters stored in the query string so refresh, Back, and shared links
 * reopen the same view. Empty values and defaults are left out of the address.
 */
export function useUrlFilters<T extends FilterDefaults>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlKey = searchParams.toString();
  const defaultsKey = JSON.stringify(defaults);
  const stableDefaults = useMemo(() => defaults, [defaultsKey]);
  const [values, setValues] = useState<T>(() => readFilters(searchParams, stableDefaults));

  useEffect(() => {
    const fromUrl = readFilters(new URLSearchParams(urlKey), stableDefaults);
    setValues((current) => (sameFilters(current, fromUrl) ? current : fromUrl));
  }, [urlKey, stableDefaults]);

  useEffect(() => {
    const next = toQuery(values, stableDefaults);
    const current = toQuery(readFilters(new URLSearchParams(urlKey), stableDefaults), stableDefaults);
    if (next === current) return;
    const handle = window.setTimeout(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, DEFAULT_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [values, stableDefaults, pathname, router, urlKey]);

  const update = useCallback((patch: Partial<T>) => {
    setValues((current) => ({ ...current, ...patch }));
  }, []);

  return { values, setValues: update };
}
