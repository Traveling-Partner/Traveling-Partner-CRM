"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { useNewsletterListQuery } from "@/hooks/queries/use-newsletter-list-query";
import { queryKeys } from "@/lib/api/query-keys";
import { deleteNewsletter } from "@/services/newsletter";
import type { NewsletterRow } from "@/services/newsletter-list";

const DEFAULT_PAGE_SIZE = 6;

function truncateMessage(value: string | null | undefined, max = 80): string {
  const text = value?.trim() || "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export default function AdminNewsletterPage() {
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching } = useNewsletterListQuery({
    page,
    pageSize,
    status: statusFilter,
    search
  });

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterRow | null>(null);

  const deleteMutation = useApiMutation<void, number>({
    mutationFn: async ({ token, variables: id }) => {
      await deleteNewsletter(id, token);
    },
    invalidateKeys: [queryKeys.newsletter.all],
    onSuccess: () => {
      success("Newsletter deleted.");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toastError(err.message);
    }
  });

  const deleteLoading = deleteMutation.isPending;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const openDeleteDialog = useCallback((row: NewsletterRow) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    const id = deleteTarget?.id;
    if (!id) return;
    deleteMutation.mutate(id);
  }, [deleteTarget, deleteMutation]);

  const columns: ColumnDef<NewsletterRow>[] = useMemo(
    () => [
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="font-medium">{truncateMessage(row.original.message, 60)}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.attachedFile ? "Has attachment" : "No attachment"}
            </p>
          </div>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status?.toUpperCase() ?? "";
          let variant: "success" | "secondary" | "outline" = "outline";
          if (s === "PUBLISHED" || s === "ACTIVE" || s === "SENT") variant = "success";
          else if (s === "DRAFT") variant = "secondary";
          return (
            <Badge variant={variant}>{row.original.status?.trim() || "—"}</Badge>
          );
        }
      },
      {
        accessorKey: "userName",
        header: "Username",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.userName?.trim() || "—"}
          </span>
        )
      },
      {
        accessorKey: "userRole",
        header: "Role",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.userRole?.trim() || "—"}
          </span>
        )
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/newsletter/${row.original.id}/preview`}>Preview</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/newsletter/${row.original.id}`}>Edit</Link>
            </Button>
          </div>
        )
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteDialog(row.original)}
          >
            Delete
          </Button>
        )
      }
    ],
    [openDeleteDialog]
  );

  return (
    <AppShell title="Newsletter">
      <PageContainer>
        <SectionCard
          title="Newsletter management"
          description="Create and manage newsletters. Preview opens in admin."
          headerAction={
            <Button asChild>
              <Link href="/admin/newsletter/create">Create newsletter</Link>
            </Button>
          }
        >
          <div className="flex flex-col gap-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by message…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-xs"
            />
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
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted/60" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No newsletters found"
              description="Try another search or status filter."
            />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(row) => String(row.id)} />
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
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
            <PaginationControls
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </SectionCard>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete newsletter?"
          description={
            deleteTarget?.message
              ? `This will permanently delete "${truncateMessage(deleteTarget.message, 40)}".`
              : "This will permanently delete this newsletter."
          }
          confirmLabel={deleteLoading ? "Deleting…" : "Delete"}
          cancelLabel="Cancel"
          destructive
        />
      </PageContainer>
    </AppShell>
  );
}
