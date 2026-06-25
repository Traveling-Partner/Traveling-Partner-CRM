"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { taxManagementItems } from "@/mock-data/tax-management";

export default function TaxManagementPage() {
  return (
    <PercentageManagementView
      pageTitle="Tax Management"
      sectionTitle="Tax Management"
      sectionDescription="Configure tax rates applied to rides and services. Data is mock until API integration."
      entityLabel="Tax"
      searchPlaceholder="Search taxes..."
      initialData={taxManagementItems}
    />
  );
}
