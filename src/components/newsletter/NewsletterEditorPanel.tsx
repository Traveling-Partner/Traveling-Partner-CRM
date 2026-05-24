"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { SectionCard } from "@/components/common/SectionCard";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentPreview } from "@/components/content/AttachmentPreview";
import type { NewsletterEditorFormValues } from "@/app/admin/newsletter/_newsletter-form-shared";

interface NewsletterEditorPanelProps {
  register: UseFormRegister<NewsletterEditorFormValues>;
  errors: FieldErrors<NewsletterEditorFormValues>;
  attachmentPreview: string;
  attachmentUploading: boolean;
  onAttachmentChange: React.ChangeEventHandler<HTMLInputElement>;
  submitting: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

/** Shared create/edit layout — mirrors blog two-column editor structure. */
export function NewsletterEditorPanel({
  register,
  errors,
  attachmentPreview,
  attachmentUploading,
  onAttachmentChange,
  submitting,
  onSaveDraft,
  onPublish
}: NewsletterEditorPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <SectionCard
          title="Newsletter content"
          description="Message shown to recipients."
        >
          <div className="space-y-4">
            <input type="hidden" {...register("attachedFile")} />
            <FormField
              label="Message"
              htmlFor="message"
              required
              error={errors.message}
              description="Short summary shown in the newsletter list."
            >
              <Textarea
                id="message"
                rows={6}
                placeholder="New discount available for all people"
                {...register("message")}
              />
            </FormField>
            {/* Blog parity: rich HTML body — not used for newsletter API yet.
            <BlogRichEditor value={...} onChange={...} />
            */}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard
          title="Attachment preview"
          description="Upload an image or PDF."
        >
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={onAttachmentChange}
              disabled={attachmentUploading}
            />
            {attachmentUploading ? (
              <p className="text-xs text-muted-foreground">Uploading attachment...</p>
            ) : null}
            {attachmentPreview ? (
              <AttachmentPreview
                url={attachmentPreview}
                title="Newsletter attachment"
                heightClassName="h-40"
              />
            ) : null}
            {errors.attachedFile ? (
              <p className="text-xs text-destructive">{errors.attachedFile.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                URL is set automatically after upload.
              </p>
            )}
          </div>
        </SectionCard>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting || attachmentUploading}
            onClick={onSaveDraft}
          >
            {submitting ? "Saving..." : "Save draft"}
          </Button>
          <Button
            type="button"
            disabled={submitting || attachmentUploading}
            onClick={onPublish}
          >
            {submitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
