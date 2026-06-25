"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { insuranceManagementItems } from "@/mock-data/insurance-management";

export default function InsuranceManagementPage() {
  return (
    <PercentageManagementView
      pageTitle="Insurance Management"
      sectionTitle="Insurance Management"
      sectionDescription="Configure insurance coverage rates and premiums. Data is mock until API integration."
      entityLabel="Insurance"
      searchPlaceholder="Search insurance plans..."
      initialData={insuranceManagementItems}
    />
  );
}
