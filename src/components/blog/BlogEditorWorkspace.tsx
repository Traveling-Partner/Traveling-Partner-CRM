"use client";

import { useId, type ChangeEventHandler, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  Loader2,
  Tag,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatRelativePostTime } from "@/lib/format-relative-post-time";
import type { BlogCategory } from "@/services/blog";
import type { FieldError } from "react-hook-form";

export interface BlogEditorWorkspaceProps {
  mode: "create" | "edit";
  pageTitle?: string;
  submitting: boolean;
  coverUploading: boolean;
  imagePreview: string;
  categories: BlogCategory[];
  mainTitle: string;
  description1: string;
  author: string;
  tagsText: string;
  date: string;
  categoryId: number;
  errors: {
    mainTitle?: FieldError;
    description1?: FieldError;
    author?: FieldError;
    categoryId?: FieldError;
    description2?: FieldError;
    seoTitle?: FieldError;
    seoDescription?: FieldError;
  };
  register: {
    coverImage: object;
    mainTitle: object;
    description1: object;
    author: object;
    tagsText: object;
    date: object;
    seoTitle: object;
    seoDescription: object;
  };
  onCategoryChange: (id: number) => void;
  onImageChange: ChangeEventHandler<HTMLInputElement>;
  onSaveDraft: () => void;
  onPublish: () => void;
  editor: ReactNode;
}

export function BlogEditorWorkspace({
  mode,
  pageTitle,
  submitting,
  coverUploading,
  imagePreview,
  categories,
  mainTitle,
  description1,
  date,
  categoryId,
  errors,
  register,
  onCategoryChange,
  onImageChange,
  onSaveDraft,
  onPublish,
  editor
}: BlogEditorWorkspaceProps) {
  const coverInputId = useId();
  const relative = formatRelativePostTime(date);
  const heading =
    mode === "create"
      ? "Create post"
      : pageTitle?.trim()
        ? `Edit · ${pageTitle.trim()}`
        : "Edit post";

  return (
    <div className="relative pb-24">
      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 -mx-1 mb-6 border-b border-border/50 bg-background/90 px-1 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/admin/blog" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Blog
              </Link>
            </Button>
            <div className="hidden h-5 w-px bg-border/70 sm:block" />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold text-foreground sm:text-base">
                {heading}
              </p>
              <p className="text-2xs text-muted-foreground">
                {mode === "create" ? "New article" : "Update article"} ·{" "}
                {relative !== "—" ? relative : "Pick a date"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={onSaveDraft}
            >
              {submitting ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              onClick={onPublish}
            >
              {submitting ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
        {/* Cover hero */}
        <input type="hidden" {...register.coverImage} />
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-premium-sm">
          <div className="relative aspect-[21/9] w-full min-h-[180px] sm:min-h-[220px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview || "/mock-images/blog-cover.svg"}
              alt="Cover"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-white/80">
                  Cover image
                </p>
                <p className="text-xs text-white/70">
                  Recommended wide landscape · JPG or PNG
                </p>
              </div>
              <label
                htmlFor={coverInputId}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-black/35 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/50",
                  coverUploading && "pointer-events-none opacity-70"
                )}
              >
                {coverUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                {coverUploading ? "Uploading…" : "Change cover"}
              </label>
            </div>
          </div>
          <input
            id={coverInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
            disabled={coverUploading}
          />
        </div>

        {/* Title fields — all original inputs kept, clearly labeled */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-premium-xs sm:p-5">
          <div className="space-y-1.5">
            <label
              htmlFor="mainTitle"
              className="text-sm font-semibold text-foreground"
            >
              Main Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="mainTitle"
              placeholder="Post title"
              className="h-11 rounded-lg font-heading text-base font-semibold sm:text-lg"
              {...register.mainTitle}
            />
            {errors.mainTitle?.message ? (
              <p className="text-xs font-medium text-red-500">
                {errors.mainTitle.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="description1"
                className="text-sm font-semibold text-foreground"
              >
                Description 1 (Short intro)
              </label>
              <p className="text-xs text-muted-foreground">
                Short summary shown in the blog list.
              </p>
            </div>
            <Textarea
              id="description1"
              rows={3}
              placeholder="Write a short intro for the blog list…"
              className="rounded-lg"
              {...register.description1}
            />
            {errors.description1?.message ? (
              <p className="text-xs font-medium text-red-500">
                {errors.description1.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="seoTitle"
                className="text-sm font-semibold text-foreground"
              >
                SEO Title
              </label>
              <Input
                id="seoTitle"
                placeholder="Optional SEO title"
                className="h-10 rounded-lg"
                {...register.seoTitle}
              />
              {errors.seoTitle?.message ? (
                <p className="text-xs font-medium text-red-500">
                  {errors.seoTitle.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="seoDescription"
                className="text-sm font-semibold text-foreground"
              >
                SEO Description
              </label>
              <Input
                id="seoDescription"
                placeholder="Optional SEO description"
                className="h-10 rounded-lg"
                {...register.seoDescription}
              />
              {errors.seoDescription?.message ? (
                <p className="text-xs font-medium text-red-500">
                  {errors.seoDescription.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Metadata strip */}
        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-premium-xs sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Post details
            </p>
            <span className="rounded-full bg-[var(--brand-light)] px-2.5 py-0.5 text-2xs font-medium text-foreground">
              {mainTitle?.trim() ? "In progress" : "Untitled"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground">
                <Tag className="h-3 w-3" />
                Category
              </label>
              <Select
                value={String(categoryId)}
                onValueChange={(value) => onCategoryChange(Number(value))}
              >
                <SelectTrigger className="h-9 rounded-lg">
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
              {errors.categoryId?.message ? (
                <p className="text-2xs font-medium text-red-500">
                  {errors.categoryId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="author"
                className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground"
              >
                <UserRound className="h-3 w-3" />
                Author
              </label>
              <Input
                id="author"
                className="h-9 rounded-lg"
                placeholder="Admin"
                {...register.author}
              />
              {errors.author?.message ? (
                <p className="text-2xs font-medium text-red-500">
                  {errors.author.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="date"
                className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground"
              >
                <CalendarDays className="h-3 w-3" />
                Post date
              </label>
              <Input
                id="date"
                type="date"
                className="h-9 rounded-lg"
                {...register.date}
              />
              <p className="text-2xs text-muted-foreground">
                Shows as {relative !== "—" ? relative : "…"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="tagsText"
                className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                Tags
              </label>
              <Input
                id="tagsText"
                className="h-9 rounded-lg"
                placeholder="travel, adventure"
                {...register.tagsText}
              />
            </div>
          </div>

          {description1?.trim() ? (
            <p className="mt-4 line-clamp-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
              {description1.trim()}
            </p>
          ) : null}
        </div>

        {/* Editor */}
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3 px-0.5">
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground">
                Article body
              </h2>
              <p className="text-2xs text-muted-foreground">
                Type <span className="font-medium text-foreground">/</span> for
                blocks · drag images into the editor
              </p>
            </div>
          </div>
          {errors.description2?.message ? (
            <p className="text-xs font-medium text-red-500">
              {errors.description2.message}
            </p>
          ) : null}
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-premium-md">
            {editor}
          </div>
        </div>
      </div>

      {/* Bottom floating actions on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-4xl gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={submitting}
            onClick={onSaveDraft}
          >
            Draft
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={submitting}
            onClick={onPublish}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
