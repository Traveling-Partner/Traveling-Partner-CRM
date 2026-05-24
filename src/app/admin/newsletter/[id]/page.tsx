"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { NewsletterEditorPanel } from "@/components/newsletter/NewsletterEditorPanel";
import { uploadContactDocument } from "@/lib/upload-contact-document";
import { updateNewsletter } from "@/services/newsletter";
import { useNewsletterDetailQuery } from "@/hooks/queries/use-newsletter-detail-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import {
  newsletterEditorSchema,
  type NewsletterEditorFormValues,
  buildNewsletterUpsertPayload,
  normalizeNewsletterStatusForForm
} from "@/app/admin/newsletter/_newsletter-form-shared";

const FALLBACK_ATTACHMENT = "/mock-images/document-fallback.svg";

export default function AdminNewsletterEditPage() {
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const { success, error: showError } = useToast();

  const { data: row, isLoading, isError } = useNewsletterDetailQuery(
    Number.isFinite(idNum) ? idNum : undefined
  );

  const [attachmentPreview, setAttachmentPreview] = useState(FALLBACK_ATTACHMENT);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<NewsletterEditorFormValues>({
    resolver: zodResolver(newsletterEditorSchema),
    defaultValues: {
      message: "",
      attachedFile: "",
      status: "DRAFT"
    }
  });

  const message = watch("message");

  useEffect(() => {
    if (!row) return;
    reset({
      message: row.message?.trim() || "",
      attachedFile: row.attachedFile?.trim() || "",
      status: normalizeNewsletterStatusForForm(row.status)
    });
    setAttachmentPreview(row.attachedFile?.trim() || FALLBACK_ATTACHMENT);
  }, [row, reset]);

  const submitWithStatus = async (
    values: NewsletterEditorFormValues,
    nextStatus: "DRAFT" | "PUBLISHED"
  ) => {
    if (!Number.isFinite(idNum)) return;
    setSubmitting(true);
    try {
      const payload = buildNewsletterUpsertPayload(values, nextStatus, authUser);
      await updateNewsletter(idNum, payload, token);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.newsletter.detail(idNum)
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all });
      success("Newsletter updated.");
      router.push("/admin/newsletter");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to update newsletter.");
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

  if (isLoading) {
    return (
      <AppShell title="Edit Newsletter">
        <PageContainer>
          <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
        </PageContainer>
      </AppShell>
    );
  }

  if (isError || !row || !Number.isFinite(idNum)) {
    return (
      <AppShell title="Edit Newsletter">
        <PageContainer>
          <SectionCard
            title="Newsletter not found"
            description="This newsletter could not be loaded. Check the id or try again from the list."
          >
            <Button asChild>
              <Link href="/admin/newsletter">Back to newsletter</Link>
            </Button>
          </SectionCard>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={message ? `Edit • ${message.slice(0, 40)}` : "Edit Newsletter"}>
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/newsletter" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to newsletter
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/newsletter/${idNum}/preview`}>Preview</Link>
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
