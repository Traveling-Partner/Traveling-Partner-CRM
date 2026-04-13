import { ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ImageUploadField({ id, value, onChange }: ImageUploadFieldProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60"
      >
        <UploadCloud className="h-4 w-4" />
        Upload image
      </label>
      <Input id={id} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {value ? (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <img src={value} alt="Preview" className="h-32 w-full object-cover" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No image selected.</p>
      )}
    </div>
  );
}
