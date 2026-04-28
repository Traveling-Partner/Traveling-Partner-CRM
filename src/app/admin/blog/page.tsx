"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";
import { deleteBlog } from "@/services/blog";
import { apiUrl } from "@/lib/api-base";

interface BlogRow {
  id: number;
  coverImage?: string | null;
  mainTitle: string | null;
  description1?: string | null;
  description2?: string | null;
  date?: string | null;
  author?: string | null;
  readTime?: string | null;
  tags?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  views?: number | string | null;
  /** Some APIs use this key instead of `views` */
  viewCount?: number | string | null;
}

interface PaginatedBlogData {
  content: BlogRow[];
  totalPages: number;
  totalElements?: number;
}

const DEFAULT_PAGE_SIZE = 6;

function parseBlogListResponse(res: unknown): PaginatedBlogData {
  if (!res || typeof res !== "object") {
    return { content: [], totalPages: 1 };
  }
  const r = res as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object"
      ? (r.data as Record<string, unknown>)
      : r;

  const content = Array.isArray(payload.content) ? payload.content : [];
  const totalPages =
    typeof payload.totalPages === "number" ? payload.totalPages : 1;
  const totalElements =
    typeof payload.totalElements === "number"
      ? payload.totalElements
      : undefined;

  return {
    content: content as BlogRow[],
    totalPages,
    totalElements
  };
}

function formatBlogDate(value: string | null | undefined): string {
  if (!value || !String(value).trim()) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

/**
 * Reads view count straight from the API row object (no pre-normalization).
 * Supports `views`, `viewCount`, `totalViews`, `view_count`.
 */
function extractViews(row: BlogRow): number | undefined {
  const r = row as unknown as Record<string, unknown>;
  const keys = ["views", "viewCount", "totalViews", "view_count"] as const;
  for (const key of keys) {
    const v = r[key];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "bigint") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
      continue;
    }
    if (typeof v === "string") {
      const n = Number(v.replace(/,/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

export default function AdminBlogPage() {
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      setDebouncedSearch(value);
    }, 400);
  };

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${apiUrl("/blog/getAll")}?page=${page}&size=${pageSize}&search=${encodeURIComponent(debouncedSearch.trim())}`;
      if (statusFilter !== "all") {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const res = await fetcher<unknown>(url, { token });
      const parsed = parseBlogListResponse(res);
      const raw = Array.isArray(parsed.content) ? parsed.content : [];

      if (process.env.NODE_ENV === "development") {
        const asRows = raw as BlogRow[];
        const sample = asRows.find((r) => r.id === 40) ?? asRows[0];
        console.log("[Blog] list request URL →", url);
        console.log("[Blog] NEXT_PUBLIC_API_URL →", process.env.NEXT_PUBLIC_API_URL);
        console.log("[Blog] resolved api root (via apiUrl) matches /api/blog/...");
        console.log("[Blog] first row keys:", sample && Object.keys(sample as object));
        const row40 = asRows.find((r) => r.id === 40);
        console.log("[Blog] row id=40 →", row40);
        console.log(
          "[Blog] extractViews(id 40) →",
          row40 ? extractViews(row40) : "(not in this page)"
        );
      }

      setRows(raw as BlogRow[]);
      setTotalPages(parsed.totalPages || 1);
      setTotalElements(
        typeof parsed.totalElements === "number"
          ? parsed.totalElements
          : parsed.content.length
      );
    } catch {
      setRows([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, token]);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  const openDeleteDialog = useCallback((row: BlogRow) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const id = deleteTarget?.id;
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteBlog(id, token);
      success("Blog deleted.");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await fetchBlogs();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to delete blog.");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, token, success, toastError, fetchBlogs]);

  const columns: ColumnDef<BlogRow>[] = useMemo(
    () => [
      {
        accessorKey: "mainTitle",
        header: "Title",
        cell: ({ row }) => {
          const title = row.original.mainTitle?.trim() || "—";
          const desc =
            row.original.description1?.trim() ||
            row.original.description2?.trim() ||
            "—";
          return (
            <div className="space-y-0.5">
              <p className="font-medium">{title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status?.toUpperCase() ?? "";
          let variant: "success" | "secondary" | "outline" = "outline";
          if (s === "PUBLISHED" || s === "ACTIVE") variant = "success";
          else if (s === "DRAFT") variant = "secondary";
          return (
            <Badge variant={variant}>{row.original.status?.trim() || "—"}</Badge>
          );
        }
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-muted-foreground">
            {row.original.categoryName?.trim() || "—"}
          </span>
        )
      },
      {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.author?.trim() || "—"}
          </span>
        )
      },
      {
        accessorKey: "readTime",
        header: "Read Time",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.readTime?.trim() || "—"}
          </span>
        )
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatBlogDate(row.original.date)}
          </span>
        )
      },
      {
        id: "displayViews",
        header: "Views",
        accessorFn: (row) => extractViews(row),
        cell: ({ getValue, row }) => {
          let v = getValue() as number | undefined;
          if (typeof v !== "number" || !Number.isFinite(v)) {
            v = extractViews(row.original);
          }
          return typeof v === "number" && Number.isFinite(v) ? (
            <span className="font-medium tabular-nums text-foreground">{v}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/blog/${row.original.id}`}>Edit</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={`/blog/${row.original.id}`} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
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
    <AppShell title="Blog">
      <PageContainer>
        <SectionCard
          title="Blog management"
          description="Create and manage blog posts. Preview opens in new tab."
          headerAction={
            <Button asChild>
              <Link href="/admin/blog/create">Create post</Link>
            </Button>
          }
        >
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by title…"
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
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No posts found"
              description="Try another search or status filter."
            />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => String(row.id)}
            />
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              {totalElements ? page * pageSize + 1 : 0} –{" "}
              {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
            </span>
          </div>
          <PaginationControls
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </SectionCard>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete blog post?"
          description={
            deleteTarget?.mainTitle
              ? `This will permanently delete "${deleteTarget.mainTitle.trim()}".`
              : "This will permanently delete this post."
          }
          confirmLabel={deleteLoading ? "Deleting…" : "Delete"}
          cancelLabel="Cancel"
          destructive
        />
      </PageContainer>
    </AppShell>
  );
}
