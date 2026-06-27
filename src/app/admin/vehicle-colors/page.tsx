"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleColorsSection } from "@/components/vehicle-management/VehicleColorsSection";

export default function VehicleColorsPage() {
  return (
    <AppShell title="Vehicle Colors">
      <PageContainer>
        <div className="px-1">
          <h1 className="text-lg font-heading font-bold text-foreground sm:text-xl">Vehicle Colors</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage vehicle colors mapped to types and models.
          </p>
        </div>
        <VehicleColorsSection />
      </PageContainer>
    </AppShell>
  );
}
