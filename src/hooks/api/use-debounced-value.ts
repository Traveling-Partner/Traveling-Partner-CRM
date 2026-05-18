"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SEARCH_DEBOUNCE_MS } from "@/lib/api/query-config";

export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
