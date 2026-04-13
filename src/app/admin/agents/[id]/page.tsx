"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { agents } from "@/mock-data/agents";
import { drivers } from "@/mock-data/drivers";
import { partners } from "@/mock-data/partners";
import { commissions } from "@/mock-data/commissions";

const agentDocumentImages = [
  "/mock-images/id-document.svg",
  "/mock-images/trade-license.svg",
  "/mock-images/vat-certificate.svg"
];

export default function AdminAgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const agent = useMemo(
    () => agents.find((a) => a.id === params.id),
    [params.id]
  );

  const myDrivers = useMemo(
    () => drivers.filter((d) => d.createdByAgentId === params.id),
    [params.id]
  );
  const myPartners = useMemo(
    () => partners.filter((p) => p.createdByAgentId === params.id),
    [params.id]
  );
  const myCommissions = useMemo(
    () =>
      commissions
        .filter((c) => c.agentId === params.id)
        .sort(
          (a, b) =>
            new Date(b.month).getTime() - new Date(a.month).getTime()
        )
        .slice(0, 6)
        .reverse()
        .map((c) => ({
          month: new Date(c.month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit"
          }),
          amount: c.amount
        })),
    [params.id]
  );

  const agentDocuments = useMemo(
    () => [
      {
        id: `${params.id}-national-id`,
        type: "NATIONAL_ID",
        fileName: "national-id.jpg",
        fileUrl: agentDocumentImages[0],
        uploadedAt: "2026-03-05T09:00:00.000Z",
        status: "VERIFIED"
      },
      {
        id: `${params.id}-agent-license`,
        type: "AGENT_LICENSE",
        fileName: "agent-license.jpg",
        fileUrl: agentDocumentImages[1],
        uploadedAt: "2026-03-06T09:00:00.000Z",
        status: "VERIFIED"
      },
      {
        id: `${params.id}-tax-certificate`,
        type: "TAX_CERTIFICATE",
        fileName: "tax-certificate.jpg",
        fileUrl: agentDocumentImages[2],
        uploadedAt: "2026-03-07T09:00:00.000Z",
        status: "PENDING"
      }
    ],
    [params.id]
  );

  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");

  useEffect(() => {
    if (agentDocuments.length > 0) {
      setSelectedDocumentId(agentDocuments[0].id);
    }
  }, [agentDocuments]);

  const selectedDocument =
    agentDocuments.find((doc) => doc.id === selectedDocumentId) ?? agentDocuments[0];
  const selectedIsPdf =
    selectedDocument?.fileName.toLowerCase().endsWith(".pdf") ||
    selectedDocument?.fileUrl.toLowerCase().includes(".pdf");
  const fallbackImage = "/mock-images/document-fallback.svg";

  useEffect(() => {
    setPreviewSrc(selectedDocument?.fileUrl ?? "");
  }, [selectedDocument?.id, selectedDocument?.fileUrl]);

  if (!agent) {
    return (
      <AppShell title="Agent detail">
        <PageContainer>
          <EmptyState
            title="Agent not found"
            description="This agent id does not exist in the mock dataset."
            actionLabel="Back to agents"
            onActionClick={() => router.push("/admin/agents")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Agent • ${agent.name}`}>
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agents" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to agents
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Agent profile"
            description="Contact and status"
            className="lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                <p className="mt-0.5 font-heading font-medium">{agent.name}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-0.5 font-heading font-medium">{agent.email}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="mt-0.5 font-heading font-medium">{agent.phone}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={agent.status} />
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Commission rate</p>
                <p className="mt-0.5 font-heading font-medium">{agent.commissionRate}%</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Performance" description="Onboarded counts">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Drivers onboarded</span>
                <span className="font-heading font-semibold">{myDrivers.length}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Partners onboarded</span>
                <span className="font-heading font-semibold">{myPartners.length}</span>
              </div>
            </div>
          </SectionCard>
        </div>
        <SectionCard
          title="Commission trend"
          description="Last 6 months"
          className="mt-4"
        >
          <div className="h-64">
            {myCommissions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={myCommissions}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="month" tickMargin={8} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#fdb813" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No commission data" description="Commission records will appear here." />
            )}
          </div>
        </SectionCard>

        <div className="mt-4">
          <SectionCard
            title="Uploaded documents"
            description="Agent verification files submitted during onboarding."
          >
            {agentDocuments.length === 0 ? (
              <EmptyState
                title="No documents uploaded"
                description="Uploaded files will appear here for review."
              />
            ) : (
              <div className="grid gap-3 text-xs lg:grid-cols-[360px,1fr]">
                <div className="space-y-2">
                  {agentDocuments.map((doc) => (
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
