"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleModelsSection } from "@/components/vehicle-management/VehicleModelsSection";

export default function VehicleModelsPage() {
  return (
    <AppShell title="Vehicle Models">
      <PageContainer>
        <VehicleModelsSection />
      </PageContainer>
    </AppShell>
  );
}
