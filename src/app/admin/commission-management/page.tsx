"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { useCommissionManagement } from "@/hooks/percentage-management/useCommissionManagement";

export default function CommissionManagementPage() {
  const controller = useCommissionManagement();

  return (
    <PercentageManagementView
      pageTitle="Commission Management"
      sectionTitle="Commission Management"
      sectionDescription="Configure commission percentages for agents and partners."
      entityLabel="Commission"
      searchPlaceholder="Search commissions..."
      controller={controller}
    />
  );
}
