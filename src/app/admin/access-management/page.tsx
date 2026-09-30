"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  ACCESS_MODULES,
  formatPermissionModule,
  formatPermissionRoleName
} from "@/mock-data/access-management";
import {
  usePermissionRolesQuery,
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation
} from "@/hooks/queries/use-access-permissions";
import type { PermissionEntry, PermissionLevel } from "@/services/permissions";

function flagsFromLevel(level: PermissionLevel) {
  return {
    read: level === "READ",
    write: level === "WRITE"
  };
}

function levelFromFlags(read: boolean, write: boolean): PermissionLevel {
  if (write) return "WRITE";
  if (read) return "READ";
  return "NONE";
}

function levelLabel(level: PermissionLevel) {
  if (level === "READ") return "Read";
  if (level === "WRITE") return "Write";
  return "None";
}

function groupPermissionRows(permissions: PermissionEntry[]) {
  const byModule = new Map(permissions.map((entry) => [entry.module, entry]));
  const used = new Set<string>();

  const groups = ACCESS_MODULES.map((section) => {
    const items = section.children
      .map((child) => {
        const entry = byModule.get(child.id);
        if (!entry) return null;
        used.add(child.id);
        return { ...entry, label: child.label };
      })
      .filter((item): item is PermissionEntry & { label: string } => item !== null);
    return { id: section.id, label: section.label, items };
  }).filter((group) => group.items.length > 0);

  const leftover = permissions.filter((entry) => !used.has(entry.module));
  if (leftover.length > 0) {
    groups.push({
      id: "other",
      label: "Other",
      items: leftover.map((entry) => ({
        ...entry,
        label: formatPermissionModule(entry.module)
      }))
    });
  }

  return groups;
}

export default function AdminAccessManagementPage() {
  const { success, error: showError } = useToast();
  const [pickedRole, setPickedRole] = useState<string | null>(null);

  const rolesQuery = usePermissionRolesQuery();
  const roles = rolesQuery.data ?? [];
  const roleName =
    (pickedRole && roles.some((role) => role.name === pickedRole)
      ? pickedRole
      : roles[0]?.name) ?? "";

  const permissionsQuery = useRolePermissionsQuery(roleName);
  const updateMutation = useUpdateRolePermissionsMutation();

  const selectedRole = roles.find((role) => role.name === roleName);
  const permissions = permissionsQuery.data?.permissions ?? [];
  const groups = useMemo(() => groupPermissionRows(permissions), [permissions]);
  const busy = updateMutation.isPending;

  const setLevel = async (module: string, moduleLabel: string, level: PermissionLevel) => {
    if (!roleName) return;
    const nextPermissions = permissions.map((entry) =>
      entry.module === module ? { module: entry.module, level } : entry
    );
    if (!nextPermissions.some((entry) => entry.module === module)) {
      nextPermissions.push({ module, level });
    }

    try {
      await updateMutation.mutateAsync({
        role: roleName,
        permissions: nextPermissions
      });
      success(`${moduleLabel} set to ${levelLabel(level)}.`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update permissions.");
    }
  };

  return (
    <AppShell title="Access Management">
      <PageContainer>
        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <header className="flex flex-col gap-4 border-b border-border/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Access Management
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Permissions for{" "}
                {selectedRole
                  ? formatPermissionRoleName(selectedRole.name)
                  : "the selected role"}
              </p>
            </div>
            <div className="w-full sm:w-72">
              <label htmlFor="access-role" className="sr-only">
                Role
              </label>
              <Select
                value={roleName || undefined}
                onValueChange={(value) => {
                  if (value === roleName) return;
                  setPickedRole(value);
                  success(`Role changed to ${formatPermissionRoleName(value)}.`);
                }}
                disabled={rolesQuery.isLoading || roles.length === 0}
              >
                <SelectTrigger id="access-role" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {formatPermissionRoleName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          {rolesQuery.error ? (
            <p className="mx-6 my-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:mx-8">
              {rolesQuery.error.message}
            </p>
          ) : null}

          {permissionsQuery.error ? (
            <p className="mx-6 my-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:mx-8">
              {permissionsQuery.error.message}
            </p>
          ) : null}

          {rolesQuery.isLoading || (Boolean(roleName) && permissionsQuery.isLoading) ? (
            <div className="space-y-3 px-6 py-6 sm:px-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <EmptyState
              className="m-6 sm:m-8"
              title="No roles found"
              description="Roles for Access Management could not be loaded."
            />
          ) : permissions.length === 0 ? (
            <EmptyState
              className="m-6 sm:m-8"
              title="No permissions found"
              description="This role has no permission modules yet."
            />
          ) : (
            <div className={cn("min-w-0", busy && "pointer-events-none opacity-70")}>
              <Table className="min-w-[36rem]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-12 pl-6 sm:pl-8">Page</TableHead>
                    <TableHead className="h-12 w-28 text-center">Read</TableHead>
                    <TableHead className="h-12 w-28 text-center">Write</TableHead>
                    <TableHead className="h-12 w-32 pr-6 text-center sm:pr-8">None</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <GroupRows
                      key={group.id}
                      label={group.label}
                      items={group.items}
                      onChange={setLevel}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </PageContainer>
    </AppShell>
  );
}

function GroupRows({
  label,
  items,
  onChange
}: {
  label: string;
  items: Array<PermissionEntry & { label: string }>;
  onChange: (module: string, moduleLabel: string, level: PermissionLevel) => void;
}) {
  return (
    <>
      <TableRow className="hover:bg-transparent">
        <TableCell
          colSpan={4}
          className="bg-muted/50 py-2.5 pl-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:pl-8"
        >
          {label}
        </TableCell>
      </TableRow>
      {items.map((item) => (
        <PermissionRow
          key={item.module}
          module={item.module}
          label={item.label}
          nested
          value={item.level}
          onChange={(level) => onChange(item.module, item.label, level)}
        />
      ))}
    </>
  );
}

function PermissionRow({
  module,
  label,
  value,
  onChange,
  nested
}: {
  module: string;
  label: string;
  value: PermissionLevel;
  onChange: (level: PermissionLevel) => void;
  nested?: boolean;
}) {
  const { read, write } = flagsFromLevel(value);
  const isNone = value === "NONE";

  return (
    <TableRow>
      <TableCell className={cn("pl-6 font-medium sm:pl-8", nested && "pl-10 sm:pl-14")}>
        {label}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <Switch
            id={`${module}-read`}
            checked={read}
            onCheckedChange={(checked) => onChange(levelFromFlags(checked, false))}
            aria-label={`${label} read`}
          />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <Switch
            id={`${module}-write`}
            checked={write}
            onCheckedChange={(checked) => onChange(levelFromFlags(false, checked))}
            aria-label={`${label} write`}
          />
        </div>
      </TableCell>
      <TableCell className="pr-6 text-center sm:pr-8">
        <button
          type="button"
          onClick={() => {
            if (!isNone) onChange("NONE");
          }}
          className={cn(
            "inline-flex h-8 min-w-[4.5rem] items-center justify-center rounded-full px-3 text-xs font-semibold transition-all duration-150",
            isNone
              ? "bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-sm"
              : "border border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          )}
        >
          None
        </button>
      </TableCell>
    </TableRow>
  );
}
