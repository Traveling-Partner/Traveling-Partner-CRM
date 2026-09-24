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
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { useBlogListQuery } from "@/hooks/queries/use-blog-list-query";
import { queryKeys } from "@/lib/api/query-keys";
import { deleteBlog } from "@/services/blog";
import type { BlogRow } from "@/services/blog-list";
import { formatRelativePostTime } from "@/lib/format-relative-post-time";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";
import { BLOG_CATEGORIES, parseCategoryNames } from "@/lib/blog-categories";

/** Brand gradient shared by the Published and Featured tags. */
const BRAND_BADGE =
  "border-transparent bg-gradient-to-r from-[#fce001] to-[#fdb813] text-slate-900";

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => asText(item)).filter(Boolean).join(", ");
  }
  return "";
}

function formatBlogDate(value: unknown): string {
  const text = asText(value).trim();
  if (!text) return "—";
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return text;
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
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching } = useBlogListQuery({
    page,
    pageSize,
    status: statusFilter,
    featured: featuredFilter,
    category: categoryFilter,
    search
  });

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? rows.length;
  const loading = isLoading || isFetching;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null);

  const deleteMutation = useApiMutation<void, number>({
    mutationFn: async ({ token, variables: id }) => {
      await deleteBlog(id, token);
    },
    invalidateKeys: [queryKeys.blog.all],
    onSuccess: () => {
      success("Blog deleted.");
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

  const openDeleteDialog = useCallback((row: BlogRow) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    const id = deleteTarget?.id;
    if (!id) return;
    deleteMutation.mutate(id);
  }, [deleteTarget, deleteMutation]);

  const columns: ColumnDef<BlogRow>[] = useMemo(
    () => [
      {
        accessorKey: "mainTitle",
        header: "Title",
        cell: ({ row }) => {
          const title = asText(row.original.mainTitle).trim() || "—";
          const desc =
            asText(row.original.description1).trim() ||
            asText(row.original.description2).trim() ||
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
          const label = asText(row.original.status).trim();
          const s = label.toUpperCase();
          let variant: "success" | "secondary" | "outline" = "outline";
          if (s === "ACTIVE") variant = "success";
          else if (s === "DRAFT") variant = "secondary";
          return s === "PUBLISHED" ? (
            <Badge className={BRAND_BADGE}>{label}</Badge>
          ) : (
            <Badge variant={variant}>{label || "—"}</Badge>
          );
        }
      },
      {
        id: "featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.isFeatured === true ? (
            <Badge className={BRAND_BADGE}>FEATURED</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => {
          const names = parseCategoryNames(row.original.categoryName);
          if (names.length === 0) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {names.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
          );
        }
      },
      {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {asText(row.original.author).trim() || "—"}
          </span>
        )
      },
      {
        id: "postedAgo",
        accessorKey: "date",
        header: "Posted",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground" title={formatBlogDate(row.original.date)}>
            {formatRelativePostTime(asText(row.original.date) || null)}
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
          <div className="grid gap-2.5 pb-3 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              placeholder="Search by title…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={featuredFilter}
              onValueChange={(value) => {
                setFeaturedFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All posts</SelectItem>
                <SelectItem value="true">Featured only</SelectItem>
                <SelectItem value="false">Not featured</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {BLOG_CATEGORIES.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
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
              title="No posts found"
              description="Try another search, status, featured, or category filter."
            />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => String(row.id)}
            />
          )}
          <ListPaginationFooter
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
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
              ? `This will permanently delete "${asText(deleteTarget.mainTitle).trim()}".`
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
