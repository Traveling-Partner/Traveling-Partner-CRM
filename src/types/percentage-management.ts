export type PercentageManagementStatus = "ACTIVE" | "INACTIVE";

export interface PercentageManagementItem {
  id: string;
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}

export interface PercentageManagementFormValues {
  name: string;
  percentage: number;
  status: PercentageManagementStatus;
}
