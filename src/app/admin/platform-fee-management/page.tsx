"use client";

import { PercentageManagementView } from "@/components/percentage-management/PercentageManagementView";
import { usePlatformFeeManagement } from "@/hooks/percentage-management/usePlatformFeeManagement";

export default function PlatformFeeManagementPage() {
  const controller = usePlatformFeeManagement();

  return (
    <PercentageManagementView
      pageTitle="Platform Fee Management"
      sectionTitle="Platform Fee Management"
      sectionDescription="Configure platform fee percentages charged on bookings."
      entityLabel="Platform Fee"
      searchPlaceholder="Search platform fees..."
      controller={controller}
    />
  );
}
