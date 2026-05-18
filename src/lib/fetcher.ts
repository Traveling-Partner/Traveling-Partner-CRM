interface FetcherOptions extends RequestInit {
  token?: string | null;
  /** Reuse the same in-flight GET for identical URLs (default: true for GET). Ignored when `signal` is set. */
  dedupe?: boolean;
  /** Log request lifecycle in development when `NEXT_PUBLIC_DEBUG_API=true`. */
  debugLabel?: string;
}

const inFlightGetRequests = new Map<string, Promise<unknown>>();

function shouldDebugApi(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEBUG_API === "true"
  );
}

function getDedupeKey(method: string, endpoint: string): string {
  return `${method.toUpperCase()}:${endpoint}`;
}

export async function fetcher<T = unknown>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { token, headers, dedupe, debugLabel, signal, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();
  const useDedupe = dedupe ?? method === "GET";

  if (useDedupe && !signal && inFlightGetRequests.has(getDedupeKey(method, endpoint))) {
    const existing = inFlightGetRequests.get(getDedupeKey(method, endpoint))!;
    if (shouldDebugApi()) {
      console.debug("[fetcher] deduped", { label: debugLabel, method, endpoint });
    }
    return existing as Promise<T>;
  }

  const run = async (): Promise<T> => {
    const storageToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const accessToken = token ?? storageToken;

    if (shouldDebugApi()) {
      console.debug("[fetcher] start", {
        label: debugLabel,
        method,
        endpoint,
        aborted: signal?.aborted ?? false
      });
    }

    const response = await fetch(endpoint, {
      ...rest,
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(headers ?? {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        (data as { message?: string })?.message ?? "Request failed. Please try again.";
      throw new Error(message);
    }

    if (shouldDebugApi()) {
      console.debug("[fetcher] success", { label: debugLabel, method, endpoint });
    }

    return data as T;
  };

  const promise = run().catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (shouldDebugApi()) {
        console.debug("[fetcher] aborted", { label: debugLabel, method, endpoint });
      }
    }
    throw error;
  });

  if (useDedupe && !signal) {
    const key = getDedupeKey(method, endpoint);
    inFlightGetRequests.set(key, promise);
    promise.finally(() => {
      if (inFlightGetRequests.get(key) === promise) {
        inFlightGetRequests.delete(key);
      }
    });
  }

  return promise;
}
