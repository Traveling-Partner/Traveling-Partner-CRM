"use client";

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import { EMPTY_PAGE_GATE, toPagePermissionGate } from "@/lib/page-permissions";
import { fetchUserPermissions, type RolePermissionsData } from "@/services/permissions";
import { normalizeRole } from "@/lib/rbac";
import { ROLES } from "@/lib/roles";
import { setAuthRole } from "@/store/slices/authSlice";

/** One GET /user/permission per logged-in user. Admin is never filtered. */
export function useUserPermissionsQuery() {
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    const role = query.data?.role?.trim();
    if (!query.isSuccess || !role) return;
    const normalized = normalizeRole(role);
    if (normalized === "DRIVER" || normalized === "PARTNER") return;
    dispatch(setAuthRole(role));
  }, [dispatch, query.isSuccess, query.data?.role]);

  const gate = useMemo(() => {
    if (isAdmin) return null;
    if (query.isSuccess) return toPagePermissionGate(query.data);
    if (query.isError) return EMPTY_PAGE_GATE;
    return null;
  }, [isAdmin, query.isSuccess, query.isError, query.data]);

  return { ...query, gate, isAdmin };
}
