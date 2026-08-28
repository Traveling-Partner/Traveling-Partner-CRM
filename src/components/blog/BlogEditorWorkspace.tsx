"use client";

import { useId, type ChangeEventHandler, type ReactNode } from "react";
import Link from "next/link";
import { useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  HelpCircle,
  ImagePlus,
  Loader2,
  Plus,
  Tag,
  Trash2,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatRelativePostTime } from "@/lib/format-relative-post-time";
import type { BlogCategory } from "@/services/blog";
import type { BlogEditorFormValues } from "@/app/admin/blog/_blog-form-shared";

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
  categoryNames: string[];
  errors: FieldErrors<BlogEditorFormValues>;
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
  onCategoryToggle: (name: string) => void;
  onImageChange: ChangeEventHandler<HTMLInputElement>;
  onSaveDraft: () => void;
  onPublish: () => void;
  editor: ReactNode;
  control: Control<BlogEditorFormValues>;
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
  categoryNames,
  errors,
  register,
  onCategoryToggle,
  onImageChange,
  onSaveDraft,
  onPublish,
  editor,
  control
}: BlogEditorWorkspaceProps) {
  const coverInputId = useId();
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });
  const relative = formatRelativePostTime(date);
  const heading =
    mode === "create"
      ? "Create post"
      : pageTitle?.trim()
        ? `Edit · ${pageTitle.trim()}`
        : "Edit post";

  return (
    <div className="relative pb-20">
      {/* Top actions — not sticky, so editor toolbar can sit flush under app header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button variant="ghost" size="sm" asChild className="h-8 shrink-0 px-2">
              <Link href="/admin/blog" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Blog
              </Link>
            </Button>
            <div className="hidden h-4 w-px bg-border/70 sm:block" />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold text-foreground">
                {heading}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={submitting}
              onClick={onSaveDraft}
            >
              {submitting ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8"
              disabled={submitting}
              onClick={onPublish}
            >
              {submitting ? "Publishing…" : "Publish"}
            </Button>
          </div>
      </div>

      <div className="w-full space-y-5 animate-fade-in">
        {/* Cover hero */}
        <input type="hidden" {...register.coverImage} />
        <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-premium-sm">
          <div className="relative aspect-[3/1] w-full min-h-[120px] max-h-[200px] sm:min-h-[140px]">
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
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-premium-xs sm:p-4">
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
        <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-premium-xs sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Post details
            </p>
            <span className="rounded-full bg-[var(--brand-light)] px-2.5 py-0.5 text-2xs font-medium text-foreground">
              {mainTitle?.trim() ? "In progress" : "Untitled"}
              {relative !== "—" ? ` · ${relative}` : ""}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
              <label className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground">
                <Tag className="h-3 w-3" />
                Categories
              </label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-border/70 bg-background p-2">
                {categories.map((category) => {
                  const selected = categoryNames.includes(category.name);
                  return (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => onCategoryToggle(category.name)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                        selected
                          ? "border-[#fdb813]/60 bg-[var(--brand-light)] text-foreground shadow-sm"
                          : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-2xs text-muted-foreground">Select one or more. Saved as text, no ID.</p>
              {errors.categoryNames?.message ? (
                <p className="text-2xs font-medium text-red-500">
                  {errors.categoryNames.message}
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 px-0.5">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Article body
            </h2>
            <p className="text-2xs text-muted-foreground">
              Type <span className="font-medium text-foreground">/</span> for blocks
            </p>
          </div>
          {errors.description2?.message ? (
            <p className="text-xs font-medium text-red-500">
              {errors.description2.message}
            </p>
          ) : null}
          <div className="rounded-xl border border-border/60 shadow-premium-md">
            {editor}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-premium-xs sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-light)] text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-heading text-sm font-semibold text-foreground">
                    Explore Common Questions
                  </h2>
                  <p className="text-2xs text-muted-foreground">
                    Optional. Add FAQs for this post. Empty items are not sent.
                  </p>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => append({ question: "", answer: "" })}
            >
              <Plus className="h-3.5 w-3.5" />
              Add question
            </Button>
          </div>

          {fields.length === 0 ? (
            <button
              type="button"
              onClick={() => append({ question: "", answer: "" })}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3.5 text-left shadow-sm transition hover:border-[#fdb813]/50 hover:bg-[var(--brand-light)]/40"
            >
              <span className="text-sm font-medium text-muted-foreground">
                No FAQs yet. Click to add the first question.
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-2.5">
                    <p className="text-sm font-semibold text-foreground">
                      Question {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove question ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="space-y-1.5">
                      <label className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Question
                      </label>
                      <Input
                        placeholder="How can I get started?"
                        className="h-10 rounded-lg font-medium"
                        {...control.register(`faqs.${index}.question`)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Answer
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Write a short, clear answer…"
                        className="rounded-lg"
                        {...control.register(`faqs.${index}.answer`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-2xs text-muted-foreground">
            Still have questions? Contact our support
          </p>
        </div>
      </div>

      {/* Bottom floating actions on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-none gap-2">
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
