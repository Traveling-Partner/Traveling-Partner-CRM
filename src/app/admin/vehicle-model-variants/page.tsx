"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleModelVariantsSection } from "@/components/vehicle-management/VehicleModelVariantsSection";

export default function VehicleModelVariantsPage() {
  return (
    <AppShell title="Vehicle Model Variants">
      <PageContainer>
        <div className="px-1">
          <h1 className="text-lg font-heading font-bold text-foreground sm:text-xl">Vehicle Model Variants</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage vehicle model variants mapped to models.
          </p>
        </div>
        <VehicleModelVariantsSection />
      </PageContainer>
    </AppShell>
  );
}
