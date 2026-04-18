"use client";

import { ChangeEvent, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  token?: string | null;
}

interface UploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

export function ImageUploadField({ id, value, onChange, token }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const storageToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const accessToken = token ?? storageToken;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/Carousel`,
        {
          method: "POST",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          body: formData
        }
      );

      const json: UploadResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Upload failed.");
      }

      onChange(json.data);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            Upload image
          </>
        )}
      </label>
      <Input id={id} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}
      {value ? (
        <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-2">
          <img src={value} alt="Preview" className="mx-auto max-h-48 w-auto rounded object-contain" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No image selected.</p>
      )}
    </div>
  );
}
