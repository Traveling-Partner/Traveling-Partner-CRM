"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { LazyBlogRichEditor } from "@/components/blog/LazyBlogRichEditor";
import { BlogEditorWorkspace } from "@/components/blog/BlogEditorWorkspace";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import {
  getBlogById,
  updateBlog
} from "@/services/blog";
import { BLOG_CATEGORIES, parseCategoryNames, toggleCategoryName } from "@/lib/blog-categories";
import { apiUrl } from "@/lib/api-base";
import {
  blogEditorSchema,
  type BlogEditorFormValues,
  buildBlogUpsertPayload,
  faqsFromApi,
  normalizeBlogStatusForForm
} from "@/app/admin/blog/_blog-form-shared";

interface UploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: showError } = useToast();

  const [description2, setDescription2] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      author: "Admin",
      categoryNames: [],
      tagsText: "",
      seoTitle: "",
      seoDescription: "",
      status: "DRAFT",
      faqs: []
    }
  });

  const mainTitle = watch("mainTitle");
  const description1 = watch("description1") ?? "";
  const categoryNames = watch("categoryNames") ?? [];
  const date = watch("date");

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const row = await getBlogById(idNum, token);
        if (cancelled) return;
        if (!row) {
          setNotFound(true);
          return;
        }

        const desc2 = row.description2 ?? "";
        const dateStr =
          typeof row.date === "string" && row.date.trim()
            ? row.date.trim().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

        reset({
          coverImage: row.coverImage?.trim() || "/mock-images/blog-cover.svg",
          mainTitle: row.mainTitle ?? "",
          description1: row.description1 ?? "",
          description2: desc2,
          date: dateStr,
          author: row.author ?? "Admin",
          categoryNames: parseCategoryNames(row.categoryName),
          tagsText: (row.tags ?? []).join(", "),
          seoTitle: row.seoTitle ?? "",
          seoDescription: row.seoDescription ?? "",
          status: normalizeBlogStatusForForm(row.status),
          faqs: faqsFromApi(row.faqs)
        });
        setDescription2(desc2);
        setImagePreview(row.coverImage?.trim() || "/mock-images/blog-cover.svg");
      } catch {
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idNum, token, reset]);

  const submitWithStatus = async (
    values: BlogEditorFormValues,
    nextStatus: "DRAFT" | "PUBLISHED"
  ) => {
    setSubmitting(true);
    try {
      const payload = buildBlogUpsertPayload(values, nextStatus);
      await updateBlog(idNum, payload, token);
      success(`Blog "${values.mainTitle.trim()}" updated.`);
      router.push("/admin/blog");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to update blog.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = handleSubmit((vals) => void submitWithStatus(vals, "DRAFT"));
  const publish = handleSubmit((vals) => void submitWithStatus(vals, "PUBLISHED"));

  const onEditorChange = useCallback(
    (html: string) => {
      setDescription2(html);
      setValue("description2", html, { shouldDirty: true });
    },
    [setValue]
  );

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

  if (loading) {
    return (
      <AppShell title="Edit Post">
        <PageContainer>
          <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
        </PageContainer>
      </AppShell>
    );
  }

  if (notFound || !Number.isFinite(idNum)) {
    return (
      <AppShell title="Edit Post">
        <PageContainer>
          <SectionCard
            title="Post not found"
            description="This blog could not be loaded. Check the id or try again from the list."
          >
            <Button asChild>
              <Link href="/admin/blog">Back to blog</Link>
            </Button>
          </SectionCard>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={mainTitle ? `Edit • ${mainTitle}` : "Edit Post"} wideContent>
      <PageContainer>
        <BlogEditorWorkspace
          mode="edit"
          pageTitle={mainTitle}
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
              key={idNum}
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
