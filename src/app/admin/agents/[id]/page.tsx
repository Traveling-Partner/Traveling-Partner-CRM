"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";

interface AgentDetailResponse {
  id: number;
  email: string | null;
  username: string | null;
  mobileNumber: string | null;
  name: string | null;
  status: string;
  cnicNumber?: string | null;
  cnicFront?: string | null;
  cnicBack?: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
}

export default function AdminAgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentDetailResponse | null>(null);
  const fallbackCnicImage = "/mock-images/id-document.svg";

  useEffect(() => {
    let active = true;
    const loadAgent = async () => {
      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/users/sale-agents/${params.id}`;
        const response = await fetcher<AgentDetailResponse | ApiEnvelope<AgentDetailResponse>>(url, { token });
        const payload =
          response && typeof response === "object" && "data" in response && response.data
            ? response.data
            : (response as AgentDetailResponse);
        if (active) setAgent(payload);
      } catch {
        if (active) setAgent(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadAgent();
    return () => {
      active = false;
    };
  }, [params.id, token]);

  if (!loading && !agent) {
    return (
      <AppShell title="Agent detail">
        <PageContainer>
          <EmptyState
            title="Agent not found"
            description="This agent could not be loaded from backend."
            actionLabel="Back to agents"
            onActionClick={() => router.push("/admin/agents")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Agent • ${agent?.name || "—"}`}>
      <PageContainer>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agents" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to agents
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/agents/${params.id}/edit`} className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit agent
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Agent profile"
            description="Contact and status"
            className="lg:col-span-2"
          >
            {loading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="mt-0.5 font-heading font-medium">{agent?.name || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-0.5 font-heading font-medium">{agent?.email || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5 font-heading font-medium">{agent?.mobileNumber || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={agent?.status || "PENDING"} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Performance" description="Onboarded counts">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Drivers onboarded</span>
                <span className="font-heading font-semibold">—</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Partners onboarded</span>
                <span className="font-heading font-semibold">—</span>
              </div>
            </div>
          </SectionCard>
        </div>
        <SectionCard
          title="CNIC documents"
          description="Front and back CNIC images from agent profile."
          className="mt-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CNIC Front
              </p>
              <div className="h-56 overflow-hidden rounded-md border border-border/60 bg-background">
                <img
                  src={agent?.cnicFront || fallbackCnicImage}
                  alt="CNIC Front"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackCnicImage;
                  }}
                />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {agent?.cnicFront || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CNIC Back
              </p>
              <div className="h-56 overflow-hidden rounded-md border border-border/60 bg-background">
                <img
                  src={agent?.cnicBack || fallbackCnicImage}
                  alt="CNIC Back"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackCnicImage;
                  }}
                />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {agent?.cnicBack || "—"}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Future use: keep uploaded documents section for later backend integration.
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
        */}
      </PageContainer>
    </AppShell>
  );
}
