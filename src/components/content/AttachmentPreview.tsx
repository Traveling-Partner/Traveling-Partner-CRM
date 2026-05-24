"use client";

const FALLBACK = "/mock-images/document-fallback.svg";

export function isPdfAttachmentUrl(url: string): boolean {
  const normalized = url.split("?")[0].toLowerCase();
  return normalized.endsWith(".pdf");
}

interface AttachmentPreviewProps {
  url: string;
  title?: string;
  className?: string;
  heightClassName?: string;
}

/** Reusable image or PDF preview (blog cover / newsletter attachment). */
export function AttachmentPreview({
  url,
  title = "Attachment preview",
  className = "",
  heightClassName = "h-40"
}: AttachmentPreviewProps) {
  const src = url?.trim() || FALLBACK;

  if (isPdfAttachmentUrl(src)) {
    return (
      <div
        className={`overflow-hidden rounded-lg border border-border/60 bg-muted/20 ${className}`}
      >
        <iframe
          src={src}
          title={title}
          className={`w-full ${heightClassName} min-h-[10rem] bg-background`}
        />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-border/60 ${className}`}>
      <img
        src={src}
        alt={title}
        className={`${heightClassName} w-full object-cover`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK;
        }}
      />
    </div>
  );
}
