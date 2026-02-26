"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { drivers } from "@/mock-data/drivers";
import { agents } from "@/mock-data/agents";
import type { Driver } from "@/types/domain";
import { useToast } from "@/components/ui/toast";

interface QueueRow extends Driver {
  agentName: string;
}

const PAGE_SIZE = 8;

export default function DocumentsQueuePage() {
  const { success } = useToast();

  const [cityFilter, setCityFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDriver, setPreviewDriver] = useState<QueueRow | null>(null);

  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"APPROVE" | "REJECT" | null>(
    null
  );
  const [decisionDriver, setDecisionDriver] = useState<QueueRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingDrivers: QueueRow[] = useMemo(
    () =>
      drivers
        .filter((d) => d.status === "PENDING")
        .map((d) => ({
          ...d,
          agentName:
            agents.find((a) => a.id === d.createdByAgentId)?.name ??
            "Unknown agent"
        })),
    []
  );

  const cities = useMemo(
    () => Array.from(new Set(pendingDrivers.map((d) => d.city))),
    [pendingDrivers]
  );

  const agentOptions = useMemo(
    () =>
      Array.from(
        new Set(pendingDrivers.map((d) => d.agentName))
      ),
    [pendingDrivers]
  );

  const filtered = useMemo(
    () =>
      pendingDrivers.filter((driver) => {
        const matchesSearch = driver.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCity =
          cityFilter === "all" || driver.city === cityFilter;
        const matchesAgent =
          agentFilter === "all" || driver.agentName === agentFilter;
        return matchesSearch && matchesCity && matchesAgent;
      }),
    [pendingDrivers, search, cityFilter, agentFilter]
  );

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const openPreview = (driver: QueueRow) => {
    setPreviewDriver(driver);
    setPreviewOpen(true);
  };

  const openDecision = (driver: QueueRow, type: "APPROVE" | "REJECT") => {
    setDecisionDriver(driver);
    setDecisionType(type);
    setRejectReason("");
    setDecisionDialogOpen(true);
  };

  const onDecisionConfirm = () => {
    if (!decisionDriver || !decisionType) return;
    if (decisionType === "APPROVE") {
      success(`Documents for ${decisionDriver.name} approved (mock).`);
    } else {
      success(
        `Documents for ${decisionDriver.name} rejected (mock). Reason: ${
          rejectReason || "not specified"
        }`
      );
    }
  };

  const columns: ColumnDef<QueueRow>[] = [
    {
      accessorKey: "name",
      header: "Driver",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.phone}
          </p>
        </div>
      )
    },
    {
      accessorKey: "city",
      header: "City"
    },
    {
      accessorKey: "agentName",
      header: "Agent"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openPreview(row.original)}
          >
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => openDecision(row.original, "APPROVE")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openDecision(row.original, "REJECT")}
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppShell title="Document verification">
      <PageContainer>
        <SectionCard
          title="Verification queue"
          description="Review and act on pending driver documents before they go live."
        >
          {pendingDrivers.length === 0 ? (
            <EmptyState
              title="No documents pending"
              description="As new drivers sign up, their documentation will appear here."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  placeholder="Search drivers…"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  className="max-w-xs"
                />
                <div className="flex flex-wrap items-center gap-2">
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

                  <Select
                    value={agentFilter}
                    onValueChange={(value) => {
                      setAgentFilter(value);
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All agents</SelectItem>
                      {agentOptions.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
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
                  pending submissions
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
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </SectionCard>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Document preview – {previewDriver?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">
                This is a mock preview. In production this would stream the
                actual uploaded documents from secure storage.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border/70 bg-muted/40 p-2"
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800">
                      <img
                        src={`https://images.pexels.com/photos/104836/pexels-photo-104836.jpeg?auto=compress&cs=tinysrgb&w=400&q=60`}
                        alt="Mock document"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground">
                      Sample document #{index}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={decisionDialogOpen}
          onOpenChange={setDecisionDialogOpen}
          onConfirm={onDecisionConfirm}
          title={
            decisionType === "APPROVE"
              ? "Approve documents"
              : "Reject documents"
          }
          description={
            decisionType === "APPROVE"
              ? "This will mark the driver's documents as approved in a real environment. This sandbox does not persist changes."
              : undefined
          }
          destructive={decisionType === "REJECT"}
        />

        {decisionType === "REJECT" && decisionDialogOpen && (
          <div className="mt-3 max-w-md rounded-lg border border-dashed border-red-500/40 bg-red-500/5 p-3 text-xs">
            <p className="mb-1 font-medium text-red-600 dark:text-red-400">
              Rejection reason (mock)
            </p>
            <Input
              placeholder="Provide a short reason for rejecting these documents"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}

