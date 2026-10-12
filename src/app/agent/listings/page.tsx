"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSalesAgentDriversQuery,
  useSalesAgentPartnersQuery
} from "@/hooks/queries/use-sales-agent";
import { showPhone } from "@/lib/format-ids";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";
import type { SalesAgentReferral } from "@/services/sales-agent";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function referralColumns(kind: "Driver" | "Partner"): ColumnDef<SalesAgentReferral>[] {
  return [
    {
      accessorKey: "fullName",
      header: kind,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.fullName || "—"}</p>
          <p className="text-xs text-muted-foreground">
            {showPhone(row.original.mobileNumber)}
          </p>
        </div>
      )
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => row.original.city || "—"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status ? <StatusBadge status={row.original.status} /> : "—"
    },
    {
      accessorKey: "joinedAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.joinedAt)}
        </span>
      )
    }
  ];
}

function ReferralList({
  kind,
  search,
  onSearch
}: {
  kind: "drivers" | "partners";
  search: string;
  onSearch: (value: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const driversQuery = useSalesAgentDriversQuery({
    page,
    pageSize,
    search,
    enabled: kind === "drivers"
  });
  const partnersQuery = useSalesAgentPartnersQuery({
    page,
    pageSize,
    search,
    enabled: kind === "partners"
  });
  const query = kind === "drivers" ? driversQuery : partnersQuery;
  const rows = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const loading = query.isLoading && !query.data;
  const columns = useMemo(
    () => referralColumns(kind === "drivers" ? "Driver" : "Partner"),
    [kind]
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={search}
          onChange={(event) => {
            onSearch(event.target.value);
            setPage(1);
          }}
          placeholder={`Search ${kind === "drivers" ? "driver" : "partner"}...`}
          className="pl-9"
        />
      </div>
      {query.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {query.error.message}
        </p>
      ) : null}
      {loading ? (
        <div className="space-y-2 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : query.error ? (
        <EmptyState title="Could not load this list" description={query.error.message} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => String(row.userId)}
          emptyTitle={kind === "drivers" ? "No drivers yet" : "No partners yet"}
          emptyDescription={
            kind === "drivers"
              ? "Drivers you register will appear here."
              : "Partners you register will appear here."
          }
        />
      )}
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
    </div>
  );
}

export default function AgentListingsPage() {
  const [tab, setTab] = useState("drivers");
  const [driverSearch, setDriverSearch] = useState("");
  const [partnerSearch, setPartnerSearch] = useState("");

  return (
    <AppShell title="My Listings">
      <PageContainer>
        <SectionCard
          title="My listings"
          description="Drivers and partners registered by you. This list is view-only."
        >
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="drivers">My Drivers</TabsTrigger>
              <TabsTrigger value="partners">My Partners</TabsTrigger>
            </TabsList>
            <TabsContent value="drivers" className="mt-0">
              <ReferralList
                kind="drivers"
                search={driverSearch}
                onSearch={setDriverSearch}
              />
            </TabsContent>
            <TabsContent value="partners" className="mt-0">
              <ReferralList
                kind="partners"
                search={partnerSearch}
                onSearch={setPartnerSearch}
              />
            </TabsContent>
          </Tabs>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
