"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { useTaxManagement } from "@/hooks/percentage-management/useTaxManagement";

export default function TaxManagementPage() {
  const controller = useTaxManagement();

  return (
    <PercentageManagementView
      pageTitle="Tax Management"
      sectionTitle="Tax Management"
      sectionDescription="Configure tax rates applied to rides and services."
      entityLabel="Tax"
      searchPlaceholder="Search taxes..."
      controller={controller}
    />
  );
}
