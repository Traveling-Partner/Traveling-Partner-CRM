"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleBrandsSection } from "@/components/vehicle-management/VehicleBrandsSection";

export default function VehicleBrandsPage() {
  return (
    <AppShell title="Vehicle Brands">
      <PageContainer>
        <VehicleBrandsSection />
      </PageContainer>
    </AppShell>
  );
}
