interface FetcherOptions extends RequestInit {
  token?: string | null;
  /**
   * Share in-flight identical GETs. Default: true for GET.
   * Signal-aware: React Query abort+remount reuses the same HTTP request
   * instead of showing (canceled) then a second 200.
   */
  dedupe?: boolean;
  /** Log request lifecycle in development when `NEXT_PUBLIC_DEBUG_API=true`. */
  debugLabel?: string;
  /**
   * When true, 4xx/5xx and failed envelopes resolve to `null` instead of throwing.
   * Use for optional endpoints so Next.js does not treat expected misses as runtime errors.
   */
  ignoreHttpError?: boolean;
}

const FALLBACK_ERROR = "Request failed. Please try again.";
const NETWORK_ERROR = "Unable to reach the server. Please try again.";

/**
 * Wait one task so React Strict Mode remount (subscribe → unsubscribe → subscribe)
 * can reattach before we abort the real HTTP request.
 */
const GET_ABORT_GRACE_MS = 32;

type InFlightGet = {
  promise: Promise<unknown>;
  controller: AbortController;
  subscribers: number;
  abortTimer: ReturnType<typeof setTimeout> | null;
};

const inFlightGetRequests = new Map<string, InFlightGet>();

export function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function shouldDebugApi(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEBUG_API === "true"
  );
}

function getDedupeKey(method: string, endpoint: string): string {
  return `${method.toUpperCase()}:${endpoint}`;
}

function readApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return FALLBACK_ERROR;
  const record = data as Record<string, unknown>;
  const message = record.message;
  if (typeof message === "string" && message.trim()) return message.trim();
  if (Array.isArray(message) && typeof message[0] === "string" && message[0].trim()) {
    return message[0].trim();
  }
  if (typeof record.error === "string" && record.error.trim()) return record.error.trim();
  return FALLBACK_ERROR;
}

function isFailedEnvelope(data: unknown): boolean {
  return (
    !!data &&
    typeof data === "object" &&
    (data as { success?: boolean }).success === false
  );
}

function cancelScheduledAbort(entry: InFlightGet) {
  if (entry.abortTimer == null) return;
  clearTimeout(entry.abortTimer);
  entry.abortTimer = null;
}

function subscribeToInFlightGet(entry: InFlightGet, signal?: AbortSignal) {
  entry.subscribers += 1;
  cancelScheduledAbort(entry);

  if (!signal) return;

  const onAbort = () => {
    entry.subscribers = Math.max(0, entry.subscribers - 1);
    if (entry.subscribers > 0) return;
    cancelScheduledAbort(entry);
    entry.abortTimer = setTimeout(() => {
      entry.abortTimer = null;
      if (entry.subscribers > 0 || entry.controller.signal.aborted) return;
      entry.controller.abort();
    }, GET_ABORT_GRACE_MS);
  };

  if (signal.aborted) {
    onAbort();
    return;
  }

  signal.addEventListener("abort", onAbort, { once: true });
}

export async function fetcher<T = unknown>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { token, headers, dedupe: _dedupe, debugLabel, signal, ignoreHttpError, ...rest } =
    options;
  const method = (rest.method ?? "GET").toUpperCase();
  const key = getDedupeKey(method, endpoint);
  /**
   * Share in-flight GETs even when callers pass `dedupe: false` + AbortSignal.
   * Services historically disabled fetcher dedupe because React Query supplies a
   * signal; that skipped sharing and produced (canceled) then 200.
   */
  const useDedupe = method === "GET";

  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }

  if (useDedupe) {
    const existing = inFlightGetRequests.get(key);
    if (existing && !existing.controller.signal.aborted) {
      subscribeToInFlightGet(existing, signal);
      if (shouldDebugApi()) {
        console.debug("[fetcher] deduped", { label: debugLabel, method, endpoint });
      }
      return existing.promise as Promise<T>;
    }
  }

  const controller = useDedupe ? new AbortController() : null;
  const fetchSignal = controller?.signal ?? signal;

  const run = async (): Promise<T> => {
    const storageToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const accessToken = token ?? storageToken;

    if (shouldDebugApi()) {
      console.debug("[fetcher] start", {
        label: debugLabel,
        method,
        endpoint,
        aborted: fetchSignal?.aborted ?? false
      });
    }

    let response: Response;
    try {
      response = await fetch(endpoint, {
        ...rest,
        method,
        signal: fetchSignal,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(headers ?? {})
        }
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      throw new Error(NETWORK_ERROR);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || isFailedEnvelope(data)) {
      if (ignoreHttpError) {
        return null as T;
      }
      throw new Error(readApiErrorMessage(data));
    }

    if (shouldDebugApi()) {
      console.debug("[fetcher] success", { label: debugLabel, method, endpoint });
    }

    return data as T;
  };

  const promise = run().catch((error: unknown) => {
    if (isAbortError(error) && shouldDebugApi()) {
      console.debug("[fetcher] aborted", { label: debugLabel, method, endpoint });
    }
    throw error;
  });

  if (useDedupe && controller) {
    const entry: InFlightGet = {
      promise,
      controller,
      subscribers: 0,
      abortTimer: null
    };
    inFlightGetRequests.set(key, entry);
    subscribeToInFlightGet(entry, signal);
    promise.finally(() => {
      const current = inFlightGetRequests.get(key);
      if (current === entry) {
        cancelScheduledAbort(entry);
        inFlightGetRequests.delete(key);
      }
    });
  }

  return promise;
}
