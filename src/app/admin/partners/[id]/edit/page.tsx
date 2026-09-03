"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { usePartnerDetailQuery } from "@/hooks/queries/use-partner-detail-query";
import { queryKeys } from "@/lib/api/query-keys";
import { updatePartnerProfile } from "@/services/users";
import {
  ProfileEditForm,
  toProfileUpdateBody,
  type ProfileEditValues
} from "@/components/admin/users/ProfileEditForm";
import TPLoader from "@/components/TPLoader";

export default function AdminEditPartnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const { data: partner, isLoading, isError } = usePartnerDetailQuery(params.id);

  const defaultValues = useMemo<ProfileEditValues | null>(() => {
    if (!partner) return null;
    return {
      firstName: partner.basicInformation?.firstName || "",
      lastName: partner.basicInformation?.lastName || "",
      email: partner.basicInformation?.email || partner.email || "",
      mobileNumber: partner.mobileNumber || "",
      whatsApp: partner.basicInformation?.whatsApp || "",
      gender: partner.basicInformation?.gender || "Male",
      city: partner.basicInformation?.city || "",
      cnicNumber: partner.basicInformation?.cnicNumber || ""
    };
  }, [partner]);

  const mutation = useApiMutation({
    mutationFn: ({ token, variables }: { token: string; variables: ProfileEditValues }) =>
      updatePartnerProfile(params.id, toProfileUpdateBody(variables), { token }),
    invalidateKeys: [queryKeys.users.partnerDetail(params.id), queryKeys.users.all],
    onSuccess: () => {
      success("Partner updated.");
      router.push(`/admin/partners/${params.id}`);
    },
    onError: (err) => error(err.message)
  });

  if (!isLoading && (isError || !partner || !defaultValues)) {
    return (
      <AppShell title="Edit partner">
        <PageContainer>
          <EmptyState
            title="Partner not found"
            description="This partner could not be loaded."
            actionLabel="Back"
            onActionClick={() => router.push("/admin/partners")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit partner">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/partners/${params.id}`} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to partner
            </Link>
          </Button>
        </div>
        <SectionCard title="Edit partner profile" description="Saves via PUT /users/partners/update/{id}. Send only changed fields.">
          {isLoading || !defaultValues ? (
            <div className="flex justify-center py-10">
              <TPLoader variant="inline" size={120} label="Loading…" />
            </div>
          ) : (
            <ProfileEditForm
              key={partner?.id}
              defaultValues={defaultValues}
              saving={mutation.isPending}
              submitLabel="Save partner"
              onSubmit={async (values) => {
                await mutation.mutateAsync(values);
              }}
            />
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
