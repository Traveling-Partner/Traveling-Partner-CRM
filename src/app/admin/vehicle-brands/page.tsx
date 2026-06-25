"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleBrandsSection } from "@/components/vehicle-management/VehicleBrandsSection";

export default function VehicleBrandsPage() {
  return (
    <AppShell title="Vehicle Brands">
      <PageContainer>
        <div className="px-1">
          <h1 className="text-lg font-heading font-bold text-foreground sm:text-xl">Vehicle Brands</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage vehicle brands mapped to vehicle types.
          </p>
        </div>
        <VehicleBrandsSection />
      </PageContainer>
    </AppShell>
  );
}
