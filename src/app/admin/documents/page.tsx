"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";

interface DriverRow {
  id: number;
  email: string | null;
  name: string | null;
  username: string | null;
  mobileNumber: string | null;
  status: string;
  city: string | null;
  createdAt: string | null;
}

interface DriversResponse {
  content: DriverRow[];
  totalPages: number;
}

interface DriverDocumentsResponse {
  id: number;
  cnicFront: string | null;
  cnicBack: string | null;
  licenseFront: string | null;
  licenseBack: string | null;
  registrationFront: string | null;
  registrationBack: string | null;
  cnicStatus?: string | null;
  licenseStatus?: string | null;
  vehicleStatus?: string | null;
  /** GET /users/documents/{id} returns vehicle doc status under this key */
  vehicleDocStatus?: string | null;
  registrationStatus?: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface PreviewDocument {
  id: "driver-license" | "vehicle-registration" | "id-document";
  type: "DRIVER_LICENSE" | "VEHICLE_REGISTRATION" | "ID_DOCUMENT";
  fileName: string;
  frontUrl: string;
  backUrl: string;
  status: string;
}

type DecisionType = "APPROVE" | "REJECT";
type ApiDocStatus = "APPROVED" | "REJECTED" | "PENDING";

interface DocumentStatusPayload {
  cnicStatus: ApiDocStatus;
  licenseStatus: ApiDocStatus;
  vehicleStatus: ApiDocStatus;
}

const PAGE_SIZE = 6;
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
  return normalized;
}

function mapRawStatus(value: unknown): ApiDocStatus {
  if (value === null || value === undefined) return "PENDING";
  const s = String(value).trim().toUpperCase();
  if (s === "APPROVED" || s === "REJECTED" || s === "PENDING") return s;
  return "PENDING";
}

