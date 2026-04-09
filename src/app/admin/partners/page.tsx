"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { partners } from "@/mock-data/partners";
import type { Partner } from "@/types/domain";
import { useToast } from "@/components/ui/toast";

interface PartnerRow extends Partner {}

const PAGE_SIZE = 10;

export default function AdminPartnersPage() {
  const router = useRouter();
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const cities = useMemo(
    () => Array.from(new Set(partners.map((p) => p.city))),
    []
  );

  const filtered = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = partner.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || partner.status === statusFilter;
      const matchesCity =
        cityFilter === "all" || partner.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [search, statusFilter, cityFilter]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const columns: ColumnDef<PartnerRow>[] = [
    {
      accessorKey: "name",
      header: "Partner",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.city}
          </p>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/partners/${row.original.id}`)}
          >
            View
          </Button>
          {row.original.status === "APPROVED" ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                success(`Partner "${row.original.name}" marked inactive (mock).`)
              }
            >
              Inactive
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                success(`Partner "${row.original.name}" marked active (mock).`)
              }
            >
              Active
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <AppShell title="Partners">
      <PageContainer>
        <SectionCard
          title="Partner management"
          description="Manage fleet and corporate partners across your operating regions."
        >
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search partners…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              className="max-w-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={cityFilter}
                onValueChange={(value) => {
                  setCityFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable columns={columns} data={paginated} />

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium">
                {paginated.length ? page * PAGE_SIZE + 1 : 0}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {page * PAGE_SIZE + paginated.length}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span>{" "}
              partners
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
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

