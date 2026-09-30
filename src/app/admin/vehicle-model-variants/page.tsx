"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleModelVariantsSection } from "@/components/vehicle-management/VehicleModelVariantsSection";

export default function VehicleModelVariantsPage() {
  return (
    <AppShell title="Vehicle Model Variants">
      <PageContainer>
        <VehicleModelVariantsSection />
      </PageContainer>
    </AppShell>
  );
}
