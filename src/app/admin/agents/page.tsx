"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { Search } from "lucide-react";
import { useEmployeeRolesQuery, usePortalUsersListQuery } from "@/hooks/queries/use-portal-users";
import { showPhone } from "@/lib/format-ids";
import { formatPortalRole, primaryRole, type PortalUser } from "@/services/portal-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";
import { WriteOnly } from "@/components/auth/WriteOnly";

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const rolesQuery = useEmployeeRolesQuery();
  const { data, isLoading, error } = usePortalUsersListQuery({
    page,
    pageSize,
    search,
    role
  });

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading && !data;

  const columns: ColumnDef<PortalUser>[] = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => {
        const name = row.original.name || "—";
        const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200 text-[11px] font-bold text-violet-700 dark:from-violet-800 dark:to-violet-900 dark:text-violet-300">
              {initials || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground">{row.original.email || "—"}</p>
            </div>
          </div>
        );
      }
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const value = primaryRole(row.original);
        return (
          <span className="text-[13px] text-muted-foreground">
            {value ? formatPortalRole(value) : "—"}
          </span>
        );
      }
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground">{row.original.city || "—"}</span>
      )
    },
    {
      accessorKey: "mobileNumber",
      header: "Phone",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{showPhone(row.original.mobileNumber)}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status ?? "PENDING"} />
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/admin/agents/${row.original.id}`)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Employees List">
      <PageContainer>
        <SectionCard
          title="Employees"
          description="Create and manage portal employees by role."
          headerAction={
            <WriteOnly>
              <Button onClick={() => router.push("/admin/agents/create")}>
                Create employee
              </Button>
            </WriteOnly>
          }
        >
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search employees"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {rolesQuery.roles.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {formatPortalRole(item.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Could not load this list" description={error.message} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No employees found"
              description="Try another search or role, or create an employee."
            />
          ) : (
            <DataTable columns={columns} data={rows} />
          )}
          <ListPaginationFooter
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
