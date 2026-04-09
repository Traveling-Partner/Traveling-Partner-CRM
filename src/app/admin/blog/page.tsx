"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/mock-data/blog-posts";
import type { BlogPost } from "@/types/domain";

const PAGE_SIZE = 10;

export default function AdminBlogPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{row.original.excerpt}</p>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "PUBLISHED" ? "success" : "secondary"}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground">
          {row.original.category}
        </span>
      )
    },
    {
      accessorKey: "authorName",
      header: "Author",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.authorName}</span>
      )
    },
    {
      accessorKey: "readTime",
      header: "Read Time",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.readTime}</span>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.publishedAt ?? row.original.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => <span className="font-medium">{row.original.views}</span>
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
            <a href={`/blog/${row.original.slug}`} target="_blank" rel="noopener noreferrer">
              Preview
            </a>
          </Button>
        </div>
      )
    }
  ];

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
              placeholder="Search posts…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <DataTable columns={columns} data={paginated} />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {paginated.length ? page * PAGE_SIZE + 1 : 0} – {page * PAGE_SIZE + paginated.length} of{" "}
              {filtered.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span>Page {page + 1} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
