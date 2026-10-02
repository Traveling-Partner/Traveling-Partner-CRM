"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { toPagePermissionGate } from "@/lib/page-permissions";
import { fetchUserPermissions, type RolePermissionsData } from "@/services/permissions";
import { normalizeRole } from "@/lib/rbac";
import { ROLES } from "@/lib/roles";

/** One GET /user/permission per logged-in user. Admin is never filtered. */
export function useUserPermissionsQuery() {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const isAdmin = normalizeRole(useAppSelector((state) => state.auth.user?.role)) === ROLES.ADMIN;

  const query = useApiQuery<RolePermissionsData>({
    queryKey: queryKeys.permissions.me(userId ?? ""),
    enabled: Boolean(userId) && !isAdmin,
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
    queryFn: ({ token, signal }) => fetchUserPermissions({ token, signal })
  });

  const gate = useMemo(
    () => (isAdmin || !query.isSuccess ? null : toPagePermissionGate(query.data)),
    [isAdmin, query.isSuccess, query.data]
  );

  return { ...query, gate };
}
