import { z } from "zod";
import type { BlogApiRecord, BlogFaqPayload, BlogUpsertPayload } from "@/services/blog";
import { pickWebsiteBlogFields } from "@/services/blog";
import { normalizeCategoryNames } from "@/lib/blog-categories";
import { formatRelativePostTime } from "@/lib/format-relative-post-time";

export const blogEditorSchema = z.object({
  coverImage: z.string().min(4, "Cover image is required"),
  mainTitle: z.string().min(4, "Main title is required"),
  description1: z.string().optional(),
  description2: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  author: z.string().min(2, "Author is required"),
  categoryNames: z.array(z.string().trim().min(1)).min(1, "Select at least one category"),
  tagsText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  faqs: z
    .array(
      z.object({
        question: z.string().optional(),
        answer: z.string().optional()
      })
    )
    .optional()
});

export type BlogEditorFormValues = z.infer<typeof blogEditorSchema>;

function buildFaqPayload(values: BlogEditorFormValues): BlogFaqPayload[] {
  return (values.faqs ?? [])
    .map((item, index) => ({
      question: (item.question ?? "").trim(),
      answer: (item.answer ?? "").trim(),
      sortOrder: index + 1
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0);
}

export function buildBlogUpsertPayload(
  values: BlogEditorFormValues,
  status: "DRAFT" | "PUBLISHED",
  existing?: BlogApiRecord | null
): BlogUpsertPayload {
  const tags = (values.tagsText ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const faqs = buildFaqPayload(values);
  const preserved = pickWebsiteBlogFields(existing);

  return {
    ...preserved,
    coverImage: values.coverImage.trim(),
    mainTitle: values.mainTitle.trim(),
    seoTitle: (values.seoTitle ?? "").trim(),
    seoDescription: (values.seoDescription ?? "").trim(),
    status,
    description1: (values.description1 ?? "").trim() || null,
    description2: (values.description2 ?? "").trim() || null,
    date: values.date,
    author: values.author.trim(),
    readTime: formatRelativePostTime(values.date),
    tags,
    categoryName: normalizeCategoryNames(values.categoryNames),
    faqs
  };
}

export function faqsFromApi(faqs: BlogFaqPayload[] | null | undefined) {
  if (!Array.isArray(faqs) || faqs.length === 0) return [];
  return [...faqs]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      question: item.question ?? "",
      answer: item.answer ?? ""
    }));
}

export function normalizeBlogStatusForForm(api: string | null | undefined): "DRAFT" | "PUBLISHED" {
  const u = (api ?? "").toUpperCase();
  if (u === "PUBLISHED" || u === "ACTIVE") return "PUBLISHED";
  return "DRAFT";
}
