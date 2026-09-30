"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Ban,
  Briefcase,
  Car,
  Contact,
  Eye,
  FileText,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  Pencil,
  Receipt,
  Route,
  Share2,
  ShieldCheck,
  Siren,
  TrendingUp,
  Users
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  ACCESS_MODULES,
  ACCESS_ROLES,
  ROLE_PERMISSIONS,
  type AccessPermission,
  type AccessRoleId
} from "@/mock-data/access-management";

const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  "user-management": Users,
  driver: Users,
  partner: Briefcase,
  "employees-list": Contact,
  document: FileText,
  "driver-partner-management": Share2,
  "sos-management": Siren,
  "ride-management": Route,
  "commission-management": TrendingUp,
  "agent-performance": BadgeDollarSign,
  "content-management": FolderOpen,
  "financial-management": Receipt,
  "vehicle-management": Car,
  "access-management": KeyRound
};

const STATUS_STYLES: Record<AccessPermission, string> = {
  Read: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  Write: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Read/Write": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  None: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
};

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

function PermissionSwitches({
  id,
  value,
  onChange
}: {
  id: string;
  value: AccessPermission;
  onChange: (value: AccessPermission) => void;
}) {
  const { read, write } = flagsFromPermission(value);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-2.5">
        <Switch
          id={`${id}-read`}
          checked={read}
          onCheckedChange={(checked) => onChange(permissionFromFlags(checked, write))}
        />
        <Label htmlFor={`${id}-read`} className="cursor-pointer text-sm font-medium">
          Read
        </Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Switch
          id={`${id}-write`}
          checked={write}
          onCheckedChange={(checked) => onChange(permissionFromFlags(read, checked))}
        />
        <Label htmlFor={`${id}-write`} className="cursor-pointer text-sm font-medium">
          Write
        </Label>
      </div>
      <span
        className={cn(
          "inline-flex min-w-[5.25rem] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
          STATUS_STYLES[value]
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function AdminAccessManagementPage() {
  const { success } = useToast();
  const [roleId, setRoleId] = useState<AccessRoleId>(ACCESS_ROLES[0].id);
  const [pendingRoleId, setPendingRoleId] = useState<AccessRoleId | null>(null);
  const [matrix, setMatrix] = useState(clonePermissions);

  const selectedRole = ACCESS_ROLES.find((role) => role.id === roleId) ?? ACCESS_ROLES[0];
  const permissions = matrix[roleId];
  const pendingRole = pendingRoleId ? roleLabel(pendingRoleId) : "";

  const counts = useMemo(() => {
    const values = Object.values(permissions);
    return {
      readWrite: values.filter((item) => item === "Read/Write").length,
      write: values.filter((item) => item === "Write").length,
      read: values.filter((item) => item === "Read").length,
      none: values.filter((item) => item === "None").length
    };
  }, [permissions]);

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

  const confirmRoleChange = () => {
    if (!pendingRoleId) return;
    const nextLabel = roleLabel(pendingRoleId);
    setRoleId(pendingRoleId);
    setPendingRoleId(null);
    success(`Role changed to ${nextLabel}.`);
  };

  return (
    <AppShell title="Access Management" wideContent>
      <PageContainer className="gap-5">
        <section className="glass-panel relative overflow-hidden rounded-[2rem]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#fce001] via-[#fdb813] to-transparent" />
          <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fce001] to-[#fdb813] text-slate-900 shadow-md shadow-yellow-500/20">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Admin control
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
                  Access Management
                </h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Choose a role and set what that role can see and change.
                </p>
              </div>
            </div>

            <div className="w-full max-w-md space-y-1.5 lg:w-80">
              <label htmlFor="access-role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role
              </label>
              <Select
                value={roleId}
                onValueChange={(value) => {
                  const next = value as AccessRoleId;
                  if (next === roleId) return;
                  setPendingRoleId(next);
                }}
              >
                <SelectTrigger
                  id="access-role"
                  className="h-11 rounded-xl border-border/80 bg-background/80 font-medium"
                >
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
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile
            label="Read / Write"
            value={counts.readWrite}
            hint="Full access"
            icon={ShieldCheck}
            accent="from-[#fce001]/80 to-[#fdb813]/80"
          />
          <StatTile
            label="Write"
            value={counts.write}
            hint="Can change"
            icon={Pencil}
            accent="from-amber-400/70 to-amber-500/40"
          />
          <StatTile
            label="Read"
            value={counts.read}
            hint="View only"
            icon={Eye}
            accent="from-sky-400/70 to-sky-500/40"
          />
          <StatTile
            label="None"
            value={counts.none}
            hint="Hidden"
            icon={Ban}
            accent="from-slate-300/80 to-slate-400/40"
          />
        </div>

        <p className="px-1 text-sm text-muted-foreground">
          Editing{" "}
          <span className="font-semibold text-foreground">{selectedRole.label}</span>
        </p>

        <div className="space-y-4">
          <section className="glass-panel overflow-hidden rounded-[1.75rem]">
            <header className="flex items-center gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-light)] text-slate-800 dark:text-yellow-200">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold tracking-tight">Core modules</h3>
                <p className="text-[11px] text-muted-foreground">Direct screens for this role</p>
              </div>
            </header>
            <ul className="divide-y divide-border/40">
              {ACCESS_MODULES.filter((module) => !module.children).map((module) => {
                const Icon = MODULE_ICONS[module.id] ?? KeyRound;
                return (
                  <PermissionRow
                    key={module.id}
                    id={module.id}
                    icon={Icon}
                    label={module.label}
                    value={permissions[module.id]}
                    onChange={(value) => setPermission(module.id, module.label, value)}
                  />
                );
              })}
            </ul>
          </section>

          {ACCESS_MODULES.filter((module) => module.children).map((module) => {
            const Icon = MODULE_ICONS[module.id] ?? KeyRound;
            const children = module.children ?? [];
            return (
              <section key={module.id} className="glass-panel overflow-hidden rounded-[1.75rem]">
                <header className="flex items-center gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-light)] text-slate-800 dark:text-yellow-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold tracking-tight">
                      {module.label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{children.length} screens</p>
                  </div>
                </header>
                <ul className="divide-y divide-border/40">
                  {children.map((child) => (
                    <PermissionRow
                      key={child.id}
                      id={child.id}
                      label={child.label}
                      value={permissions[child.id]}
                      onChange={(value) => setPermission(child.id, child.label, value)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </PageContainer>

      <ConfirmDialog
        open={pendingRoleId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRoleId(null);
        }}
        title="Change role?"
        description="This will show and edit permissions for a different role."
        confirmLabel="Change role"
        cancelLabel="Keep current"
        icon={<Users className="h-4 w-4" />}
        onConfirm={confirmRoleChange}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              From
            </p>
            <p className="truncate text-sm font-semibold">{selectedRole.label}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              To
            </p>
            <p className="truncate text-sm font-semibold">{pendingRole}</p>
          </div>
        </div>
      </ConfirmDialog>
    </AppShell>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent
}: {
  label: string;
  value: number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl px-4 py-3.5">
      <div className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", accent)} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function PermissionRow({
  id,
  label,
  value,
  onChange,
  icon: Icon
}: {
  id: string;
  label: string;
  value: AccessPermission;
  onChange: (value: AccessPermission) => void;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <li className="flex list-none flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        ) : (
          <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-border sm:block" />
        )}
        <span className="truncate text-sm font-medium">{label}</span>
      </div>
      <PermissionSwitches id={id} value={value} onChange={onChange} />
    </li>
  );
}
