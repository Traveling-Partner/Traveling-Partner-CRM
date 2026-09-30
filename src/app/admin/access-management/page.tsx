"use client";

import { useMemo, useState } from "react";
import { KeyRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ACCESS_MODULES,
  ACCESS_ROLES,
  getPermissionsForRole,
  type AccessPermission,
  type AccessRoleId
} from "@/mock-data/access-management";

const PERMISSION_STYLES: Record<AccessPermission, string> = {
  Read: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  Write: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Read/Write": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  None: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
};

function PermissionBadge({ value }: { value: AccessPermission }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        PERMISSION_STYLES[value]
      )}
    >
      {value}
    </span>
  );
}

export default function AdminAccessManagementPage() {
  const [roleId, setRoleId] = useState<AccessRoleId>(ACCESS_ROLES[0].id);

  const selectedRole = ACCESS_ROLES.find((role) => role.id === roleId) ?? ACCESS_ROLES[0];
  const permissions = useMemo(() => getPermissionsForRole(roleId), [roleId]);

  return (
    <AppShell title="Access Management">
      <PageContainer>
        <SectionCard
          title="Access Management"
          description="Select a role to view its assigned permissions."
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-slate-800 dark:text-yellow-200">
              <KeyRound className="h-5 w-5" />
            </div>
          }
        >
          <div className="mb-5 max-w-md space-y-1.5">
            <label htmlFor="access-role" className="text-sm font-medium text-foreground">
              Role
            </label>
            <Select value={roleId} onValueChange={(value) => setRoleId(value as AccessRoleId)}>
              <SelectTrigger id="access-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            Permissions for <span className="font-medium text-foreground">{selectedRole.label}</span>
          </p>

          <div className="hidden overflow-hidden rounded-2xl border border-border/60 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%]">Module</TableHead>
                  <TableHead>Permission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACCESS_MODULES.map((module) =>
                  module.children ? (
                    <ModuleGroupRows
                      key={module.id}
                      label={module.label}
                      items={module.children}
                      permissions={permissions}
                    />
                  ) : (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.label}</TableCell>
                      <TableCell>
                        <PermissionBadge value={permissions[module.id]} />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {ACCESS_MODULES.map((module) =>
              module.children ? (
                <div
                  key={module.id}
                  className="rounded-2xl border border-border/60 bg-background/60 p-3"
                >
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {module.label}
                  </p>
                  <ul className="space-y-1">
                    {module.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between gap-3 rounded-xl px-2 py-2"
                      >
                        <span className="text-sm font-medium">{child.label}</span>
                        <PermissionBadge value={permissions[child.id]} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  key={module.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-3"
                >
                  <span className="text-sm font-medium">{module.label}</span>
                  <PermissionBadge value={permissions[module.id]} />
                </div>
              )
            )}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}

function ModuleGroupRows({
  label,
  items,
  permissions
}: {
  label: string;
  items: { id: string; label: string }[];
  permissions: Record<string, AccessPermission>;
}) {
  return (
    <>
      <TableRow className="hover:bg-transparent">
        <TableCell
          colSpan={2}
          className="bg-muted/40 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </TableCell>
      </TableRow>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="pl-8 font-medium">{item.label}</TableCell>
          <TableCell>
            <PermissionBadge value={permissions[item.id]} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
