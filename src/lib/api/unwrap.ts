/** Unwraps `{ data: T }` API envelopes or returns the payload as-is. */
export function unwrapEnvelope<T>(response: unknown): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as { data: T }).data !== undefined &&
    (response as { data: T }).data !== null
  ) {
    return (response as { data: T }).data;
  }
  return response as T;
}
