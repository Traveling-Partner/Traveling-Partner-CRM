"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { useCommissionManagement } from "@/hooks/percentage-management/useCommissionManagement";

export default function CommissionManagementPage() {
  const controller = useCommissionManagement();

  return (
    <PercentageManagementView
      pageTitle="App Commission"
      sectionTitle="App Commission"
      sectionDescription="Configure commission percentages for agents and partners."
      entityLabel="Commission"
      searchPlaceholder="Search commissions..."
      controller={controller}
    />
  );
}
