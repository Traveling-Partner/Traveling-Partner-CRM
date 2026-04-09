interface FetcherOptions extends RequestInit {
  token?: string | null;
}

export async function fetcher<T = unknown>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const storageToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const accessToken = token ?? storageToken;

  const response = await fetch(endpoint, {
    ...rest,
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

  return data as T;
}
