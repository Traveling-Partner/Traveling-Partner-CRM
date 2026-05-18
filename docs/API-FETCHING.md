# API fetching architecture

This project uses **TanStack Query (React Query)** + a thin **`fetcher`** wrapper for all authenticated REST calls.

## Goals

- One request per unique query key (deduplication via React Query cache)
- Automatic cancellation when components unmount or filters change (`AbortSignal`)
- No refetch spam (`refetchOnWindowFocus: false`, tuned `staleTime`)
- Safe behavior under **React Strict Mode** in development
- Clear path for new features

## Stack

| Layer | Location | Responsibility |
|--------|-----------|----------------|
| HTTP | `src/lib/fetcher.ts` | JSON, Bearer token, optional debug logs |
| URLs | `src/lib/api/endpoints.ts` | `getPublicApiBase()`, `buildApiUrl()` |
| Query client | `src/lib/api/query-client.ts` | Singleton `QueryClient` |
| Defaults | `src/lib/api/query-config.ts` | `staleTime`, retry, refetch rules |
| Keys | `src/lib/api/query-keys.ts` | Cache keys for invalidation |
| Services | `src/services/*.ts` | Pure async functions (no React) |
| Hooks | `src/hooks/queries/*.ts` | `useApiQuery` / `usePaginatedQuery` per feature |
| Primitives | `src/hooks/api/*.ts` | `useApiQuery`, `useApiMutation`, `useDebouncedValue` |
| Provider | `src/providers/QueryProvider.tsx` | Wraps app inside Redux in `ReduxProvider` |

## Global defaults

From `src/lib/api/query-config.ts`:

- `staleTime`: 60s (lists/details)
- `retry`: 1
- `refetchOnWindowFocus`: **false**
- `refetchOnReconnect`: **false**
- Dashboard: `refetchInterval` 15 minutes, `staleTime` 30s

## Adding a new GET API

### 1. Add a query key

```ts
// src/lib/api/query-keys.ts
export const queryKeys = {
  myFeature: {
    list: (filters: { page: number }) => ["myFeature", "list", filters] as const,
  },
};
```

### 2. Add a service function

```ts
// src/services/my-feature.ts
import { buildApiUrl } from "@/lib/api/endpoints";
import { fetcher } from "@/lib/fetcher";

export async function fetchMyList(
  filters: { page: number },
  opts: { token: string; signal?: AbortSignal }
) {
  return fetcher(buildApiUrl("/my/endpoint", { page: filters.page }), {
    token: opts.token,
    signal: opts.signal,
    dedupe: false, // React Query handles deduplication
    debugLabel: "my-feature:list",
  });
}
```

### 3. Add a query hook

```ts
// src/hooks/queries/use-my-feature-query.ts
"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchMyList } from "@/services/my-feature";

export function useMyFeatureQuery(page: number) {
  return useApiQuery({
    queryKey: queryKeys.myFeature.list({ page }),
    queryFn: ({ token, signal }) => fetchMyList({ page }, { token, signal }),
  });
}
```

### 4. Use in a page (no `useEffect` + `fetcher` in components)

```tsx
const { data, isLoading, error } = useMyFeatureQuery(page);
```

## Paginated + search lists

Use `usePaginatedQuery` + `useDebouncedValue` (see `use-drivers-list-query.ts`).

Search text should be debounced in the hook so the query key does not change on every keystroke.

## Mutations (POST/PUT/DELETE)

```ts
const mutation = useApiMutation({
  mutationFn: ({ token, variables }) =>
    updateSomething(variables.id, payload, token),
  invalidateKeys: [queryKeys.users.drivers({ ... })], // or parent key
});
```

## Debug logging

Set in `.env.local`:

```bash
NEXT_PUBLIC_DEBUG_API=true
```

Logs appear as `[fetcher]` and hook-level messages in the console.

## React Strict Mode

In **development**, React may mount effects twice. TanStack Query:

- Deduplicates identical in-flight queries by `queryKey`
- Aborts previous requests when the query is cancelled

You may see one **cancelled** request in Network tab — that is expected.

**Production** does not double-mount; one successful request per key.

## Migration status

| Area | Status |
|------|--------|
| Admin dashboard | Migrated (`useAdminDashboardQuery`) |
| Drivers list | Migrated |
| Partners list | Migrated |
| Agents list | Migrated |
| Carousel list | Migrated |
| Driver detail, documents, vehicle-types, blog admin | Use same pattern (services + `useApiQuery`) — migrate when touching those files |

## Do not

- Call `fetcher` directly inside `useEffect` in page components for reads
- Depend on `useCallback` + `useEffect` chains for data loading
- Put full JWT in `queryKey` (keys use filters only; auth gates `enabled`)

## Do

- Put HTTP in `src/services/`
- Put React wiring in `src/hooks/queries/`
- Invalidate with `queryKeys` factories after mutations
- Pass `signal` from queryFn to `fetcher` (`dedupe: false`)
