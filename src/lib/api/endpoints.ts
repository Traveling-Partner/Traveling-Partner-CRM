/** REST base from `NEXT_PUBLIC_API_URL` (no trailing slash). */
export function getPublicApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }
  return base.replace(/\/$/, "");
}

export function buildApiUrl(path: string, searchParams?: Record<string, string | number | undefined>): string {
  const base = getPublicApiBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}
