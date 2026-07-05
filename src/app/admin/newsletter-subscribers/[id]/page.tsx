"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useNewsletterSubscriberDetailQuery } from "@/hooks/queries/use-newsletter-subscriber-detail-query";
import type { SubscriberNewsletterRow } from "@/services/newsletter-subscribers";

const SENT_NEWSLETTERS_PAGE_SIZE = 5;

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

function getSentDate(row: SubscriberNewsletterRow): string | null {
  return row.sentAt ?? row.deliveredAt ?? null;
}

export default function NewsletterSubscriberDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [sentPage, setSentPage] = useState(0);
  const [sentPageSize, setSentPageSize] = useState(SENT_NEWSLETTERS_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useNewsletterSubscriberDetailQuery({
    id: params.id,
    page: sentPage,
    pageSize: sentPageSize
  });

  const loading = isLoading || isFetching;

  const sentColumns: ColumnDef<SubscriberNewsletterRow>[] = useMemo(
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
        id: "sentAt",
        header: "Sent Date",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {formatDateTime(getSentDate(row.original))}
          </span>
        )
      }
    ],
    []
  );

  if (!loading && !data && !error) {
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

  const newsletters = data?.newsletters ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? sentPage;

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

        {error ? (
          <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        ) : null}

        <SectionCard
          title={
            loading
              ? "Loading…"
              : data?.fullName?.trim() || data?.subscriberEmail || "Subscriber"
          }
          description="Subscriber profile and newsletter delivery history."
        >
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-md bg-muted/60" />
              ))}
            </div>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Email address</dt>
                <dd className="text-sm font-medium text-foreground">{data?.subscriberEmail}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Subscription date</dt>
                <dd className="text-sm text-foreground tabular-nums">
                  {formatDateTime(data?.subscribedAt)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={data?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"} />
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Total newsletters received
                </dt>
                <dd className="text-sm font-medium tabular-nums">
                  {data?.totalNewslettersReceived ?? 0}
                </dd>
              </div>
            </dl>
          )}
        </SectionCard>

        <SectionCard
          title="Newsletters sent"
          description="Published newsletters delivered to this subscriber."
        >
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 w-full animate-pulse rounded-md bg-muted/60" />
              ))}
            </div>
          ) : totalElements === 0 ? (
            <EmptyState
              title="No newsletters sent yet"
              description="This subscriber has not received any published newsletters."
            />
          ) : (
            <>
              <DataTable
                columns={sentColumns}
                data={newsletters}
                getRowId={(row) => String(row.newsletterId)}
              />
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
                    · Showing {currentPage * sentPageSize + 1}–
                    {Math.min((currentPage + 1) * sentPageSize, totalElements)} of {totalElements}
                  </span>
                </div>
                <PaginationControls
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => setSentPage(nextPage - 1)}
                />
              </div>
            </>
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
