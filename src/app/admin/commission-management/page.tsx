"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { commissionManagementItems } from "@/mock-data/commission-management";

export default function CommissionManagementPage() {
  return (
    <PercentageManagementView
      pageTitle="Commission Management"
      sectionTitle="Commission Management"
      sectionDescription="Configure commission percentages for agents and partners. Data is mock until API integration."
      entityLabel="Commission"
      searchPlaceholder="Search commissions..."
      initialData={commissionManagementItems}
    />
  );
}
