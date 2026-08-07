"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { LazyBlogRichEditor } from "@/components/blog/LazyBlogRichEditor";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { createBlog, getAllBlogCategories, type BlogCategory } from "@/services/blog";
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
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      categoryId: 1,
      tagsText: "",
      seoTitle: "",
      seoDescription: "",
      status: "DRAFT"
    }
  });

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

  const submitWithStatus = async (values: BlogEditorFormValues, nextStatus: "DRAFT" | "PUBLISHED") => {
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
    <AppShell title="Create Post">
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/blog" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>
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

        <div className="space-y-6">
          <SectionCard
            title="Post details"
            description="Title, intro, and publishing metadata."
          >
            <div className="space-y-4">
              <input type="hidden" {...register("coverImage")} />
              <FormField
                label="Main Title"
                htmlFor="mainTitle"
                required
                error={errors.mainTitle}
              >
                <Input
                  id="mainTitle"
                  placeholder="Post title"
                  {...register("mainTitle")}
                />
              </FormField>
              <FormField
                label="Description 1 (Short intro)"
                htmlFor="description1"
                error={errors.description1}
                description="Short summary shown in the blog list."
              >
                <Textarea
                  id="description1"
                  rows={3}
                  {...register("description1")}
                />
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
                <FormField
                  label="Author"
                  htmlFor="author"
                  required
                  error={errors.author}
                >
                  <Input
                    id="author"
                    placeholder="Admin"
                    {...register("author")}
                  />
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
                <FormField
                  label="Post date"
                  htmlFor="date"
                  description="Shown as relative time (e.g. 1 hour ago)."
                >
                  <Input id="date" type="date" {...register("date")} />
                </FormField>
                <FormField
                  label="Cover image"
                  htmlFor="coverImageFile"
                  description="Hero image for the post."
                >
                  <div className="space-y-2">
                    <input
                      id="coverImageFile"
                      type="file"
                      accept="image/*"
                      onChange={onImageChange}
                      disabled={coverUploading}
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
                    />
                    {coverUploading ? (
                      <p className="text-xs text-muted-foreground">Uploading cover image...</p>
                    ) : null}
                    {imagePreview ? (
                      <div className="overflow-hidden rounded-lg border border-border/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Cover preview"
                          className="h-28 w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Article editor"
            description="Write and format your article. Type / for blocks."
          >
            <FormField
              label="Description 2 (Detailed content)"
              htmlFor="description2"
              error={errors.description2}
            >
              <LazyBlogRichEditor
                value={description2}
                token={token}
                onUploadError={(message) => showError(message)}
                onChange={(html) => {
                  setDescription2(html);
                  setValue("description2", html);
                }}
              />
            </FormField>
          </SectionCard>

          <div className="flex justify-end gap-2 pb-6">
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
      </PageContainer>
    </AppShell>
  );
}
