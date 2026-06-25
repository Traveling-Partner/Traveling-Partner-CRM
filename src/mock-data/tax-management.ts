import type { PercentageManagementItem } from "@/types/percentage-management";

export const taxManagementItems: PercentageManagementItem[] = [
  { id: "tax-1", name: "Standard VAT", percentage: 15, status: "ACTIVE" },
  { id: "tax-2", name: "City Service Tax", percentage: 2.5, status: "ACTIVE" },
  { id: "tax-3", name: "Tourism Levy", percentage: 1, status: "INACTIVE" },
  { id: "tax-4", name: "Airport Surcharge Tax", percentage: 3, status: "ACTIVE" },
  { id: "tax-5", name: "Regional Transit Tax", percentage: 0.75, status: "INACTIVE" },
  { id: "tax-6", name: "Luxury Ride Tax", percentage: 5, status: "ACTIVE" }
];
