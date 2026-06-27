"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { BlogRichEditor } from "@/components/blog/BlogRichEditor";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { CoverImageUploadPanel } from "@/components/common/CoverImageUploadPanel";
import { useAppSelector } from "@/store/hooks";
import {
  getBlogById,
  updateBlog,
  getAllBlogCategories,
  type BlogCategory
} from "@/services/blog";
import {
  blogEditorSchema,
  type BlogEditorFormValues,
  buildBlogUpsertPayload,
  normalizeBlogStatusForForm
} from "@/app/admin/blog/_blog-form-shared";

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
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      categoryId: 1,
      readTime: "5 min",
      tagsText: "",
      seoTitle: "",
      seoDescription: "",
      status: "DRAFT"
    }
  });

  const mainTitle = watch("mainTitle");

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const list = await getAllBlogCategories(token);
        if (!cancelled) setCategories(list);
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [token]);

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
          categoryId: row.categoryId ?? 1,
          readTime: row.readTime ?? "5 min",
          tagsText: (row.tags ?? []).join(", "),
          seoTitle: row.seoTitle ?? "",
          seoDescription: row.seoDescription ?? "",
          status: normalizeBlogStatusForForm(row.status)
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

  const submitWithStatus = async (values: BlogEditorFormValues, nextStatus: "DRAFT" | "PUBLISHED") => {
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
    <AppShell title={mainTitle ? `Edit • ${mainTitle}` : "Edit Post"}>
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/blog" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <SectionCard
              title="Post content"
              description="Edit the article body and metadata."
            >
              <div className="space-y-4">
                <input type="hidden" {...register("coverImage")} />
                <FormField
                  label="Main Title"
                  htmlFor="mainTitle"
                  required
                  error={errors.mainTitle}
                >
                  <Input id="mainTitle" placeholder="Post title" {...register("mainTitle")} />
                </FormField>
                <FormField
                  label="Description 1 (Short intro)"
                  htmlFor="description1"
                  error={errors.description1}
                  description="Short summary shown in the blog list."
                >
                  <Textarea id="description1" rows={3} {...register("description1")} />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Category"
                    required
                    error={errors.categoryId}
                  >
                    <Select
                      value={String(watch("categoryId"))}
                      onValueChange={(value) =>
                        setValue("categoryId", Number(value), { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Author" htmlFor="author" required error={errors.author}>
                    <Input id="author" {...register("author")} />
                  </FormField>
                </div>
                <FormField
                  label="Tags (comma separated)"
                  htmlFor="tagsText"
                  description='Example: "travel, adventure, guide"'
                >
                  <Input id="tagsText" placeholder="travel, adventure, guide" {...register("tagsText")} />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Read time" htmlFor="readTime" required error={errors.readTime}>
                    <Input id="readTime" {...register("readTime")} />
                  </FormField>
                  <FormField label="Date" htmlFor="date">
                    <Input id="date" type="date" {...register("date")} />
                  </FormField>
                </div>
                <FormField
                  label="Description 2 (Detailed content)"
                  htmlFor="description2"
                  error={errors.description2}
                >
                  <BlogRichEditor
                    key={idNum}
                    value={description2}
                    onChange={(html) => {
                      setDescription2(html);
                      setValue("description2", html);
                    }}
                  />
                </FormField>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <CoverImageUploadPanel
              imageUrl={imagePreview}
              onImageUrlChange={(url) => {
                setValue("coverImage", url, { shouldValidate: true, shouldDirty: true });
                setImagePreview(url);
              }}
              token={token}
              disabled={submitting}
              onError={showError}
              title="Cover image preview"
              description="Upload a hero image."
              emptyMessage="Choose an image to see a preview."
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void saveDraft()}
              >
                {submitting ? "Saving..." : "Save draft"}
              </Button>
              <Button type="button" disabled={submitting} onClick={() => void publish()}>
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
