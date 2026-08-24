"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { useInsuranceManagement } from "@/hooks/percentage-management/useInsuranceManagement";

export default function InsuranceManagementPage() {
  const controller = useInsuranceManagement();

  return (
    <PercentageManagementView
      pageTitle="Insurance Management"
      sectionTitle="Insurance Management"
      sectionDescription="Configure insurance coverage rates and premiums."
      entityLabel="Insurance"
      searchPlaceholder="Search insurance plans..."
      controller={controller}
    />
  );
}
