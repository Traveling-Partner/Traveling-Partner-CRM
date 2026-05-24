import { z } from "zod";
import type { NewsletterUpsertPayload } from "@/services/newsletter";
import { buildNewsletterAuthFields } from "@/services/newsletter";
import type { AuthUser } from "@/store/slices/authSlice";

export const newsletterEditorSchema = z.object({
  message: z.string().trim().min(4, "Message is required (at least 4 characters)."),
  attachedFile: z.string().trim().min(4, "Attachment is required."),
  status: z.enum(["DRAFT", "PUBLISHED"])
});

export type NewsletterEditorFormValues = z.infer<typeof newsletterEditorSchema>;

export function buildNewsletterUpsertPayload(
  values: NewsletterEditorFormValues,
  status: "DRAFT" | "PUBLISHED",
  user: AuthUser | null
): NewsletterUpsertPayload {
  return {
    message: values.message.trim(),
    attachedFile: values.attachedFile.trim(),
    status,
    ...buildNewsletterAuthFields(user)
  };
}

export function normalizeNewsletterStatusForForm(
  api: string | null | undefined
): "DRAFT" | "PUBLISHED" {
  const u = (api ?? "").toUpperCase();
  if (u === "PUBLISHED" || u === "ACTIVE" || u === "SENT") return "PUBLISHED";
  return "DRAFT";
}

/*
 * Blog-only fields preserved for future parity (categories, SEO, rich editor, tags).
 * Newsletter intentionally uses message + attachment only; see Blog module:
 *   src/app/admin/blog/_blog-form-shared.ts
 *   src/components/blog/BlogRichEditor.tsx
 */
