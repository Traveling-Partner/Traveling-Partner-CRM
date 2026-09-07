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
import { useDriverDetailQuery } from "@/hooks/queries/use-driver-detail-query";
import { queryKeys } from "@/lib/api/query-keys";
import { updateDriverProfile } from "@/services/users";
import {
  ProfileEditForm,
  toProfileUpdateBody,
  type ProfileEditValues
} from "@/components/admin/users/ProfileEditForm";
import TPLoader from "@/components/TPLoader";

export default function AdminEditDriverPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const { data, isLoading, isError } = useDriverDetailQuery(params.id);
  const driver = data?.driver ?? null;

  const defaultValues = useMemo<ProfileEditValues | null>(() => {
    if (!driver) return null;
    return {
      firstName: driver.basicInformation?.firstName || "",
      lastName: driver.basicInformation?.lastName || "",
      email: driver.basicInformation?.email || driver.email || "",
      mobileNumber: driver.mobileNumber || "",
      whatsApp: driver.basicInformation?.whatsApp || "",
      gender: driver.basicInformation?.gender || "Male",
      city: driver.basicInformation?.city || "",
      cnicNumber: driver.basicInformation?.cnicNumber || ""
    };
  }, [driver]);

  const mutation = useApiMutation({
    mutationFn: ({ token, variables }: { token: string; variables: ProfileEditValues }) =>
      updateDriverProfile(params.id, toProfileUpdateBody(variables), { token }),
    invalidateKeys: [queryKeys.users.driverDetail(params.id), queryKeys.users.all],
    onSuccess: () => {
      success("Driver updated.");
      router.push(`/admin/drivers/${params.id}`);
    },
    onError: (err) => error(err.message)
  });

  if (!isLoading && (isError || !driver || !defaultValues)) {
    return (
      <AppShell title="Edit driver">
        <PageContainer>
          <EmptyState
            title="Driver not found"
            description="This driver could not be loaded."
            actionLabel="Back"
            onActionClick={() => router.push("/admin/drivers")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit driver">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/drivers/${params.id}`} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to driver
            </Link>
          </Button>
        </div>
        <SectionCard title="Edit driver profile" description="Saves via PUT /users/drivers/update/{id}. License and vehicle docs are unchanged.">
          {isLoading || !defaultValues ? (
            <div className="flex justify-center py-10">
              <TPLoader variant="inline" size={120} label="Loading…" />
            </div>
          ) : (
            <ProfileEditForm
              key={driver?.id}
              defaultValues={defaultValues}
              saving={mutation.isPending}
              submitLabel="Save driver"
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
