"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { NewsletterEditorPanel } from "@/components/newsletter/NewsletterEditorPanel";
import { uploadContactDocument } from "@/lib/upload-contact-document";
import { createNewsletter } from "@/services/newsletter";
import {
  newsletterEditorSchema,
  type NewsletterEditorFormValues,
  buildNewsletterUpsertPayload
} from "@/app/admin/newsletter/_newsletter-form-shared";

const FALLBACK_ATTACHMENT = "/mock-images/document-fallback.svg";

export default function AdminNewsletterCreatePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const { success, error: showError } = useToast();

  const [attachmentPreview, setAttachmentPreview] = useState(FALLBACK_ATTACHMENT);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<NewsletterEditorFormValues>({
    resolver: zodResolver(newsletterEditorSchema),
    defaultValues: {
      message: "",
      attachedFile: "",
      status: "DRAFT"
    }
  });

  const submitWithStatus = async (
    values: NewsletterEditorFormValues,
    nextStatus: "DRAFT" | "PUBLISHED"
  ) => {
    setSubmitting(true);
    try {
      const payload = buildNewsletterUpsertPayload(values, nextStatus, authUser);
      await createNewsletter(payload, token);
      success(`Newsletter saved successfully.`);
      router.push("/admin/newsletter");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create newsletter.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = handleSubmit((vals) => void submitWithStatus(vals, "DRAFT"));
  const publish = handleSubmit((vals) => void submitWithStatus(vals, "PUBLISHED"));

  const onAttachmentChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const inputEl = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachmentUploading(true);
    try {
      const url = await uploadContactDocument(file, token);
      setValue("attachedFile", url, { shouldValidate: true, shouldDirty: true });
      setAttachmentPreview(url);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to upload attachment.");
    } finally {
      setAttachmentUploading(false);
      inputEl.value = "";
    }
  };

  return (
    <AppShell title="Create Newsletter">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/newsletter" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to newsletter
            </Link>
          </Button>
        </div>

        <NewsletterEditorPanel
          register={register}
          errors={errors}
          attachmentPreview={attachmentPreview}
          attachmentUploading={attachmentUploading}
          onAttachmentChange={onAttachmentChange}
          submitting={submitting}
          onSaveDraft={() => void saveDraft()}
          onPublish={() => void publish()}
        />
      </PageContainer>
    </AppShell>
  );
}
