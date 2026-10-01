"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { toPagePermissionGate } from "@/lib/page-permissions";
import { fetchUserPermissions, type RolePermissionsData } from "@/services/permissions";

/** One GET /user/permission per logged-in user. Shared by sidebar + route guard. */
export function useUserPermissionsQuery() {
  const userId = useAppSelector((state) => state.auth.user?.id);

  const query = useApiQuery<RolePermissionsData>({
    queryKey: queryKeys.permissions.me(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
    queryFn: ({ token, signal }) => fetchUserPermissions({ token, signal })
  });

  const gate = useMemo(
    () => (query.isSuccess ? toPagePermissionGate(query.data) : null),
    [query.isSuccess, query.data]
  );

  return { ...query, gate };
}
