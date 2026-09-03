"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useAuditLogsQuery } from "@/hooks/queries/use-audit-logs-query";
import type { AuditLogRow } from "@/services/audit-logs";

const USER_TYPE_OPTIONS = [
  { value: "all", label: "All user types" },
  { value: "ADMIN", label: "Admin" },
  { value: "DRIVER", label: "Driver" },
  { value: "PARTNER", label: "Partner" },
  { value: "AGENT", label: "Agent" }
] as const;

function formatTimestamp(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "—";
  try {
    const d = parseISO(text);
    if (Number.isNaN(d.getTime())) return text;
    return format(d, "MMM d, yyyy HH:mm");
  } catch {
    return text;
  }
}

interface AuditLogsSectionProps {
  /** Dashboard uses a shorter default page and a link to the full viewer. */
  variant?: "page" | "dashboard";
}

export function AuditLogsSection({ variant = "page" }: AuditLogsSectionProps) {
  const isDashboard = variant === "dashboard";
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isDashboard ? 10 : 20);

  const { data, isLoading, isFetching, error } = useAuditLogsQuery({
    page,
    pageSize,
    userType,
    search,
    fromDate,
    toDate,
    module: moduleFilter,
    action: actionFilter,
    userId
  });

  const rows = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalElements = data?.totalElements ?? rows.length;
  const showSkeleton = isLoading && !data;

  const columns: ColumnDef<AuditLogRow>[] = useMemo(
    () => [
      {
        accessorKey: "description",
        header: "Activity",
        cell: ({ row }) => (
          <span className="block max-w-xl whitespace-normal text-sm text-foreground">
            {row.original.description?.trim() || "—"}
          </span>
        )
      },
      {
        accessorKey: "userType",
        header: "User type",
        cell: ({ row }) =>
          row.original.userType ? (
            <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium">
              {row.original.userType}
            </span>
          ) : (
            "—"
          )
      },
      {
        accessorKey: "mobileNumber",
        header: "Mobile",
        cell: ({ row }) => row.original.mobileNumber?.trim() || "—"
      },
      {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatTimestamp(row.original.createdAt)}
          </span>
        )
      }
    ],
    []
  );

  return (
    <SectionCard
      title="Audit logs"
      description="Admin activity log: who did what in the CRM. Filter by user type, search the description, module, action, user ID, or date range."
      headerAction={
        isDashboard ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/audit-logs">
              Full viewer
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-2.5 pb-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search description…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <Select
          value={userType}
          onValueChange={(value) => {
            setUserType(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="User type" />
          </SelectTrigger>
          <SelectContent>
            {USER_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Module"
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(0);
          }}
          className="w-40"
          aria-label="Module"
        />
        <Input
          placeholder="Action"
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(0);
          }}
          className="w-40"
          aria-label="Action"
        />
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setPage(0);
          }}
          className="w-36"
          aria-label="User ID"
        />
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(0);
          }}
          className="w-44"
          aria-label="From date"
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(0);
          }}
          className="w-44"
          aria-label="To date"
        />
      </div>
      {error ? <p className="pb-3 text-sm text-destructive">{error.message}</p> : null}
      {showSkeleton ? (
        <div className="space-y-2 py-3">
          {Array.from({ length: isDashboard ? 5 : 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="Try another search, user type, module, action, user ID, or date range."
        />
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row, index) => String(row.id ?? index)}
          />
        </div>
      )}
      <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-7 w-[4.5rem] border-border/40 bg-background text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
          <span className="hidden sm:inline">· {totalElements} total</span>
        </div>
        <PaginationControls
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />
      </div>
    </SectionCard>
  );
}
