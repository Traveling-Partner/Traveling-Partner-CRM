"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleTypesSection } from "@/components/vehicle-management/VehicleTypesSection";

export default function VehicleTypesPage() {
  return (
    <AppShell title="Vehicle Types">
      <PageContainer>
        <VehicleTypesSection />
      </PageContainer>
    </AppShell>
  );
}
