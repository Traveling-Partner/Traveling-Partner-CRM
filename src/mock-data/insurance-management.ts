import type { PercentageManagementItem } from "@/types/percentage-management";

export const insuranceManagementItems: PercentageManagementItem[] = [
  { id: "insurance-1", name: "Passenger Liability Cover", percentage: 2, status: "ACTIVE" },
  { id: "insurance-2", name: "Driver Accident Cover", percentage: 1.5, status: "ACTIVE" },
  { id: "insurance-3", name: "Vehicle Damage Waiver", percentage: 3.25, status: "ACTIVE" },
  { id: "insurance-4", name: "Trip Cancellation Cover", percentage: 0.5, status: "INACTIVE" },
  { id: "insurance-5", name: "Comprehensive Fleet Cover", percentage: 4, status: "ACTIVE" },
  { id: "insurance-6", name: "Medical Emergency Cover", percentage: 1.25, status: "INACTIVE" }
];
