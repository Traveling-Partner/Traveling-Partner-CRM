"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ArrowUpRight, ScrollText, Search } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { AuditLogDetailDialog } from "@/components/audit-logs/AuditLogDetailDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { useAuditLogsQuery } from "@/hooks/queries/use-audit-logs-query";
import type { AuditLogRow } from "@/services/audit-logs";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";

const USER_TYPE_OPTIONS = [
  { value: "all", label: "All user types" },
  { value: "ADMIN", label: "Admin" },
  { value: "DRIVER", label: "Driver" },
  { value: "PARTNER", label: "Partner" },
  { value: "AGENT", label: "Agent" }
] as const;

const HIGHLIGHT_FADE_MS = 4000;

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
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const highlightId = searchParams.get("highlightId") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [userType, setUserType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [highlightVisible, setHighlightVisible] = useState(Boolean(highlightId));
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDashboard || !urlSearch) return;
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch, isDashboard]);

  useEffect(() => {
    if (!highlightId) {
      setHighlightVisible(false);
      return;
    }
    setHighlightVisible(true);
    const timer = window.setTimeout(() => setHighlightVisible(false), HIGHLIGHT_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  const { data, isLoading, isFetching, error } = useAuditLogsQuery(
    isDashboard
      ? {
          page: 1,
          pageSize: 10,
          userType: "all",
          search: "",
          fromDate: "",
          toDate: "",
          module: "",
          action: "",
          userId: ""
        }
      : {
          page,
          pageSize,
          userType,
          search,
          fromDate,
          toDate,
          module: moduleFilter,
          action: actionFilter,
          userId
        }
  );

  const rows = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalElements = data?.totalElements ?? rows.length;
  const showSkeleton = isLoading && !data;

  useEffect(() => {
    if (!highlightId || showSkeleton) return;
    const el = tableWrapRef.current?.querySelector(`[data-row-id="${highlightId}"]`);
    if (!(el instanceof HTMLElement)) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId, rows, showSkeleton]);

  const columns: ColumnDef<AuditLogRow>[] = useMemo(() => {
    const activity: ColumnDef<AuditLogRow> = {
      accessorKey: "description",
      header: "Activity",
      cell: ({ row }) => (
        <span className="block max-w-xl whitespace-normal text-sm text-foreground">
          {row.original.description?.trim() || "—"}
        </span>
      )
    };
    const userType: ColumnDef<AuditLogRow> = {
      accessorKey: "userType",
      header: "User type",
      cell: ({ row }) =>
        row.original.userType ? (
          <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium">
            {row.original.userType}
          </span>
        ) : (
          "—"
        )
    };
    const mobile: ColumnDef<AuditLogRow> = {
      accessorKey: "mobileNumber",
      header: "Mobile",
      cell: ({ row }) => row.original.mobileNumber?.trim() || "—"
    };
    const timestamp: ColumnDef<AuditLogRow> = {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatTimestamp(row.original.createdAt)}
        </span>
      )
    };
    if (isDashboard) return [activity, userType, mobile, timestamp];
    return [
      activity,
      userType,
      mobile,
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ row }) => row.original.module?.trim() || "—"
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => row.original.action?.trim() || "—"
      },
      timestamp
    ];
  }, [isDashboard]);

  const hasFilters =
    Boolean(search.trim()) ||
    userType !== "all" ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(moduleFilter.trim()) ||
    Boolean(actionFilter.trim()) ||
    Boolean(userId.trim());

  const clearFilters = () => {
    setSearch("");
    setUserType("all");
    setFromDate("");
    setToDate("");
    setModuleFilter("");
    setActionFilter("");
    setUserId("");
    setPage(1);
  };

  return (
    <SectionCard
      title={isDashboard ? "Recent activity" : "Audit logs"}
      description={
        isDashboard
          ? "Latest 10 admin activity logs. Open the full viewer for search and filters."
          : "Admin activity log: who did what in the CRM. Filter by user type, search the description, module, action, user ID, or date range."
      }
      icon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fce001] to-[#fdb813] shadow-sm">
          <ScrollText className="h-5 w-5 text-foreground" />
        </div>
      }
      headerAction={
        isDashboard ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/audit-logs">
              Full viewer
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : (
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-medium tabular-nums text-muted-foreground">
            {showSkeleton ? "Loading…" : `${totalElements} logs`}
          </span>
        )
      }
    >
      {!isDashboard ? (
        <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={userType}
            onValueChange={(value) => {
              setUserType(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
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
              setPage(1);
            }}
            aria-label="Module"
          />
          <Input
            placeholder="Action"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Action"
          />
          <Input
            placeholder="User ID"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
            aria-label="User ID"
          />
          <div className="grid grid-cols-2 gap-2.5 sm:col-span-2 lg:col-span-1">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              aria-label="From date"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              aria-label="To date"
            />
          </div>
          {hasFilters ? (
            <div className="flex items-center sm:col-span-2 lg:col-span-3">
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="pb-3 text-sm text-destructive">{error.message}</p> : null}
      {showSkeleton ? (
        <div className="space-y-2 py-3">
          {Array.from({ length: isDashboard ? 5 : 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description={
            isDashboard
              ? "No recent activity yet."
              : "Try another search, user type, module, action, user ID, or date range."
          }
        />
      ) : (
        <div
          ref={tableWrapRef}
          className={cn(isFetching && "opacity-70 transition-opacity")}
        >
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row, index) => String(row.id ?? index)}
            onRowClick={setSelectedLog}
            getRowClassName={(row) => {
              if (!highlightId || String(row.id) !== highlightId) return undefined;
              return cn(
                "transition-colors duration-700",
                highlightVisible &&
                  "bg-gradient-to-r from-[#fce001]/55 to-[#fdb813]/40 shadow-[inset_3px_0_0_0_#fdb813] hover:bg-transparent hover:from-[#fce001]/55 hover:to-[#fdb813]/40"
              );
            }}
          />
        </div>
      )}
      {!isDashboard ? (
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
      ) : null}
      <AuditLogDetailDialog log={selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)} />
    </SectionCard>
  );
}
