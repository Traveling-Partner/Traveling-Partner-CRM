"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useDriversListQuery } from "@/hooks/queries/use-drivers-list-query";
import { useDriverStatusCountsQuery } from "@/hooks/queries/use-driver-status-counts-query";
import type { DriverRow } from "@/services/users";
import { Search, Filter, UserCircle, Clock, CheckCircle2, Ban, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 25;

export default function AdminDriversPage() {
  const router = useRouter();

  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useDriversListQuery({
    page,
    pageSize,
    status: statusFilter,
    name: nameFilter,
    mobileNumber: phoneFilter,
    city: cityFilter,
    gender: genderFilter
  });
  const {
    data: statusCounts,
    isLoading: countsLoading,
    isFetching: countsFetching
  } = useDriverStatusCountsQuery();

  const drivers: DriverRow[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading || isFetching;
  const countsLoadingState = countsLoading || countsFetching;

  const statusCountCards = [
    {
      label: "Pending",
      value: statusCounts.pending,
      icon: Clock,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-600 dark:text-amber-400"
    },
    {
      label: "Approved",
      value: statusCounts.approved,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      label: "Blocked",
      value: statusCounts.blocked,
      icon: Ban,
      iconBg: "bg-red-50 dark:bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-600 dark:text-red-400"
    },
    {
      label: "Rejected",
      value: statusCounts.rejected,
      icon: XCircle,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-orange-600 dark:text-orange-400"
    }
  ];

  const resetPage = () => setPage(0);

  const columns: ColumnDef<DriverRow>[] = [
    {
      accessorKey: "name",
      header: "Driver",
      cell: ({ row }) => {
        const d = row.original;
        const displayName = d.name || d.username || "—";
        const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-[11px] font-bold text-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300">
              

              {d.profilePicture  ? (
                      <img
                        src={d.profilePicture}
                        alt={`${displayName} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        {initials || <UserCircle className="h-4 w-4" strokeWidth={1.25} />}
                        
                      </div>
                    )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground">{d.mobileNumber}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground">{row.original.gender || "—"}</span>
      )
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground">{row.original.email || "—"}</span>
      )
    },

    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground">{row.original.city || "—"}</span>
      )
    },
   
    {
      accessorKey: "referralCode",
      header: "Referral No",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground">{row.original.referralCode || "—"}</span>
      )
    },
    {
      accessorKey: "cnicNumber",
      header: "CNIC",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.original.cnicNumber || "—"}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "—"}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/admin/drivers/${row.original.id}`)}
        >
          View →
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Drivers">
      <PageContainer>
        <SectionCard
          title="Driver directory"
          description="Search, filter, and review all drivers in your Traveling Partner network."
        >
          <div className="mb-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
            {statusCountCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", card.iconBg)}>
                    <card.icon className={cn("h-5 w-5", card.iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {card.label}
                    </p>
                    {countsLoadingState ? (
                      <Skeleton className="mt-1 h-7 w-12" />
                    ) : (
                      <p className={cn("text-2xl font-bold tracking-tight tabular-nums", card.valueColor)}>
                        {card.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          {/* Filters */}
          <div className="space-y-2.5 pb-3">
            {/* <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter drivers</span>
            </div> */}
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  placeholder="Name"
                  value={nameFilter}
                  onChange={(e) => {
                    setNameFilter(e.target.value);
                    resetPage();
                  }}
                  className="pl-9"
                />
              </div>
              <Input
                placeholder="Phone number"
                value={phoneFilter}
                onChange={(e) => {
                  setPhoneFilter(e.target.value);
                  resetPage();
                }}
              />
              <Input
                placeholder="City"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  resetPage();
                }}
              />
              <Select
                value={genderFilter}
                onValueChange={(value) => {
                  setGenderFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={drivers} />
          )}

          {/* Pagination footer */}
          <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPage(0);
                  setPageSize(Number(v));
                }}
              >
                <SelectTrigger className="h-7 w-[4.5rem] border-border/40 bg-background text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
              {/* <span>per page</span> */}
            </div>
            <PaginationControls
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
