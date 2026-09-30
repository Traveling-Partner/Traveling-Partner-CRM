"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
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
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  ACCESS_MODULES,
  ACCESS_ROLES,
  ROLE_PERMISSIONS,
  type AccessPermission,
  type AccessRoleId
} from "@/mock-data/access-management";

function clonePermissions() {
  return Object.fromEntries(
    ACCESS_ROLES.map((role) => [role.id, { ...ROLE_PERMISSIONS[role.id] }])
  ) as Record<AccessRoleId, Record<string, AccessPermission>>;
}

function flagsFromPermission(value: AccessPermission) {
  return {
    read: value === "Read" || value === "Read/Write",
    write: value === "Write" || value === "Read/Write"
  };
}

function permissionFromFlags(read: boolean, write: boolean): AccessPermission {
  if (read && write) return "Read/Write";
  if (write) return "Write";
  if (read) return "Read";
  return "None";
}

function roleLabel(id: AccessRoleId) {
  return ACCESS_ROLES.find((role) => role.id === id)?.label ?? id;
}

export default function AdminAccessManagementPage() {
  const { success } = useToast();
  const [roleId, setRoleId] = useState<AccessRoleId>(ACCESS_ROLES[0].id);
  const [matrix, setMatrix] = useState(clonePermissions);

  const selectedRole = ACCESS_ROLES.find((role) => role.id === roleId) ?? ACCESS_ROLES[0];
  const permissions = matrix[roleId];

  const setPermission = (moduleId: string, moduleLabel: string, value: AccessPermission) => {
    setMatrix((current) => ({
      ...current,
      [roleId]: {
        ...current[roleId],
        [moduleId]: value
      }
    }));
    success(`${moduleLabel} set to ${value}.`);
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
                Permissions for {selectedRole.label}
              </p>
            </div>
            <div className="w-full sm:w-72">
              <label htmlFor="access-role" className="sr-only">
                Role
              </label>
              <Select
                value={roleId}
                onValueChange={(value) => {
                  const next = value as AccessRoleId;
                  if (next === roleId) return;
                  setRoleId(next);
                  success(`Role changed to ${roleLabel(next)}.`);
                }}
              >
                <SelectTrigger id="access-role" className="h-11 rounded-xl">
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
          </header>

          <div className="min-w-0">
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
                {ACCESS_MODULES.map((module) => (
                  <GroupRows
                    key={module.id}
                    label={module.label}
                    items={module.children}
                    permissions={permissions}
                    onChange={setPermission}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}

function GroupRows({
  label,
  items,
  permissions,
  onChange
}: {
  label: string;
  items: { id: string; label: string }[];
  permissions: Record<string, AccessPermission>;
  onChange: (moduleId: string, moduleLabel: string, value: AccessPermission) => void;
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
          key={item.id}
          id={item.id}
          label={item.label}
          nested
          value={permissions[item.id]}
          onChange={(value) => onChange(item.id, item.label, value)}
        />
      ))}
    </>
  );
}

function PermissionRow({
  id,
  label,
  value,
  onChange,
  nested
}: {
  id: string;
  label: string;
  value: AccessPermission;
  onChange: (value: AccessPermission) => void;
  nested?: boolean;
}) {
  const { read, write } = flagsFromPermission(value);
  const isNone = value === "None";

  return (
    <TableRow>
      <TableCell className={cn("pl-6 font-medium sm:pl-8", nested && "pl-10 sm:pl-14")}>
        {label}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <Switch
            id={`${id}-read`}
            checked={read}
            onCheckedChange={(checked) => onChange(permissionFromFlags(checked, write))}
            aria-label={`${label} read`}
          />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <Switch
            id={`${id}-write`}
            checked={write}
            onCheckedChange={(checked) => onChange(permissionFromFlags(read, checked))}
            aria-label={`${label} write`}
          />
        </div>
      </TableCell>
      <TableCell className="pr-6 text-center sm:pr-8">
        <button
          type="button"
          onClick={() => {
            if (!isNone) onChange("None");
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
