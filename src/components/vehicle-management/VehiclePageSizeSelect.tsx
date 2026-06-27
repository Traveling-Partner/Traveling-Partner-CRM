import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/app/admin/vehicle-management/_vehicle-form-shared";

interface VehiclePageSizeSelectProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function VehiclePageSizeSelect({ pageSize, onPageSizeChange }: VehiclePageSizeSelectProps) {
  return (
    <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Page size" />
      </SelectTrigger>
      <SelectContent>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <SelectItem key={size} value={size}>
            {size} / page
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