function pickVehicleStatus(payload: Record<string, unknown>): unknown {
  const keys = [
    "vehicleDocStatus",
    "vehicleStatus",
    "registrationStatus",
    "vehicleRegistrationStatus",
    "registrationDocumentsStatus"
  ] as const;
  for (const k of keys) {
    const v = payload[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
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
  const token = useAppSelector((state) => state.auth.token);

  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDriver, setPreviewDriver] = useState<DriverRow | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDocuments, setPreviewDocuments] = useState<PreviewDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<PreviewDocument["id"]>("driver-license");
  const [previewSrc, setPreviewSrc] = useState<string>(fallbackImage);

  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionScope, setDecisionScope] = useState<"table" | "preview">("table");
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null);
  const [decisionDriver, setDecisionDriver] = useState<DriverRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [rawDocumentStatuses, setRawDocumentStatuses] = useState<DocumentStatusPayload>({
    cnicStatus: "PENDING",
    licenseStatus: "PENDING",
    vehicleStatus: "PENDING"
  });

  useEffect(() => {
    let active = true;
    const loadCities = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/users/drivers?page=0&size=500`;
        const response = await fetcher<DriversResponse>(url, { token });
        if (!active) return;
        const uniqueCities = Array.from(
          new Set(response.content.map((item) => item.city).filter(Boolean) as string[])
        ).sort();
        setCities(uniqueCities);
      } catch {
        // ignore city load error
      }
    };
    void loadCities();
    return () => {
      active = false;
    };
  }, [token]);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/users/drivers?page=${page}&size=${PAGE_SIZE}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (cityFilter !== "all") url += `&city=${encodeURIComponent(cityFilter)}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const response = await fetcher<DriversResponse>(url, { token });
      setDrivers(response.content);
      setTotalPages(response.totalPages || 1);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, cityFilter, search]);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  const selectedDocument = previewDocuments.find((doc) => doc.id === selectedDocumentId) ?? previewDocuments[0];

  const loadPreviewDocuments = useCallback(async (driverId: number) => {
    setPreviewLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/documents/${driverId}`;
      const response = await fetcher<DriverDocumentsResponse | ApiEnvelope<DriverDocumentsResponse>>(url, { token });
      const payload =
        response && typeof response === "object" && "data" in response && response.data
          ? response.data
          : (response as DriverDocumentsResponse);

      const payloadRecord = payload as unknown as Record<string, unknown>;
      const vehicleStatusRaw = pickVehicleStatus(payloadRecord);

      setRawDocumentStatuses({
        cnicStatus: mapRawStatus(payload?.cnicStatus),
        licenseStatus: mapRawStatus(payload?.licenseStatus),
        vehicleStatus: mapRawStatus(vehicleStatusRaw)
      });

      const docs: PreviewDocument[] = [
        {
          id: "driver-license",
          type: "DRIVER_LICENSE",
          fileName: "driver-license.jpg",
          frontUrl: safeImageUrl(payload?.licenseFront) || fallbackByType.DRIVER_LICENSE,
          backUrl: safeImageUrl(payload?.licenseBack) || fallbackByType.DRIVER_LICENSE,
          status: normalizeDocumentStatus(payload?.licenseStatus)
        },
        {
          id: "vehicle-registration",
          type: "VEHICLE_REGISTRATION",
          fileName: "vehicle-registration.jpg",
          frontUrl:
            safeImageUrl(payload?.registrationFront) || fallbackByType.VEHICLE_REGISTRATION,
          backUrl:
            safeImageUrl(payload?.registrationBack) || fallbackByType.VEHICLE_REGISTRATION,
          status: normalizeDocumentStatus(vehicleStatusRaw)
        },
        {
          id: "id-document",
          type: "ID_DOCUMENT",
          fileName: "id-document.jpg",
          frontUrl: safeImageUrl(payload?.cnicFront) || fallbackByType.ID_DOCUMENT,
          backUrl: safeImageUrl(payload?.cnicBack) || fallbackByType.ID_DOCUMENT,
          status: normalizeDocumentStatus(payload?.cnicStatus)
        }
      ];
      setPreviewDocuments(docs);
      setPreviewSrc(docs[0].frontUrl);
    } catch {
      setPreviewDocuments([]);
      error("Failed to load documents preview.");
    } finally {
      setPreviewLoading(false);
    }
  }, [token, error]);

  const openPreview = async (driver: DriverRow) => {
    setPreviewDriver(driver);
    setPreviewOpen(true);
    setSelectedDocumentId("driver-license");
    setPreviewSrc(fallbackImage);
    await loadPreviewDocuments(driver.id);
  };

  const openDecision = (driver: DriverRow, type: DecisionType) => {
    setDecisionScope("table");
    setDecisionDriver(driver);
    setDecisionType(type);
    setRejectReason("");
    setDecisionDialogOpen(true);
  };

  const openPreviewDecision = (type: DecisionType) => {
    if (!previewDriver) return;
    setDecisionScope("preview");
    setDecisionDriver(previewDriver);
    setDecisionType(type);
    setRejectReason("");
    setDecisionDialogOpen(true);
  };

  const applyDecision = async (
    driver: DriverRow,
    type: DecisionType,
    scope: "table" | "preview",
    selectedId: PreviewDocument["id"]
  ) => {
    let payload: DocumentStatusPayload;

    if (scope === "table") {
      payload =
        type === "APPROVE"
          ? {
              cnicStatus: "APPROVED",
              licenseStatus: "APPROVED",
              vehicleStatus: "APPROVED"
            }
          : {
              cnicStatus: "REJECTED",
              licenseStatus: "REJECTED",
              vehicleStatus: "REJECTED"
            };
    } else {
      const decision = type === "APPROVE" ? "APPROVED" : "REJECTED";
      payload = { ...rawDocumentStatuses };
      if (selectedId === "driver-license") {
        payload.licenseStatus = decision;
      } else if (selectedId === "vehicle-registration") {
        payload.vehicleStatus = decision;
      } else {
        payload.cnicStatus = decision;
      }
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/documents/status/${driver.id}`;
    await fetcher(url, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    });
  };

  const onDecisionConfirm = () => {
    if (!decisionDriver || !decisionType) return;
    const run = async () => {
      setDecisionLoading(true);
      try {
        await applyDecision(decisionDriver, decisionType, decisionScope, selectedDocumentId);
        if (decisionScope === "table") {
          success(
            decisionType === "APPROVE"
              ? "All documents approved successfully."
              : "All documents rejected successfully."
          );
        } else {
          success(
            decisionType === "APPROVE"
              ? `${previewDocLabel(selectedDocumentId)} approved successfully.`
              : `${previewDocLabel(selectedDocumentId)} rejected successfully.`
          );
        }
        await loadDrivers();
        if (previewDriver?.id === decisionDriver.id) {
          await loadPreviewDocuments(decisionDriver.id);
        }
        setDecisionDialogOpen(false);
      } catch {
        error("Failed to update document status.");
      } finally {
        setDecisionLoading(false);
      }
    };
    void run();
  };

  const columns: ColumnDef<DriverRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Driver",
          cell: ({ row }) => {
          const driverName =
             row.original.name || row.original.username || "—";

         
          return (
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{driverName}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.mobileNumber || "—"}
              </p>
            </div>
          );
        }
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => row.original.city || "—"
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—"
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
              onClick={() => void openPreview(row.original)}
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
    ],
    []
  );

  return (
    <AppShell title="Document verification">
      <PageContainer>
        <SectionCard
          title="Verification queue"
          description="Review and act on pending driver documents before they go live."
        >
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
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : drivers.length === 0 ? (
              <EmptyState
                title="No records found"
                description="Try changing filters to see more drivers."
              />
            ) : (
              <DataTable columns={columns} data={drivers} />
            )}

            <PaginationControls
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage - 1)}
            />
          </>
        </SectionCard>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Document preview - {previewDriver?.username || previewDriver?.name || "Driver"}
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
                          ? "border-primary/60 bg-primary/10 shadow-sm"
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
                            onClick={() => setPreviewSrc(selectedDocument?.frontUrl || fallbackImage)}
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                          <a
                            href={selectedDocument?.frontUrl || fallbackImage}
                            download
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </a>
                        </div>
                      </div>
                      <div className="h-[210px] bg-muted/20 p-2">
                        <img
                          src={selectedDocument?.frontUrl || fallbackImage}
                          alt="Front"
                          className="h-full w-full rounded-md bg-background object-cover"
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
                            onClick={() => setPreviewSrc(selectedDocument?.backUrl || fallbackImage)}
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                          <a
                            href={selectedDocument?.backUrl || fallbackImage}
                            download
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </a>
                        </div>
                      </div>
                      <div className="h-[210px] bg-muted/20 p-2">
                        <img
                          src={selectedDocument?.backUrl || fallbackImage}
                          alt="Back"
                          className="h-full w-full rounded-md bg-background object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2">
                    <Button size="sm" onClick={() => openPreviewDecision("APPROVE")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
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

        <ConfirmDialog
          open={decisionDialogOpen}
          onOpenChange={setDecisionDialogOpen}
          onConfirm={onDecisionConfirm}
          title={
            decisionScope === "preview"
              ? decisionType === "APPROVE"
                ? `Approve ${previewDocLabel(selectedDocumentId)}`
                : `Reject ${previewDocLabel(selectedDocumentId)}`
              : decisionType === "APPROVE"
                ? "Approve all documents"
                : "Reject all documents"
          }
          description={
            decisionScope === "preview"
              ? decisionType === "APPROVE"
                ? "Only the selected document’s verification status will be set to APPROVED. Other documents stay as they are on the server."
                : "Only the selected document’s verification status will be set to REJECTED. Other documents stay as they are on the server."
              : decisionType === "APPROVE"
                ? "This will mark all three document statuses (CNIC, license, vehicle) as APPROVED."
                : "This will mark all three document statuses (CNIC, license, vehicle) as REJECTED."
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

