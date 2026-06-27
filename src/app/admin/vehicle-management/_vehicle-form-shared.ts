import { z } from "zod";

export const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING", "APPROVED"] as const;

export const DEFAULT_VEHICLE_PAGE_SIZE = 6;

export const PAGE_SIZE_OPTIONS = ["6", "10", "20", "50"] as const;

export const vehicleTypeSchema = z.object({
  name: z.string().trim().min(1, "Vehicle type name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

export const modelSchema = z.object({
  name: z.string().trim().min(1, "Model name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

export const colorSchema = z.object({
  name: z.string().trim().min(1, "Color name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required."),
  vehicleTypeId: z.coerce.number().min(1, "Vehicle type is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

export type VehicleTypeForm = z.infer<typeof vehicleTypeSchema>;
export type ModelForm = z.infer<typeof modelSchema>;
export type ColorForm = z.infer<typeof colorSchema>;
export type BrandForm = z.infer<typeof brandSchema>;

export type VehicleQueryTab = "types" | "models" | "colors" | "brands";
