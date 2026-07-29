"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { marketingContentRows } from "@/mock-data/role-workspaces";
import { Search } from "lucide-react";

type ContentStatus = "PUBLISHED" | "PENDING" | "SCHEDULED" | "UNPUBLISHED";
type Row = (typeof marketingContentRows)[number] & { status: ContentStatus };

export default function MarketingContentPage() {
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState<Row[]>(() => [...marketingContentRows]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          row.title.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q);
        const matchStatus = status === "all" || row.status === status;
        return matchSearch && matchStatus;
      }),
    [rows, search, status]
  );

  const setContentStatus = (id: string, next: ContentStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: next } : row)));
    success(`Content marked ${next.toLowerCase()}.`);
  };

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.title}</p>
          <p className="text-[11px] text-muted-foreground">{row.original.seoTitle}</p>
        </div>
      )
    },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    { accessorKey: "author", header: "Author" },
    { accessorKey: "updatedAt", header: "Updated" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" asChild>
            <Link href={`/marketing-manager/content/${row.original.id}`}>Edit</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => setContentStatus(row.original.id, "PUBLISHED")}
          >
            Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => setContentStatus(row.original.id, "UNPUBLISHED")}
          >
            Unpublish
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => {
              setRows((prev) => prev.filter((r) => r.id !== row.original.id));
              success("Content deleted.");
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppShell title="Content Management" wideContent>
      <PageContainer>
        <SectionCard
          title="All content"
          description="Create, edit, publish, schedule, and analyze marketing content."
          headerAction={
            <Button asChild>
              <Link href="/marketing-manager/content/create">Create content</Link>
            </Button>
          }
        >
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search title or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filtered} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
