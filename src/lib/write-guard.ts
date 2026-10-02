/** Read-only lock for the current page. Default allow so login OTP still works. */
let writeAllowed = true;

export function setWriteAllowed(allowed: boolean) {
  writeAllowed = allowed;
}

export function assertWriteAllowed(method: string, endpoint: string) {
  const verb = method.toUpperCase();
  if (verb === "GET" || verb === "HEAD" || verb === "OPTIONS") return;
  if (endpoint.includes("/auth/")) return;
  if (writeAllowed) return;
  throw new Error("You have view-only access on this page.");
}
