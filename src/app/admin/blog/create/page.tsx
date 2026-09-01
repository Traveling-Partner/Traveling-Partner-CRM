"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { LazyBlogRichEditor } from "@/components/blog/LazyBlogRichEditor";
import { BlogEditorWorkspace } from "@/components/blog/BlogEditorWorkspace";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { createBlog } from "@/services/blog";
import { BLOG_CATEGORIES, toggleCategoryName } from "@/lib/blog-categories";
import { apiUrl } from "@/lib/api-base";
import {
  blogEditorSchema,
  type BlogEditorFormValues,
  buildBlogUpsertPayload
} from "@/app/admin/blog/_blog-form-shared";

interface UploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: showError } = useToast();
  const authUser = useAppSelector((state) => state.auth.user);

  const [description2, setDescription2] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("/mock-images/blog-cover.svg");
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<BlogEditorFormValues>({
    resolver: zodResolver(blogEditorSchema),
    defaultValues: {
      coverImage: "/mock-images/blog-cover.svg",
      mainTitle: "",
      description1: "",
      description2: "",
      date: new Date().toISOString().slice(0, 10),
      author: authUser?.name || "Admin",
      categoryNames: [],
      tagsText: "",
      seoTitle: "",
      seoDescription: "",
      isFeatured: false,
      status: "DRAFT",
      faqs: []
    }
  });

  const mainTitle = watch("mainTitle");
  const description1 = watch("description1") ?? "";
  const categoryNames = watch("categoryNames") ?? [];
  const date = watch("date");

  const submitWithStatus = async (
    values: BlogEditorFormValues,
    nextStatus: "DRAFT" | "PUBLISHED"
  ) => {
    setSubmitting(true);
    try {
      const payload = buildBlogUpsertPayload(values, nextStatus);
      await createBlog(payload, token);
      success(`Blog "${values.mainTitle.trim()}" saved successfully.`);
      router.push("/admin/blog");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create blog.");
    } finally {
      setSubmitting(false);
    }
  };

  const onEditorChange = useCallback(
    (html: string) => {
      setDescription2(html);
      setValue("description2", html, { shouldDirty: true });
    },
    [setValue]
  );

  const saveDraft = handleSubmit((vals) => void submitWithStatus(vals, "DRAFT"));
  const publish = handleSubmit((vals) => void submitWithStatus(vals, "PUBLISHED"));

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const inputEl = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    try {
      const storageToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const accessToken = token ?? storageToken;
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiUrl("/documents/Carousel"), {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData
      });
      const json: UploadResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || "Cover upload failed.");
      }

      setValue("coverImage", json.data, { shouldValidate: true, shouldDirty: true });
      setImagePreview(json.data);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to upload cover image.");
    } finally {
      setCoverUploading(false);
      inputEl.value = "";
    }
  };

  return (
    <AppShell title="Create Post" wideContent>
      <PageContainer>
        <BlogEditorWorkspace
          mode="create"
          submitting={submitting}
          coverUploading={coverUploading}
          imagePreview={imagePreview}
          categories={BLOG_CATEGORIES}
          mainTitle={mainTitle}
          description1={description1}
          author={watch("author")}
          tagsText={watch("tagsText") ?? ""}
          date={date}
          categoryNames={categoryNames}
          errors={errors}
          register={{
            coverImage: register("coverImage"),
            mainTitle: register("mainTitle"),
            description1: register("description1"),
            author: register("author"),
            tagsText: register("tagsText"),
            date: register("date"),
            seoTitle: register("seoTitle"),
            seoDescription: register("seoDescription")
          }}
          onCategoryToggle={(name) =>
            setValue("categoryNames", toggleCategoryName(categoryNames, name), {
              shouldValidate: true,
              shouldDirty: true
            })
          }
          onImageChange={onImageChange}
          onSaveDraft={() => void saveDraft()}
          onPublish={() => void publish()}
          control={control}
          editor={
            <LazyBlogRichEditor
              value={description2}
              token={token}
              className="rounded-none border-0 shadow-none"
              onUploadError={(message) => showError(message)}
              onChange={onEditorChange}
            />
          }
        />
      </PageContainer>
    </AppShell>
  );
}
