import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/page-size";

interface VehiclePageSizeSelectProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function VehiclePageSizeSelect({ pageSize, onPageSizeChange }: VehiclePageSizeSelectProps) {
  return (
    <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
      <SelectTrigger className="h-7 w-[4.5rem] border-border/40 bg-background text-xs shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
