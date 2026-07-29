"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";
import { managerUsers } from "@/mock-data/role-workspaces";
import { Search } from "lucide-react";

type Row = (typeof managerUsers)[number];

export default function ManagerUsersPage() {
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [rows, setRows] = useState<Row[]>(() => [...managerUsers]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q);
        const matchStatus = status === "all" || row.status === status;
        const matchRole = role === "all" || row.role === role;
        return matchSearch && matchStatus && matchRole;
      }),
    [rows, search, status, role]
  );

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.original.email}</p>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) =>
        ROLE_LABELS[row.original.role as AppRole] ?? row.original.role
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    { accessorKey: "lastActive", header: "Last active" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" asChild>
            <Link href={`/manager/users/${row.original.id}`}>View</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => {
              setRows((prev) =>
                prev.map((u) =>
                  u.id === row.original.id
                    ? {
                        ...u,
                        status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                      }
                    : u
                )
              );
              success("User status updated (UI).");
            }}
          >
            {row.original.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => {
              setRows((prev) => prev.filter((u) => u.id !== row.original.id));
              success("User removed (UI).");
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppShell title="User Management" wideContent>
      <PageContainer>
        <SectionCard
          title="All users"
          description="Search, filter, activate/deactivate, and manage workspace users."
          headerAction={
            <Button asChild>
              <Link href="/manager/users/create">Create user</Link>
            </Button>
          }
        >
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="AGENT">Sales Agent</SelectItem>
                  <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                  <SelectItem value="MARKETING_MANAGER">Marketing Manager</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DataTable columns={columns} data={filtered} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
