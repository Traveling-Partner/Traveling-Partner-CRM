"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, FileText, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { useDocumentsQueueQuery } from "@/hooks/queries/use-documents-queue-query";
import { useDriverDocumentsQuery } from "@/hooks/queries/use-driver-documents-query";
import {
  normalizeApiDocStatus,
  type ApiDocStatus
} from "@/lib/documents-utils";
import { queryKeys } from "@/lib/api/query-keys";
import {
  updateDriverDocumentStatus,
  updatePartnerCnicStatus,
  type DocumentStatusPayload,
  type PreviewDocument
} from "@/services/documents";
import type { DriverRow, PartnerRow } from "@/services/users";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";

type DecisionType = "APPROVE" | "REJECT";
type DocumentKind = "cnic" | "license" | "vehicle";
type QueueRole = "DRIVER" | "PARTNER";

interface DocumentQueueRow {
  rowId: string;
  kind: DocumentKind;
  previewId: PreviewDocument["id"];
  label: string;
  driver: DriverRow;
  role: QueueRole;
  status: ApiDocStatus;
}

function partnerAsQueueUser(partner: PartnerRow): DriverRow {
  return {
    id: partner.id,
    name: partner.name,
    username: partner.name,
    email: partner.email,
    mobileNumber: partner.mobileNumber ?? "",
    gender: partner.gender,
    referralCode: partner.referralCode,
    city: partner.city,
    cnicNumber: partner.cnicNumber,
    status: partner.status,
    profilePicture: partner.profilePicture,
    createdAt: partner.createdAt ?? null
  };
}

const DOCUMENT_ENTRIES: Array<{
  kind: DocumentKind;
  previewId: PreviewDocument["id"];
  label: string;
  apiFilter: string;
}> = [
  { kind: "cnic", previewId: "id-document", label: "CNIC", apiFilter: "CNIC" },
  { kind: "license", previewId: "driver-license", label: "License", apiFilter: "LICENSE" },
  { kind: "vehicle", previewId: "vehicle-registration", label: "Vehicle", apiFilter: "VEHICLE" }
];

const PENDING_STATUSES: DocumentStatusPayload = {
  cnicStatus: "PENDING",
  licenseStatus: "PENDING",
  vehicleStatus: "PENDING"
};

const DEFAULT_PAGE_SIZE = 25;
const fallbackImage = "/mock-images/document-fallback.svg";
const fallbackByType = {
  DRIVER_LICENSE: "/mock-images/driver-license.svg",
  VEHICLE_REGISTRATION: "/mock-images/vehicle-registration.svg",
  ID_DOCUMENT: "/mock-images/id-document.svg"
};

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized;
}

function normalizeDocumentStatus(value: unknown): string {
  if (typeof value !== "string") return "—";
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "—";
  if (normalized === "APPROVED" || normalized === "REJECTED" || normalized === "PENDING") {
    return normalized;
  }
  if (normalized === "REJECT") return "REJECTED";
  return normalized;
}

function previewDocLabel(id: PreviewDocument["id"]): string {
  switch (id) {
    case "driver-license":
      return "driver license";
    case "vehicle-registration":
      return "vehicle registration";
    case "id-document":
      return "ID document";
    default:
      return "document";
  }
}

