"use client";

import { useApiQuery } from "@/hooks/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  fetchAssignableRoles,
  fetchMyPermissions,
  fetchRolePermissions
} from "@/services/permissions";

/** GET /api/admin/permissions/roles - Access Management's role dropdown (admin only). */
export function useAssignableRolesQuery() {
  return useApiQuery({
    queryKey: queryKeys.permissions.roles(),
    queryFn: ({ token, signal }) => fetchAssignableRoles({ token, signal })
  });
}

/** GET /api/admin/permissions/{role} - the selected role's full permission matrix. */
export function useRolePermissionsQuery(role: string | null) {
  return useApiQuery({
    queryKey: queryKeys.permissions.role(role ?? ""),
    enabled: !!role,
    queryFn: ({ token, signal }) => fetchRolePermissions(role as string, { token, signal })
  });
}

/**
 * GET /api/user/permission - the authenticated caller's own permissions.
 * Standalone for now: not wired into auth state, navigation, or CRUD
 * gating in this ticket's scope - that integration is explicitly deferred
 * to a follow-up ticket.
 */
export function useMyPermissionsQuery() {
  return useApiQuery({
    queryKey: queryKeys.permissions.mine(),
    queryFn: ({ token, signal }) => fetchMyPermissions({ token, signal })
  });
}
