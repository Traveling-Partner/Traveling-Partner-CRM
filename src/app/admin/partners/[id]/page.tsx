"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { partners } from "@/mock-data/partners";
import { drivers } from "@/mock-data/drivers";
import { rides } from "@/mock-data/rides";

export default function AdminPartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const partner = useMemo(
    () => partners.find((p) => p.id === params.id),
    [params.id]
  );

  if (!partner) {
    return (
      <AppShell title="Partner detail">
        <PageContainer>
          <EmptyState
            title="Partner not found"
            description="This partner id does not exist in the mock dataset."
            actionLabel="Back to partners"
            onActionClick={() => router.push("/admin/partners")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const partnerDrivers = drivers.filter(
    (d) => d.city === partner.city
  );

  const partnerRides = rides.filter((r) => r.partnerId === partner.id);
  const completedRides = partnerRides.filter(
    (r) => r.status === "COMPLETED"
  );
  const totalFare = completedRides.reduce((acc, r) => acc + r.fare, 0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(
    partner.documents?.[0]?.id ?? ""
  );
  const selectedDocument =
    partner.documents?.find((doc) => doc.id === selectedDocumentId) ??
    partner.documents?.[0];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const selectedIsPdf = selectedDocument
    ? selectedDocument.fileName.toLowerCase().endsWith(".pdf") ||
      selectedDocument.fileUrl.toLowerCase().includes(".pdf")
    : false;
  const fallbackImage = "https://picsum.photos/seed/document-fallback/1200/800";

  useEffect(() => {
    setPreviewSrc(selectedDocument?.fileUrl ?? "");
  }, [selectedDocument?.id, selectedDocument?.fileUrl]);

  return (
    <AppShell title={`Partner • ${partner.name}`}>
      <PageContainer>
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/partners" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to partners
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Partner profile"
            description="Core details for this fleet partner"
            className="lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                <p className="mt-0.5 font-heading font-medium">{partner.name}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</p>
                <p className="mt-0.5 font-heading font-medium">{partner.city}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={partner.status} />
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created at</p>
                <p className="mt-0.5 font-heading font-medium">
                  {new Date(partner.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Network snapshot"
            description="High level metrics for this partner across your marketplace."
          >
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Drivers (same city)</span>
                <span className="font-heading font-semibold">{partnerDrivers.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Completed rides</span>
                <span className="font-heading font-semibold">{completedRides.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Gross fares (mock)</span>
                <span className="font-heading font-semibold">${Math.round(totalFare)}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4">
          <SectionCard
            title="Uploaded documents"
            description="Partner-level verification documents uploaded during onboarding."
          >
            {!partner.documents || partner.documents.length === 0 ? (
              <EmptyState
                title="No documents uploaded"
                description="Uploaded files will appear here for review."
              />
            ) : (
              <div className="grid gap-3 text-xs lg:grid-cols-[360px,1fr]">
                <div className="space-y-2">
                  {partner.documents.map((doc) => (
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
                      <div className="ml-2 shrink-0">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                          {doc.status}
                        </span>
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
                      <div className="flex items-center gap-1">
                        <a
                          href={selectedDocument.fileUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            setPreviewOpen(true);
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
                    <div className="h-[360px] bg-muted/20 p-2">
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
                          className="h-full w-full rounded-md object-cover bg-background"
                          onError={() => {
                            setPreviewSrc(fallbackImage);
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Status history"
            description="How this partner has moved through your onboarding workflow."
          >
            <ol className="space-y-3 text-xs">
              {partner.statusHistory.map((entry) => (
                <li key={entry.changedAt} className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0">
                    <p className="font-heading font-medium">
                      {entry.status} • {new Date(entry.changedAt).toLocaleDateString()}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      by user {entry.changedByUserId}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard
            title="Recent rides"
            description="Sample of trips associated with this partner."
          >
            {partnerRides.length === 0 ? (
              <EmptyState
                title="No rides yet"
                description="Once this partner starts operating, their trips will appear here."
              />
            ) : (
              <div className="space-y-2 text-xs">
                {partnerRides.slice(0, 6).map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {ride.city} • {ride.status}
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground">
                        {new Date(ride.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[0.7rem] font-semibold">
                      ${Math.round(ride.fare)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
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
                    {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                  </p>
                  <a
                    href={selectedDocument.fileUrl}
                    download
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
                <div className="h-[65vh] overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-2">
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
      </PageContainer>
    </AppShell>
  );
}

