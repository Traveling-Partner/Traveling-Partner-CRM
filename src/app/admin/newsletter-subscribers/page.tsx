"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useNewsletterSubscribersListQuery } from "@/hooks/queries/use-newsletter-subscribers-list-query";
import type { SubscriberListRow } from "@/services/newsletter-subscribers";

const DEFAULT_PAGE_SIZE = 6;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function subscriberStatusBadge(status: string) {
  return <StatusBadge status={status === "ACTIVE" ? "ACTIVE" : "INACTIVE"} />;
}

export default function NewsletterSubscribersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useNewsletterSubscribersListQuery({
    page,
    pageSize,
    status: statusFilter,
    search
  });

  const subscribers: SubscriberListRow[] = data?.content ?? [];
  const totalSubscribers = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const columns: ColumnDef<SubscriberListRow>[] = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Subscriber Name",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {row.original.fullName?.trim() || "—"}
          </span>
        )
      },
      {
        accessorKey: "email",
        header: "Email Address",
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">{row.original.email}</span>
        )
      },
      {
        accessorKey: "subscribedAt",
        header: "Subscription Date",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {formatDate(row.original.subscribedAt)}
          </span>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => subscriberStatusBadge(row.original.status)
      },
      {
        accessorKey: "totalNewslettersReceived",
        header: "Total Newsletters Received",
        cell: ({ row }) => (
          <span className="text-[13px] font-medium tabular-nums">
            {row.original.totalNewslettersReceived}
          </span>
        )
      },
      {
        accessorKey: "lastNewsletterReceived",
        header: "Last Newsletter Received",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {formatDate(row.original.lastNewsletterReceived)}
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
            onClick={() => router.push(`/admin/newsletter-subscribers/${row.original.id}`)}
          >
            View →
          </Button>
        )
      }
    ],
    [router]
  );

  return (
    <AppShell title="Newsletter Subscribers">
      <PageContainer>
        <SectionCard
          title="Newsletter subscribers"
          description="View email subscribers and the newsletters sent to them."
        >
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="flex flex-col gap-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-full animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </div>
          ) : totalSubscribers === 0 ? (
            <EmptyState
              title="No subscribers found"
              description="Try another email search or status filter."
            />
          ) : (
            <DataTable
              columns={columns}
              data={subscribers}
              getRowId={(row) => String(row.id)}
            />
          )}

          {!loading && totalSubscribers > 0 && (
            <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
                <span>
                  · Showing {page * pageSize + 1}–
                  {Math.min((page + 1) * pageSize, totalSubscribers)} of {totalSubscribers}
                </span>
              </div>
              <PaginationControls
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(nextPage) => setPage(nextPage - 1)}
              />
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Manage newsletter content on the{" "}
            <Link
              href="/admin/newsletter"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Newsletter
            </Link>{" "}
            page.
          </p>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
