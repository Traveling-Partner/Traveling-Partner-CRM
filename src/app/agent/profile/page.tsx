"use client";

import { Copy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSalesAgentProfileQuery } from "@/hooks/queries/use-sales-agent";
import { showPhone } from "@/lib/format-ids";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function AgentProfilePage() {
  const { data, isLoading, error } = useSalesAgentProfileQuery();
  const { success } = useToast();
  const loading = isLoading && !data;
  const initials = (data?.name || "SA")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const copyReferral = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    success("Referral code copied.");
  };

  return (
    <AppShell title="Profile">
      <PageContainer>
        {error ? (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-40" />
          </div>
        ) : error || !data ? (
          <EmptyState
            title="Profile not available"
            description={error?.message || "Your sales agent profile could not be loaded."}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard
              title="Profile"
              description="Your account details from the sales agent API."
              className="lg:col-span-2"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813] text-2xl font-heading font-bold text-slate-900 shadow-md">
                  {initials}
                </div>
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <Field label="Full name" value={data.name || "—"} />
                  <Field label="Phone" value={showPhone(data.mobileNumber)} />
                  <Field label="Email" value={data.email || "—"} />
                  <Field label="City" value={data.city || "—"} />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Referral code"
              description="Share this code when registering drivers or partners."
            >
              <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your code
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-background px-3 py-2 font-mono text-sm font-semibold">
                    {data.referralCode || "—"}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyReferral}
                    disabled={!data.referralCode}
                    aria-label="Copy referral code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
