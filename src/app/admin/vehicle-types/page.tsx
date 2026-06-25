"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { VehicleTypesSection } from "@/components/vehicle-management/VehicleTypesSection";

export default function VehicleTypesPage() {
  return (
    <AppShell title="Vehicle Types">
      <PageContainer>
        <div className="px-1">
          <h1 className="text-lg font-heading font-bold text-foreground sm:text-xl">Vehicle Types</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage ride categories with operational defaults.
          </p>
        </div>
        <VehicleTypesSection />
      </PageContainer>
    </AppShell>
  );
}
