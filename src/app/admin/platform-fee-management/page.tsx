"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { platformFeeManagementItems } from "@/mock-data/platform-fee-management";

export default function PlatformFeeManagementPage() {
  return (
    <PercentageManagementView
      pageTitle="Platform Fee Management"
      sectionTitle="Platform Fee Management"
      sectionDescription="Configure platform fee percentages charged on bookings. Data is mock until API integration."
      entityLabel="Platform Fee"
      searchPlaceholder="Search platform fees..."
      initialData={platformFeeManagementItems}
    />
  );
}
