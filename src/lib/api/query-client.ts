import { QueryClient } from "@tanstack/react-query";
import { defaultQueryClientOptions } from "@/lib/api/query-config";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryClientOptions
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Singleton for the browser; new client per server request when SSR expands later.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
