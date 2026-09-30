"use client";

import { useApiMutation, useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  fetchPermissionRoles,
  fetchRolePermissions,
  updateRolePermissions,
  type PermissionRole,
  type RolePermissionsData,
  type RolePermissionsUpdatePayload
} from "@/services/permissions";

export function usePermissionRolesQuery() {
  return useApiQuery<PermissionRole[]>({
    queryKey: queryKeys.permissions.roles(),
    queryFn: ({ token, signal }) => fetchPermissionRoles({ token, signal })
  });
}

export function useRolePermissionsQuery(role: string) {
  return useApiQuery<RolePermissionsData>({
    queryKey: queryKeys.permissions.byRole(role),
    enabled: Boolean(role),
    queryFn: ({ token, signal }) => fetchRolePermissions(role, { token, signal })
  });
}

export function useUpdateRolePermissionsMutation() {
  return useApiMutation<RolePermissionsData, RolePermissionsUpdatePayload>({
    mutationFn: ({ token, variables }) => updateRolePermissions(variables, token),
    invalidateKeys: [queryKeys.permissions.all]
  });
}
