"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import {
  deleteBanner,
  getAllBanners,
  getCarouselPublishedIds,
  type BannerRecord
} from "@/services/carousel";

const DEFAULT_PAGE_SIZE = 6;

type BannerStatus = "Published" | "Draft";

interface BannerRow extends BannerRecord {
  status: BannerStatus;
}

export default function AdminCarouselListPage() {
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: showError } = useToast();

  const [rows, setRows] = useState<BannerRow[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BannerRow | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const [allBanners, publishedIds] = await Promise.all([
        getAllBanners(token),
        getCarouselPublishedIds(token)
      ]);

      const mapped = allBanners.map<BannerRow>((item) => ({
        ...item,
        status: publishedIds.has(item.id) ? "Published" : "Draft"
      }));
      setRows(mapped);
      setPage(0);
    } catch (e) {
      setRows([]);
      showError(e instanceof Error ? e.message : "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(
    () => rows.slice(page * pageSize, page * pageSize + pageSize),
    [rows, page, pageSize]
  );

  const openDelete = useCallback((row: BannerRow) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await deleteBanner(deleteTarget.id, token);
      success("Banner deleted.");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await fetchRows();
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to delete banner.");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, token, success, showError, fetchRows]);

  const columns: ColumnDef<BannerRow>[] = useMemo(
    () => [
      {
        accessorKey: "bannerImage",
        header: "Cover Image",
        cell: ({ row }) => (
          <div className="h-16 w-28 overflow-hidden rounded-md border border-border/70 bg-muted/20">
            <img
              src={row.original.bannerImage}
              alt={row.original.bannerTitle || "Banner cover"}
              className="h-full w-full object-cover"
            />
          </div>
        )
      },
      {
        accessorKey: "bannerTitle",
        header: "Title",
        cell: ({ row }) => (
          <p className="max-w-[220px] font-medium">
            {row.original.bannerTitle?.trim() || "—"}
          </p>
        )
      },
      {
        accessorKey: "bannerDescription",
        header: "Description",
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-[360px] text-sm text-muted-foreground">
            {row.original.bannerDescription?.trim() || "—"}
          </p>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "Published" ? "success" : "secondary"}>
            {row.original.status}
          </Badge>
        )
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/carousel/${row.original.id}`}>Edit</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => openDelete(row.original)}>
              Delete
            </Button>
          </div>
        )
      }
    ],
    [openDelete]
  );

  return (
    <AppShell title="Carousel Management">
      <PageContainer>
        <SectionCard
          title="App home carousel banners"
          description="Manage promotional slides for the app home screen."
          headerAction={
            <Button asChild>
              <Link href="/admin/carousel/create">Create Banner</Link>
            </Button>
          }
        >
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 w-full animate-pulse rounded-md bg-muted/60" />
              ))}
            </div>
          ) : pageRows.length === 0 ? (
            <EmptyState
              title="No banners found"
              description="Create a banner to start building your app carousel."
            />
          ) : (
            <DataTable
              columns={columns}
              data={pageRows}
              getRowId={(row) => String(row.id)}
            />
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
              currentPage={Math.min(page + 1, totalPages)}
              totalPages={totalPages}
              onPageChange={(nextPage) => setPage(nextPage - 1)}
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
          title="Delete banner?"
          description={
            deleteTarget?.bannerTitle
              ? `This will permanently delete "${deleteTarget.bannerTitle}".`
              : "This will permanently delete this banner."
          }
          confirmLabel={deleteLoading ? "Deleting..." : "Delete"}
          cancelLabel="Cancel"
          destructive
        />
      </PageContainer>
    </AppShell>
  );
}
