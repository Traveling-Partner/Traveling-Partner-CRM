"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Pencil } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttachmentPreview } from "@/components/content/AttachmentPreview";
import { useNewsletterDetailQuery } from "@/hooks/queries/use-newsletter-detail-query";
import TPLoader from "@/components/TPLoader";

export default function AdminNewsletterPreviewPage() {
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);

  const { data: row, isLoading, isError } = useNewsletterDetailQuery(
    Number.isFinite(idNum) ? idNum : undefined
  );

  if (isLoading) {
    return (
      <AppShell title="Newsletter preview">
        <PageContainer>
          <div className="flex justify-center py-12">
            <TPLoader variant="inline" size={120} label="Loading…" />
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  if (isError || !row || !Number.isFinite(idNum)) {
    return (
      <AppShell title="Newsletter preview">
        <PageContainer>
          <SectionCard
            title="Newsletter not found"
            description="This newsletter could not be loaded."
          >
            <Button asChild>
              <Link href="/admin/newsletter">Back to newsletter</Link>
            </Button>
          </SectionCard>
        </PageContainer>
      </AppShell>
    );
  }

  const status = row.status?.trim() || "—";
  const attachmentUrl = row.attachedFile?.trim() || "";

  return (
    <AppShell title="Newsletter preview">
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/newsletter" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to newsletter
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/newsletter/${idNum}`} className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <SectionCard title="Message" description="Newsletter body text.">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {row.message?.trim() || "—"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{status}</Badge>
              {row.userName ? <span>By {row.userName}</span> : null}
              {row.userRole ? <span>• {row.userRole}</span> : null}
              {row.userId != null ? <span>• ID {row.userId}</span> : null}
            </div>
          </SectionCard>

          <SectionCard title="Attachment" description="Uploaded file preview.">
            {attachmentUrl ? (
              <div className="space-y-3">
                <AttachmentPreview
                  url={attachmentUrl}
                  title="Newsletter attachment"
                  heightClassName="h-56"
                />
                <a
                  href={attachmentUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:bg-muted/50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attachment.</p>
            )}
          </SectionCard>
        </div>
      </PageContainer>
    </AppShell>
  );
}