export default function DocumentsQueuePage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const queueQuery = useDocumentsQueueQuery({
    page,
    pageSize,
    status: statusFilter,
    name: nameFilter,
    mobileNumber: phoneFilter,
    city: cityFilter,
    gender: genderFilter,
    documentType: documentTypeFilter
  });

  const drivers = queueQuery.data?.drivers.content ?? [];
  const partners = queueQuery.data?.partners.content ?? [];
  const documentStatusesByDriverId = queueQuery.data?.documentStatusesByDriverId ?? {};
  const documentStatusesByPartnerId = queueQuery.data?.documentStatusesByPartnerId ?? {};
  const includePartnerCnic =
    documentTypeFilter === "all" || documentTypeFilter === "CNIC";
  const totalPages = Math.max(
    queueQuery.data?.drivers.totalPages ?? 1,
    includePartnerCnic ? (queueQuery.data?.partners.totalPages ?? 0) : 0,
    1
  );
  const loading = queueQuery.isLoading || queueQuery.isFetching;
  const resetPage = () => setPage(0);

  const documentRows: DocumentQueueRow[] = useMemo(() => {
    const driverRows = drivers.flatMap((driver) =>
      DOCUMENT_ENTRIES.map((entry) => {
        const raw = documentStatusesByDriverId[driver.id];
        const statusValue =
          entry.kind === "cnic"
            ? raw?.cnicStatus
            : entry.kind === "license"
              ? raw?.licenseStatus
              : raw?.vehicleStatus;
        return {
          rowId: `driver-${driver.id}-${entry.kind}`,
          kind: entry.kind,
          previewId: entry.previewId,
          label: entry.label,
          driver,
          role: "DRIVER" as const,
          status: normalizeApiDocStatus(statusValue)
        };
      })
    );

    const partnerRows: DocumentQueueRow[] = includePartnerCnic
      ? partners.map((partner) => ({
          rowId: `partner-${partner.id}-cnic`,
          kind: "cnic" as const,
          previewId: "id-document" as const,
          label: "CNIC",
          driver: partnerAsQueueUser(partner),
          role: "PARTNER" as const,
          status: normalizeApiDocStatus(documentStatusesByPartnerId[partner.id]?.cnicStatus)
        }))
      : [];

    const rows = [...partnerRows, ...driverRows];

    if (documentTypeFilter === "all") return rows;
    return rows.filter(
      (row) =>
        DOCUMENT_ENTRIES.find((entry) => entry.kind === row.kind)?.apiFilter ===
        documentTypeFilter
    );
  }, [
    drivers,
    partners,
    documentStatusesByDriverId,
    documentStatusesByPartnerId,
    documentTypeFilter,
    includePartnerCnic
  ]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDriver, setPreviewDriver] = useState<DriverRow | null>(null);
  const [previewRole, setPreviewRole] = useState<QueueRole>("DRIVER");
  const [selectedDocumentId, setSelectedDocumentId] = useState<PreviewDocument["id"]>("id-document");
  const [previewSrc, setPreviewSrc] = useState<string>(fallbackImage);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState<string>(fallbackImage);
  const [imageModalTitle, setImageModalTitle] = useState("Document preview");

  const previewDocsQuery = useDriverDocumentsQuery(previewDriver?.id, previewOpen);
  const previewDocuments =
    previewRole === "PARTNER"
      ? previewDocsQuery.previewDocuments.filter((doc) => doc.id === "id-document")
      : previewDocsQuery.previewDocuments;
  const previewLoading = previewDocsQuery.isLoading || previewDocsQuery.isFetching;
  const rawDocumentStatuses = previewDocsQuery.rawStatuses ?? {
    cnicStatus: "PENDING" as ApiDocStatus,
    licenseStatus: "PENDING" as ApiDocStatus,
    vehicleStatus: "PENDING" as ApiDocStatus
  };

  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null);
  const [decisionDriver, setDecisionDriver] = useState<DriverRow | null>(null);
  const [decisionRole, setDecisionRole] = useState<QueueRole>("DRIVER");
  const [tableActionMenuVersion, setTableActionMenuVersion] = useState(0);
  const [rejectReason, setRejectReason] = useState("");

  const decisionMutation = useApiMutation<
    void,
    { userId: number; role: QueueRole; payload: DocumentStatusPayload }
  >({
    mutationFn: ({ token, variables }) => {
      if (variables.role === "PARTNER") {
        return updatePartnerCnicStatus(
          variables.userId,
          {
            cnicStatus: variables.payload.cnicStatus,
            rejectionReason: variables.payload.rejectionReason
          },
          { token }
        );
      }
      return updateDriverDocumentStatus(variables.userId, variables.payload, { token });
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["users", "documents", "queue"] });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.driverDocuments(variables.userId)
      });
      if (variables.role === "PARTNER") {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.users.partnerDetail(variables.userId)
        });
      }
    }
  });

  const decisionLoading = decisionMutation.isPending;

  const selectedDocument = previewDocuments.find((doc) => doc.id === selectedDocumentId) ?? previewDocuments[0];

  useEffect(() => {
    const selected =
      previewDocuments.find((doc) => doc.id === selectedDocumentId) ?? previewDocuments[0];
    if (selected) {
      setPreviewSrc(selected.frontUrl);
    }
  }, [previewDocuments, selectedDocumentId]);

  const openPreview = (
    driver: DriverRow,
    previewId: PreviewDocument["id"] = "id-document",
    role: QueueRole = "DRIVER"
  ) => {
    setPreviewDriver(driver);
    setPreviewRole(role);
    setPreviewOpen(true);
    setSelectedDocumentId(role === "PARTNER" ? "id-document" : previewId);
    setPreviewSrc(fallbackImage);
  };

  const openDecision = (row: DocumentQueueRow, type: DecisionType) => {
    setDecisionDriver(row.driver);
    setDecisionRole(row.role);
    setSelectedDocumentId(row.role === "PARTNER" ? "id-document" : row.previewId);
    setDecisionType(type);
    setRejectReason("");
    setDecisionDialogOpen(true);
  };

  const openPreviewDecision = (type: DecisionType) => {
    if (!previewDriver) return;
    setDecisionDriver(previewDriver);
    setDecisionRole(previewRole);
    if (previewRole === "PARTNER") setSelectedDocumentId("id-document");
    setDecisionType(type);
    setRejectReason("");
    setDecisionDialogOpen(true);
  };

  const openImageModal = (src: string, label: string) => {
    setImageModalSrc(src || fallbackImage);
    setImageModalTitle(label);
    setImageModalOpen(true);
  };

  const downloadDocument = useCallback(
    async (url: string, fileName: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("download-failed");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
      } catch {
        window.open(url, "_blank", "noopener,noreferrer");
        error("Direct download not available; opened file in a new tab.");
      }
    },
    [error]
  );

  const buildDecisionPayload = (
    type: DecisionType,
    driver: DriverRow,
    selectedId: PreviewDocument["id"],
    rejectedValue: "REJECTED" | "REJECT" = "REJECTED",
    rejectionReasonText?: string
  ): DocumentStatusPayload => {
    const fromPreview =
      previewDriver?.id === driver.id ? rawDocumentStatuses : undefined;
    const payload: DocumentStatusPayload = {
      ...(fromPreview ?? documentStatusesByDriverId[driver.id] ?? PENDING_STATUSES)
    };

    const decision = type === "APPROVE" ? "APPROVED" : rejectedValue;
    if (selectedId === "driver-license") {
      payload.licenseStatus = decision;
    } else if (selectedId === "vehicle-registration") {
      payload.vehicleStatus = decision;
    } else {
      payload.cnicStatus = decision;
    }

    if (type === "REJECT" && rejectionReasonText) {
      payload.rejectionReason = rejectionReasonText;
    }

    return payload;
  };

  const submitDecision = async (
    driver: DriverRow,
    type: DecisionType,
    rejectedValue: "REJECTED" | "REJECT",
    rejectionReasonText?: string
  ) => {
    const payload = buildDecisionPayload(
      type,
      driver,
      selectedDocumentId,
      rejectedValue,
      rejectionReasonText
    );
    await decisionMutation.mutateAsync({
      userId: driver.id,
      role: decisionRole,
      payload
    });
  };

  const onDecisionConfirm = () => {
    if (!decisionDriver || !decisionType) return;

    const run = async () => {
      const trimmedRejectReason = rejectReason.trim();
      if (decisionType === "REJECT" && !trimmedRejectReason) {
        error("Please add rejection reason.");
        return;
      }

      try {
        try {
          await submitDecision(
            decisionDriver,
            decisionType,
            "REJECTED",
            trimmedRejectReason
          );
        } catch {
          if (decisionType !== "REJECT" || decisionRole === "PARTNER") {
            throw new Error("reject-failed");
          }
          await submitDecision(
            decisionDriver,
            decisionType,
            "REJECT",
            trimmedRejectReason
          );
        }
        success(
          decisionType === "APPROVE"
            ? `${previewDocLabel(selectedDocumentId)} approved successfully.`
            : `${previewDocLabel(selectedDocumentId)} rejected successfully.`
        );
        setDecisionDialogOpen(false);
      } catch {
        error("Failed to update document status.");
      }
    };
    void run();
  };

  const columns: ColumnDef<DocumentQueueRow>[] = useMemo(
    () => [
      {
        accessorKey: "driver",
        header: "User",
        cell: ({ row }) => {
          const driver = row.original.driver;
          const driverName = driver.name || driver.username || "—";
          const initials = driverName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          const roleLabel = row.original.role === "PARTNER" ? "Partner" : "Driver";
          return (
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-[11px] font-bold text-amber-700 dark:from-amber-800 dark:to-amber-900 dark:text-amber-300">
                {initials || "?"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{driverName}</p>
                <p className="text-[11px] text-muted-foreground">{driver.mobileNumber || "—"}</p>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {roleLabel}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: "label",
        header: "Document",
        cell: ({ row }) => (
          <span className="text-[13px] font-medium text-foreground">{row.original.label}</span>
        )
      },
      {
        id: "cnicNumber",
        header: "CNIC",
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {row.original.driver.cnicNumber || "—"}
          </span>
        )
      },
      {
        id: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">{row.original.driver.email || "—"}</span>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const entry = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => void openPreview(entry.driver, entry.previewId, entry.role)}
              >
                Preview →
              </Button>
              <Select
                  key={`doc-action-${entry.rowId}-${tableActionMenuVersion}`}
                  onValueChange={(value) => {
                    if (value === "APPROVE" || value === "REJECT") {
                      openDecision(entry, value);
                      setTableActionMenuVersion((prev) => prev + 1);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVE" disabled={entry.status === "APPROVED"}>
                      Approve
                    </SelectItem>
                    <SelectItem value="REJECT" disabled={entry.status === "REJECTED"}>
                      Reject
                    </SelectItem>
                  </SelectContent>
                </Select>
            </div>
          );
        }
      }
    ],
    [tableActionMenuVersion]
  );

  return (
    <AppShell title="Document verification">
      <PageContainer>
        <SectionCard
          title="Verification queue"
          description="Drivers have CNIC, License, and Vehicle. Partners appear as CNIC only — approving that document promotes the Partner account."
        >
          <>
            <div className="space-y-2.5 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter documents</span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    placeholder="Name"
                    value={nameFilter}
                    onChange={(event) => {
                      setNameFilter(event.target.value);
                      resetPage();
                    }}
                    className="pl-9"
                  />
                </div>
                <Input
                  placeholder="Phone number"
                  value={phoneFilter}
                  onChange={(event) => {
                    setPhoneFilter(event.target.value);
                    resetPage();
                  }}
                />
                <Input
                  placeholder="City"
                  value={cityFilter}
                  onChange={(event) => {
                    setCityFilter(event.target.value);
                    resetPage();
                  }}
                />
                <Select
                  value={genderFilter}
                  onValueChange={(value) => {
                    setGenderFilter(value);
                    resetPage();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    resetPage();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={documentTypeFilter}
                  onValueChange={(value) => {
                    setDocumentTypeFilter(value);
                    resetPage();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="CNIC">CNIC</SelectItem>
                    <SelectItem value="LICENSE">License</SelectItem>
                    <SelectItem value="VEHICLE">Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2 py-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : documentRows.length === 0 ? (
              <EmptyState
                title="No records found"
                description="Try changing filters to see more documents."
              />
            ) : (
              <DataTable
                columns={columns}
                data={documentRows}
                getRowId={(row) => row.rowId}
              />
            )}

            <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {/* <span>Show</span> */}
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
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                  </SelectContent>
                </Select>
                {/* <span>per page</span> */}
              </div>
              <PaginationControls
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage - 1)}
              />
            </div>
          </>
        </SectionCard>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Document preview — {previewDriver?.username || previewDriver?.name || "User"}
                {previewRole === "PARTNER" ? " (Partner)" : " (Driver)"}
              </DialogTitle>
            </DialogHeader>
            {previewLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading documents...</div>
            ) : (
              <div className="grid gap-3 text-xs lg:grid-cols-[320px,1fr]">
                <div className="space-y-2">
                  {previewDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocumentId(doc.id);
                        setPreviewSrc(doc.frontUrl);
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        selectedDocument?.id === doc.id
                          ? "border-[#fdb813]/40 bg-[var(--brand-light-hover)] shadow-sm ring-1 ring-[#fdb813]/20"
                          : "border-border/60 bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="h-12 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/30">
                          <img
                            src={doc.frontUrl}
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
                        </div>
                      </div>
                      <div className="ml-2 mt-1">
                        {doc.status === "—" ? (
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <StatusBadge status={doc.status} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {selectedDocument?.fileName || "document.jpg"}
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground">
                        {(selectedDocument?.type || "DOCUMENT").replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-3 md:grid-cols-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[0.7rem] font-medium text-muted-foreground">Front</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openImageModal(
                                selectedDocument?.frontUrl || fallbackImage,
                                `${selectedDocument?.fileName || "document"} (Front)`
                              )
                            }
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void downloadDocument(
                                selectedDocument?.frontUrl || fallbackImage,
                                `${selectedDocument?.id || "document"}-front.jpg`
                              )
                            }
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="h-[210px] bg-muted/20 p-2">
                        <img
                          src={selectedDocument?.frontUrl || fallbackImage}
                          alt="Front"
                          className="h-full w-full cursor-zoom-in rounded-md bg-background object-cover"
                          onClick={() =>
                            openImageModal(
                              selectedDocument?.frontUrl || fallbackImage,
                              `${selectedDocument?.fileName || "document"} (Front)`
                            )
                          }
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[0.7rem] font-medium text-muted-foreground">Back</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openImageModal(
                                selectedDocument?.backUrl || fallbackImage,
                                `${selectedDocument?.fileName || "document"} (Back)`
                              )
                            }
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void downloadDocument(
                                selectedDocument?.backUrl || fallbackImage,
                                `${selectedDocument?.id || "document"}-back.jpg`
                              )
                            }
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="h-[210px] bg-muted/20 p-2">
                        <img
                          src={selectedDocument?.backUrl || fallbackImage}
                          alt="Back"
                          className="h-full w-full cursor-zoom-in rounded-md bg-background object-cover"
                          onClick={() =>
                            openImageModal(
                              selectedDocument?.backUrl || fallbackImage,
                              `${selectedDocument?.fileName || "document"} (Back)`
                            )
                          }
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2">
                      <Button
                        size="sm"
                        disabled={normalizeApiDocStatus(selectedDocument?.status) === "APPROVED"}
                        onClick={() => openPreviewDecision("APPROVE")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={normalizeApiDocStatus(selectedDocument?.status) === "REJECTED"}
                        onClick={() => openPreviewDecision("REJECT")}
                      >
                        Reject
                      </Button>
                    </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{imageModalTitle}</DialogTitle>
            </DialogHeader>
            <div className="h-[70vh] overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-2">
              <img
                src={imageModalSrc}
                alt={imageModalTitle}
                className="h-full w-full rounded-md bg-background object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={decisionDialogOpen}
          onOpenChange={setDecisionDialogOpen}
          onConfirm={onDecisionConfirm}
          title={
            decisionType === "APPROVE"
              ? `Approve ${previewDocLabel(selectedDocumentId)}`
              : `Reject ${previewDocLabel(selectedDocumentId)}`
          }
          description={
            decisionRole === "PARTNER"
              ? decisionType === "APPROVE"
                ? "Only cnicStatus is sent. Approving CNIC promotes this Partner account to APPROVED."
                : "Only cnicStatus is sent. The Partner account stays pending until CNIC is approved."
              : decisionType === "APPROVE"
                ? "Only this document’s verification status will be set to APPROVED. The other two documents stay as they are on the server."
                : "Only this document’s verification status will be set to REJECTED. The other two documents stay as they are on the server."
          }
          confirmLabel={decisionLoading ? "Updating..." : decisionType === "APPROVE" ? "Approve" : "Reject"}
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

