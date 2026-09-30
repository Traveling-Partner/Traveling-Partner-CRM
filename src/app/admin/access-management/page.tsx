"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ACCESS_MODULES,
  ACCESS_PERMISSIONS,
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

const PERMISSION_PILL: Record<
  AccessPermission,
  { selected: string; label: string }
> = {
  None: {
    selected: "bg-slate-800 text-white shadow-sm dark:bg-slate-200 dark:text-slate-900",
    label: "None"
  },
  Read: {
    selected: "bg-sky-500 text-white shadow-sm shadow-sky-500/25",
    label: "Read"
  },
  Write: {
    selected: "bg-amber-500 text-white shadow-sm shadow-amber-500/25",
    label: "Write"
  },
  "Read/Write": {
    selected:
      "bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900 shadow-sm shadow-yellow-500/30",
    label: "R/W"
  }
};

function clonePermissions() {
  return Object.fromEntries(
    ACCESS_ROLES.map((role) => [role.id, { ...ROLE_PERMISSIONS[role.id] }])
  ) as Record<AccessRoleId, Record<string, AccessPermission>>;
}

function PermissionControl({
  value,
  onChange
}: {
  value: AccessPermission;
  onChange: (value: AccessPermission) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Permission"
      className="inline-flex w-full min-w-[14.5rem] rounded-full border border-border/70 bg-muted/40 p-0.5 sm:w-auto"
    >
      {ACCESS_PERMISSIONS.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150 sm:flex-none sm:px-3",
              selected
                ? PERMISSION_PILL[option].selected
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
          >
            <span className="sm:hidden">{PERMISSION_PILL[option].label}</span>
            <span className="hidden sm:inline">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AdminAccessManagementPage() {
  const [roleId, setRoleId] = useState<AccessRoleId>(ACCESS_ROLES[0].id);
  const [matrix, setMatrix] = useState(clonePermissions);

  const selectedRole = ACCESS_ROLES.find((role) => role.id === roleId) ?? ACCESS_ROLES[0];
  const permissions = matrix[roleId];

  const counts = useMemo(() => {
    const values = Object.values(permissions);
    return {
      readWrite: values.filter((item) => item === "Read/Write").length,
      write: values.filter((item) => item === "Write").length,
      read: values.filter((item) => item === "Read").length,
      none: values.filter((item) => item === "None").length
    };
  }, [permissions]);

  const setPermission = (moduleId: string, value: AccessPermission) => {
    setMatrix((current) => ({
      ...current,
      [roleId]: {
        ...current[roleId],
        [moduleId]: value
      }
    }));
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
              <Select value={roleId} onValueChange={(value) => setRoleId(value as AccessRoleId)}>
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
                    icon={Icon}
                    label={module.label}
                    value={permissions[module.id]}
                    onChange={(value) => setPermission(module.id, value)}
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
                      label={child.label}
                      value={permissions[child.id]}
                      onChange={(value) => setPermission(child.id, value)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </PageContainer>
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
  label,
  value,
  onChange,
  icon: Icon
}: {
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
      <PermissionControl value={value} onChange={onChange} />
    </li>
  );
}
