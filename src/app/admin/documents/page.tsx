"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, FileText } from "lucide-react";
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
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";

interface QueueRow extends Driver {
  agentName: string;
}

const PAGE_SIZE = 8;
const mockDocuments = [
  {
    id: "driver-license",
    type: "DRIVER_LICENSE",
    fileName: "driver-license.jpg",
    fileUrl: "/mock-images/driver-license.svg",
    uploadedAt: "2026-03-10T10:00:00.000Z",
    status: "VERIFIED"
  },
  {
    id: "vehicle-registration",
    type: "VEHICLE_REGISTRATION",
    fileName: "vehicle-registration.jpg",
    fileUrl: "/mock-images/vehicle-registration.svg",
    uploadedAt: "2026-03-11T10:00:00.000Z",
    status: "VERIFIED"
  },
  {
    id: "id-document",
    type: "ID_DOCUMENT",
    fileName: "id-document.jpg",
    fileUrl: "/mock-images/id-document.svg",
    uploadedAt: "2026-03-12T10:00:00.000Z",
    status: "PENDING"
  }
] as const;

export default function DocumentsQueuePage() {
  const { success } = useToast();

  const [cityFilter, setCityFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDriver, setPreviewDriver] = useState<QueueRow | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(
    mockDocuments[0].id
  );
  const [previewSrc, setPreviewSrc] = useState<string>(mockDocuments[0].fileUrl);

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
    setSelectedDocumentId(mockDocuments[0].id);
    setPreviewSrc(mockDocuments[0].fileUrl);
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

  const selectedDocument =
    mockDocuments.find((doc) => doc.id === selectedDocumentId) ?? mockDocuments[0];
  const selectedIsPdf =
    selectedDocument.fileName.toLowerCase().endsWith(".pdf") ||
    selectedDocument.fileUrl.toLowerCase().includes(".pdf");
  const fallbackImage = "/mock-images/document-fallback.svg";

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

              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
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
                <PaginationControls
                  currentPage={page + 1}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => setPage(Math.max(0, nextPage - 1))}
                />
              </div>
            </>
          )}
        </SectionCard>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Document preview – {previewDriver?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 text-xs lg:grid-cols-[320px,1fr]">
              <div className="space-y-2">
                {mockDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setPreviewSrc(doc.fileUrl);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedDocument.id === doc.id
                        ? "border-primary/60 bg-primary/10 shadow-sm"
                        : "border-border/60 bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="h-12 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/30">
                        <img
                          src={doc.fileUrl}
                          alt={doc.fileName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>
                      <div className="mt-0.5 rounded-md bg-muted p-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {doc.type.replaceAll("_", " ")}
                        </p>
                        <p className="truncate text-[0.7rem] text-muted-foreground">
                          {doc.fileName}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 mt-1">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                        {doc.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {selectedDocument.fileName}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {selectedDocument.type.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={selectedDocument.fileUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewSrc(selectedDocument.fileUrl);
                      }}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </a>
                    <a
                      href={selectedDocument.fileUrl}
                      download
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </div>
                </div>
                <div className="h-[420px] bg-muted/20 p-2">
                  {selectedIsPdf ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      title={selectedDocument.fileName}
                      className="h-full w-full rounded-md border border-border/60 bg-background"
                    />
                  ) : (
                    <img
                      src={previewSrc}
                      alt={selectedDocument.fileName}
                      className="h-full w-full rounded-md bg-background object-cover"
                      onError={() => {
                        setPreviewSrc(fallbackImage);
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!previewDriver) return;
                      setPreviewOpen(false);
                      openDecision(previewDriver, "APPROVE");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (!previewDriver) return;
                      setPreviewOpen(false);
                      openDecision(previewDriver, "REJECT");
                    }}
                  >
                    Reject
                  </Button>
                </div>
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
              : "Optionally provide a reason for rejection. This sandbox does not persist changes."
          }
          confirmLabel={decisionType === "APPROVE" ? "Approve" : "Reject"}
          destructive={decisionType === "REJECT"}
          children={
            decisionType === "REJECT" ? (
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
                <label className="mb-2 block text-xs font-medium text-foreground">
                  Rejection reason (optional)
                </label>
                <Input
                  placeholder="e.g. Document expired or unclear"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="bg-background"
                />
              </div>
            ) : undefined
          }
        />
      </PageContainer>
    </AppShell>
  );
}

