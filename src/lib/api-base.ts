/**
 * Builds absolute API URLs. If `NEXT_PUBLIC_API_URL` ends with `/api`, uses it as-is;
 * otherwise appends `/api` so local bases like `http://localhost:8080` hit `/api/...`
 * (e.g. `http://localhost:8080/api/blog/getAll`).
 */
export function apiUrl(path: string): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
  const root = raw.endsWith("/api") ? raw : `${raw}/api`;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${root}${suffix}`;
}
