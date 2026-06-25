import type { PercentageManagementItem } from "@/types/percentage-management";

export const commissionManagementItems: PercentageManagementItem[] = [
  { id: "commission-mgmt-1", name: "Agent Base Commission", percentage: 12, status: "ACTIVE" },
  { id: "commission-mgmt-2", name: "Partner Referral Commission", percentage: 8, status: "ACTIVE" },
  { id: "commission-mgmt-3", name: "Premium Tier Commission", percentage: 15, status: "ACTIVE" },
  { id: "commission-mgmt-4", name: "Seasonal Promo Commission", percentage: 10, status: "INACTIVE" },
  { id: "commission-mgmt-5", name: "Corporate Account Commission", percentage: 6.5, status: "ACTIVE" }
];
