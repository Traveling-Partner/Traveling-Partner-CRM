import type { PercentageManagementItem } from "@/types/percentage-management";

export const platformFeeManagementItems: PercentageManagementItem[] = [
  { id: "platform-fee-1", name: "Standard Platform Fee", percentage: 20, status: "ACTIVE" },
  { id: "platform-fee-2", name: "Peak Hour Surcharge", percentage: 5, status: "ACTIVE" },
  { id: "platform-fee-3", name: "Long Distance Fee", percentage: 3.5, status: "ACTIVE" },
  { id: "platform-fee-4", name: "Express Booking Fee", percentage: 2, status: "INACTIVE" },
  { id: "platform-fee-5", name: "International Route Fee", percentage: 7.5, status: "ACTIVE" }
];
