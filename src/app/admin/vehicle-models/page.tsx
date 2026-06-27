"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleModelsSection } from "@/components/vehicle-management/VehicleModelsSection";

export default function VehicleModelsPage() {
  return (
    <AppShell title="Vehicle Models">
      <PageContainer>
        <div className="px-1">
          <h1 className="text-lg font-heading font-bold text-foreground sm:text-xl">Vehicle Models</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Model years for marketplace availability.
          </p>
        </div>
        <VehicleModelsSection />
      </PageContainer>
    </AppShell>
  );
}
