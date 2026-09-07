"use client";

import { ChangeEvent, useId, useState } from "react";
import { UploadCloud } from "lucide-react";
import TPLoader from "@/components/TPLoader";
import { SectionCard } from "@/components/common/SectionCard";
import { cn } from "@/lib/utils";
import { uploadCarouselImage } from "@/lib/upload-carousel-image";

interface CoverImageUploadPanelProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  token?: string | null;
  disabled?: boolean;
  onError?: (message: string) => void;
  title?: string;
  description?: string;
  emptyMessage?: string;
  previewHeightClassName?: string;
  className?: string;
}

export function CoverImageUploadPanel({
  imageUrl,
  onImageUrlChange,
  token,
  disabled,
  onError,
  title = "Cover image preview",
  description = "Upload a hero image or paste a URL in the field.",
  emptyMessage = "Choose an image to see a preview.",
  previewHeightClassName = "h-40",
  className
}: CoverImageUploadPanelProps) {
  const fileInputId = useId();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadCarouselImage(file, token ?? null);
      onImageUrlChange(url);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      inputEl.value = "";
    }
  };

  const previewUrl = imageUrl.trim();

  return (
    <SectionCard title={title} description={description} className={className}>
      <div className="space-y-3">
        <label
          htmlFor={fileInputId}
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60",
            (uploading || disabled) && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <>
              <TPLoader variant="inline" size={120} />
              Uploading cover image…
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Choose image
            </>
          )}
        </label>
        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading || disabled}
        />

        {uploading ? (
          <p className="text-xs text-muted-foreground">Uploading cover image...</p>
        ) : null}

        {previewUrl ? (
          <div className="overflow-hidden rounded-lg border border-border/60">
            <img
              src={previewUrl}
              alt="Cover preview"
              className={cn("w-full object-cover", previewHeightClassName)}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </SectionCard>
  );
}
