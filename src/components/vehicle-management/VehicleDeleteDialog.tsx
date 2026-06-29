import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface VehicleDeleteDialogProps {
  open: boolean;
  deleting: boolean;
  recordName?: string | null;
  entityLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function VehicleDeleteDialog({
  open,
  deleting,
  recordName,
  entityLabel = "record",
  onOpenChange,
  onConfirm
}: VehicleDeleteDialogProps) {
  const trimmedName = recordName?.trim();
  const description = trimmedName
    ? `Are you sure you want to delete "${trimmedName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${entityLabel}? This action cannot be undone.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm deletion</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
