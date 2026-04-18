import { z } from "zod";
import type { BlogUpsertPayload } from "@/services/blog";

export const blogEditorSchema = z.object({
  coverImage: z.string().min(4, "Cover image is required"),
  mainTitle: z.string().min(4, "Main title is required"),
  description1: z.string().min(10, "Description is required"),
  description2: z.string().min(10, "Detailed content is required"),
  date: z.string().min(1, "Date is required"),
  author: z.string().min(2, "Author is required"),
  categoryId: z.coerce.number().int().positive("Category ID must be greater than 0"),
  readTime: z.string().min(2, "Read time is required"),
  tagsText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"])
});

export type BlogEditorFormValues = z.infer<typeof blogEditorSchema>;

export function buildBlogUpsertPayload(
  values: BlogEditorFormValues,
  status: "DRAFT" | "PUBLISHED"
): BlogUpsertPayload {
  const tags = (values.tagsText ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    coverImage: values.coverImage.trim(),
    mainTitle: values.mainTitle.trim(),
    seoTitle: (values.seoTitle ?? "").trim(),
    seoDescription: (values.seoDescription ?? "").trim(),
    status,
    description1: values.description1.trim(),
    description2: values.description2.trim(),
    date: values.date,
    author: values.author.trim(),
    readTime: values.readTime.trim(),
    tags,
    categoryId: values.categoryId
  };
}

export function normalizeBlogStatusForForm(api: string | null | undefined): "DRAFT" | "PUBLISHED" {
  const u = (api ?? "").toUpperCase();
  if (u === "PUBLISHED" || u === "ACTIVE") return "PUBLISHED";
  return "DRAFT";
}
