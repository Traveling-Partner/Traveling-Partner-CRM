"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { useAssignableRolesQuery, useRolePermissionsQuery } from "@/hooks/queries/use-permissions-queries";
import { queryKeys } from "@/lib/api/query-keys";
import {
  PERMISSION_LEVELS,
  PERMISSION_MODULES,
  updateRolePermissions,
  type PermissionDto,
  type PermissionLevel,
  type RolePermissionsDto
} from "@/services/permissions";

function formatModuleLabel(module: string): string {
  return module
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Always every `PERMISSION_MODULES` entry, defaulting to NONE - same rule
 * the backend's own `buildFullPermissionList` uses, so the UI never has to
 * guess what an absent module means.
 */
function toFullMatrix(permissions: PermissionDto[] | undefined): Record<string, PermissionLevel> {
  const byModule = new Map((permissions ?? []).map((p) => [p.module, p.level as PermissionLevel]));
  const matrix: Record<string, PermissionLevel> = {};
  for (const module of PERMISSION_MODULES) {
    matrix[module] = byModule.get(module) ?? "NONE";
  }
  return matrix;
}

export default function AccessManagementPage() {
  const { success, error: toastError } = useToast();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<Record<string, PermissionLevel> | null>(null);

  const rolesQuery = useAssignableRolesQuery();
  const permissionsQuery = useRolePermissionsQuery(selectedRole);

  const roles = rolesQuery.data ?? [];

  // Default to the first assignable role once the list loads.
  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRole(roles[0].name);
    }
  }, [roles, selectedRole]);

  const loadedMatrix = useMemo(
    () => toFullMatrix(permissionsQuery.data?.permissions),
    [permissionsQuery.data]
  );

  // Reset the editable matrix whenever a new role's data arrives (switching
  // role or reloading) - edits for the previous role must never bleed in.
  useEffect(() => {
    if (permissionsQuery.data) {
      setMatrix(loadedMatrix);
    }
  }, [permissionsQuery.data, loadedMatrix]);

  useEffect(() => {
    if (rolesQuery.isError) {
      toastError(rolesQuery.error?.message ?? "Failed to load roles.");
    }
  }, [rolesQuery.isError, rolesQuery.error, toastError]);

  useEffect(() => {
    if (permissionsQuery.isError) {
      toastError(permissionsQuery.error?.message ?? "Failed to load role permissions.");
    }
  }, [permissionsQuery.isError, permissionsQuery.error, toastError]);

  const isDirty = useMemo(() => {
    if (!matrix) return false;
    return PERMISSION_MODULES.some((module) => matrix[module] !== loadedMatrix[module]);
  }, [matrix, loadedMatrix]);

  const saveMutation = useApiMutation<RolePermissionsDto, void>({
    mutationFn: async ({ token }) => {
      if (!selectedRole || !matrix) {
        throw new Error("No role selected.");
      }
      // Always submit the complete matrix - the backend only upserts the
      // modules it's given, so sending a partial list would leave omitted
      // modules at their old value rather than resetting them, but could
      // also silently miss a module the admin intended to clear if we ever
      // sent anything less than the full, current PERMISSION_MODULES set.
      const permissions: PermissionDto[] = PERMISSION_MODULES.map((module) => ({
        module,
        level: matrix[module]
      }));
      return updateRolePermissions({ role: selectedRole, permissions }, { token });
    },
    invalidateKeys: selectedRole ? [queryKeys.permissions.role(selectedRole)] : [],
    onSuccess: () => {
      success(`Permissions saved for ${selectedRole}.`);
    },
    onError: (err) => {
      toastError(err.message);
    }
  });

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setMatrix(null);
  };

  const handleLevelChange = (module: string, level: PermissionLevel) => {
    setMatrix((prev) => (prev ? { ...prev, [module]: level } : prev));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const isMatrixLoading = !!selectedRole && (permissionsQuery.isLoading || !matrix);

  return (
    <AppShell title="Access Management" allowedRoles={["ADMIN"]}>
      <PageContainer>
        <SectionCard
          title="Role permissions"
          description="Configure READ / WRITE access per module for each portal role. This controls what the Ops Portal shows and allows for that role - it does not change backend enforcement, which today only covers a subset of endpoints."
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedRole ?? undefined} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!selectedRole || !matrix || !isDirty || saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          }
        >
          {rolesQuery.isLoading ? (
            <LoadingSkeleton lines={5} />
          ) : roles.length === 0 ? (
            <EmptyState
              title="No assignable roles"
              description="No roles are currently configured for Access Management."
            />
          ) : !selectedRole ? (
            <EmptyState
              title="Select a role"
              description="Choose a role above to view and edit its permissions."
            />
          ) : isMatrixLoading ? (
            <LoadingSkeleton lines={8} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead className="w-48">Access level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MODULES.map((module) => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{formatModuleLabel(module)}</TableCell>
                    <TableCell>
                      <Select
                        value={matrix?.[module]}
                        onValueChange={(level) => handleLevelChange(module, level as PermissionLevel)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PERMISSION_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
