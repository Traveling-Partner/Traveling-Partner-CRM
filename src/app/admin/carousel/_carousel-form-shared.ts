import { z } from "zod";

export const carouselFormSchema = z.object({
  bannerTitle: z.string().trim().min(2, "Title must be at least 2 characters."),
  bannerImage: z
    .string()
    .trim()
    .url("Cover image must be a valid URL (https://example.com/image.jpg).")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Use a public http/https image URL only (base64 data URLs are not supported)."
    ),
  bannerDescription: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters.")
});

export type CarouselFormValues = z.infer<typeof carouselFormSchema>;
