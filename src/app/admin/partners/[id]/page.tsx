"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText, Pencil, UserCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { usePartnerDetailQuery } from "@/hooks/queries/use-partner-detail-query";
import { useDriverDocumentsQuery } from "@/hooks/queries/use-driver-documents-query";
import { queryKeys } from "@/lib/api/query-keys";
import { updateUserStatus } from "@/services/users";
import { updatePartnerCnicStatus } from "@/services/documents";
import { normalizeApiDocStatus, type ApiDocStatus } from "@/lib/documents-utils";

interface PartnerDocument {
  id: "id-document";
  type: "ID_DOCUMENT";
  fileName: string;
  frontUrl: string;
  backUrl: string;
  uploadedAt: string | null;
  status: string;
}

const fallbackImage = "/mock-images/document-fallback.svg";
const fallbackIdImage = "/mock-images/id-document.svg";

export default function AdminPartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const { data: partner, isLoading, isError } = usePartnerDetailQuery(params.id);
  const docsQuery = useDriverDocumentsQuery(partner?.id, Boolean(partner?.id));
  const cnicStatus = normalizeApiDocStatus(docsQuery.rawStatuses?.cnicStatus);
  const loading = isLoading;

  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("id-document");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>(fallbackImage);
  const [previewDownloadName, setPreviewDownloadName] = useState<string>("document.jpg");
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [cnicDecision, setCnicDecision] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const profilePicture = partner?.basicInformation?.profilePicture?.trim() || null;

  const statusMutation = useApiMutation<void, { userId: number; status: string }>({
    mutationFn: ({ token, variables }) =>
      updateUserStatus(variables.userId, variables.status, { token }),
    invalidateKeys: [queryKeys.users.partnerDetail(params.id)],
    onSuccess: (_data, variables) => {
      setOptimisticStatus(variables.status);
      success(variables.status === "BLOCKED" ? "Partner blocked." : "Partner unblocked.");
      setStatusConfirmOpen(false);
    },
    onError: (err) => {
      showError(err.message);
    }
  });

  const statusUpdating = statusMutation.isPending;

  const cnicMutation = useApiMutation<
    void,
    { cnicStatus: ApiDocStatus; rejectionReason?: string }
  >({
    mutationFn: ({ token, variables }) =>
      updatePartnerCnicStatus(partner!.id, variables, { token }),
    invalidateKeys: [
      queryKeys.users.partnerDetail(params.id),
      queryKeys.users.driverDocuments(params.id),
      ["users", "documents", "queue"]
    ],
    onSuccess: (_data, variables) => {
      success(
        variables.cnicStatus === "APPROVED"
          ? "Partner CNIC approved. Account will promote to APPROVED if this was the only required document."
          : "Partner CNIC rejected."
      );
      setCnicDecision(null);
      setRejectReason("");
    },
    onError: (err) => showError(err.message)
  });

  const documents = useMemo<PartnerDocument[]>(() => {
    if (!partner) return [];
    const preview = docsQuery.previewDocuments[0];
    return [
      {
        id: "id-document",
        type: "ID_DOCUMENT",
        fileName: "id-document.jpg",
        frontUrl: preview?.frontUrl || partner.basicInformation?.cnicFront || fallbackIdImage,
        backUrl: preview?.backUrl || partner.basicInformation?.cnicBack || fallbackIdImage,
        uploadedAt: partner.updatedAt || partner.createdAt,
        status: preview?.status || cnicStatus
      }
    ];
  }, [partner, docsQuery.previewDocuments, cnicStatus]);

  const selectedDocument =
    documents.find((doc) => doc.id === selectedDocumentId) ?? documents[0];
  const selectedIsPdf = selectedDocument
    ? selectedDocument.fileName.toLowerCase().endsWith(".pdf") ||
      selectedDocument.frontUrl.toLowerCase().includes(".pdf")
    : false;

  useEffect(() => {
    setPreviewSrc(selectedDocument?.frontUrl ?? fallbackImage);
  }, [selectedDocument?.id, selectedDocument?.frontUrl]);

  const fullName = `${partner?.basicInformation?.firstName || ""} ${partner?.basicInformation?.lastName || ""}`.trim() || "—";
  const city = partner?.basicInformation?.city || "—";
  const gender = partner?.basicInformation?.gender || "—";
  const email = partner?.basicInformation?.email || partner?.email || "—";
  const partnerStatus = optimisticStatus ?? partner?.status;
  const isBlocked = String(partnerStatus || "").toUpperCase() === "BLOCKED";
  const nextStatus: "APPROVED" | "ACTIVE" | "BLOCKED" = isBlocked
    ? cnicStatus === "APPROVED"
      ? "APPROVED"
      : "ACTIVE"
    : "BLOCKED";

  const handleStatusConfirm = () => {
    if (!partner) return;
    statusMutation.mutate({ userId: partner.id, status: nextStatus });
  };

  if (!loading && (isError || !partner)) {
    return (
      <AppShell title="Partner detail">
        <PageContainer>
          <EmptyState
            title="Partner not found"
            description="This partner could not be loaded from backend."
            actionLabel="Back to partners"
            onActionClick={() => router.push("/admin/partners")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Partner • ${fullName}`}>
      <PageContainer>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/partners" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to partners
            </Link>
          </Button>
          {partner ? (
            <Button size="sm" asChild>
              <Link href={`/admin/partners/${params.id}/edit`} className="gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit partner
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4">
          <SectionCard
            title="Partner profile"
            description="Core details for this fleet partner"
          >
            {loading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                 <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted/20">
                    {profilePicture  ? (
                      <img
                        src={profilePicture}
                        alt={`${fullName} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || <UserCircle className="h-4 w-4" strokeWidth={1.25} />}
                      </div>
                    )}
                  </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="mt-0.5 font-heading font-medium">{fullName}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</p>
                  <p className="mt-0.5 font-heading font-medium">{city}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gender</p>
                  <p className="mt-0.5 font-heading font-medium">{gender}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5 font-heading font-medium">{partner?.mobileNumber || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-0.5 font-heading font-medium break-all">{email}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">WhatsApp</p>
                  <p className="mt-0.5 font-heading font-medium">{partner?.basicInformation?.whatsApp || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CNIC number</p>
                  <p className="mt-0.5 font-heading font-medium tabular-nums">{partner?.basicInformation?.cnicNumber || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={partnerStatus || "PENDING"} />
                  </div>
                </div>
              </div>
            )}
            {!loading && partner ? (
              <div className="mt-4 flex justify-end">
                <Button
                  variant={isBlocked ? "default" : "destructive"}
                  onClick={() => setStatusConfirmOpen(true)}
                >
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              </div>
            ) : null}
          </SectionCard>
        </div>

        <div className="mt-4">
          <SectionCard
            title="Uploaded documents"
            description="Partner CNIC only. Approve here to promote the account to APPROVED (license/vehicle are not required)."
          >
            {documents.length === 0 ? (
              <EmptyState
                title="No documents uploaded"
                description="Uploaded files will appear here for review."
              />
            ) : (
              <div className="grid gap-3 text-xs lg:grid-cols-[360px,1fr]">
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
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
                          <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                            Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 shrink-0">
                        <StatusBadge status={doc.status} />
                      </div>
                    </button>
                  ))}
                </div>

                {selectedDocument ? (
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
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          disabled={cnicMutation.isPending || cnicStatus === "APPROVED"}
                          onClick={() => {
                            setRejectReason("");
                            setCnicDecision("APPROVE");
                          }}
                        >
                          Approve CNIC
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={cnicMutation.isPending || cnicStatus === "REJECTED"}
                          onClick={() => {
                            setRejectReason("");
                            setCnicDecision("REJECT");
                          }}
                        >
                          Reject CNIC
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 p-3 md:grid-cols-2">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-[0.7rem] font-medium text-muted-foreground">Front</p>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewSrc(selectedDocument.frontUrl);
                                setPreviewDownloadName("id-document-front.jpg");
                                setPreviewOpen(true);
                              }}
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </button>
                            <a
                              href={selectedDocument.frontUrl}
                              download="id-document-front.jpg"
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          </div>
                        </div>
                        <div className="h-[220px] bg-muted/20 p-2">
                          <img
                            src={selectedDocument.frontUrl}
                            alt={`${selectedDocument.fileName} front`}
                            className="h-full w-full cursor-zoom-in rounded-md bg-background object-cover"
                            onClick={() => {
                              setPreviewSrc(selectedDocument.frontUrl);
                              setPreviewDownloadName("id-document-front.jpg");
                              setPreviewOpen(true);
                            }}
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
                              onClick={() => {
                                setPreviewSrc(selectedDocument.backUrl);
                                setPreviewDownloadName("id-document-back.jpg");
                                setPreviewOpen(true);
                              }}
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </button>
                            <a
                              href={selectedDocument.backUrl}
                              download="id-document-back.jpg"
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          </div>
                        </div>
                        <div className="h-[220px] bg-muted/20 p-2">
                          <img
                            src={selectedDocument.backUrl}
                            alt={`${selectedDocument.fileName} back`}
                            className="h-full w-full cursor-zoom-in rounded-md bg-background object-cover"
                            onClick={() => {
                              setPreviewSrc(selectedDocument.backUrl);
                              setPreviewDownloadName("id-document-back.jpg");
                              setPreviewOpen(true);
                            }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackImage;
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Future: keep trade license and VAT certificate blocks for partner docs if backend adds them again.
        <SectionCard title="Trade/VAT documents">...</SectionCard>
        */}

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDocument?.fileName ?? "Document preview"}
              </DialogTitle>
            </DialogHeader>
            {selectedDocument ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    {selectedDocument.type.replaceAll("_", " ")} • Uploaded{" "}
                    {selectedDocument.uploadedAt ? new Date(selectedDocument.uploadedAt).toLocaleDateString() : "—"}
                  </p>
                  <a
                    href={previewSrc}
                    download={previewDownloadName}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
                <div className="h-[65vh] overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-2">
                  {selectedIsPdf ? (
                    <iframe
                      src={selectedDocument.frontUrl}
                      title={selectedDocument.fileName}
                      className="h-full w-full rounded-md border border-border/60 bg-background"
                    />
                  ) : (
                    <img
                      src={previewSrc}
                      alt={selectedDocument.fileName}
                      className="h-full w-full rounded-md object-cover bg-background"
                      onError={() => {
                        setPreviewSrc(fallbackImage);
                      }}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={statusConfirmOpen}
          onOpenChange={setStatusConfirmOpen}
          onConfirm={handleStatusConfirm}
          title={isBlocked ? "Unblock partner?" : "Block partner?"}
          description={
            partner
              ? isBlocked
                ? `Unblock "${fullName}"? Account status will be restored.`
                : `Block "${fullName}"? They will not be able to use the app.`
              : undefined
          }
          confirmLabel={statusUpdating ? "Updating..." : isBlocked ? "Unblock" : "Block"}
          cancelLabel="Cancel"
          destructive={!isBlocked}
        />
        <ConfirmDialog
          open={cnicDecision !== null}
          onOpenChange={(open) => {
            if (!open) {
              setCnicDecision(null);
              setRejectReason("");
            }
          }}
          onConfirm={() => {
            if (!cnicDecision) return;
            if (cnicDecision === "REJECT" && !rejectReason.trim()) {
              showError("Please add rejection reason.");
              return;
            }
            cnicMutation.mutate({
              cnicStatus: cnicDecision === "APPROVE" ? "APPROVED" : "REJECTED",
              rejectionReason: cnicDecision === "REJECT" ? rejectReason.trim() : undefined
            });
          }}
          title={cnicDecision === "APPROVE" ? "Approve partner CNIC?" : "Reject partner CNIC?"}
          description={
            cnicDecision === "APPROVE"
              ? "This updates verification in the app. A Partner account promotes to APPROVED from CNIC alone."
              : "The partner account will not be approved until CNIC is approved."
          }
          confirmLabel={cnicMutation.isPending ? "Saving…" : cnicDecision === "APPROVE" ? "Approve" : "Reject"}
          destructive={cnicDecision === "REJECT"}
        >
          {cnicDecision === "REJECT" ? (
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason"
            />
          ) : null}
        </ConfirmDialog>
      </PageContainer>
    </AppShell>
  );
}

