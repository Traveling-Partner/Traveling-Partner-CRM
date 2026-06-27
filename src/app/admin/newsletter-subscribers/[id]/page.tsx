"use client";

<<<<<<< Updated upstream
import { useMemo } from "react";
=======
<<<<<<< HEAD
import { useMemo, useState } from "react";
=======
import { useMemo } from "react";
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { getNewsletterSubscriberById } from "@/mock-data/newsletter-subscribers";
import type { SentNewsletterRecord } from "@/types/newsletter-subscribers";

const SENT_NEWSLETTERS_PAGE_SIZE = 5;

=======
>>>>>>> Stashed changes
import { StatusBadge } from "@/components/ui/status-badge";
import { getNewsletterSubscriberById } from "@/mock-data/newsletter-subscribers";
import type { SentNewsletterRecord } from "@/types/newsletter-subscribers";

<<<<<<< Updated upstream
=======
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function truncateMessage(value: string | null | undefined, max = 80): string {
  const text = value?.trim() || "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export default function NewsletterSubscriberDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const subscriber = getNewsletterSubscriberById(params.id);
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  const [sentPage, setSentPage] = useState(0);
  const [sentPageSize, setSentPageSize] = useState(SENT_NEWSLETTERS_PAGE_SIZE);
=======
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes

  const sentColumns: ColumnDef<SentNewsletterRecord>[] = useMemo(
    () => [
      {
        accessorKey: "message",
        header: "Newsletter",
        cell: ({ row }) => (
          <p className="text-sm font-medium">{truncateMessage(row.original.message, 100)}</p>
        )
      },
      {
        accessorKey: "newsletterId",
        header: "Newsletter ID",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            #{row.original.newsletterId}
          </span>
        )
      },
      {
        accessorKey: "sentAt",
        header: "Sent Date",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {formatDateTime(row.original.sentAt)}
          </span>
        )
      }
    ],
    []
  );

  if (!subscriber) {
    return (
      <AppShell title="Newsletter Subscribers">
        <PageContainer>
          <EmptyState
            title="Subscriber not found"
            description="This subscriber record could not be found."
            actionLabel="Back to subscribers"
            onActionClick={() => router.push("/admin/newsletter-subscribers")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const sortedSentNewsletters = [...subscriber.sentNewsletters].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  const sentTotalPages = Math.max(1, Math.ceil(sortedSentNewsletters.length / sentPageSize));
  const safeSentPage = Math.min(sentPage, Math.max(0, sentTotalPages - 1));
  const paginatedSentNewsletters = sortedSentNewsletters.slice(
    safeSentPage * sentPageSize,
    safeSentPage * sentPageSize + sentPageSize
  );
=======
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes

  return (
    <AppShell title="Newsletter Subscribers">
      <PageContainer>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/newsletter-subscribers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to subscribers
            </Link>
          </Button>
        </div>

        <SectionCard
          title={subscriber.name?.trim() || subscriber.email}
          description="Subscriber profile and newsletter delivery history."
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium text-muted-foreground">Email address</dt>
              <dd className="text-sm font-medium text-foreground">{subscriber.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium text-muted-foreground">Subscription date</dt>
              <dd className="text-sm text-foreground tabular-nums">
                {formatDateTime(subscriber.subscriptionDate)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge
                  status={subscriber.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                />
              </dd>
            </div>
            <div className="space-y-1">
<<<<<<< Updated upstream
              <dt className="text-xs font-medium text-muted-foreground">Total newsletters received</dt>
=======
<<<<<<< HEAD
              <dt className="text-xs font-medium text-muted-foreground">
                Total newsletters received
              </dt>
=======
              <dt className="text-xs font-medium text-muted-foreground">Total newsletters received</dt>
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
              <dd className="text-sm font-medium tabular-nums">
                {subscriber.sentNewsletters.length}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Newsletters sent"
          description="Published newsletters delivered to this subscriber."
        >
          {sortedSentNewsletters.length === 0 ? (
            <EmptyState
              title="No newsletters sent yet"
              description="This subscriber has not received any published newsletters."
            />
          ) : (
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
            <>
              <DataTable
                columns={sentColumns}
                data={paginatedSentNewsletters}
                getRowId={(row) => `${row.newsletterId}-${row.sentAt}`}
              />
              {sortedSentNewsletters.length > 0 && (
                <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Show</span>
                    <Select
                      value={String(sentPageSize)}
                      onValueChange={(value) => {
                        setSentPageSize(Number(value));
                        setSentPage(0);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[4.5rem] border-border/40 bg-background text-xs shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>per page</span>
                    <span>
                      · Showing {safeSentPage * sentPageSize + 1}–
                      {Math.min((safeSentPage + 1) * sentPageSize, sortedSentNewsletters.length)} of{" "}
                      {sortedSentNewsletters.length}
                    </span>
                  </div>
                  <PaginationControls
                    currentPage={safeSentPage + 1}
                    totalPages={sentTotalPages}
                    onPageChange={(nextPage) => setSentPage(nextPage - 1)}
                  />
                </div>
              )}
            </>
=======
>>>>>>> Stashed changes
            <DataTable
              columns={sentColumns}
              data={sortedSentNewsletters}
              getRowId={(row) => `${row.newsletterId}-${row.sentAt}`}
            />
<<<<<<< Updated upstream
=======
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
